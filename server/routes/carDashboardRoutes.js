import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { getDashboardData } from "../controllers/carDashboardController.js";

const router = express.Router();

/**
 * CAR DASHBOARD ROUTE
 * FINAL PATH: /api/dashboard
 */
router.get("/", protect, getDashboardData);

export default router;
