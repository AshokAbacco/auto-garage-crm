import bcrypt from "bcryptjs";
import prisma from "../models/prismaClient.js";
import PLAN_LIMITS from "../config/planLimits.js";

/**
 * =============================================
 * CREATE STAFF (OWNER ONLY)
 * =============================================
 */
export const createStaff = async (req, res) => {
  try {
    // Owner is already authenticated via protect middleware
    if (req.user.type !== "owner") {
      return res.status(403).json({ message: "Access denied" });
    }

    const ownerId = req.user.id;
    const { email, password, name, phone } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    // 1️⃣ Count existing staff
    const staffCount = await prisma.carStaff.count({
      where: { ownerId },
    });

    const allowedUsers = PLAN_LIMITS[req.user.plan];

    // Owner counts as 1
    if (staffCount + 1 >= allowedUsers) {
      return res.status(400).json({
        message: "Staff limit reached. Upgrade your plan.",
      });
    }

    // 2️⃣ Prevent duplicate email
    const existingStaff = await prisma.carStaff.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingStaff) {
      return res.status(400).json({ message: "Staff email already exists" });
    }

    // 3️⃣ Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4️⃣ Create staff
    const staff = await prisma.carStaff.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        name,
        phone,
        ownerId,
      },
    });

    res.status(201).json({
      message: "Staff created successfully",
      staff: {
        id: staff.id,
        email: staff.email,
        name: staff.name,
        phone: staff.phone,
        isActive: staff.isActive,
      },
    });
  } catch (error) {
    console.error("❌ Create Staff Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * =============================================
 * LIST STAFF (OWNER ONLY)
 * =============================================
 */
export const listStaff = async (req, res) => {
  try {
    if (req.user.type !== "owner") {
      return res.status(403).json({ message: "Access denied" });
    }

    const staff = await prisma.carStaff.findMany({
      where: { ownerId: req.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        isActive: true,
        baseSalary: true,
        joinDate: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json(staff);
  } catch (error) {
    console.error("❌ List Staff Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * =============================================
 * TOGGLE STAFF ACTIVE / INACTIVE
 * =============================================
 */
export const toggleStaffStatus = async (req, res) => {
  try {
    if (req.user.type !== "owner") {
      return res.status(403).json({ message: "Access denied" });
    }

    const { id } = req.params;

    const staff = await prisma.carStaff.findFirst({
      where: {
        id: Number(id),
        ownerId: req.user.id,
      },
    });

    if (!staff) {
      return res.status(404).json({ message: "Staff not found" });
    }

    const updated = await prisma.carStaff.update({
      where: { id: staff.id },
      data: { isActive: !staff.isActive },
    });

    res.status(200).json({
      message: `Staff ${updated.isActive ? "activated" : "deactivated"}`,
      isActive: updated.isActive,
    });
  } catch (error) {
    console.error("❌ Toggle Staff Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
