import bcrypt from "bcryptjs";
import prisma from "../models/prismaClient.js";

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
    // ✅ Only ADMIN (role === "user")
    if (!req.user || req.user.role !== "user") {
      return res.status(403).json({ message: "Admin access only" });
    }

    const { username, name, email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const emailLower = email.toLowerCase().trim();

    // ✅ Check existing user
    const existingUser = await prisma.user.findUnique({
      where: { email: emailLower },
    });

    if (existingUser) {
      return res
        .status(400)
        .json({ message: "A user with this email already exists" });
    }

    // ✅ Plan & limit
    const plan = req.user.plan || "BASIC";
    const limit = TEAM_LIMITS[plan] || 1;

    // ✅ Count team members (washTeam) + admin
    const teamCount = await prisma.washTeam.count({
      where: { createdBy: req.user.id },
    });

    const used = teamCount + 1; // admin included

    if (used >= limit) {
      return res.status(403).json({
        message: `Team limit reached for ${plan} plan`,
      });
    }

    // ✅ Generate username
    const baseUsername = (username || name || emailLower.split("@")[0])
      .toLowerCase()
      .replace(/\s+/g, "");

    const finalUsername = await generateUniqueUsername(baseUsername);

    // ✅ Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 1️⃣ Create USER (team member)
    const user = await prisma.user.create({
      data: {
        email: emailLower,
        username: finalUsername,
        password: hashedPassword,
        role: "team",
        plan: "BASIC",
        allowedCrms: ["WASH"],
      },
    });

    // 2️⃣ Create TEAM record
    const team = await prisma.washTeam.create({
      data: {
        name: name || finalUsername,
        email: emailLower,
        createdBy: req.user.id,
      },
    });

    // 3️⃣ Link USER → TEAM
    await prisma.user.update({
      where: { id: user.id },
      data: { washTeamId: team.id },
    });

    return res.status(201).json({
      message: "Team account created successfully",
      team,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
      },
    });
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(400).json({
        message: "Username or email already exists",
      });
    }

    console.error("❌ Create Team Error:", error);
    return res.status(500).json({ message: "Server error" });
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
      return res.status(403).json({ message: "Admin access only" });
    }

    const admin = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { email: true, plan: true },
    });

    const plan = req.user.plan || "BASIC";
    const limit = TEAM_LIMITS[plan] || 1;

    // ✅ Count team members correctly
    const teamCount = await prisma.washTeam.count({
      where: { createdBy: req.user.id },
    });

    const used = teamCount + 1; // admin included

    return res.json({
      admin,
      team: {
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
