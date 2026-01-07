
import bcrypt from "bcryptjs";
import prisma from "../models/prismaClient.js";
import jwt from "jsonwebtoken";

export const createBikeTeamMember = async (req, res) => {
  try {
    const ownerId = req.user.id;
    const { name, role, phone, username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        message: "Username, email and password are required",
      });
    }

    // ❌ Duplicate username or email
    const existingLogin = await prisma.bikeTeamLogin.findFirst({
      where: {
        OR: [{ username }, { email }],
      },
    });

    if (existingLogin) {
      return res.status(400).json({
        message: "Username or email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const team = await prisma.bikeTeam.create({
      data: {
        ownerId,
        name: name || username,
        role: role || "Team Member",
        phone: phone || "",

        login: {
          create: {
            username,
            email,          // ✅ stored here
            password: hashedPassword,
          },
        },
      },
      include: { login: true },
    });

    res.status(201).json({
      success: true,
      message: "Team member created",
      team,
    });
  } catch (err) {
    console.error("createBikeTeamMember error:", err);
    res.status(500).json({ message: "Failed to create team member" });
  }
};


export const bikeTeamLogin = async (req, res) => {
  try {
    // ✅ THIS LINE (you asked about this)
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({
        message: "Username/Email and password are required",
      });
    }

    // ✅ THIS QUERY (you asked about this)
    const login = await prisma.bikeTeamLogin.findFirst({
      where: {
        OR: [
          { username: identifier },
          { email: identifier },
        ],
      },
      include: {
        team: true,
      },
    });

    if (!login || !login.isActive) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, login.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // 🔐 Generate token
    const token = jwt.sign(
      {
        id: login.id,
        type: "bike_team",
        ownerId: login.team.ownerId,
        teamId: login.team.id,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      token,
      user: {
        type: "bike_team",
        teamId: login.team.id,
        ownerId: login.team.ownerId,

        // 🔑 FOR UI (TOP NAVBAR)
        username: login.username,
        email: login.email,
        displayName: login.team.name,

        role: login.team.role, // Mechanic / Manager
      },
    });

  } catch (err) {
    console.error("bikeTeamLogin error:", err);
    return res.status(500).json({ message: "Login failed" });
  }
};

export const getBikeTeamList = async (req, res) => {
  try {
    const ownerId = req.user.id;

    const teams = await prisma.bikeTeam.findMany({
      where: { ownerId },
      include: {
        login: {
          select: {
            username: true,
            isActive: true,
          },
        },
        staff: true,
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({
      success: true,
      teams,
    });
  } catch (error) {
    console.error("getBikeTeamList error:", error);
    res.status(500).json({ message: "Failed to fetch team list" });
  }
};

export const getBikeTeamInfo = async (req, res) => {
  try {
    const ownerId = req.user.id;

    const owner = await prisma.user.findUnique({
      where: { id: ownerId },
      select: { email: true, plan: true },
    });

    if (!owner) {
      return res.status(404).json({ message: "Owner not found" });
    }

    const used = await prisma.bikeTeam.count({
      where: { ownerId },
    });

    const limit =
      owner.plan === "STANDARD"
        ? 3
        : owner.plan === "PREMIUM"
        ? 10
        : 0;

    return res.json({
      adminEmail: owner.email,
      used,
      limit,
      plan: owner.plan,
    });
  } catch (error) {
    console.error("getBikeTeamInfo error:", error);
    res.status(500).json({ message: "Failed to fetch team info" });
  }
};


// export const getTeamInfo = async (req, res) => {
//   try {
//     const user = req.user;

//     // 🔒 Normalize role (THIS IS THE KEY FIX)
//     const role = String(user.role).toLowerCase();

//     // ❌ Only OWNER can access team info
//     if (role !== "user") {
//       return res.status(403).json({
//         message: "Only owner can access team info",
//       });
//     }

//     // ❌ Block BASIC plan
//     if (user.plan === "BASIC") {
//       return res.status(403).json({
//         message: "Team not allowed for this plan",
//       });
//     }

//     // ✅ Count owner + team members
//     const used = await prisma.user.count({
//       where: {
//         OR: [
//           { id: user.id },
//           { parentUserId: user.id },
//         ],
//       },
//     });

//     const limit =
//       user.plan === "STANDARD" ? 3 :
//       user.plan === "PREMIUM" ? 10 : 1;

//     return res.json({
//       adminEmail: user.email,
//       plan: user.plan,
//       used,
//       limit,
//     });

//   } catch (error) {
//     console.error("getTeamInfo error:", error);
//     return res.status(500).json({ message: "Failed to fetch team info" });
//   }
// };

// export const createTeamUser = async (req, res) => {
//   try {
//     const admin = req.user;

//     // 🔒 Normalize role
//     const role = String(admin.role).toLowerCase();

//     // ❌ Only OWNER can add team users
//     if (role !== "user") {
//       return res.status(403).json({
//         message: "Only owner can add team members",
//       });
//     }

//     // ❌ Block BASIC plan
//     if (admin.plan === "BASIC") {
//       return res.status(403).json({
//         message: "Upgrade plan to add team members",
//       });
//     }

//     // 📊 Team limit by plan
//     const limit =
//       admin.plan === "STANDARD"
//         ? 3
//         : admin.plan === "PREMIUM"
//         ? 10
//         : 1;

//     // 👥 Count owner + team users
//     const used = await prisma.user.count({
//       where: {
//         OR: [
//           { id: admin.id },
//           { parentUserId: admin.id },
//         ],
//       },
//     });

//     if (used >= limit) {
//       return res.status(403).json({
//         message: "Team limit reached for your plan",
//       });
//     }

//     // 📥 Input
//     let { email, username, password } = req.body;

//     if (!email || !password) {
//       return res.status(400).json({
//         message: "Email and password are required",
//       });
//     }

//     // ✅ Normalize email
//     email = email.toLowerCase().trim();

//     // ❌ Check duplicate email
//     const existingUser = await prisma.user.findUnique({
//       where: { email },
//     });

//     if (existingUser) {
//       return res.status(400).json({
//         message: "Email already exists",
//       });
//     }

//     // 🔐 Hash password
//     const hashedPassword = await bcrypt.hash(password, 10);

//     // 🎟️ Referral code
//     const myReferralCode =
//       "ATREF-" + Math.random().toString(36).substring(2, 8).toUpperCase();

//     // ✅ CREATE TEAM USER
//     const teamUser = await prisma.user.create({
//       data: {
//         email,
//         username,
//         password: hashedPassword,
//         role: "TEAM_MEMBER",

//         // 🔗 Link to owner (CORRECT PRISMA WAY)
//         parentUser: {
//           connect: { id: admin.id },
//         },

//         // 🔐 CRM access
//         plan: admin.plan,
//         allowedCrms: ["BIKE"],

//         myReferralCode,
//       },
//       select: {
//         id: true,
//         email: true,
//         username: true,
//         role: true,
//         createdAt: true,
//       },
//     });

//     return res.json({
//       success: true,
//       message: "Team user created successfully",
//       user: teamUser,
//     });

//   } catch (error) {
//     console.error("createTeamUser error:", error);
//     return res.status(500).json({
//       message: "Failed to create team user",
//     });
//   }
// };