import prisma from "../models/prismaClient.js";
import { getOwnerUserId } from "../utils/getAdminId.js";

/* =====================================================
   GET ALL WASHING REMINDERS
===================================================== */
export const getWashingReminders = async (req, res) => {
  try {
    const ownerUserId = getOwnerUserId(req.user);

    const reminders = await prisma.washingReminder.findMany({
      where: {
        washingClient: {
          userId: ownerUserId,
        },
      },
      include: {
        washingClient: {
          select: {
            id: true,
            fullName: true,
            phone: true,
            regNumber: true,
          },
        },
      },
      orderBy: { nextWashDate: "asc" },
    });

    res.json({
      success: true,
      total: reminders.length,
      data: reminders,
    });
  } catch (error) {
    console.error("getWashingReminders error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching washing reminders",
    });
  }
};

/* =====================================================
   GET SINGLE WASHING REMINDER
===================================================== */
export const getWashingReminderById = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const ownerUserId = getOwnerUserId(req.user);

    const reminder = await prisma.washingReminder.findFirst({
      where: {
        id,
        washingClient: {
          userId: ownerUserId,
        },
      },
      include: {
        washingClient: true,
      },
    });

    if (!reminder) {
      return res.status(404).json({
        success: false,
        message: "Washing reminder not found",
      });
    }

    res.json({ success: true, data: reminder });
  } catch (error) {
    console.error("getWashingReminderById error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching washing reminder",
    });
  }
};

/* =====================================================
   CREATE WASHING REMINDER
===================================================== */
export const createWashingReminder = async (req, res) => {
  try {
    const { washingClientId, nextWashDate, note } = req.body;

    if (!washingClientId || !nextWashDate) {
      return res.status(400).json({
        success: false,
        message: "washingClientId and nextWashDate are required",
      });
    }

    const parsedId = Number(washingClientId);
    const ownerUserId = getOwnerUserId(req.user);

    const client = await prisma.washingClient.findFirst({
      where: {
        id: parsedId,
        userId: ownerUserId,
      },
    });

    if (!client) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized client access",
      });
    }

    const washDate = new Date(nextWashDate);

    const remind3DaysAt = new Date(washDate);
    remind3DaysAt.setDate(remind3DaysAt.getDate() - 3);

    const remind1DayAt = new Date(washDate);
    remind1DayAt.setDate(remind1DayAt.getDate() - 1);

    const reminder = await prisma.washingReminder.create({
      data: {
        washingClientId: parsedId,
        userId: req.user.id,
        nextWashDate: washDate,
        note: note || null,
        remind3DaysAt,
        remind1DayAt,
      },
      include: {
        washingClient: true,
      },
    });

    res.status(201).json({
      success: true,
      data: reminder,
    });
  } catch (error) {
    console.error("createWashingReminder error:", error);
    res.status(500).json({
      success: false,
      message: "Error creating washing reminder",
    });
  }
};

/* =====================================================
   UPDATE WASHING REMINDER
===================================================== */
export const updateWashingReminder = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const ownerUserId = getOwnerUserId(req.user);

    const exists = await prisma.washingReminder.findFirst({
      where: {
        id,
        washingClient: {
          userId: ownerUserId,
        },
      },
    });

    if (!exists) {
      return res.status(404).json({
        success: false,
        message: "Washing reminder not found",
      });
    }

    const { nextWashDate, note } = req.body;

    let updateData = { note };

    if (nextWashDate) {
      const newDate = new Date(nextWashDate);

      const remind3DaysAt = new Date(newDate);
      remind3DaysAt.setDate(remind3DaysAt.getDate() - 3);

      const remind1DayAt = new Date(newDate);
      remind1DayAt.setDate(remind1DayAt.getDate() - 1);

      updateData.nextWashDate = newDate;
      updateData.remind3DaysAt = remind3DaysAt;
      updateData.remind1DayAt = remind1DayAt;
      updateData.sent3Days = false;
      updateData.sent1Day = false;
    }

    const updated = await prisma.washingReminder.update({
      where: { id },
      data: updateData,
      include: {
        washingClient: true,
      },
    });

    res.json({
      success: true,
      message: "Washing reminder updated",
      data: updated,
    });
  } catch (error) {
    console.error("updateWashingReminder error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating washing reminder",
    });
  }
};

/* =====================================================
   DELETE WASHING REMINDER
===================================================== */
export const deleteWashingReminder = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const ownerUserId = getOwnerUserId(req.user);

    const reminder = await prisma.washingReminder.findFirst({
      where: {
        id,
        washingClient: {
          userId: ownerUserId,
        },
      },
    });

    if (!reminder) {
      return res.status(404).json({
        success: false,
        message: "Washing reminder not found",
      });
    }

    await prisma.washingReminder.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: "Washing reminder deleted",
    });
  } catch (error) {
    console.error("deleteWashingReminder error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting washing reminder",
    });
  }
};
