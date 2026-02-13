import prisma from "../models/prismaClient.js";

/* -------------------------------------------------------
   Utility: Subtract days from date
--------------------------------------------------------*/
function subtractDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() - days);
  return d;
}

/* =======================================================
   GET ALL REMINDERS
======================================================= */
export const getReminders = async (req, res) => {
  try {
    const userId = req.user?.id;

    const where = userId ? { userId } : {};

    const reminders = await prisma.reminder.findMany({
      where,
      include: {
        client: {
          select: {
            id: true,
            fullName: true,
            phone: true,
            vehicleMake: true,
            vehicleModel: true,
            regNumber: true,
          },
        },
        user: {
          select: { id: true, username: true },
        },
      },
      orderBy: { serviceDate: "asc" },
    });

    return res.status(200).json({
      success: true,
      total: reminders.length,
      data: reminders,
    });
  } catch (error) {
    console.error("❌ Error fetching reminders:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching reminders",
      error: error.message,
    });
  }
};

/* =======================================================
   GET SINGLE REMINDER
======================================================= */
export const getReminderById = async (req, res) => {
  try {
    const { id } = req.params;

    const reminder = await prisma.reminder.findUnique({
      where: { id: Number(id) },
      include: {
        client: true,
        user: true,
      },
    });

    if (!reminder) {
      return res
        .status(404)
        .json({ success: false, message: "Reminder not found" });
    }

    return res.json({ success: true, data: reminder });
  } catch (error) {
    console.error("❌ Error fetching reminder:", error);
    return res
      .status(500)
      .json({ success: false, message: "Error fetching reminder" });
  }
};

/* =======================================================
   CREATE REMINDER
======================================================= */
export const createReminder = async (req, res) => {
  try {
    const { clientId, serviceDate, note } = req.body;

    if (!clientId || !serviceDate) {
      return res.status(400).json({
        message: "clientId and serviceDate are required",
      });
    }

    const parsedClientId = parseInt(clientId);
    if (isNaN(parsedClientId)) {
      return res.status(400).json({ message: "Invalid clientId" });
    }

    const serviceDateObj = new Date(serviceDate);

    const reminder = await prisma.reminder.create({
      data: {
        clientId: parsedClientId,
        userId: req.user?.id || null,
        serviceDate: serviceDateObj,
        note: note || null,
        remind15At: subtractDays(serviceDateObj, 15),
        remind7At: subtractDays(serviceDateObj, 7),
      },
      include: {
        client: true,
        user: true,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Reminder created successfully",
      data: reminder,
    });
  } catch (error) {
    console.error("❌ Error creating reminder:", error);
    return res.status(500).json({
      success: false,
      message: "Error creating reminder",
      error: error.message,
    });
  }
};

/* =======================================================
   UPDATE REMINDER
======================================================= */
export const updateReminder = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await prisma.reminder.findUnique({
      where: { id: Number(id) },
    });

    if (!existing) {
      return res
        .status(404)
        .json({ success: false, message: "Reminder not found" });
    }

    let updatedData = {
      note: req.body.note ?? existing.note,
    };

    // If serviceDate is updated, recalculate reminder dates
    if (req.body.serviceDate) {
      const newServiceDate = new Date(req.body.serviceDate);

      updatedData.serviceDate = newServiceDate;
      updatedData.remind15At = subtractDays(newServiceDate, 15);
      updatedData.remind7At = subtractDays(newServiceDate, 7);
      updatedData.sent15 = false; // reset flags
      updatedData.sent7 = false;
    }

    if (req.body.clientId) {
      updatedData.clientId = Number(req.body.clientId);
    }

    const updatedReminder = await prisma.reminder.update({
      where: { id: Number(id) },
      data: updatedData,
      include: {
        client: true,
        user: true,
      },
    });

    return res.json({
      success: true,
      message: "Reminder updated successfully",
      data: updatedReminder,
    });
  } catch (error) {
    console.error("❌ Error updating reminder:", error);
    return res
      .status(500)
      .json({ success: false, message: "Error updating reminder" });
  }
};

/* =======================================================
   DELETE REMINDER
======================================================= */
export const deleteReminder = async (req, res) => {
  try {
    const { id } = req.params;

    const reminder = await prisma.reminder.findUnique({
      where: { id: Number(id) },
    });

    if (!reminder) {
      return res
        .status(404)
        .json({ success: false, message: "Reminder not found" });
    }

    await prisma.reminder.delete({
      where: { id: Number(id) },
    });

    return res.json({
      success: true,
      message: "Reminder deleted successfully",
    });
  } catch (error) {
    console.error("❌ Error deleting reminder:", error);
    return res
      .status(500)
      .json({ success: false, message: "Error deleting reminder" });
  }
};
