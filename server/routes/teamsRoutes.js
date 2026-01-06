import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  createTeam,
  getTeamInfo,
  getTeams,
  deleteTeam,
  washStaffLogin,
} from "../controllers/teamsController.js";

const router = express.Router();

/**
 * ==============================
 * ADMIN CHECK (role === "user")
 * ==============================
 */
const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== "user") {
    return res.status(403).json({ message: "Admin access only" });
  }
  next();
};

/**
 * ==============================
 * /api/teams (ADMIN ONLY)
 * ==============================
 */

router.post("/create", protect, adminOnly, createTeam);
router.get("/info", protect, adminOnly, getTeamInfo);
router.get("/", protect, adminOnly, getTeams);
router.delete("/:id", protect, adminOnly, deleteTeam);
router.post("/wash-staff/login", washStaffLogin);

export default router;
