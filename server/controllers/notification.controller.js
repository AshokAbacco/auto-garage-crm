// src/controllers/notification.controller.js
import * as notificationService from "../services/notification.service.js";

// ==============================
// GET /api/notifications
// App-facing — no auth required
// ?phone=919876543210  (optional — omit to get GLOBAL only)
// ==============================
export const getAppNotifications = async (req, res) => {
  try {
    const { phone } = req.query;
    const data = await notificationService.getNotificationsForUser(phone || null);
    return res.json({ success: true, count: data.length, data });
  } catch (err) {
    console.error("GET APP NOTIFICATIONS ERROR:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ==============================
// GET /api/notifications/all
// CRM-facing — auth required
// ?page=1&limit=30
// ==============================
export const getAllNotifications = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 30;
    const data = await notificationService.getAllNotifications({ page, limit });
    return res.json({ success: true, ...data });
  } catch (err) {
    console.error("GET ALL NOTIFICATIONS ERROR:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ==============================
// POST /api/notifications
// CRM-facing — auth required
// Body: { title, body, iconKey?, scope, clientPhone? }
// ==============================
export const createNotification = async (req, res) => {
  try {
    const { title, body, iconKey, scope, clientPhone } = req.body;
    const createdByUserId = req.user.id;

    if (!title || !body) {
      return res
        .status(400)
        .json({ success: false, message: "Title and body are required" });
    }

    if (scope === "USER" && !clientPhone) {
      return res.status(400).json({
        success: false,
        message: "clientPhone is required for USER-scoped notifications",
      });
    }

    const notification = await notificationService.createManualNotification({
      title,
      body,
      iconKey,
      scope: scope || "GLOBAL",
      clientPhone,
      createdByUserId,
    });

    return res.json({
      success: true,
      message: "Notification created successfully",
      data: notification,
    });
  } catch (err) {
    console.error("CREATE NOTIFICATION ERROR:", err);
    return res.status(400).json({ success: false, message: err.message });
  }
};

// ==============================
// DELETE /api/notifications/:id
// CRM-facing — auth required
// Soft-deletes (sets isActive = false)
// ==============================
export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    await notificationService.deactivateNotification(id);
    return res.json({ success: true, message: "Notification removed" });
  } catch (err) {
    console.error("DELETE NOTIFICATION ERROR:", err);
    return res.status(400).json({ success: false, message: err.message });
  }
};