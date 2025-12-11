import express from "express";
import {
  getBikeReminders,
  getBikeReminderById,
  createBikeReminder,
  updateBikeReminder,
  deleteBikeReminder,
} from "../controllers/bikeRemindersController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// ✅ Fetch all bike reminders OR create
router
  .route("/")
  .get(protect, getBikeReminders)
  .post(protect, createBikeReminder);

// ✅ Fetch, update or delete by ID
router
  .route("/:id")
  .get(protect, getBikeReminderById)
  .put(protect, updateBikeReminder)
  .delete(protect, deleteBikeReminder);

export default router;
