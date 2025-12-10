import prisma from "../models/prismaClient.js";

/**
 * ✅ GET ALL BIKE REMINDERS
 * GET /api/bike-reminders
 */
export const getBikeReminders = async (req, res) => {
  try {
    const userId = req.user?.id;

    const reminders = await prisma.bikeReminder.findMany({
      where: userId ? { userId } : {},
      include: {
        bike: {   // ✅ MUST MATCH PRISMA FIELD NAME
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

    res.status(200).json({
      success: true,
      total: reminders.length,
      data: reminders,
    });
  } catch (error) {
    console.error("❌ Error fetching bike reminders:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching bike reminders",
    });
  }
};


/**
 * ✅ GET SINGLE BIKE REMINDER
 * GET /api/bike-reminders/:id
 */
export const getBikeReminderById = async (req, res) => {
  try {
    const { id } = req.params;

    const reminder = await prisma.bikeReminder.findUnique({
      where: { id: Number(id) },
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
    console.error("❌ Error fetching bike reminder:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching bike reminder",
    });
  }
};


/**
 * ✅ CREATE BIKE REMINDER
 * POST /api/bike-reminders
 */
export const createBikeReminder = async (req, res) => {
  try {
    console.log("📩 BIKE REMINDER BODY:", req.body);

    const {
      bikeClientId,
      bikeId,        // ✅ fallback support
      message,
      remindDate,
      remindTime,
    } = req.body;

    const finalBikeId = bikeClientId || bikeId;

    // ✅ STRONG VALIDATION
    if (!finalBikeId || !message || !remindDate) {
      return res.status(400).json({
        success: false,
        message: "bikeClientId, message and remindDate are required",
        received: req.body,
      });
    }

    const reminder = await prisma.bikeReminder.create({
      data: {
        bikeClientId: Number(finalBikeId),
        userId: req.user?.id || null,
        message: message.trim(),
        remindDate: new Date(remindDate),
        remindTime: remindTime || null,
      },
    });

    res.status(201).json({
      success: true,
      data: reminder,
    });
  } catch (error) {
    console.error("❌ BIKE REMINDER CREATE ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Error creating bike reminder",
    });
  }
};


/**
 * ✅ UPDATE BIKE REMINDER
 * PUT /api/bike-reminders/:id
 */
export const updateBikeReminder = async (req, res) => {
  try {
    const { id } = req.params;

    const exists = await prisma.bikeReminder.findUnique({
      where: { id: Number(id) },
    });

    if (!exists) {
      return res.status(404).json({ success: false, message: "Bike reminder not found" });
    }

    const updated = await prisma.bikeReminder.update({
      where: { id: Number(id) },
      data: {
        ...req.body,
        bikeId: req.body.bikeId
          ? Number(req.body.bikeId)
          : undefined,
        remindDate: req.body.remindDate
          ? new Date(req.body.remindDate)
          : undefined,
      },
      include: { bike: true },
    });

    res.json({
      success: true,
      message: "Bike reminder updated successfully",
      data: updated,
    });
  } catch (error) {
    console.error("❌ Error updating bike reminder:", error);
    res.status(500).json({ success: false, message: "Error updating bike reminder" });
  }
};

/**
 * ✅ DELETE BIKE REMINDER
 * DELETE /api/bike-reminders/:id
 */
export const deleteBikeReminder = async (req, res) => {
  try {
    const { id } = req.params;

    const reminder = await prisma.bikeReminder.findUnique({
      where: { id: Number(id) },
    });

    if (!reminder) {
      return res.status(404).json({ success: false, message: "Bike reminder not found" });
    }

    await prisma.bikeReminder.delete({
      where: { id: Number(id) },
    });

    res.json({ success: true, message: "Bike reminder deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting bike reminder:", error);
    res.status(500).json({ success: false, message: "Error deleting bike reminder" });
  }
};
