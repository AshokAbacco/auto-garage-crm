// server/controllers/authController.js
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../models/prismaClient.js";
import { generateToken } from "../utils/generateToken.js";

/**
 * =============================================
 * REGISTER USER
 * =============================================
 */
// export const registerUser = async (req, res) => {
//   try {
//     const { username, email, password, crmType } = req.body;

//     if (!username || !email || !password || !crmType) {
//       return res.status(400).json({ message: "All fields are required" });
//     }

//     const emailLower = email.toLowerCase().trim();
//     const hashedPassword = await bcrypt.hash(password, 10);

//     /**
//      * =============================================
//      * FETCH LATEST PAYMENT (SOURCE OF TRUTH)
//      * =============================================
//      */
//     const latestPayment = await prisma.payment.findFirst({
//       where: { email: emailLower },
//       orderBy: { createdAt: "desc" },
//     });

//     const plan = latestPayment?.plan || "BASIC";
//     const referralCodeUsed = latestPayment?.referralCode || null;

//     /**
//      * =============================================
//      * REFERRAL LOOKUP (OPTIONAL)
//      * =============================================
//      */
//     let referredByUserId = null;

//     if (referralCodeUsed) {
//       const referrer = await prisma.user.findUnique({
//         where: { myReferralCode: referralCodeUsed },
//         select: { id: true },
//       });

//       if (referrer) {
//         referredByUserId = referrer.id;
//       }
//     }

//     const userPlan = latestPayment?.plan || "BASIC";
//     const companyName = latestPayment?.companyName || null;
//     const phone = latestPayment?.phone || null;

//     const planExpiry = latestPayment?.planExpiry
//   ? new Date(latestPayment.planExpiry)
//   : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
//     // Check duplicates
//     const [existingUserByEmail, existingUserByUsername] = await Promise.all([
//       prisma.user.findUnique({ where: { email: emailLower } }),
//       prisma.user.findUnique({ where: { username } }),
//     ]);

//     if (
//       existingUserByUsername &&
//       (!existingUserByEmail ||
//         existingUserByUsername.id !== existingUserByEmail.id)
//     ) {
//       return res.status(400).json({
//         message: "This username is already taken.",
//       });
//     }

//     /**
//      * =============================================
//      * CASE 1 — USER EXISTS (EMAIL FROM PAYMENT)
//      * =============================================
//      */
//     if (existingUserByEmail) {
//       const updatedUser = await prisma.user.update({
//         where: { email: emailLower },
//         data: {
//           username,
//           password: hashedPassword,
//           allowedCrms: [crmType.toUpperCase()],
//           plan: userPlan,
//           planExpiry,
//           companyName, // ✅ ADDED
//           phone, // ✅ ADDED
//         },
//       });

//       const token = generateToken(updatedUser);

//       return res.status(200).json({
//         message: "Registration completed successfully",
//         token,
//         user: updatedUser,
//       });
//     }

//     /**
//      * =============================================
//      * CASE 2 — NEW USER
//      * =============================================
//      */
//     const myReferralCode =
//       "ATREF-" + Math.random().toString(36).substring(2, 8).toUpperCase();

//     const newUser = await prisma.user.create({
//       data: {
//         username,
//         email: emailLower,
//         password: hashedPassword,
//         role: "user",
//         allowedCrms: [crmType.toUpperCase()],
//         myReferralCode,
//         plan: userPlan,
//         planExpiry,
//         referredByUserId,
//         companyName, // ✅ ADDED
//         phone, // ✅ ADDED
//       },
//     });

//     const token = generateToken(newUser);

//     return res.status(201).json({
//       message: "User registered successfully",
//       token,
//       user: newUser,
//     });
//   } catch (error) {
//     console.error("❌ Registration Error:", error);
//     return res.status(500).json({ message: "Internal server error" });
//   }
// };

