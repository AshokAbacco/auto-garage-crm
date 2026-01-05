import express from "express";
import Razorpay from "razorpay";
import crypto from "crypto";
import prisma from "../models/prismaClient.js";
import { PlanType } from "@prisma/client";

const router = express.Router();

/* ----------------------------------------------
   🔹 RAZORPAY INSTANCE
---------------------------------------------- */
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/* ----------------------------------------------
   🔹 CONFIG
---------------------------------------------- */
const useTrial = (process.env.USE_TRIAL || "true").toLowerCase() === "true";

/* ----------------------------------------------
   🔹 PLAN MAPPINGS
---------------------------------------------- */

// Razorpay Plan IDs (ENV)
const RAZORPAY_PLAN_MAP = {
  basic: process.env.RAZORPAY_PLAN_CAR_BASIC,
  standard: process.env.RAZORPAY_PLAN_CAR_STANDARD,
  premium: process.env.RAZORPAY_PLAN_CAR_PREMIUM,
};

// Prisma Enum mapping
const PRISMA_PLAN_MAP = {
  basic: "BASIC",
  standard: "STANDARD",
  premium: "PREMIUM",
};

/* ----------------------------------------------
   🔹 DATE UTILS
---------------------------------------------- */
function addInterval(date, billingPeriod) {
  const d = new Date(date);
  if (billingPeriod === "monthly") {
    d.setMonth(d.getMonth() + 1);
  } else {
    d.setFullYear(d.getFullYear() + 1);
  }
  return d;
}

/* =========================================================
   1️⃣ CREATE SUBSCRIPTION
========================================================= */
router.post("/create-subscription", async (req, res) => {
  try {
    const { plan, billingPeriod, customer } = req.body || {};

    /* ---------------- VALIDATION ---------------- */
    if (!plan?.name || typeof plan.numericPrice !== "number") {
      return res.status(400).json({
        success: false,
        error: "Invalid plan data",
      });
    }

    if (!["monthly", "yearly"].includes(billingPeriod)) {
      return res.status(400).json({
        success: false,
        error: "Invalid billing period",
      });
    }

    if (!customer?.email || !customer?.name || !customer?.phone) {
      return res.status(400).json({
        success: false,
        error: "Invalid customer data",
      });
    }

    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return res.status(500).json({
        success: false,
        error: "Razorpay keys missing",
      });
    }

    /* ---------------- PLAN NORMALIZATION ---------------- */
    const rawPlanName = plan.name.toLowerCase().trim().replace(/\s+/g, "");

    const razorpayPlanId = RAZORPAY_PLAN_MAP[rawPlanName];
    const prismaPlan = PRISMA_PLAN_MAP[rawPlanName];

    if (!razorpayPlanId || !prismaPlan) {
      return res.status(400).json({
        success: false,
        error: `Invalid plan name: ${plan.name}`,
      });
    }
    const prismaPlanMap = {
      basic: PlanType.BASIC,
      standard: PlanType.STANDARD,
      premium: PlanType.PREMIUM,
    };

    // const prismaPlan = prismaPlanMap[rawName];

    if (!prismaPlan) {
      return res.status(400).json({
        success: false,
        error: `Invalid plan enum '${plan.name}'`,
      });
    }

    /* ---------------- CHECK UPGRADE ---------------- */
    const existingPayments = await prisma.payment.findMany({
      where: { email: customer.email.toLowerCase() },
    });

    const isUpgrade = existingPayments.length > 0;

    /* ---------------- TRIAL LOGIC ---------------- */
    let startAt;
    if (!isUpgrade && useTrial) {
      startAt = Math.floor((Date.now() + 7 * 24 * 60 * 60 * 1000) / 1000);
    }

    /* ---------------- RAZORPAY SUBSCRIPTION ---------------- */
    const totalCount = billingPeriod === "monthly" ? 12 : 1;

    const subscriptionPayload = {
      plan_id: razorpayPlanId,
      total_count: totalCount,
      quantity: 1,
      customer_notify: 1,
      notes: {
        planName: plan.name,
        customerEmail: customer.email,
        customerPhone: customer.phone,
      },
    };

    if (startAt) subscriptionPayload.start_at = startAt;

    let subscription;
    try {
      subscription = await razorpay.subscriptions.create(subscriptionPayload);
    } catch (err) {
      console.error("Razorpay error:", err);
      return res.status(502).json({
        success: false,
        error: err?.error?.description || "Razorpay subscription failed",
      });
    }

    /* ---------------- SAVE TO DB ---------------- */
    const payment = await prisma.payment.create({
      data: {
        customerName: customer.name,
        companyName: customer.companyName || null,
        email: customer.email.toLowerCase(),
        phone: customer.phone,

        plan: prismaPlan, // ✅ ENUM FIX
        billingPeriod,
        amount: Number(plan.numericPrice),

        referralCode: customer.referenceCode || null,
        gstNumber: customer.gstNumber || null,

        subscriptionId: subscription.id,
        isTrial: !!startAt,
        status: startAt ? "TRIAL" : "PENDING",
        trialEndDate: startAt ? new Date(startAt * 1000) : null,
        nextBillingDate: startAt ? new Date(startAt * 1000) : null,
      },
    });

    return res.json({
      success: true,
      subscription,
      razorpayKey: process.env.RAZORPAY_KEY_ID,
      isTrial: !!startAt,
      trialEndDate: startAt ? new Date(startAt * 1000) : null,
      paymentRecordId: payment.id,
    });
  } catch (err) {
    console.error("CREATE SUBSCRIPTION ERROR →", err);
    return res.status(500).json({
      success: false,
      error: err.message || "Internal Server Error",
    });
  }
});

