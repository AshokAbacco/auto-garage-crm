// src/routes/notification.routes.js
import express from "express";
import * as controller from "../controllers/notification.controller.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// ─── App-facing (no auth) ────────────────────────────────────────────────────

/**
 * GET /api/notifications
 * Returns GLOBAL notifications + USER-scoped ones matching the phone.
 * Query: ?phone=919876543210  (optional)
 */
router.get("/", controller.getAppNotifications);

// ─── CRM-facing (auth required) ──────────────────────────────────────────────

/**
 * GET /api/notifications/all
 * Paginated list of all notifications for the CRM admin view.
 * Query: ?page=1&limit=30
 */
router.get("/all", protect, controller.getAllNotifications);

/**
 * POST /api/notifications
 * Manually create a custom notification from the CRM UI.
 * Body: { title, body, iconKey?, scope ("GLOBAL"|"USER"), clientPhone? }
 */
router.post("/", protect, controller.createNotification);

/**
 * DELETE /api/notifications/:id
 * Soft-delete (deactivate) a notification.
 */
router.delete("/:id", protect, controller.deleteNotification);

export default router;