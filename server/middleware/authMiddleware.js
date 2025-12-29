// server/middleware/authMiddleware.js
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import prisma from "../models/prismaClient.js";

dotenv.config();

export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ Ensure user still exists
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        plan: true,
        parentUserId: true,
        allowedCrms: true,
      },
    });

    if (!user) {
      return res.status(401).json({
        message: "User not found or deleted",
      });
    }

    // 🔐 Normalize role (important)
    req.user = {
      ...user,
      role: user.role?.toUpperCase(),
    };

    next();
  } catch (error) {
    console.error("❌ Auth Middleware Error:", error);

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        message: "Token expired, please login again",
        expiredAt: error.expiredAt,
      });
    }

    return res.status(401).json({
      message: "Invalid token",
    });
  }
};
