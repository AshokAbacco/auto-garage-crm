// server/controllers/authController.js
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../models/prismaClient.js";
import { generateToken } from "../utils/generateToken.js";

/**
 * @desc Register a new user
 * @route POST /api/auth/register
 * @access Public 
 */
export const registerUser = async (req, res) => {
  try {
    const { username, email, password, crmType } = req.body;

    // Validate
    if (!username || !email || !password || !crmType) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if user already exists (TEMP USER created after payment)
    let existingUser = await prisma.user.findUnique({
      where: { email }
    });

    // === CASE 1: USER EXISTS → UPDATE IT ===
    if (existingUser) {
      const hashedPassword = await bcrypt.hash(password, 10);

      const updatedUser = await prisma.user.update({
        where: { email },
        data: {
          username,
          password: hashedPassword,
          allowedCrms: [crmType.toUpperCase()],
        }
      });

      const token = generateToken(updatedUser);

      return res.status(200).json({
        message: "Registration completed successfully",
        token,
        user: updatedUser
      });
    }

    // === CASE 2: NEW USER (no payment) ===
    const hashedPassword = await bcrypt.hash(password, 10);

    const myReferralCode =
      "ATREF-" + Math.random().toString(36).substring(2, 8).toUpperCase();

    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        role: "user",
        profileImage: null,
        allowedCrms: [crmType.toUpperCase()],
        myReferralCode,
        referredByCode: null,
        referredByUserId: null,
      },
    });

    const token = generateToken(newUser);

    return res.status(201).json({
      message: "User registered successfully",
      token,
      user: newUser
    });

  } catch (error) {
    console.error("❌ Registration Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};





/**
 * @desc Login a user
 * @route POST /api/auth/login
 * @access Public
 */
export const loginUser = async (req, res) => {
  try {
    const { identifier, password, crmType } = req.body;

    if (!identifier || !password || !crmType) {
      return res.status(400).json({
        message: "Email/Username, password and CRM type are required",
      });
    }

    const isEmail = identifier.includes("@");

    const user = await prisma.user.findFirst({
      where: isEmail ? { email: identifier } : { username: identifier },
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

    // ⭐ Fetch the user's company name from payment table
    const userPayment = await prisma.payment.findFirst({
      where: { email: user.email },
      orderBy: { createdAt: "desc" },
      select: { companyName: true },
    });

    const token = generateToken(user);

    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage || null,
        allowedCrms: user.allowedCrms,
        crmType,
        companyName: userPayment?.companyName || null, // ⭐ added
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
 * @desc Get current user's profile
 * @route GET /api/auth/profile
 * @access Private
 */
export const getProfile = async (req, res) => {
  try {
    // ✅ Fetch user from DB
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        profileImage: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("❌ Profile Fetch Error:", error);
    res.status(500).json({ message: "Error fetching profile" });
  }
};

/**
 * @desc Verify JWT token validity
 * @route GET /api/auth/verify
 * @access Public (self-check)
 */
export const verifyToken = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({
        valid: false,
        message: "No token provided",
      });
    }

    const token = authHeader.split(" ")[1];

    // ✅ Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ Confirm user exists
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, username: true, email: true, role: true },
    });

    if (!user) {
      return res.status(404).json({
        valid: false,
        message: "User not found for this token",
      });
    }

    return res.status(200).json({
      valid: true,
      user,
    });
  } catch (error) {
    console.error("❌ Token Verification Error:", error);
    return res.status(401).json({
      valid: false,
      message: "Invalid or expired token",
    });
  }
};

/**
 * @desc Delete user account
 * @route DELETE /api/auth/delete
 * @access Private
 */
export const deleteAccount = async (req, res) => {
  try {
    const userId = req.user.id;

    // Delete user-related payment records (if needed)
    await prisma.payment.deleteMany({
      where: { email: req.user.email }
    });

    // Delete user
    await prisma.user.delete({
      where: { id: userId }
    });

    return res.status(200).json({ message: "Account deleted successfully" });

  } catch (error) {
    console.error("❌ Delete Account Error:", error);
    return res.status(500).json({ message: "Failed to delete account" });
  }
};
