// server/routes/carStaffRoutes.js
import express from "express";
import {
  createStaff,
  listStaff,
  updateStaff,
  deleteStaff,
  toggleStaffStatus,
} from "../controllers/carStaffController.js";
import { protect } from "../middleware/authMiddleware.js";
import { ownerOnly } from "../middleware/ownerOnly.js";

const router = express.Router();

/**
 * OWNER ONLY — STAFF HR MANAGEMENT
 */
router.post("/", protect, ownerOnly, createStaff);
router.get("/", protect, ownerOnly, listStaff);
router.put("/:id", protect, ownerOnly, updateStaff);
router.delete("/:id", protect, ownerOnly, deleteStaff);
router.patch("/:id/toggle", protect, ownerOnly, toggleStaffStatus);



export default router;
