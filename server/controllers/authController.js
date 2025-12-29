// server/controllers/authController.js
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../models/prismaClient.js";
import { generateToken } from "../utils/generateToken.js";

/**
 * =============================================
 * REGISTER USER
 * =============================================
 */
export const registerUser = async (req, res) => {
  try {
    const { username, email, password, crmType } = req.body;

    if (!username || !email || !password || !crmType) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const emailLower = email.toLowerCase().trim();
    const hashedPassword = await bcrypt.hash(password, 10);

    // 🔍 Fetch latest payment FIRST
    const latestPayment = await prisma.payment.findFirst({
      where: { email: emailLower },
      orderBy: { createdAt: "desc" },
    });

    const plan = latestPayment?.plan || "BASIC";
    const planExpiry = latestPayment?.expiryDate || null;

    const existingUser = await prisma.user.findUnique({
      where: { email: emailLower },
    });

    // 🟡 EXISTING USER (after payment)
    if (existingUser) {
      const updatedUser = await prisma.user.update({
        where: { email: emailLower },
        data: {
          username,
          password: hashedPassword,
          allowedCrms: [crmType.toUpperCase()],
          plan,
          planExpiry,
        },
      });

      const token = generateToken(updatedUser);

      return res.status(200).json({
        message: "Registration completed successfully",
        token,
        user: updatedUser,
      });
    }

    // 🟢 NEW USER
    const myReferralCode =
      "ATREF-" + Math.random().toString(36).substring(2, 8).toUpperCase();

    const newUser = await prisma.user.create({
      data: {
        username,
        email: emailLower,
        password: hashedPassword,
        role: "user",
        allowedCrms: [crmType.toUpperCase()],
        myReferralCode,
        plan,
        planExpiry,
      },
    });

    const token = generateToken(newUser);

    return res.status(201).json({
      message: "User registered successfully",
      token,
      user: newUser,
    });
  } catch (error) {
    console.error("❌ Registration Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};


/**
 * =============================================
 * LOGIN USER
 * =============================================
 */
export const loginUser = async (req, res) => {
  try {
    const { identifier, password, crmType } = req.body;

    if (!identifier || !password || !crmType) {
      return res.status(400).json({
        message: "Email/Username, password, and CRM type are required",
      });
    }

    const isEmail = identifier.includes("@");

    const user = await prisma.user.findFirst({
      where: isEmail
        ? { email: identifier.toLowerCase() }
        : { username: identifier },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

   /* ================================
   🔐 SALARY ACCESS RULES
   ================================ */
    if (crmType.toUpperCase() === "SALARY") {
      if (user.role !== "user") {
        return res
          .status(403)
          .json({ message: "Only ADMIN can access Salary module" });
      }

      if (user.plan !== "PREMIUM") {
        return res
          .status(403)
          .json({ message: "Premium plan required to access Salary module" });
      }
    }

    /* ================================
      CRM ACCESS CHECK (SKIP SALARY)
      ================================ */
    if (
      crmType.toUpperCase() !== "SALARY" &&
      !user.allowedCrms.includes(crmType.toUpperCase())
    ) {
      return res.status(403).json({
        message: `You do not have access to the ${crmType} CRM`,
      });
    }


    // 🔄 SAFETY PLAN SYNC (READ ONLY)
    const latestPayment = await prisma.payment.findFirst({
      where: { email: user.email, status: "ACTIVE" },
      orderBy: { createdAt: "desc" },
    });

    let finalPlan = user.plan;
    let finalExpiry = user.planExpiry;

    if (latestPayment && latestPayment.plan !== user.plan) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          plan: latestPayment.plan,
          planExpiry: latestPayment.expiryDate,
        },
      });

      finalPlan = latestPayment.plan;
      finalExpiry = latestPayment.expiryDate;
    }

    const userPayment = await prisma.payment.findFirst({
      where: { email: user.email },
      orderBy: { createdAt: "desc" },
      select: { companyName: true, phone: true },
    });

    const token = generateToken({
      ...user,
      plan: finalPlan,
      planExpiry: finalExpiry,
    });

    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        plan: finalPlan,
        planExpiry: finalExpiry,
        allowedCrms: user.allowedCrms,
        crmType,
        companyName: userPayment?.companyName || null,
        phone: userPayment?.phone || null,
      },
    });
  } catch (error) {
    console.error("❌ Login Error:", error);
    return res.status(500).json({
      message: "Internal server error during login",
    });
  }
};


/**
 * =============================================
 * GET PROFILE
 * =============================================
 */
export const getProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        plan: true, // ⭐ RETURN PLAN
        profileImage: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json(user);
  } catch (error) {
    console.error("❌ Profile Fetch Error:", error);
    res.status(500).json({ message: "Error fetching profile" });
  }
};

/**
 * =============================================
 * VERIFY TOKEN
 * =============================================
 */
export const verifyToken = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ valid: false, message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, username: true, email: true, role: true, plan: true },
    });

    if (!user) {
      return res.status(404).json({ valid: false, message: "User not found" });
    }

    return res.status(200).json({
      valid: true,
      user,
    });
  } catch (error) {
    console.error("❌ Token Verification Error:", error);
    return res.status(401).json({ valid: false, message: "Invalid or expired token" });
  }
};

/**
 * =============================================
 * DELETE ACCOUNT
 * =============================================
 */
export const deleteAccount = async (req, res) => {
  try {
    const userId = req.user.id;

    await prisma.payment.deleteMany({
      where: { email: req.user.email },
    });

    await prisma.user.delete({
      where: { id: userId },
    });

    res.status(200).json({ message: "Account deleted successfully" });
  } catch (error) {
    console.error("❌ Delete Account Error:", error);
    return res.status(500).json({ message: "Failed to delete account" });
  }
};
