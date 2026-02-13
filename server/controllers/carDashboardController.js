// carDashboardContoller.js
import prisma from "../models/prismaClient.js";

export const getDashboardData = async (req, res) => {
  try {
    const now = new Date();

    /* ===============================
       STAFF DASHBOARD
    =============================== */
    if (req.user.type === "staff") {
      const ownerId = req.user.ownerId;

      const totalClients = await prisma.client.count({
        where: { userId: ownerId },
      });

      const totalServices = await prisma.service.count({
        where: { client: { userId: ownerId } },
      });

      const upcomingReminders = await prisma.reminder.count({
        where: {
          userId: ownerId,
          OR: [
            { remind15At: { gte: now }, sent15: false },
            { remind7At: { gte: now }, sent7: false },
          ],
        },
      });

      return res.status(200).json({
        stats: {
          totalClients,
          totalServices,
          upcomingReminders,
          totalRevenue: 0,
          avgServiceTime: 0,
          customerRating: 0,
          overdueRevenue: 0,
        },
        charts: {
          monthlyRevenue: [],
          serviceTypes: [],
          weeklyAppointments: [],
        },
        data: {
          todayAppointments: [],
        },
      });
    }

    /* ===============================
       OWNER DASHBOARD
    =============================== */
    const userId = req.user.id;

    const totalClients = await prisma.client.count({
      where: { userId },
    });

    const totalServices = await prisma.service.count({
      where: { client: { userId } },
    });

    const upcomingReminders = await prisma.reminder.count({
      where: {
        userId,
        OR: [
          { remind15At: { gte: now }, sent15: false },
          { remind7At: { gte: now }, sent7: false },
        ],
      },
    });

    const totalRevenueAgg = await prisma.invoice.aggregate({
      where: { userId },
      _sum: { grandTotal: true },
    });

    return res.status(200).json({
      stats: {
        totalClients,
        totalServices,
        upcomingReminders,
        totalRevenue: Number(totalRevenueAgg._sum.grandTotal) || 0,
        avgServiceTime: 0,
        customerRating: 4.5,
        overdueRevenue: 0,
      },
      charts: {
        monthlyRevenue: [],
        serviceTypes: [],
        weeklyAppointments: [],
      },
      data: {
        todayAppointments: [],
      },
    });
  } catch (error) {
    console.error("❌ CAR DASHBOARD ERROR:", error);
    return res.status(500).json({
      message: "Failed to load dashboard data",
    });
  }
};
