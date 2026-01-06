import bcrypt from "bcryptjs";
import prisma from "../models/prismaClient.js";
import { generateToken } from "../utils/generateToken.js";

/**
 * ==============================
 * PLAN → TEAM LIMITS (ADMIN INCLUDED)
 * ==============================
 */
const TEAM_LIMITS = {
  BASIC: 1,       // admin only
  STANDARD: 3,    // admin + 2 staff
  PREMIUM: 10     // admin + 9 staff
};

/**
 * ==============================
 * CREATE WASH STAFF (ADMIN)
 * ==============================
 */
export const createTeam = async (req, res) => {
  try {
    const { email, password, username } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const emailLower = email.toLowerCase().trim();

    // ❌ Prevent duplicate staff
    const existingStaff = await prisma.washStaff.findUnique({
      where: { email: emailLower },
    });
    if (existingStaff) {
      return res.status(400).json({ message: "Staff already exists" });
    }

    // ✅ Get or create admin's wash team
    let team = await prisma.washTeam.findFirst({
      where: { createdBy: req.user.id },
      include: { members: true },
    });

    if (!team) {
      team = await prisma.washTeam.create({
        data: {
          name: "My Wash Team",
          email: req.user.email, // ADMIN EMAIL ONLY
          createdBy: req.user.id,
        },
        include: { members: true },
      });
    }

    // ✅ Plan limit check
    const limit = TEAM_LIMITS[req.user.plan] || 1;
    const used = team.members.length + 1; // admin included

    if (used >= limit) {
      return res.status(403).json({ message: "Team limit reached" });
    }

    // ✅ Create wash staff
    const hashedPassword = await bcrypt.hash(password, 10);

    const staff = await prisma.washStaff.create({
      data: {
        email: emailLower,
        username,
        password: hashedPassword,
        washTeamId: team.id,
      },
    });

    return res.status(201).json({
      message: "Wash staff created successfully",
      staff,
    });
  } catch (error) {
    console.error("❌ Create Team Error:", error);

    if (error.code === "P2002") {
      return res.status(400).json({
        message: "Email or username already exists",
      });
    }

    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * ==============================
 * GET TEAM INFO (ADMIN)
 * ==============================
 */
export const getTeamInfo = async (req, res) => {
  try {
     if (req.user.type !== "owner") {
        return res.status(403).json({ message: "Admin only" });
      }



    const admin = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { email: true, plan: true },
    });

    const team = await prisma.washTeam.findFirst({
      where: { createdBy: req.user.id },
      include: { members: true },
    });

    const limit = TEAM_LIMITS[admin.plan] || 1;
    const used = (team?.members.length || 0) + 1;

    return res.json({
      admin,
      team: {
        id: team?.id || null,
        used,
        limit,
      },
    });
  } catch (error) {
    console.error("❌ Team Info Error:", error);
    return res.status(500).json({ message: "Failed to load team info" });
  }
};

/**
 * ==============================
 * GET ALL TEAMS (ADMIN)
 * ==============================
 */
export const getTeams = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "user") {
      return res.status(403).json({ message: "Admin access only" });
    }

    const teams = await prisma.washTeam.findMany({
      where: { createdBy: req.user.id },
      include: {
        members: {
          select: {
            id: true,
            email: true,
            username: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return res.json(teams);
  } catch (error) {
    console.error("❌ Get Teams Error:", error);
    return res.status(500).json({ message: "Failed to fetch teams" });
  }
};

/**
 * ==============================
 * DELETE TEAM (ADMIN)
 * ==============================
 */
export const deleteTeam = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "user") {
      return res.status(403).json({ message: "Admin access only" });
    }

    const teamId = Number(req.params.id);

    const team = await prisma.washTeam.findUnique({
      where: { id: teamId },
    });

    if (!team || team.createdBy !== req.user.id) {
      return res.status(404).json({ message: "Team not found" });
    }

    // ✅ Delete wash staff
    await prisma.washStaff.deleteMany({
      where: { washTeamId: teamId },
    });

    // ✅ Delete team
    await prisma.washTeam.delete({
      where: { id: teamId },
    });

    return res.json({ message: "Team deleted successfully" });
  } catch (error) {
    console.error("❌ Delete Team Error:", error);
    return res.status(500).json({ message: "Failed to delete team" });
  }
};

/**
 * ==============================
 * WASH STAFF LOGIN
 * ==============================
 */
export const washStaffLogin = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res
        .status(400)
        .json({ message: "Email/Username and password required" });
    }

    const staff = await prisma.washStaff.findFirst({
      where: {
        OR: [
          { email: identifier.toLowerCase().trim() },
          { username: identifier.trim() },
        ],
        isActive: true,
      },
      include: {
        team: true,
      },
    });

    if (!staff) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, staff.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = generateToken({
      id: staff.id,
      type: "wash-staff",
      teamId: staff.washTeamId,
    });

    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: staff.id,
        email: staff.email,
        username: staff.username,
        type: "wash-staff",
        teamId: staff.washTeamId,
      },
    });
  } catch (error) {
    console.error("❌ Wash Staff Login Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
