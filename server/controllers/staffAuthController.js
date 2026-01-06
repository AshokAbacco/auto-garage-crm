import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../models/prismaClient.js";
import PLAN_LIMITS from "../config/planLimits.js";


// export const loginStaff = async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     if (!email || !password) {
//       return res.status(400).json({
//         message: "Email and password are required",
//       });
//     }

//     const staff = await prisma.carStaff.findUnique({
//       where: { email: email.toLowerCase() },
//     });

//     if (!staff || !staff.isActive) {
//       return res.status(401).json({
//         message: "Invalid credentials or inactive staff",
//       });
//     }

//     const isMatch = await bcrypt.compare(password, staff.password);
//     if (!isMatch) {
//       return res.status(401).json({ message: "Invalid credentials" });
//     }

//     // 🔐 Staff JWT (NOTE: type = staff)
//     const token = jwt.sign(
//       {
//         id: staff.id,
//         type: "staff",
//         ownerId: staff.ownerId,
//       },
//       process.env.JWT_SECRET,
//       { expiresIn: "7d" }
//     );

//     return res.status(200).json({
//       message: "Staff login successful",
//       token,
//       user: {
//         id: staff.id,
//         type: "staff",
//         role: "staff",
//         ownerId: staff.ownerId,
//         name: staff.name,
//         email: staff.email,
//       },
//     });
//   } catch (error) {
//     console.error("❌ Staff Login Error:", error);
//     return res.status(500).json({
//       message: "Internal server error",
//     });
//   }
// };

export const loginStaff = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({
        message: "Email or phone and password are required",
      });
    }

    /**
     * 1️⃣ Find staff login record
     */
    const login = await prisma.carStaffLogin.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: {
        staff: true,
      },
    });

    if (!login || !login.isActive || !login.staff) {
      return res.status(401).json({
        message: "Invalid credentials or inactive staff",
      });
    }

    const isMatch = await bcrypt.compare(password, finalLogin.password);
    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    /**
     * 3️⃣ Fetch owner plan (for UI permissions)
     */
    const owner = await prisma.user.findUnique({
      where: { id: login.ownerId },
      select: { plan: true, companyName: true },
    });

    /**
     * 4️⃣ Issue JWT
     * IMPORTANT: id = carStaffLogin.id (NOT staff.id)
     */
    const token = jwt.sign(
      {
        id: login.id, // ✅ MUST match protect middleware
        type: "staff",
        ownerId: finalLogin.ownerId,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      message: "Staff login successful",
      token,
      user: {
        id: login.staff.id, // actual staff ID (frontend use)
        type: "staff",
        role: login.staff.role,
        ownerId: login.ownerId,
        name: login.staff.name,
        email: login.email,
        plan: owner?.plan || "BASIC",
        companyName: owner?.companyName || null,
      },
    });
  } catch (error) {
    console.error("❌ Car Staff Login Error:", error);
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

    const login = await prisma.bikeTeamLogin.findUnique({
      where: { id: req.user.id },
      include: {
        team: {
          include: {
            owner: true,
          },
        },
      },
    });

    if (!login) {
      return res.status(404).json({ message: "Profile not found" });
    }

    return res.json({
      id: login.team.id,
      name: login.team.name,
      role: login.team.role,
      username: login.username,
      companyName: login.team.owner.companyName,
      type: "bike_team",
    });
  } catch (error) {
    console.error("❌ Bike Team Profile Error:", error);
    res.status(500).json({ message: "Failed to load profile" });
  }
};
