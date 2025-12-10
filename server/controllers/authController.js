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

    // Check duplicates
    const [existingUserByEmail, existingUserByUsername] = await Promise.all([
      prisma.user.findUnique({ where: { email: emailLower } }),
      prisma.user.findUnique({ where: { username } }),
    ]);

    if (
      existingUserByUsername &&
      (!existingUserByEmail || existingUserByUsername.id !== existingUserByEmail.id)
    ) {
      return res.status(400).json({
        message: "This username is already taken.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // CASE 1 — User exists by email (temporary user previously created)
    if (existingUserByEmail) {
      const updatedUser = await prisma.user.update({
        where: { email: emailLower },
        data: {
          username,
          password: hashedPassword,
          allowedCrms: [crmType.toUpperCase()],
          plan: "BASIC", // ⭐ Default plan on registration
        },
      });

      const token = generateToken(updatedUser);

      return res.status(200).json({
        message: "Registration completed successfully",
        token,
        user: updatedUser,
      });
    }

    // CASE 2 — New user
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
        profileImage: null,
        referredByCode: null,
        referredByUserId: null,
        plan: "BASIC", // ⭐ Default plan
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

    if (error.code === "P2002") {
      const target = error.meta?.target || [];
      if (target.includes("username"))
        return res.status(400).json({ message: "Username already taken" });
      if (target.includes("email"))
        return res.status(400).json({ message: "Email already registered" });
    }

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
      where: isEmail ? { email: identifier.toLowerCase() } : { username: identifier },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // CRM permission check
    if (!user.allowedCrms.includes(crmType.toUpperCase())) {
      return res.status(403).json({
        message: `You do not have access to the ${crmType} CRM`,
      });
    }

    // Fetch extra fields from payment table (optional)
    const userPayment = await prisma.payment.findFirst({
      where: { email: user.email },
      orderBy: { createdAt: "desc" },
      select: { companyName: true, phone: true },
    });

    // ⭐ Token now includes plan
    const token = generateToken(user);

    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email.toLowerCase(),
        role: user.role,
        plan: user.plan, // ⭐ RETURN PLAN
        profileImage: user.profileImage || null,
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
