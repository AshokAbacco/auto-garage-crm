import express from "express";
import {
  createWashingStaffSalary,
  getWashingStaffSalary,
  updateWashingStaffSalary,
  payWashingStaffSalary,
  getWashingSalaryHistory,
  deleteWashingStaffSalary,
} from "../controllers/washingStaffSalaryController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.post("/", createWashingStaffSalary);
router.get("/", getWashingStaffSalary);
router.put("/:id", updateWashingStaffSalary);
router.post("/:id/pay", payWashingStaffSalary);
router.get("/:id/history", getWashingSalaryHistory);
router.delete("/:id", deleteWashingStaffSalary); // ✅ ADD

export default router;
