import express from "express";
import {
  getWashingReminders,
  getWashingReminderById,
  createWashingReminder,
  updateWashingReminder,
  deleteWashingReminder,
} from "../controllers/washingReminderController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.get("/", getWashingReminders);
router.get("/:id", getWashingReminderById);
router.post("/", createWashingReminder);
router.put("/:id", updateWashingReminder);
router.delete("/:id", deleteWashingReminder);

export default router;
