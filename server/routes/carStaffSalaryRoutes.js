// server/routes/carStaffSalaryRoutes.js
import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { ownerOnly } from "../middleware/ownerOnly.js";
import salaryController from "../controllers/carStaffSalaryController.js";
import { requirePlan } from "../middleware/planMiddleware.js";

const router = express.Router();

// Generate monthly salary (OWNER ONLY)
router.post(
  "/generate",
  protect,
  ownerOnly,
  salaryController.generateMonthlySalary
);

// Get salary list by month/year
router.get(
  "/",
  protect,
  requirePlan(["PREMIUM"]),
  ownerOnly,
  salaryController.getSalaryByMonthYear
);

// Mark salary as paid
router.patch("/:id/pay", protect, ownerOnly, salaryController.markSalaryAsPaid);

// ✅ NEW UPDATE ROUTE
router.put("/:id", protect, ownerOnly, salaryController.updateSalary);

export default router;
