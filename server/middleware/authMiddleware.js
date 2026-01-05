import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import prisma from "../models/prismaClient.js";

dotenv.config();
 
dotenv.config();

export const protect = async (req, res, next) => {
  console.log("AUTH USER:", req.user);
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
     const login = await prisma.carStaffLogin.findUnique({
       where: { id: decoded.id }, // 🔑 MATCH JWT ID
       include: {
         staff: true,
       },
     });

     if (!login || !login.isActive || !login.staff) {
       return res.status(401).json({
         message: "Staff not found or inactive",
       });
     }

     const owner = await prisma.user.findUnique({
       where: { id: login.ownerId },
       select: { plan: true },
     });

     req.user = {
       id: login.staff.id,
       type: "staff",
       role: login.staff.role,
       ownerId: login.ownerId,
       plan: owner?.plan || "BASIC", // ✅ INHERIT OWNER PLAN
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

    // ✅ FIX: explicitly set type = "owner"
    req.user = {
      ...user,
      type: "owner",
      role: user.role, // keep as-is ("user")
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

