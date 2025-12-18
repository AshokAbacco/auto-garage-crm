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

    // 🔥 FETCH LATEST PAYMENT (SOURCE OF TRUTH)
    const latestPayment = await prisma.payment.findFirst({
      where: { email: emailLower },
      orderBy: { createdAt: "desc" },
    });
    const referralCodeUsed = latestPayment?.referralCode || null;

    // 🔍 Find referrer user (if referral code exists)
    let referredByUserId = null;

    if (referralCodeUsed) {
      const referrer = await prisma.user.findUnique({
        where: { myReferralCode: referralCodeUsed },
        select: { id: true },
      });

      if (referrer) {
        referredByUserId = referrer.id;
      }
    }

    const userPlan = latestPayment?.plan || "BASIC";
    const companyName = latestPayment?.companyName || null;
    const phone = latestPayment?.phone || null;

    // Check duplicates
    const [existingUserByEmail, existingUserByUsername] = await Promise.all([
      prisma.user.findUnique({ where: { email: emailLower } }),
      prisma.user.findUnique({ where: { username } }),
    ]);

    if (
      existingUserByUsername &&
      (!existingUserByEmail ||
        existingUserByUsername.id !== existingUserByEmail.id)
    ) {
      return res.status(400).json({
        message: "This username is already taken.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    /**
     * =============================================
     * CASE 1 — USER EXISTS (EMAIL FROM PAYMENT)
     * =============================================
     */
    if (existingUserByEmail) {
      const updatedUser = await prisma.user.update({
        where: { email: emailLower },
        data: {
          username,
          password: hashedPassword,
          allowedCrms: [crmType.toUpperCase()],
          plan: userPlan,
          companyName,
          phone,
          referredByCode: referralCodeUsed, // ✅
          referredByUserId, // ✅
        },
      });

      const token = generateToken(updatedUser);

      return res.status(200).json({
        message: "Registration completed successfully",
        token,
        user: updatedUser,
      });
    }

    /**
     * =============================================
     * CASE 2 — NEW USER
     * =============================================
     */
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
        referredByCode: referralCodeUsed, 
        referredByUserId, 
        plan: userPlan, 
        companyName, 
        phone, 
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

    /**
     * ============================
     * 1️⃣ TRY OWNER LOGIN (User)
     * ============================
     */
    const owner = await prisma.user.findFirst({
      where: isEmail
        ? { email: identifier.toLowerCase() }
        : { username: identifier },
    });

    if (owner) {
      const isMatch = await bcrypt.compare(password, owner.password);
      if (!isMatch) {
        return res.status(400).json({ message: "Invalid credentials" });
      }

      // ✅ CRM restriction applies ONLY to owner
      if (!owner.allowedCrms.includes(crmType.toUpperCase())) {
        return res.status(403).json({
          message: `You do not have access to the ${crmType} CRM`,
        });
      }

      const token = generateToken({
        id: owner.id,
        role: "user",
        type: "owner",
        plan: owner.plan,
      });

      return res.status(200).json({
        message: "Login successful",
        token,
        user: {
          id: owner.id,
          email: owner.email,
          role: "user",
          type: "owner",
          plan: owner.plan,
          allowedCrms: owner.allowedCrms,
          crmType,
        },
      });
    }

    /**
     * ============================
     * 2️⃣ TRY STAFF LOGIN (CarStaff)
     * ============================
     */
    const staff = await prisma.carStaff.findUnique({
      where: { email: identifier.toLowerCase() },
    });

    if (!staff || !staff.isActive) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isStaffMatch = await bcrypt.compare(password, staff.password);
    if (!isStaffMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // ❗ Staff does NOT need allowedCrms check
    const token = generateToken({
      id: staff.id,
      role: "staff",
      type: "staff",
      ownerId: staff.ownerId,
    });

    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: staff.id,
        email: staff.email,
        role: "staff",
        type: "staff",
        ownerId: staff.ownerId,
        crmType,
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
/**
 * =============================================
 * VERIFY TOKEN (OWNER + STAFF)
 * =============================================
 */
export const verifyToken = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ valid: false });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    /**
     * ===============================
     * STAFF TOKEN
     * ===============================
     */
    if (decoded.type === "staff") {
      const staff = await prisma.carStaff.findUnique({
        where: { id: decoded.id },
      });

      if (!staff || !staff.isActive) {
        return res.status(401).json({ valid: false });
      }

      return res.status(200).json({
        valid: true,
        user: {
          id: staff.id,
          type: "staff",
          role: "staff",
          ownerId: staff.ownerId,
        },
      });
    }

    /**
     * ===============================
     * OWNER TOKEN
     * ===============================
     */
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        plan: true,
      },
    });

    if (!user) {
      return res.status(401).json({ valid: false });
    }

    return res.status(200).json({
      valid: true,
      user: {
        id: user.id,
        type: "owner",
        role: user.role,
        plan: user.plan,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("❌ Token Verification Error:", error);
    return res.status(401).json({ valid: false });
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
