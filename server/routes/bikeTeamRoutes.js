import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  createBikeTeamMember,
  getBikeTeamList,
  bikeTeamLogin,   // ✅ import from SAME file
  getBikeTeamInfo,
} from "../controllers/bikeTeamController.js";

const router = express.Router();

// 👑 Owner routes
router.post("/create", protect, createBikeTeamMember);
router.get("/list", protect, getBikeTeamList);

// 🔐 Team login
router.post("/login", bikeTeamLogin);
router.get("/info", protect, getBikeTeamInfo);

export default router;
