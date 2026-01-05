import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../models/prismaClient.js";
import PLAN_LIMITS from "../config/planLimits.js";

/**
 * =====================================================
 * STAFF LOGIN
 * =====================================================
 */
export const loginStaff = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    /**
     * 1️⃣ Find staff login record
     */
    const login = await prisma.carStaffLogin.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        staff: true,
      },
    });

    if (!login || !login.isActive || !login.staff) {
      return res.status(401).json({
        message: "Invalid credentials or inactive account",
      });
    }

    /**
     * 2️⃣ Verify password
     */
    const isMatch = await bcrypt.compare(password, login.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    /**
     * 3️⃣ Fetch OWNER plan
     */
    const owner = await prisma.user.findUnique({
      where: { id: login.ownerId },
      select: { plan: true },
    });

    /**
     * 4️⃣ Issue JWT
     */
    const token = jwt.sign(
      {
        id: login.id, // login id
        type: "staff",
        ownerId: login.ownerId,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    /**
     * 5️⃣ Return login response (IMPORTANT)
     */
    return res.status(200).json({
      message: "Staff login successful",
      token,
      user: {
        id: login.staff.id,
        name: login.staff.name,
        email: login.email,
        role: login.staff.role,
        type: "staff",
        ownerId: login.ownerId,
        plan: owner?.plan || "BASIC", // ✅ OWNER PLAN
      },
    });
  } catch (error) {
    console.error("❌ Staff Login Error:", error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

/**
 * =====================================================
 * CREATE STAFF LOGIN (OWNER ONLY)
 * =====================================================
 */
export const createStaffLogin = async (req, res) => {
  try {
    if (req.user.type !== "owner") {
      return res.status(403).json({ message: "Access denied" });
    }

    const ownerId = req.user.id;
    const staffId = Number(req.params.staffId);
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    /**
     * 1️⃣ Verify staff belongs to owner
     */
    const staff = await prisma.carStaff.findFirst({
      where: {
        id: staffId,
        ownerId,
      },
      include: {
        login: true,
      },
    });

    if (!staff) {
      return res.status(404).json({ message: "Staff not found" });
    }

    if (staff.login) {
      return res.status(400).json({
        message: "Login already exists for this staff",
      });
    }

    /**
     * 2️⃣ Check plan limits
     */
    const activeLoginCount = await prisma.carStaffLogin.count({
      where: {
        ownerId,
        isActive: true,
      },
    });

    const allowedUsers = PLAN_LIMITS[req.user.plan];
    const maxStaffLogins = allowedUsers - 1; // owner excluded

    if (activeLoginCount >= maxStaffLogins) {
      return res.status(400).json({
        message:
          "Active staff login limit reached. Deactivate another login or upgrade your plan.",
      });
    }

    /**
     * 3️⃣ Prevent duplicate email
     */
    const emailExists = await prisma.carStaffLogin.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (emailExists) {
      return res.status(400).json({
        message: "Email already in use",
      });
    }

    /**
     * 4️⃣ Create staff login
     */
    const hashedPassword = await bcrypt.hash(password, 10);

    const login = await prisma.carStaffLogin.create({
      data: {
        staffId,
        ownerId,
        email: email.toLowerCase(),
        password: hashedPassword,
      },
    });

    return res.status(201).json({
      message: "Staff login created successfully",
      login: {
        id: login.id,
        email: login.email,
        isActive: login.isActive,
      },
    });
  } catch (error) {
    console.error("❌ Create Staff Login Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * =====================================================
 * STAFF PROFILE
 * =====================================================
 */
export const getStaffProfile = async (req, res) => {
  try {
    if (req.user.type !== "staff") {
      return res.status(403).json({ message: "Forbidden" });
    }

    /**
     * Fetch staff + owner plan
     */
    const staff = await prisma.carStaff.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        role: true,
        ownerId: true,
        owner: {
          select: {
            companyName: true,
            plan: true, // ✅ OWNER PLAN
          },
        },
        login: {
          select: {
            email: true,
          },
        },
      },
    });

    if (!staff) {
      return res.status(404).json({ message: "Staff not found" });
    }

    return res.status(200).json({
      id: staff.id,
      name: staff.name,
      email: staff.login.email,
      role: staff.role,
      ownerId: staff.ownerId,
      companyName: staff.owner.companyName,
      plan: staff.owner.plan || "BASIC", // ✅ IMPORTANT
      type: "staff",
    });
  } catch (error) {
    console.error("❌ STAFF PROFILE ERROR:", error);
    return res.status(500).json({ message: "Failed to load staff profile" });
  }
};
