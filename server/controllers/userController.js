// controllers/userController.js

import bcrypt from "bcryptjs";
import prisma from "../models/prismaClient.js";
 
/**
 * @desc Get logged-in user's profile
 * @route GET /api/user/profile
 * @access Private
 */

const API_URL = process.env.VITE_API_BASE_URL;

export const getProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        username: true,
        email: true,
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
 * @desc Update profile (username, email)
 * @route PUT /api/user/update
 * @access Private
 */
export const updateProfile = async (req, res) => {
  try {
    const { username, email } = req.body;

    // Username/email update
    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        username,
        email,
      },
      select: {
        id: true,
        username: true,
        email: true,
        profileImage: true,
        role: true,
        updatedAt: true,
      },
    });

    return res.json({
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Update Profile Error:", error);
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
