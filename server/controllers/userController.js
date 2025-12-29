// controllers/userController.js

import bcrypt from "bcryptjs";
import prisma from "../models/prismaClient.js";

/**
 * @desc Get logged-in user's profile
 * @route GET /api/user/profile
 * @access Private
 */
export const getProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        username: true,
        email: true,
        phone: true,
        companyName: true,
        role: true,
        profileImage: true,
        createdAt: true,
      },
    });

    res.json(user);
  } catch (error) {
    console.error("Get Profile Error:", error);
    res.status(500).json({ message: "Failed to fetch profile" });
  }
};

/**
 * @desc Update profile (username, email, phone, companyName)
 * @route PUT /api/user/update
 * @access Private
 */
export const updateProfile = async (req, res) => {
  try {
    const { username, email, phone, companyName } = req.body;

    // Update user table
    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        username,
        email,
        phone,
        companyName,
      },
      select: {
        id: true,
        username: true,
        email: true,
        phone: true,
        companyName: true,
        profileImage: true,
        role: true,
        updatedAt: true,
      },
    });

    // Update payment table (all records for this user)
    await prisma.payment.updateMany({
      where: { email: updatedUser.email },
      data: {
        phone: phone || undefined,
        companyName: companyName || undefined,
      },
    });

    return res.json({
      message: "Profile updated successfully",
      user: updatedUser,
    });

  } catch (error) {
    console.error("🔥 Update Profile Error:", error);
    res.status(500).json({ message: "Failed to update profile" });
  }
};

/**
 * @desc Change password
 * @route PUT /api/user/change-password
 * @access Private
 */
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Both fields are required" });
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    // Check current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Incorrect current password" });

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: req.user.id },
      data: { password: hashedPassword },
    });

    return res.json({ message: "Password updated successfully" });

  } catch (error) {
    console.error("Change Password Error:", error);
    res.status(500).json({ message: "Failed to change password" });
  }
};

/**
 * @desc Upload profile image
 * @route POST /api/user/upload-image
 * @access Private
 */
export const uploadProfileImage = async (req, res) => {
  try {
    const { image } = req.body;

    if (!image) {
      return res.status(400).json({ message: "Image is required" });
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: { profileImage: image },
    });

    return res.status(200).json({
      message: "Profile image updated",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Upload Image Error:", error);
    return res.status(500).json({ message: "Server error updating image" });
  }
};


// 🔹 NEW ROUTE: check if email already exists
export const checkEmail = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Email is required" });
    }

    const cleanEmail = email.toLowerCase().trim();

    // 🔴 OLD (wrong – Mongoose)
    // const user = await User.findOne({ email: cleanEmail });

    // ✅ NEW (Prisma)
    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (user) {
      return res.json({
        success: true,
        exists: true,
        message:
          "Email already registered. Please login using this email and password.",
      });
    }

    return res.json({
      success: true,
      exists: false,
    });
  } catch (err) {
    console.error("Error in /api/user/check-email:", err);
    res.status(500).json({
      success: false,
      message: "Server error while checking email",
    });
  }
};

/**
 * @desc Create team member (ADMIN only)
 * @route POST /api/user/team/create
 * @access Private
 */

export const getTeamInfo = async (req, res) => {
  try {
    const user = req.user;

    // 🔒 Normalize role (THIS IS THE KEY FIX)
    const role = String(user.role).toLowerCase();

    // ❌ Only OWNER can access team info
    if (role !== "user") {
      return res.status(403).json({
        message: "Only owner can access team info",
      });
    }

    // ❌ Block BASIC plan
    if (user.plan === "BASIC") {
      return res.status(403).json({
        message: "Team not allowed for this plan",
      });
    }

    // ✅ Count owner + team members
    const used = await prisma.user.count({
      where: {
        OR: [
          { id: user.id },
          { parentUserId: user.id },
        ],
      },
    });

    const limit =
      user.plan === "STANDARD" ? 3 :
      user.plan === "PREMIUM" ? 10 : 1;

    return res.json({
      adminEmail: user.email,
      plan: user.plan,
      used,
      limit,
    });

  } catch (error) {
    console.error("getTeamInfo error:", error);
    return res.status(500).json({ message: "Failed to fetch team info" });
  }
};



export const createTeamUser = async (req, res) => {
  try {
    const admin = req.user;

    // 🔒 Normalize role
    const role = String(admin.role).toLowerCase();

    // ❌ Only OWNER can add team
    if (role !== "user") {
      return res.status(403).json({
        message: "Only owner can add team",
      });
    }

    // ❌ Block BASIC plan
    if (admin.plan === "BASIC") {
      return res.status(403).json({
        message: "Upgrade plan to add team",
      });
    }

    const limit =
      admin.plan === "STANDARD" ? 3 :
      admin.plan === "PREMIUM" ? 10 : 1;

    const used = await prisma.user.count({
      where: {
        OR: [{ id: admin.id }, { parentUserId: admin.id }],
      },
    });

    if (used >= limit) {
      return res.status(403).json({ message: "Team limit reached" });
    }

    const { email, username, password } = req.body;

    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const myReferralCode =
      "ATREF-" + Math.random().toString(36).substring(2, 8).toUpperCase();

    await prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
        role: "TEAM_MEMBER",
        parentUserId: admin.id,
        plan: admin.plan,
        allowedCrms: admin.allowedCrms?.length
          ? admin.allowedCrms
          : ["BIKE"],
        myReferralCode,
      },
    });

    res.json({ success: true, message: "Team user created" });

  } catch (error) {
    console.error("createTeamUser error:", error);
    res.status(500).json({ message: "Failed to create team user" });
  }
};