export const registerUser = async (req, res) => {
  try {
    const { username, email, password, crmType } = req.body;

    /* ---------- BASIC VALIDATION ---------- */
    if (!username || !email || !password || !crmType) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const emailLower = email.toLowerCase().trim();
    const hashedPassword = await bcrypt.hash(password, 10);

    /* =================================================
       FETCH LATEST PAYMENT (SINGLE SOURCE OF TRUTH)
    ================================================= */
    const latestPayment = await prisma.payment.findFirst({
      where: { email: emailLower },
      orderBy: { createdAt: "desc" },
    });

    if (!latestPayment) {
      return res.status(400).json({
        message:
          "No payment found for this email. Please complete payment first.",
      });
    }

    /* ---------- EXTRACT FROM PAYMENT ---------- */
    const userPlan = latestPayment.plan || "BASIC";
    const companyName = latestPayment.companyName || null;
    const phone = latestPayment.phone || null;
    const gstNumber = latestPayment.gstNumber || null;
    const address = latestPayment.address || null;
    const referralCodeUsed = latestPayment.referralCode || null;

    const planExpiry = latestPayment.expiryDate
      ? new Date(latestPayment.expiryDate)
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    /* =================================================
       REFERRAL LOOKUP (OPTIONAL)
    ================================================= */
    let referredByUserId = null;

    if (referralCodeUsed) {
      const referrer = await prisma.user.findUnique({
        where: { myReferralCode: referralCodeUsed },
        select: { id: true },
      });

      if (referrer) referredByUserId = referrer.id;
    }

    /* ---------- DUPLICATE CHECK ---------- */
    const [existingUserByEmail, existingUserByUsername] = await Promise.all([
      prisma.user.findUnique({ where: { email: emailLower } }),
      prisma.user.findUnique({ where: { username } }),
    ]);

    if (
      existingUserByUsername &&
      (!existingUserByEmail ||
        existingUserByUsername.id !== existingUserByEmail.id)
    ) {
      return res.status(400).json({
        message: "This username is already taken.",
      });
    }

    /* =================================================
       CASE 1 — USER ALREADY EXISTS (FROM PAYMENT EMAIL)
    ================================================= */
    if (existingUserByEmail) {
      const updatedUser = await prisma.user.update({
        where: { email: emailLower },
        data: {
          username,
          password: hashedPassword,
          allowedCrms: [crmType.toUpperCase()],
          plan: userPlan,
          planExpiry,

          // 🔥 PAYMENT → USER SYNC
          companyName,
          phone,
          gstNumber,
          address,
        },
      });

      const token = generateToken(updatedUser);

      return res.status(200).json({
        message: "Registration completed successfully",
        token,
        user: updatedUser,
      });
    }

    /* =================================================
       CASE 2 — BRAND NEW USER
    ================================================= */
    const myReferralCode =
      "ATREF-" + Math.random().toString(36).substring(2, 8).toUpperCase();

    const newUser = await prisma.user.create({
      data: {
        username,
        email: emailLower,
        password: hashedPassword,
        role: "user",
        allowedCrms: [crmType.toUpperCase()],
        myReferralCode,
        referredByUserId,

        // 🔥 PAYMENT → USER SYNC
        plan: userPlan,
        planExpiry,
        companyName,
        phone,
        gstNumber,
        address,
      },
    });

    const token = generateToken(newUser);

    return res.status(201).json({
      message: "User registered successfully",
      token,
      user: newUser,
    });
  } catch (error) {
    console.error("❌ Registration Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};


/**
 * =============================================
 * LOGIN USER
 * =============================================
 */
 
export const loginUser = async (req, res) => {
  try {
    const { identifier, password, crmType } = req.body;

    if (!identifier || !password || !crmType) {
      return res.status(400).json({
        message: "Identifier, password and CRM type are required",
      });
    }

    const rawIdentifier = identifier.trim();
    const isEmail = rawIdentifier.includes("@");

    /**
     * 🚫 BLOCK STAFF EMAILS COMPLETELY
     * Owner login must NEVER authenticate staff
     */
    if (isEmail) {
      const staffExists = await prisma.carStaffLogin.findUnique({
        where: { email: rawIdentifier.toLowerCase() },
        select: { id: true },
      });

      if (staffExists) {
        return res.status(403).json({
          message:
            "This email belongs to a staff account. Please login as Staff.",
        });
      }
    }

    /**
     * ============================
     * OWNER LOOKUP ONLY
     * ============================
     */
    const user = isEmail
      ? await prisma.user.findUnique({
          where: { email: rawIdentifier.toLowerCase() },
        })
      : await prisma.user.findUnique({
          where: { username: rawIdentifier },
        });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (!user.allowedCrms.includes(crmType.toUpperCase())) {
      return res.status(403).json({
        message: `You do not have access to the ${crmType} CRM`,
      });
    }

    const token = generateToken({
      id: user.id,
      type: "owner",
      role: "user",
      plan: user.plan,
    });

    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: "user",
        type: "owner",
        plan: user.plan,
        allowedCrms: user.allowedCrms,
        crmType,
      },
    });
  } catch (error) {
    console.error("❌ Owner Login Error:", error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

/**
 * =============================================
 * GET PROFILE
 * =============================================
 */
export const getProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        plan: true, // ⭐ RETURN PLAN
        profileImage: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json(user);
  } catch (error) {
    console.error("❌ Profile Fetch Error:", error);
    res.status(500).json({ message: "Error fetching profile" });
  }
};

/**
 * =============================================
 * VERIFY TOKEN (OWNER + STAFF)
 * =============================================
 */
export const verifyToken = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ valid: false });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    /**
     * ===============================
     * STAFF TOKEN
     * ===============================
     */
    if (decoded.type === "staff") {
      const login = await prisma.carStaffLogin.findUnique({
        where: { id: decoded.id },
        include: {
          staff: true,
        },
      });

      if (!login || !login.isActive || !login.staff) {
        return res.status(401).json({ valid: false });
      }

      return res.status(200).json({
        valid: true,
        user: {
          id: login.id, // staff id
          loginId: login.id, // login id
          type: "staff",
          role: "staff",
          ownerId: login.ownerId,
          name: login.staff.name,
        },
      });
    }

    /**
     * ===============================
     * OWNER TOKEN
     * ===============================
     */
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        plan: true,
      },
    });

    if (!user) {
      return res.status(401).json({ valid: false });
    }

    return res.status(200).json({
      valid: true,
      user: {
        id: user.id,
        type: "owner",
        role: user.role,
        plan: user.plan,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("❌ Token Verification Error:", error);
    return res.status(401).json({ valid: false });
  }
};

/**
 * =============================================
 * DELETE ACCOUNT
 * =============================================
 */
// export const deleteAccount = async (req, res) => {
//   try {
//     const userId = req.user.id;

//     await prisma.payment.deleteMany({
//       where: { email: req.user.email },
//     });

//     await prisma.user.delete({
//       where: { id: userId },
//     });

//     res.status(200).json({ message: "Account deleted successfully" });
//   } catch (error) {
//     console.error("❌ Delete Account Error:", error);
//     return res.status(500).json({ message: "Failed to delete account" });
//   }
// };

export const deleteAccount = async (req, res) => {
  const userId = req.user.id;
  const email = req.user.email?.toLowerCase();

  try {
    /* =========================
       CAR CRM (NO TRANSACTION)
    ========================= */
    const clients = await prisma.client.findMany({
      where: { userId },
      select: { id: true },
    });
    const clientIds = clients.map((c) => c.id);

    if (clientIds.length) {
      await prisma.serviceCostItem.deleteMany({
        where: { service: { clientId: { in: clientIds } } },
      });
      await prisma.serviceMedia.deleteMany({
        where: { service: { clientId: { in: clientIds } } },
      });
      await prisma.service.deleteMany({
        where: { clientId: { in: clientIds } },
      });
      await prisma.reminder.deleteMany({
        where: { clientId: { in: clientIds } },
      });
      await prisma.ocrRecord.deleteMany({
        where: { clientId: { in: clientIds } },
      });
      await prisma.invoiceCostItem.deleteMany({
        where: { invoice: { clientId: { in: clientIds } } },
      });
      await prisma.invoice.deleteMany({
        where: { clientId: { in: clientIds } },
      });
      await prisma.client.deleteMany({
        where: { id: { in: clientIds } },
      });
    }

    /* =========================
       WASH CRM (MAIN PROBLEM)
    ========================= */
    const washTeams = await prisma.washTeam.findMany({
      where: { createdBy: userId },
      select: { id: true },
    });
    const washTeamIds = washTeams.map((t) => t.id);

    if (washTeamIds.length) {
      await prisma.washStaff.deleteMany({
        where: { washTeamId: { in: washTeamIds } },
      });
      await prisma.washTeam.deleteMany({
        where: { id: { in: washTeamIds } },
      });
    }

    const washingClients = await prisma.washingClient.findMany({
      where: { userId },
      select: { id: true },
    });
    const washingClientIds = washingClients.map((c) => c.id);

    if (washingClientIds.length) {
      await prisma.washBillingService.deleteMany({
        where: {
          washingService: {
            clientId: { in: washingClientIds },
          },
        },
      });
      await prisma.washingServiceMedia.deleteMany({
        where: {
          washingService: {
            clientId: { in: washingClientIds },
          },
        },
      });
      await prisma.washingService.deleteMany({
        where: { clientId: { in: washingClientIds } },
      });
      await prisma.washBilling.deleteMany({
        where: { washingClientId: { in: washingClientIds } },
      });
      await prisma.washingClient.deleteMany({
        where: { id: { in: washingClientIds } },
      });
    }

    /* =========================
       BIKE / STAFF / PAYMENTS
    ========================= */
    await prisma.carStaffSalary.deleteMany({ where: { ownerId: userId } });
    await prisma.carStaffLogin.deleteMany({ where: { ownerId: userId } });
    await prisma.carStaff.deleteMany({ where: { ownerId: userId } });

    await prisma.bikeSalaryHistory.deleteMany({
      where: { bikeStaff: { userId } },
    });
    await prisma.bikeStaff.deleteMany({ where: { userId } });
    await prisma.staff.deleteMany({ where: { userId } });

    await prisma.payment.deleteMany({ where: { email } });

    /* =========================
       USER (SHORT TRANSACTION)
    ========================= */
    await prisma.$transaction([prisma.user.delete({ where: { id: userId } })]);

    return res.json({ success: true, message: "Account deleted successfully" });
  } catch (error) {
    console.error("❌ Delete Account Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete account",
      code: error.code,
    });
  }
};




