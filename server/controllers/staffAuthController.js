import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../models/prismaClient.js";

export const loginStaff = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const staff = await prisma.carStaff.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!staff || !staff.isActive) {
      return res.status(401).json({
        message: "Invalid credentials or inactive staff",
      });
    }

    const isMatch = await bcrypt.compare(password, staff.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // 🔐 Staff JWT (NOTE: type = staff)
    const token = jwt.sign(
      {
        id: staff.id,
        type: "staff",
        ownerId: staff.ownerId,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      message: "Staff login successful",
      token,
      user: {
        id: staff.id,
        type: "staff",
        role: "staff",
        ownerId: staff.ownerId,
        name: staff.name,
        email: staff.email,
      },
    });
  } catch (error) {
    console.error("❌ Staff Login Error:", error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};
