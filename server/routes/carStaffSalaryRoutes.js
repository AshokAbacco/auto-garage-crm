import express from "express";
import {ownerOnly} from "../middleware/ownerOnly.js";
import salaryController from "../controllers/carStaffSalaryController.js";

const router = express.Router();

// Generate monthly salary
router.post("/generate", ownerOnly, salaryController.generateMonthlySalary);

// Get salary list (month/year)
router.get("/", ownerOnly, salaryController.getSalaryByMonthYear);

// Mark salary as paid
router.patch("/:id/pay", ownerOnly, salaryController.markSalaryAsPaid);

export default router;
