import prisma from "../models/prismaClient.js";

export const getDashboardData = async (req, res) => {
  try {
    const now = new Date();

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const next30Days = new Date();
    next30Days.setDate(next30Days.getDate() + 30);

    const deleteBefore = new Date();
    deleteBefore.setDate(deleteBefore.getDate() - 7);

    /* ==========================================================
       AUTO DELETE OLD REMINDERS (older than 7 days)
    ========================================================== */

    await prisma.reminder.deleteMany({
      where: {
        serviceDate: { lt: deleteBefore },
      },
    });

    /* ==========================================================
       STAFF DASHBOARD (LIMITED)
    ========================================================== */

    if (req.user.type === "staff") {
      const ownerId = req.user.ownerId;

      const totalClients = await prisma.client.count({
        where: { userId: ownerId },
      });

      const totalServices = await prisma.service.count({
        where: { client: { userId: ownerId } },
      });

      return res.json({
        stats: { totalClients, totalServices },
        charts: {},
        reviewStats: {},
        data: {
          todayAppointments: [],
          upcomingAppointments: [],
          clientsOverview: [],
        },
      });
    }

    /* ==========================================================
       OWNER DASHBOARD
    ========================================================== */

    const userId = req.user.id;

    /* ================= CORE STATS ================= */

    const [
      totalClients,
      totalServices,
      activeServices,
      totalInvoices,
      pendingRevenueAgg,
      overdueRevenueAgg,
      totalRevenueAgg,
      reviewAgg,
    ] = await Promise.all([
      prisma.client.count({ where: { userId } }),

      prisma.service.count({ where: { client: { userId } } }),

      prisma.service.count({
        where: {
          client: { userId },
          status: { in: ["PENDING", "IN_PROGRESS"] },
        },
      }),

      prisma.invoice.count({
        where: { ownerUserId: userId },
      }),

      prisma.invoice.aggregate({
        where: { ownerUserId: userId, status: "Pending" },
        _sum: { grandTotal: true },
      }),

      prisma.invoice.aggregate({
        where: {
          ownerUserId: userId,
          status: "Pending",
          dueDate: { lt: now },
        },
        _sum: { grandTotal: true },
      }),

      prisma.invoice.aggregate({
        where: {
          ownerUserId: userId,
          status: { in: ["Paid", "Partially Paid"] },
        },
        _sum: { grandTotal: true },
      }),

      prisma.service.aggregate({
        _avg: { reviewRating: true },
        _count: { reviewRating: true },
        where: {
          client: { userId },
          reviewRating: { not: null },
        },
      }),
    ]);

    /* ================= REVENUE TREND ================= */

    const monthlyRevenueRaw = await prisma.$queryRaw`
      SELECT 
        DATE_TRUNC('month', "createdAt") AS month,
        SUM("grandTotal") FILTER (WHERE status IN ('Paid','Partially Paid')) AS revenue
      FROM "Invoice"
      WHERE "ownerUserId" = ${userId}
        AND "createdAt" >= NOW() - INTERVAL '6 months'
      GROUP BY 1
      ORDER BY 1 ASC;
    `;

    const monthlyRevenue = monthlyRevenueRaw.map((m) => ({
      month: new Date(m.month).toLocaleString("default", { month: "short" }),
      revenue: Number(m.revenue || 0),
    }));

    /* ================= 30-DAY TREND (FROM REMINDER) ================= */

    const appointmentTrendRaw = await prisma.$queryRaw`
      SELECT 
        DATE("serviceDate") as day,
        COUNT(*) as total
      FROM "Reminder"
      WHERE "clientId" IN (
        SELECT id FROM "Client" WHERE "userId" = ${userId}
      )
      AND "serviceDate" >= NOW() - INTERVAL '30 days'
      GROUP BY day
      ORDER BY day ASC;
    `;

    const appointments30Days = appointmentTrendRaw.map((d) => ({
      day: new Date(d.day).toLocaleDateString("default", {
        day: "2-digit",
        month: "short",
      }),
      appointments: Number(d.total),
    }));

    /* ================= SERVICE STATUS ================= */

    const statusRaw = await prisma.service.groupBy({
      by: ["status"],
      where: { client: { userId } },
      _count: { status: true },
    });

    const serviceStatusDistribution = statusRaw.map((s) => ({
      name: s.status,
      value: s._count.status,
    }));

    /* ================= TODAY APPOINTMENTS ================= */

    const todayReminders = await prisma.reminder.findMany({
      where: {
        client: { userId },
        serviceDate: {
          gte: startOfToday,
          lte: endOfToday,
        },
      },
      include: { client: true },
      orderBy: { serviceDate: "asc" },
    });

    const todayAppointments = todayReminders.map((r) => ({
      id: r.id,
      name: r.client.fullName,
      phone: r.client.phone,
      vehicle: `${r.client.vehicleMake || ""} ${r.client.vehicleModel || ""}`,
      regNumber: r.client.regNumber,
      time: new Date(r.serviceDate).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      note: r.note,
    }));

    /* ================= UPCOMING 30 DAYS ================= */

    const upcomingReminders = await prisma.reminder.findMany({
      where: {
        client: { userId },
        serviceDate: {
          gte: now,
          lte: next30Days,
        },
      },
      include: { client: true },
      orderBy: { serviceDate: "asc" },
    });

    const upcomingAppointments = upcomingReminders.map((r) => ({
      id: r.id,
      name: r.client.fullName,
      phone: r.client.phone,
      vehicle: `${r.client.vehicleMake || ""} ${r.client.vehicleModel || ""}`,
      regNumber: r.client.regNumber,
      serviceDate: r.serviceDate,
      note: r.note,
    }));

    /* ================= CLIENT OVERVIEW ================= */

    const clientsOverviewRaw = await prisma.client.findMany({
      where: { userId },
      include: {
        services: {
          orderBy: { date: "desc" },
          take: 1,
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const clientsOverview = clientsOverviewRaw.map((client) => ({
      id: client.id,
      name: client.fullName,
      phone: client.phone,
      vehicle: `${client.vehicleMake || ""} ${client.vehicleModel || ""}`,
      regNumber: client.regNumber,
      lastServiceDate: client.services[0]?.date || null,
      lastServiceStatus: client.services[0]?.status || "No Service",
    }));

    /* ================= FINAL RESPONSE ================= */

    return res.json({
      stats: {
        totalClients,
        totalServices,
        activeServices,
        totalInvoices,
        totalRevenue: totalRevenueAgg._sum.grandTotal || 0,
        pendingRevenue: pendingRevenueAgg._sum.grandTotal || 0,
        overdueRevenue: overdueRevenueAgg._sum.grandTotal || 0,
        upcomingReminders: upcomingAppointments.length,
      },
      reviewStats: {
        averageRating: reviewAgg._avg.reviewRating || 0,
        totalReviews: reviewAgg._count.reviewRating || 0,
      },
      charts: {
        monthlyRevenue,
        appointments30Days,
        serviceStatusDistribution,
      },
      data: {
        todayAppointments,
        upcomingAppointments,
        clientsOverview,
      },
    });
  } catch (error) {
    console.error("❌ DASHBOARD ERROR:", error);
    res.status(500).json({ message: "Failed to load dashboard data" });
  }
};
