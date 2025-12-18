//carDashboardContoller.js
import prisma from "../models/prismaClient.js";

/**
 * =============================================
 * CAR DASHBOARD CONTROLLER
 * =============================================
 */
export const getDashboardData = async (req, res) => {
  try {
    /**
     * ===============================
     * STAFF DASHBOARD (LIMITED DATA)
     * ===============================
     */
    if (req.user.type === "staff") {
      const ownerId = req.user.ownerId;

      const totalClients = await prisma.client.count({
        where: { userId: ownerId },
      });

      const totalServices = await prisma.service.count({
        where: {
          client: { userId: ownerId },
        },
      });

      const upcomingReminders = await prisma.reminder.count({
        where: {
          userId: ownerId,
          remindAt: { gte: new Date() },
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

    /**
     * ===============================
     * OWNER DASHBOARD (FULL DATA)
     * ===============================
     */
    const userId = req.user.id;

    const totalClients = await prisma.client.count({
      where: { userId },
    });

    const totalServices = await prisma.service.count({
      where: {
        client: { userId },
      },
    });

    const upcomingReminders = await prisma.reminder.count({
      where: {
        userId,
        remindAt: { gte: new Date() },
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
        totalRevenue: totalRevenueAgg._sum.grandTotal || 0,
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
