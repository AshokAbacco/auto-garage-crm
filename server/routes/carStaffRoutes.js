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
import { requirePlan } from "../middleware/planMiddleware.js";
import prisma from "../models/prismaClient.js";

const router = express.Router();

/**
 * OWNER ONLY — STAFF HR MANAGEMENT
 */
router.post(
  "/",
  protect,
  requirePlan(["STANDARD", "PREMIUM"]),
  ownerOnly,
  createStaff,
);
router.get("/", protect, ownerOnly, listStaff);
router.put("/:id", protect, ownerOnly, updateStaff);
router.delete("/:id", protect, ownerOnly, deleteStaff);
router.patch("/:id/toggle", protect, ownerOnly, toggleStaffStatus);

router.get("/search-mechanics", protect, async (req, res, next) => {
  try {
    const ownerId = req.user.id; // Extracted safely from protect middleware JWT token
    const { q } = req.query;

    const mechanics = await prisma.carStaff.findMany({
      where: {
        ownerId: ownerId, // Ensures staff only belong to this user/owner
        isActive: true, // Only display active staff members
        ...(q && {
          name: {
            contains: q,
            mode: "insensitive", // Case-insensitive matching (e.g. "rahul" matches "Rahul")
          },
        }),
      },
      select: {
        id: true,
        name: true,
        role: true,
      },
      take: 10, // Safeguard performance limit
    });

    return res.status(200).json(mechanics);
  } catch (error) {
    next(error); // Passes any unexpected errors to your global error handler in server.js
  }
});

export default router;
