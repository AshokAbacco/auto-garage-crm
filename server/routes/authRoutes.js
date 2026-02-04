// server/routes/authRoutes.js
import express from "express";
import {
    registerUser,
    loginUser,
    getProfile,
    verifyToken,
    deleteAccount,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();


/**
 * @desc Auth Routes
 * @route /api/auth
 */
 
// 🟢 Public Routes
router.post("/register", registerUser); // Register new user
router.post("/login", loginUser);       // Login and get token

// 🔒 Protected Routes
router.get("/profile", protect, getProfile); // Get logged-in user's info
router.get("/verify", protect, verifyToken);          // Self-verification (no protect needed)

router.delete("/delete", protect, deleteAccount);

export default router;