/* =========================================================
   2️⃣ VERIFY PAYMENT (LOCALHOST / DEV)
========================================================= */
router.post("/verify-payment-localhost", async (req, res) => {
  try {
    const { subscriptionId, paymentId } = req.body;

    if (!subscriptionId || !paymentId) {
      return res.status(400).json({
        success: false,
        error: "subscriptionId & paymentId required",
      });
    }

    const subscription = await razorpay.subscriptions.fetch(subscriptionId);

    if (subscription.status === "active") {
      const record = await prisma.payment.findUnique({
        where: { subscriptionId },
      });

      if (!record) {
        return res.status(404).json({
          success: false,
          error: "Subscription not found",
        });
      }

      const paidAt = new Date();
      const nextBillingDate = addInterval(paidAt, record.billingPeriod);

     const updated = await prisma.$transaction(async (tx) => {
        const payment = await tx.payment.update({
          where: { subscriptionId },
          data: {
            status: "ACTIVE",
            isTrial: false,
            paidAt,
            paymentId,
            nextBillingDate,
            expiryDate: nextBillingDate,
          },
        });

        // 🔥 UPDATE USER PLAN
        await tx.user.update({
          where: { email: payment.email },
          data: {
            plan: payment.plan,
            planExpiry: nextBillingDate,
          },
        });

        return payment;
      });


      return res.json({ success: true, updated });
    }

    return res.json({
      success: false,
      error: "Subscription not active yet",
    });
  } catch (err) {
    console.error("verify-payment-localhost error:", err);
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

/* ----------------------------------------------
   3️⃣ RAZORPAY WEBHOOK
---------------------------------------------- */
router.post("/razorpay-webhook", async (req, res) => {
  console.log("\n============================");
  console.log("📥 Webhook HIT!");
  console.log("============================\n");
  console.log("\n================ WEBHOOK RAW BODY ================");
  console.log("RAW BODY RECEIVED >>>", req.body);
  console.log("=================================================\n");

  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!secret) {
      return res
        .status(500)
        .json({ success: false, error: "Webhook secret missing" });
    }

    // 🔥 Always raw buffer
    const payloadBuffer = req.body;

    const signature = req.headers["x-razorpay-signature"];
    if (!signature) {
      console.error("Missing signature");
      return res
        .status(400)
        .json({ success: false, error: "Missing signature" });
    }

    // Verify signature
    const expected = crypto
      .createHmac("sha256", secret)
      .update(payloadBuffer)
      .digest("hex");

    if (expected !== signature) {
      console.error("❌ Invalid signature");
      return res
        .status(400)
        .json({ success: false, error: "Invalid signature" });
    }

    // Parse raw payload
    const body = JSON.parse(payloadBuffer.toString());
    const event = body.event;
    console.log("📥 Event:", event);

    /* ---------------------------------------------------
       EVENT: subscription.authenticated (UPI Mandate Approved)
    --------------------------------------------------- */
    if (event === "subscription.authenticated") {
      const sub = body.payload.subscription.entity;
      console.log("subscription.authenticated:", sub.id);

      const record = await prisma.payment.findUnique({
        where: { subscriptionId: sub.id },
      });

      if (record) {
        await prisma.payment.update({
          where: { subscriptionId: sub.id },
          data: {
            status: "TRIAL",
            isTrial: true,
            trialEndDate: record.trialEndDate,
          },
        });

        console.log("DB updated to TRIAL for:", sub.id);
      } else {
        console.warn("No record found for:", sub.id);
      }

      return res.json({ success: true });
    }

    /* ---------------------------------------------------
       EVENT: subscription.charged (Auto-debit successful)
    --------------------------------------------------- */
    if (event === "subscription.charged") {
      const sub = body.payload.subscription.entity;
      const paymentEntity = body.payload.payment.entity;

      console.log("subscription.charged:", sub.id);

      const record = await prisma.payment.findUnique({
        where: { subscriptionId: sub.id },
      });

      if (record) {
        const paidAt = paymentEntity.created_at
          ? new Date(paymentEntity.created_at * 1000)
          : new Date();

        const nextBillingDate = addInterval(paidAt, record.billingPeriod);

        await prisma.payment.update({
          where: { subscriptionId: sub.id },
          data: {
            status: "ACTIVE",
            isTrial: false,
            paidAt,
            paymentId: paymentEntity.id,
            nextBillingDate,
            expiryDate: nextBillingDate,
          },
        });

        console.log("DB updated to ACTIVE for:", sub.id);
      } else {
        console.warn("No DB record found for subscription.charged:", sub.id);
      }

      return res.json({ success: true });
    }

    /* ---------------------------------------------------
       subscription.cancelled
    --------------------------------------------------- */
    if (event === "subscription.cancelled") {
      const sub = body.payload.subscription.entity;
      await prisma.payment.updateMany({
        where: { subscriptionId: sub.id },
        data: { status: "CANCELLED" },
      });
      return res.json({ success: true });
    }

    /* ---------------------------------------------------
       subscription.paused
    --------------------------------------------------- */
    if (event === "subscription.paused") {
      const sub = body.payload.subscription.entity;
      await prisma.payment.updateMany({
        where: { subscriptionId: sub.id },
        data: { status: "PAUSED" },
      });
      return res.json({ success: true });
    }

    return res.json({ success: true });
  } catch (err) {
    console.error("Webhook handler error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});
/* =========================================================
   3️⃣ FETCH USER PLAN
========================================================= */
router.get("/user-plan/:email", async (req, res) => {
  try {
    const email = req.params.email?.toLowerCase().trim();

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const payments = await prisma.payment.findMany({
      where: { email },
      orderBy: { createdAt: "desc" },
    });

    if (!payments.length) {
      return res.json({
        success: false,
        message: "No payment records found",
      });
    }

    return res.json({
      success: true,
      currentPlan: payments[0],
      previousPlan: payments[1] || null,
      history: payments,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

export default router;
