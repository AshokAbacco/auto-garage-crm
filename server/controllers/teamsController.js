
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
  STANDARD: 3,    // admin + 2
  PREMIUM: 10     // admin + 9
};

/**
 * ==============================
 * HELPER → GENERATE UNIQUE USERNAME
 * ==============================
 */
const generateUniqueUsername = async (base) => {
  let username = base;
  let counter = 1;

  while (await prisma.user.findUnique({ where: { username } })) {
    username = `${base}${counter}`;
    counter++;
  }

  return username;
};

/**
 * ==============================
 * CREATE TEAM MEMBER (ADMIN)
 * ==============================
 */
export const createTeam = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const emailLower = email.toLowerCase().trim();

    // ❌ Prevent duplicate users
    const existingUser = await prisma.user.findUnique({
      where: { email: emailLower },
    });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // ✅ Get or create ONE team for admin
    let team = await prisma.washTeam.findFirst({
      where: { createdBy: req.user.id },
      include: { members: true },
    });

    if (!team) {
      team = await prisma.washTeam.create({
        data: {
          name: "My Wash Team",
          email: req.user.email, // ✅ ADMIN EMAIL ONLY
          createdBy: req.user.id,
        },
        include: { members: true },
      });
    }

    // ✅ Plan limits
    const TEAM_LIMITS = {
      BASIC: 1,
      STANDARD: 3,
      PREMIUM: 10,
    };

    const limit = TEAM_LIMITS[req.user.plan] || 1;
    const used = team.members.length + 1; // admin included

    if (used >= limit) {
      return res.status(403).json({ message: "Team limit reached" });
    }

    // ✅ Create team member
    const hashedPassword = await bcrypt.hash(password, 10);
    const myReferralCode =
      "TEAM-" + Math.random().toString(36).substring(2, 8).toUpperCase();

    const user = await prisma.user.create({
      data: {
        email: emailLower,
        username,
        password: hashedPassword,
        role: "team",
        plan: "BASIC",
        allowedCrms: ["WASH"],
        washTeamId: team.id,
        myReferralCode,
      },
    });

    console.log("✅ USER CREATED:", user);

    const verifyUser = await prisma.user.findUnique({
      where: { id: user.id },
    });

    console.log("🔍 VERIFY USER IN DB:", verifyUser);


    return res.status(201).json({
      message: "Team member created successfully",
      user,
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
    if (!req.user || req.user.role !== "user") {
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
      team: { used, limit },
    });
  } catch (err) {
    console.error("❌ Team Info Error:", err);
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
      include: { members: true },
    });

    if (!team || team.createdBy !== req.user.id) {
      return res.status(404).json({ message: "Team not found" });
    }

    // Delete team users
    await prisma.user.deleteMany({
      where: { washTeamId: teamId },
    });

    // Delete team record
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
 * WASH TEAM LOGIN
 * ==============================
 */
export const washStaffLogin = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({ message: "Email/Username and password required" });
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: identifier.toLowerCase().trim() },
          { username: identifier.trim() },
        ],
        role: "team",
        allowedCrms: { has: "WASH" },
      },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = generateToken({
      id: user.id,
      role: "team",
      type: "staff",
    });

    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: "team",
        crmType: "WASH",
      },
    });
  } catch (error) {
    console.error("❌ Wash Staff Login Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
