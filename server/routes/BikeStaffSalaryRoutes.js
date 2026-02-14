import express from "express";
import {
  createBikeStaff,
  getBikeStaff,
  updateBikeStaff,
  payBikeStaffSalary,
  getBikeSalaryHistory,
  deleteBikeStaff
} from "../controllers/BikestaffSalaryController.js";


const router = express.Router();

router.post("/", createBikeStaff);
router.get("/", getBikeStaff);
router.put("/:id", updateBikeStaff);
router.post("/:id/pay", payBikeStaffSalary);
router.get("/:id/history", getBikeSalaryHistory);
router.delete("/:id", deleteBikeStaff);

export default router;
