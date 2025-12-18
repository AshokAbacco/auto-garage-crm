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

    /**
     * =====================================
     * STAFF AUTH (CarStaff table)
     * =====================================
     */
    if (decoded.type === "staff") {
      const staff = await prisma.carStaff.findUnique({
        where: { id: decoded.id },
      });

      if (!staff || !staff.isActive) {
        return res.status(401).json({
          message: "Staff not found or inactive",
        });
      }

      req.user = {
        id: staff.id,
        type: "staff",
        role: "staff",
        ownerId: staff.ownerId,
      };

      return next();
    }

    /**
     * =====================================
     * OWNER AUTH (User table)
     * =====================================
     */
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        role: true,
        plan: true,
        allowedCrms: true,
      },
    });

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = {
      id: user.id,
      type: "owner",
      role: user.role,
      plan: user.plan,
      allowedCrms: user.allowedCrms,
      email: user.email,
    };

    next();
  } catch (error) {
    console.error("❌ Auth Middleware Error:", error);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
