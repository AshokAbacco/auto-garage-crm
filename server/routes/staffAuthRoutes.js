import express from "express";
import {
  loginStaff,
  createStaffLogin,
  getStaffProfile,
} from "../controllers/staffAuthController.js";
import { protect } from "../middleware/authMiddleware.js";
import { ownerOnly } from "../middleware/ownerOnly.js";

const router = express.Router();

router.post("/login", loginStaff);
router.post("/create/:staffId", protect, ownerOnly, createStaffLogin);
router.get("/profile", protect, getStaffProfile);

export default router;
