// teamsRoutes.js
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
const ownerOnly = (req, res, next) => {
  if (!req.user || req.user.type !== "owner") {
    return res.status(403).json({ message: "Owner only" });
  }
  next();
};


/**
 * ==============================
 * /api/teams (ADMIN ONLY)
 * ==============================
 */
router.get("/info", protect, ownerOnly, getTeamInfo);
router.post("/create", protect, ownerOnly, createTeam);
router.get("/", protect, ownerOnly, getTeams);
router.delete("/:id", protect, ownerOnly, deleteTeam);


// staff login (NO AUTH)
router.post("/wash-staff/login", washStaffLogin);

export default router;
