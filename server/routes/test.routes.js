import express from "express";
import { runBikeReminderCheck } from "../services/bikeReminderScheduler.js";

const router = express.Router();

router.get("/bike-reminder", async (req, res) => {
  try {
    await runBikeReminderCheck();
    res.json({ success: true, message: "Bike reminder check executed" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
