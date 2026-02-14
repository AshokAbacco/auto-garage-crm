import prisma from "../models/prismaClient.js";

/**
 * @desc Get Car CRM dashboard summary
 * @route GET /api/dashboard
 * @access Private
 */
export const getDashboardData = async (req, res) => {
  try {
    const userId = req.user.id;

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    /* ==========================================================
       1️⃣ CORE KPI AGGREGATIONS
    ========================================================== */

    const [
      paidRevenueAgg,
      pendingRevenueAgg,
      overdueRevenueAgg,
      totalInvoices,
      totalServices,
      activeServices,
      completedToday,
      totalClients,
      upcomingRemindersCount,
      approvalPendingCount,
      reviewAggregate,
      reviewDistributionRaw,
    ] = await Promise.all([
      // ✅ Paid Revenue (including partially paid)
      prisma.invoice.aggregate({
        _sum: { grandTotal: true },
        where: {
          ownerUserId: userId,
          status: { in: ["Paid", "Partially Paid"] },
        },
      }),

      // ✅ Pending Revenue
      prisma.invoice.aggregate({
        _sum: { grandTotal: true },
        where: {
          ownerUserId: userId,
          status: "Pending",
        },
      }),

      // ✅ Overdue Revenue
      prisma.invoice.aggregate({
        _sum: { grandTotal: true },
        where: {
          ownerUserId: userId,
          status: "Pending",
          dueDate: { lt: new Date() },
        },
      }),

      prisma.invoice.count({
        where: { ownerUserId: userId },
      }),

      prisma.service.count({
        where: { client: { userId } },
      }),

      prisma.service.count({
        where: {
          client: { userId },
          status: { in: ["PENDING", "IN_PROGRESS"] },
        },
      }),

      prisma.service.count({
        where: {
          client: { userId },
          status: "COMPLETED",
          serviceOutDate: {
            gte: startOfToday,
            lte: endOfToday,
          },
        },
      }),

      prisma.client.count({
        where: { userId },
      }),

      prisma.reminder.count({
        where: {
          client: { userId },
          OR: [
            { remind15At: { gte: new Date() } },
            { remind7At: { gte: new Date() } },
          ],
        },
      }),

      prisma.service.count({
        where: {
          client: { userId },
          approvalStatus: null,
        },
      }),

      // ⭐ Average Rating + Count
      prisma.service.aggregate({
        _avg: { reviewRating: true },
        _count: { reviewRating: true },
        where: {
          client: { userId },
          reviewRating: { not: null },
        },
      }),

      // ⭐ Rating Distribution
      prisma.service.groupBy({
        by: ["reviewRating"],
        where: {
          client: { userId },
          reviewRating: { not: null },
        },
        _count: { reviewRating: true },
      }),
    ]);

    /* ==========================================================
       2️⃣ MONTHLY REVENUE (LAST 6 MONTHS)
    ========================================================== */

    const monthlyRevenueRaw = await prisma.$queryRaw`
      SELECT 
        DATE_TRUNC('month', "createdAt") AS month,
        SUM("grandTotal") FILTER (WHERE status IN ('Paid','Partially Paid')) AS revenue,
        COUNT(*) FILTER (WHERE status IN ('Paid','Partially Paid')) AS invoice_count
      FROM "Invoice"
      WHERE "ownerUserId" = ${userId}
        AND "createdAt" >= NOW() - INTERVAL '6 months'
      GROUP BY 1
      ORDER BY 1 ASC;
    `;

    const monthlyRevenue = monthlyRevenueRaw.map((m) => ({
      month: new Date(m.month).toLocaleString("default", {
        month: "short",
      }),
      revenue: Number(m.revenue || 0),
      invoices: Number(m.invoice_count || 0),
    }));

    /* ==========================================================
       3️⃣ 30-DAY APPOINTMENT TREND
    ========================================================== */

    const last30DaysRaw = await prisma.$queryRaw`
      SELECT 
        DATE("date") as day,
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'COMPLETED') as completed
      FROM "Service"
      WHERE "clientId" IN (
        SELECT id FROM "Client" WHERE "userId" = ${userId}
      )
      AND "date" >= NOW() - INTERVAL '30 days'
      GROUP BY day
      ORDER BY day ASC;
    `;

    const appointments30Days = last30DaysRaw.map((d) => ({
      day: new Date(d.day).toLocaleDateString("default", {
        day: "2-digit",
        month: "short",
      }),
      appointments: Number(d.total),
      completed: Number(d.completed),
    }));

    /* ==========================================================
       4️⃣ SERVICE STATUS DISTRIBUTION
    ========================================================== */

    const serviceStatusRaw = await prisma.service.groupBy({
      by: ["status"],
      where: { client: { userId } },
      _count: { status: true },
    });

    const serviceStatusDistribution = serviceStatusRaw.map((s) => ({
      name: s.status,
      value: s._count.status,
    }));

    /* ==========================================================
       5️⃣ TODAY PANEL
    ========================================================== */

    const todayServices = await prisma.service.findMany({
      where: {
        client: { userId },
        date: {
          gte: startOfToday,
          lte: endOfToday,
        },
      },
      include: {
        client: { select: { fullName: true } },
        category: { select: { name: true } },
        subService: { select: { name: true } },
      },
      orderBy: { date: "asc" },
    });

    const todayAppointments = todayServices.map((service) => {
      const initials = service.client.fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .substring(0, 2)
        .toUpperCase();

      return {
        id: service.id,
        name: service.client.fullName,
        time: new Date(service.date).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        service:
          service.subService?.name || service.category?.name || "Service",
        status: service.status,
        avatar: initials,
      };
    });

    /* ==========================================================
       FINAL RESPONSE
    ========================================================== */

    res.json({
      stats: {
        totalRevenue: paidRevenueAgg._sum.grandTotal || 0,
        pendingRevenue: pendingRevenueAgg._sum.grandTotal || 0,
        overdueRevenue: overdueRevenueAgg._sum.grandTotal || 0,
        totalInvoices,
        totalServices,
        activeServices,
        completedToday,
        totalClients,
        upcomingReminders: upcomingRemindersCount,
        approvalPending: approvalPendingCount,
      },

      reviewStats: {
        averageRating: reviewAggregate._avg.reviewRating || 0,
        totalReviews: reviewAggregate._count.reviewRating || 0,
        ratingDistribution: reviewDistributionRaw,
      },

      charts: {
        monthlyRevenue,
        appointments30Days,
        serviceStatusDistribution,
      },

      data: {
        todayAppointments,
      },
    });
  } catch (error) {
    console.error("Dashboard Error:", error);
    res.status(500).json({ message: "Error fetching dashboard data" });
  }
};
