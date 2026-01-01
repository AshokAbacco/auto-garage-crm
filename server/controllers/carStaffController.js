// server/controllers/carStaffController.js
import bcrypt from "bcryptjs";
import prisma from "../models/prismaClient.js";
import PLAN_LIMITS from "../config/planLimits.js";
/**
 * =============================================
 * CREATE STAFF (HR PROFILE ONLY)
 * =============================================
 */
export const createStaff = async (req, res) => {
  try {
    if (req.user.type !== "owner") {
      return res.status(403).json({ message: "Access denied" });
    }

    const {
      name,
      role,
      phone,
      joinDate,
      baseSalary,
      bonus,
      leaves,
      deductionPerLeave,
      extraDeductions,
    } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Staff name is required" });
    }

    const staff = await prisma.carStaff.create({
      data: {
        ownerId: req.user.id,
        name,
        role,
        phone,
        joinDate: joinDate ? new Date(joinDate) : undefined,
        baseSalary: Number(baseSalary || 0),
        bonus: Number(bonus || 0),
        leaves: Number(leaves || 0),
        deductionPerLeave: Number(deductionPerLeave || 0),
        extraDeductions: Number(extraDeductions || 0),
      },
    });

    return res.status(201).json({
      message: "Staff created successfully",
      staff,
    });
  } catch (error) {
    console.error("❌ Create Staff Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * =============================================
 * LIST STAFF (OWNER)
 * =============================================
 */
export const listStaff = async (req, res) => {
  try {
    const staff = await prisma.carStaff.findMany({
      where: { ownerId: req.user.id },
      orderBy: { createdAt: "desc" },
      include: {
        login: {
          select: {
            id: true,
            email: true,
            isActive: true,
          },
        },
      },
    });

    return res.status(200).json(staff);
  } catch (error) {
    console.error("❌ List Staff Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * =============================================
 * UPDATE STAFF INFO (HR + LOGIN INFO)
 * =============================================
 */
export const updateStaff = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      name,
      role,
      phone,
      email, // 👈 coming from edit modal
      baseSalary,
      bonus,
      leaves,
      deductionPerLeave,
      extraDeductions,
      joinDate,
    } = req.body;

    // 1️⃣ Update staff profile
    const staff = await prisma.carStaff.updateMany({
      where: {
        id: Number(id),
        ownerId: req.user.id,
      },
      data: {
        name,
        role,
        phone,
        baseSalary: Number(baseSalary),
        bonus: Number(bonus),
        leaves: Number(leaves),
        deductionPerLeave: Number(deductionPerLeave),
        extraDeductions: Number(extraDeductions),
        joinDate: joinDate ? new Date(joinDate) : undefined,
      },
    });

    if (staff.count === 0) {
      return res.status(404).json({ message: "Staff not found" });
    }

    // 2️⃣ Update login email (if exists)
    if (email) {
      await prisma.carStaffLogin.updateMany({
        where: {
          staffId: Number(id),
          ownerId: req.user.id,
        },
        data: { email },
      });
    }

    return res.json({ message: "Staff updated successfully" });
  } catch (error) {
    console.error("❌ Update Staff Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};


/**
 * =============================================
 * DELETE STAFF (HR + LOGIN AUTO REMOVED)
 * =============================================
 */
export const deleteStaff = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await prisma.carStaff.deleteMany({
      where: {
        id: Number(id),
        ownerId: req.user.id,
      },
    });

    if (deleted.count === 0) {
      return res.status(404).json({ message: "Staff not found" });
    }

    return res.json({ message: "Staff deleted successfully" });
  } catch (error) {
    console.error("❌ Delete Staff Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * =============================================
 * TOGGLE STAFF LOGIN ACTIVE / INACTIVE (PLAN LIMIT)
 * =============================================
 */
export const toggleStaffStatus = async (req, res) => {
  try {
    if (req.user.type !== "owner") {
      return res.status(403).json({ message: "Access denied" });
    }

    const ownerId = req.user.id;
    const staffId = Number(req.params.id);

    // 1️⃣ Find staff
    const staff = await prisma.carStaff.findFirst({
      where: { id: staffId, ownerId },
      include: { login: true },
    });

    if (!staff || !staff.login) {
      return res.status(404).json({ message: "Staff login not found" });
    }

    const login = staff.login;

    // 2️⃣ ACTIVATING → CHECK PLAN LIMIT
    if (!login.isActive) {
      const activeLoginCount = await prisma.carStaffLogin.count({
        where: {
          ownerId,
          isActive: true, // ✅ CORRECT MODEL
        },
      });

      const allowedUsers = PLAN_LIMITS[req.user.plan];
      const maxActiveStaff = allowedUsers - 1; // owner excluded

      if (activeLoginCount >= maxActiveStaff) {
        return res.status(400).json({
          message:
            "Active staff limit reached. Deactivate another staff or upgrade your plan.",
        });
      }
    }

    // 3️⃣ TOGGLE LOGIN STATUS
    const updatedLogin = await prisma.carStaffLogin.update({
      where: { id: login.id },
      data: { isActive: !login.isActive },
    });

    return res.json({
      message: `Staff login ${
        updatedLogin.isActive ? "activated" : "deactivated"
      } successfully`,
      isActive: updatedLogin.isActive,
    });
  } catch (error) {
    console.error("❌ Toggle Staff Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};




