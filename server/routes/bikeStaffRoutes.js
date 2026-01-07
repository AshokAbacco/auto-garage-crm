import express from "express";
import {
  createStaff,
  getStaff,
  getStaffById,
  updateStaff,
  deleteStaff,
} from "../controllers/bikeStaffController.js";
import { protect } from "../middleware/authMiddleware.js";


const router = express.Router();

router.post("/", protect, createStaff);
router.get("/", protect, getStaff);
router.get("/:id", protect, getStaffById);
router.put("/:id", protect, updateStaff);
router.delete("/:id", protect, deleteStaff);

export default router;