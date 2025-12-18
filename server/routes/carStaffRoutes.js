import express from "express";
import {
  createStaff,
  listStaff,
  toggleStaffStatus,
} from "../controllers/carStaffController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// All routes are OWNER protected
router.post("/", protect, createStaff);
router.get("/", protect, listStaff);
router.patch("/:id/toggle", protect, toggleStaffStatus);

export default router;
