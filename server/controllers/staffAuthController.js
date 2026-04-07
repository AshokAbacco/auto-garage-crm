import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../models/prismaClient.js";
import PLAN_LIMITS from "../config/planLimits.js";


export const loginStaff = async (req, res) => {
  try {
    const { email, password, crmType } = req.body;

    if (!email || !password || !crmType) {
      return res.status(400).json({
        message: "Email, password and CRM type are required",
      });
    }

    const login = await prisma.carStaffLogin.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: {
        staff: true,
        owner: {
          select: {
            allowedCrms: true,
            plan: true,
            companyName: true,
          },
        },
      },
    });

    if (!login || !login.isActive || !login.staff) {
      return res.status(401).json({
        message: "Invalid credentials or inactive account",
      });
    }

    const isMatch = await bcrypt.compare(password, login.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const requestedCrm = crmType.toUpperCase();

    if (!login.owner.allowedCrms.includes(requestedCrm)) {
      return res.status(403).json({
        message: `You do not have access to the ${crmType} CRM`,
      });
    }

    /**
     * 🔐 JWT MUST CARRY OWNER PLAN
     */
    const token = jwt.sign(
      {
        id: login.id, // staff login id
        type: "staff",
        ownerId: login.ownerId,
        crmType: requestedCrm,
        plan: login.owner.plan, // ✅ OWNER PLAN
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      message: "Staff login successful",
      token,
      user: {
        id: finalLogin.staff.id,
        name: finalLogin.staff.name,
        role: finalLogin.staff.role,
        type: "staff",
        role: login.staff.role,
        ownerId: login.ownerId,
        name: login.staff.name,
        email: login.email,
        plan: login.owner.plan, // ✅ OWNER PLAN
        companyName: login.owner.companyName,
        crmType: requestedCrm,
      },
    });
  } catch (error) {
    console.error("❌ Staff Login Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};



export const createStaffLogin = async (req, res) => {
  try {
    if (req.user.type !== "owner") {
      return res.status(403).json({ message: "Access denied" });
    }

    const ownerId = req.user.id;
    const teamId = Number(req.params.staffId);
    const { username, password } = req.body;

    const team = await prisma.bikeTeam.findFirst({
      where: {
        id: teamId,
        ownerId,
      },
      include: { login: true },
    });

    if (!team) {
      return res.status(404).json({ message: "Team member not found" });
    }

    if (team.login) {
      return res.status(400).json({ message: "Login already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const login = await prisma.bikeTeamLogin.create({
      data: {
        bikeTeamId: teamId,
        username,
        password: hashedPassword,
      },
    });

    return res.status(201).json({
      message: "Bike team login created",
      login: {
        id: login.id,
        username: login.username,
        isActive: login.isActive,
      },
    });
  } catch (error) {
    console.error("❌ Create Bike Team Login Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getStaffProfile = async (req, res) => {
  try {
    if (req.user.type !== "bike_team") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const staff = await prisma.carStaff.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        role: true,
        owner: {
          select: {
            companyName: true,
            plan: true, // ✅ ADD THIS
          },
        },
        login: {
          select: {
            email: true,
          },
        },
      },
    });

    if (!login) {
      return res.status(404).json({ message: "Profile not found" });
    }

    return res.status(200).json({
      id: staff.id,
      name: staff.name,
      email: staff.login.email,
      role: staff.role,
      companyName: staff.owner.companyName,
      plan: staff.owner.plan, // ✅ RETURN PLAN
      type: "staff",
    });
  } catch (error) {
    console.error("❌ Bike Team Profile Error:", error);
    res.status(500).json({ message: "Failed to load profile" });
  }
};
