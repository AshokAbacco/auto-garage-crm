// server/middleware/authMiddleware.js
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import prisma from "../models/prismaClient.js";

dotenv.config();

export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // ===============================
    // TOKEN CHECK
    // ===============================
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Capture the active CRM type workspace from the signed token payload
    const activeCrmType = decoded.crmType
      ? decoded.crmType.toUpperCase().trim()
      : null;

    console.log("====================================================");
    console.log("🛡️  [AUTH MIDDLEWARE] Processing Core Authorization");
    console.log(`   ↳ Decoded User Type: "${decoded.type || "unknown"}"`);
    console.log(`   ↳ Decoded User ID: "${decoded.id || "none"}"`);
    console.log(
      `   ↳ Decoded Token crmType Payload: ${activeCrmType ? `"${activeCrmType}"` : "None"}`,
    );
    console.log("====================================================");

    /**
     * =====================================
     * 🧑‍🔧 BIKE TEAM AUTH
     * =====================================
     */
    if (decoded.type === "bike_team") {
      req.user = {
        id: decoded.id,
        type: "bike_team",
        ownerId: decoded.ownerId,
        teamId: decoded.teamId,
        crmType: activeCrmType || "BIKE", // Fallback to BIKE context for bike team members
      };
      console.log(
        `   ⚙️  [AUTH MIDDLEWARE] Assigned Workspace Context: "${req.user.crmType}" (BIKE TEAM)`,
      );
      return next();
    }

    // ======================================================
    // CAR STAFF AUTH (inherits owner plan)
    // ======================================================
    if (decoded.type === "staff") {
      const login = await prisma.carStaffLogin.findUnique({
        where: { id: decoded.id },
        include: { staff: true },
      });

      if (!login || !login.isActive || !login.staff) {
        console.log(
          "   ❌ [AUTH MIDDLEWARE] Staff validation failed or marked inactive",
        );
        return res.status(401).json({ message: "Staff not found or inactive" });
      }

      const owner = await prisma.user.findUnique({
        where: { id: login.ownerId },
        select: { plan: true },
      });

      req.user = {
        id: login.staff.id,
        type: "staff",
        role: login.staff.role || "staff",
        ownerId: login.ownerId,
        plan: owner?.plan || "BASIC", // ✅ inherit owner plan
        crmType: activeCrmType || "CAR", // Fallback to CAR context for car staff members
      };
      console.log(
        `   ⚙️  [AUTH MIDDLEWARE] Assigned Workspace Context: "${req.user.crmType}" (STAFF MEMBERS)`,
      );
      return next();
    }

    // ======================================================
    // WASH STAFF AUTH
    // ======================================================
    if (decoded.type === "wash-staff") {
      const staff = await prisma.washStaff.findUnique({
        where: { id: decoded.id },
      });

      if (!staff || !staff.isActive) {
        console.log(
          "   ❌ [AUTH MIDDLEWARE] Wash staff validation failed or marked inactive",
        );
        return res
          .status(401)
          .json({ message: "Wash staff not found or inactive" });
      }

      req.user = {
        id: staff.id,
        type: "wash-staff",
        role: "wash-staff",
        teamId: staff.washTeamId,
        crmType: activeCrmType || "WASHING", // Fallback to WASHING context for wash staff
      };
      console.log(
        `   ⚙️  [AUTH MIDDLEWARE] Assigned Workspace Context: "${req.user.crmType}" (WASH STAFF)`,
      );
      return next();
    }

    /**
     * =====================================
     * 👑 OWNER AUTH (User table)
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
        allowedCrms: true,
        referredByUserId: true,
        parentUserId: true,
      },
    });

    if (!user) {
      console.log(
        "   ❌ [AUTH MIDDLEWARE] Owner match lookup missing in prisma user tables",
      );
      return res.status(401).json({ message: "User not found" });
    }

    req.user = {
      ...user,
      type: "owner", // 🔑 VERY IMPORTANT
      crmType: activeCrmType, // 🔥 INJECTED: Pass context down to our marketplace services
    };
    console.log(
      `   ⚙️  [AUTH MIDDLEWARE] Assigned Workspace Context: "${req.user.crmType || "UNRESOLVED"}" (OWNER PROFILE)`,
    );

    return next();
  } catch (error) {
    console.error("❌ Auth Middleware Error:", error);

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        message: "Token expired, please login again",
      });
    }

    return res.status(401).json({
      message: "Invalid token",
    });
  }
};

export const requireActivePlan = (req, res, next) => {
  // Staff inherits owner plan
  if (req.user.type === "staff") return next();

  if (!req.user.planExpiry) return next();

  if (new Date(req.user.planExpiry) < new Date()) {
    return res.status(403).json({
      message: "Your subscription has expired. Please upgrade.",
      code: "PLAN_EXPIRED",
    });
  }

  next();
};
