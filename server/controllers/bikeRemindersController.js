import prisma from "../models/prismaClient.js";
import { getOwnerUserId } from "../utils/getAdminId.js";

/* =====================================================
   GET ALL BIKE REMINDERS
   GET /api/bike-reminders
===================================================== */
export const getBikeReminders = async (req, res) => {
  try {
    const ownerUserId = getOwnerUserId(req.user);

    // ✅ UPDATED: Filter via Bike relationship (Clean Architecture)
    const reminders = await prisma.bikeReminder.findMany({
      where: {
        bike: {
          ownerUserId: ownerUserId,
        },
      },
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
      // ✅ UPDATED: Order by serviceDate ascending
      orderBy: { serviceDate: "asc" },
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

    // ✅ UPDATED: Filter via Bike relationship
    const reminder = await prisma.bikeReminder.findFirst({
      where: {
        id: id,
        bike: {
          ownerUserId: ownerUserId,
        },
      },
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
    // ✅ UPDATED: Destructure new fields
    const { bikeId, serviceDate, note } = req.body;

    if (!bikeId || !serviceDate) {
      return res.status(400).json({
        success: false,
        message: "bikeId and serviceDate are required",
      });
    }

    const parsedBikeId = Number(bikeId);
    if (isNaN(parsedBikeId)) {
      return res.status(400).json({ message: "Invalid bikeId" });
    }

    const serviceDateObj = new Date(serviceDate);

    // ✅ UPDATED: Auto calculate reminders (15 days and 7 days before)
    const remind15At = new Date(serviceDateObj);
    remind15At.setDate(remind15At.getDate() - 15);

    const remind7At = new Date(serviceDateObj);
    remind7At.setDate(remind7At.getDate() - 7);

    // 🔐 Bike ownership check (Simplified)
    const bike = await prisma.bike.findFirst({
      where: {
        id: parsedBikeId,
        ownerUserId: getOwnerUserId(req.user),
      },
    });

    if (!bike) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized bike access",
      });
    }

    // ✅ UPDATED: Create with new schema fields
    const reminder = await prisma.bikeReminder.create({
      data: {
        bikeId: parsedBikeId,
        userId: req.user.id,
        serviceDate: serviceDateObj,
        note: note || null,
        remind15At,
        remind7At,
      },
      include: {
        bike: true,
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

    // ✅ UPDATED: Check existence via Bike relationship
    const exists = await prisma.bikeReminder.findFirst({
      where: {
        id: id,
        bike: {
          ownerUserId: ownerUserId,
        },
      },
    });

    if (!exists) {
      return res.status(404).json({
        success: false,
        message: "Bike reminder not found",
      });
    }

    // ✅ UPDATED: Handle new fields (serviceDate, note)
    const { serviceDate, note } = req.body;

    let updatedData = {
      note,
    };

    // If serviceDate changes, recalc reminders and reset sent flags
    if (serviceDate) {
      const newServiceDate = new Date(serviceDate);

      const remind15At = new Date(newServiceDate);
      remind15At.setDate(remind15At.getDate() - 15);

      const remind7At = new Date(newServiceDate);
      remind7At.setDate(remind7At.getDate() - 7);

      updatedData.serviceDate = newServiceDate;
      updatedData.remind15At = remind15At;
      updatedData.remind7At = remind7At;
      updatedData.sent15 = false; // Reset tracking
      updatedData.sent7 = false; // Reset tracking
    }

    const updated = await prisma.bikeReminder.update({
      where: { id },
      data: updatedData,
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

    // ✅ UPDATED: Check existence via Bike relationship
    const reminder = await prisma.bikeReminder.findFirst({
      where: {
        id: id,
        bike: {
          ownerUserId: ownerUserId,
        },
      },
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
