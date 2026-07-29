// server\routes\referral.js
import express from "express";
import prisma from "../models/prismaClient.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET /api/referral/my-referrals
router.get("/my-referrals", protect, async (req, res) => {
  try {
    const userId = req.user.id;

    // 1️⃣ Fetch logged-in user's referral code & referred users
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        myReferralCode: true,
        referrals: {
          select: {
            id: true,
            email: true,
            username: true,
            createdAt: true, // Joining date
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 2️⃣ For each referred user, find their successful payment
    const referralsWithPayments = await Promise.all(
      user.referrals.map(async (ref) => {
        const payment = await prisma.payment.findFirst({
          where: { email: ref.email, status: "ACTIVE" },
          orderBy: { paidAt: "desc" },
        });

        return {
          name: ref.username,
          email: ref.email,
          joiningDate: ref.createdAt, // ⭐ User created date
          plan: payment?.plan || "N/A",
          billing: payment?.billingPeriod || "N/A",
          amount: payment?.amount || "0",
          paidAt: payment?.paidAt || null,
        };
      }),
    );

    // 3️⃣ Final response
    res.json({
      referralCode: user.myReferralCode,
      referrals: referralsWithPayments,
    });
  } catch (error) {
    console.error("Referral Fetch Error:", error);
    return res.status(500).json({ message: "Error fetching referral data" });
  }
});

export default router;
