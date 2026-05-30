// server/controllers/carStaffController.js
import prisma from "../models/prismaClient.js";
import PLAN_LIMITS from "../config/planLimits.js";

/**
 * =============================================
 * CREATE STAFF (HR PROFILE + SALARY RULES)
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
      deductionPerLeave,
      bonusDefault,
      extraDeductionsDefault,
      includeInPayroll,
      advanceAmount, // 🔄 Extructured parameter field matching local modal updates
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

        // Salary rules (DEFAULTS)
        baseSalary: Number(baseSalary || 0),
        deductionPerLeave: Number(deductionPerLeave || 0),
        bonusDefault: Number(bonusDefault || 0),
        extraDeductionsDefault: Number(extraDeductionsDefault || 0),
        includeInPayroll:
          includeInPayroll !== undefined ? includeInPayroll : true,
        advanceAmount: Number(advanceAmount || 0), // 🔄 Parsed safe float insertion
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
 * UPDATE STAFF (HR PROFILE + SALARY RULES)
 * =============================================
 */
export const updateStaff = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      name,
      role,
      phone,
      email, // optional (login email)
      joinDate,
      baseSalary,
      deductionPerLeave,
      bonusDefault,
      extraDeductionsDefault,
      includeInPayroll,
      advanceAmount, // 🔄 Extructured parameter field matching local modal updates
    } = req.body;

    // 1️⃣ Update staff profile & salary rules
    const updated = await prisma.carStaff.updateMany({
      where: {
        id: Number(id),
        ownerId: req.user.id,
      },
      data: {
        name,
        role,
        phone,
        joinDate: joinDate ? new Date(joinDate) : undefined,

        baseSalary: baseSalary !== undefined ? Number(baseSalary) : undefined,
        deductionPerLeave:
          deductionPerLeave !== undefined
            ? Number(deductionPerLeave)
            : undefined,
        bonusDefault:
          bonusDefault !== undefined ? Number(bonusDefault) : undefined,
        extraDeductionsDefault:
          extraDeductionsDefault !== undefined
            ? Number(extraDeductionsDefault)
            : undefined,
        includeInPayroll:
          includeInPayroll !== undefined ? includeInPayroll : undefined,
        advanceAmount:
          advanceAmount !== undefined ? Number(advanceAmount) : undefined, // 🔄 Parsed safe float mapping record update
      },
    });

    if (updated.count === 0) {
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

    // 1️⃣ Find staff with login
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
          isActive: true,
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
