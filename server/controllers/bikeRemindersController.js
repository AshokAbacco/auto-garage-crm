import prisma from "../models/prismaClient.js";
import { getOwnerUserId } from "../utils/getAdminId.js";

/* =====================================================
   GET ALL BIKE REMINDERS
   GET /api/bike-reminders
===================================================== */
export const getBikeReminders = async (req, res) => {
  try {
    const ownerUserId = getOwnerUserId(req.user);

    const whereCondition =
      req.user.role === "user"
        ? { ownerUserId }
        : { ownerUserId, createdById: req.user.id };

    const reminders = await prisma.bikeReminder.findMany({
      where: whereCondition,
      include: {
        bike: {
          select: {
            id: true,
            ownerName: true,
            bikeModel: true,
            regNumber: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({
      success: true,
      total: reminders.length,
      data: reminders,
    });
  } catch (error) {
    console.error("getBikeReminders error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching bike reminders",
    });
  }
};

/* =====================================================
   GET SINGLE BIKE REMINDER
   GET /api/bike-reminders/:id
===================================================== */
export const getBikeReminderById = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const ownerUserId = getOwnerUserId(req.user);

    const reminder = await prisma.bikeReminder.findFirst({
      where:
        req.user.role === "user"
          ? { id, ownerUserId }
          : { id, ownerUserId, createdById: req.user.id },
      include: {
        bike: {
          select: {
            id: true,
            ownerName: true,
            bikeModel: true,
            regNumber: true,
          },
        },
      },
    });

    if (!reminder) {
      return res.status(404).json({
        success: false,
        message: "Bike reminder not found",
      });
    }

    res.json({
      success: true,
      data: reminder,
    });
  } catch (error) {
    console.error("getBikeReminderById error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching bike reminder",
    });
  }
};

/* =====================================================
   CREATE BIKE REMINDER
   POST /api/bike-reminders
===================================================== */
export const createBikeReminder = async (req, res) => {
  try {
    const ownerUserId = getOwnerUserId(req.user);

    const {
      bikeClientId,
      bikeId, // fallback
      message,
      remindDate,
      remindTime,
    } = req.body;

    const finalBikeId = bikeClientId || bikeId;

    if (!finalBikeId || !message || !remindDate) {
      return res.status(400).json({
        success: false,
        message: "bikeClientId, message and remindDate are required",
      });
    }

    // 🔐 Bike ownership check
    const bike = await prisma.bike.findFirst({
      where:
        req.user.role === "user"
          ? { id: Number(finalBikeId), ownerUserId }
          : {
              id: Number(finalBikeId),
              ownerUserId,
              createdById: req.user.id,
            },
    });

    if (!bike) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized bike access",
      });
    }

    const reminder = await prisma.bikeReminder.create({
      data: {
        bikeClientId: Number(finalBikeId),
        message: message.trim(),
        remindDate: new Date(remindDate),
        remindTime: remindTime || null,

        ownerUserId,
        createdById: req.user.id,
      },
    });

    res.status(201).json({
      success: true,
      data: reminder,
    });
  } catch (error) {
    console.error("createBikeReminder error:", error);
    res.status(500).json({
      success: false,
      message: "Error creating bike reminder",
    });
  }
};

/* =====================================================
   UPDATE BIKE REMINDER
   PUT /api/bike-reminders/:id
===================================================== */
export const updateBikeReminder = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const ownerUserId = getOwnerUserId(req.user);

    const exists = await prisma.bikeReminder.findFirst({
      where:
        req.user.role === "user"
          ? { id, ownerUserId }
          : { id, ownerUserId, createdById: req.user.id },
    });

    if (!exists) {
      return res.status(404).json({
        success: false,
        message: "Bike reminder not found",
      });
    }

    const updated = await prisma.bikeReminder.update({
      where: { id },
      data: {
        message: req.body.message,
        remindDate: req.body.remindDate
          ? new Date(req.body.remindDate)
          : undefined,
        remindTime: req.body.remindTime,
        isDone: req.body.isDone,
      },
      include: {
        bike: true,
      },
    });

    res.json({
      success: true,
      message: "Bike reminder updated successfully",
      data: updated,
    });
  } catch (error) {
    console.error("updateBikeReminder error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating bike reminder",
    });
  }
};

/* =====================================================
   DELETE BIKE REMINDER
   DELETE /api/bike-reminders/:id
===================================================== */
export const deleteBikeReminder = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const ownerUserId = getOwnerUserId(req.user);

    const reminder = await prisma.bikeReminder.findFirst({
      where:
        req.user.role === "user"
          ? { id, ownerUserId }
          : { id, ownerUserId, createdById: req.user.id },
    });

    if (!reminder) {
      return res.status(404).json({
        success: false,
        message: "Bike reminder not found",
      });
    }

    await prisma.bikeReminder.delete({
      where: { id: reminder.id },
    });

    res.json({
      success: true,
      message: "Bike reminder deleted successfully",
    });
  } catch (error) {
    console.error("deleteBikeReminder error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting bike reminder",
    });
  }
};
