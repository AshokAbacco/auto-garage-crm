// server/routes/payments.js
import express from "express";
import Razorpay from "razorpay";
import crypto from "crypto";
import prisma from "../models/prismaClient.js";

const router = express.Router();

/* ----------------------------------------------
   🔹 RAZORPAY INSTANCE
---------------------------------------------- */
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

console.log("Using Razorpay Key:", process.env.RAZORPAY_KEY_ID);
console.log("Loaded Plan IDs:", {
  BASIC: process.env.RAZORPAY_PLAN_CAR_BASIC,
  STANDARD: process.env.RAZORPAY_PLAN_CAR_STANDARD,
  PREMIUM: process.env.RAZORPAY_PLAN_CAR_PREMIUM,
});

/* ----------------------------------------------
   Config helpers
---------------------------------------------- */
const isProduction = process.env.NODE_ENV === "production";
const useTrial = (process.env.USE_TRIAL || "true").toLowerCase() === "true";

// Helper to add interval (monthly/yearly) to a Date
function addInterval(date, billingPeriod) {
  const d = new Date(date);
  if (billingPeriod === "monthly") {
    d.setMonth(d.getMonth() + 1);
  } else {
    d.setFullYear(d.getFullYear() + 1);
  }
  return d;
}



router.post("/create-subscription", async (req, res) => {
  try {
    const { plan, billingPeriod, customer } = req.body || {};

    // Basic validation
    if (!plan || !plan.name || typeof plan.numericPrice !== "number") {
      return res.status(400).json({
        success: false,
        error: "Invalid 'plan' object. Expect { name, numericPrice }",
      });
    }

    if (!billingPeriod || !["monthly", "yearly"].includes(billingPeriod)) {
      return res.status(400).json({
        success: false,
        error: "Invalid 'billingPeriod'. Use 'monthly' or 'yearly'.",
      });
    }

    if (!customer || !customer.email || !customer.name || !customer.phone) {
      return res.status(400).json({
        success: false,
        error: "Invalid 'customer' object. Expect { name, email, phone }",
      });
    }

    // Razorpay keys check
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return res.status(500).json({
        success: false,
        error: "Razorpay API keys missing",
      });
    }

    // Plan mapping
    const rawName = (plan?.name || "").toLowerCase().trim().replace(/\s+/g, "");
    const planMapping = {
      basic: process.env.RAZORPAY_PLAN_CAR_BASIC,
      standard: process.env.RAZORPAY_PLAN_CAR_STANDARD,
      premium: process.env.RAZORPAY_PLAN_CAR_PREMIUM,
    };

    const planID = planMapping[rawName];
    if (!planID) {
      return res.status(400).json({
        success: false,
        error: `Invalid plan name '${plan.name}'`,
      });
    }

    // Check if user already has a subscription
    const existing = await prisma.payment.findMany({
      where: { email: customer.email.toLowerCase() },
    });

    const isUpgrade = existing.length > 0;
    const useTrial = true;

    // ---------------------------
    // 🔥 Trial = start in 10 minutes
    // ---------------------------
    let startAt = undefined;

    if (!isUpgrade && useTrial) {
      startAt = Math.floor((Date.now() + 24 * 60 * 60 * 1000) / 1000);
    }

    // ---------------------------
    // 🔥 Build Subscription Payload
    // ---------------------------
    const subscriptionPayload = {
      plan_id: planID,
      total_count: 12,
      quantity: 1,
      customer_notify: 1,

      // ❌ MUST REMOVE "customer" COMPLETELY
      // customer: {},  ← remove

      notes: {
        planName: plan.name,
        customerEmail: customer.email,
        customerPhone: customer.phone,
      },
    };

    if (startAt) subscriptionPayload.start_at = startAt;

    // ---------------------------
    // Create subscription
    // ---------------------------
    let subscription;
    try {
      subscription = await razorpay.subscriptions.create(subscriptionPayload);
    } catch (err) {
      console.error("Razorpay subscription error:", err);
      return res.status(502).json({
        success: false,
        error: err?.error?.description || "Razorpay error",
      });
    }

    // Save to DB
    let created = await prisma.payment.create({
      data: {
        customerName: customer.name,
        companyName: customer.companyName || null,
        email: customer.email.toLowerCase(),
        phone: customer.phone,
        plan: plan.name,
        billingPeriod,
        amount: plan.numericPrice,
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
      paymentRecordId: created.id,
    });
  } catch (e) {
    console.error("Unexpected Error:", e);
    return res.status(500).json({ success: false, error: e.message });
  }
});




/* ----------------------------------------------
   2️⃣ VERIFY PAYMENT (for localhost/dev)
   - Use this to flip records to ACTIVE in dev if you cannot receive webhooks locally.
---------------------------------------------- */
router.post("/verify-payment-localhost", async (req, res) => {
  try {
    const { subscriptionId, paymentId } = req.body;
    if (!subscriptionId || !paymentId) {
      return res.status(400).json({ success: false, error: "subscriptionId & paymentId required" });
    }

    // Fetch subscription to check status
    const subscription = await razorpay.subscriptions.fetch(subscriptionId);
    console.log("Fetched subscription for verify:", subscriptionId, "status:", subscription.status);

    if (subscription.status === "active") {
      // Use findUnique because subscriptionId is unique in DB schema
      const record = await prisma.payment.findUnique({
        where: { subscriptionId },
      });

      if (!record) {
        return res.status(404).json({ success: false, error: "Subscription not found in DB" });
      }

      // Compute next billing date from now (first successful charge date)
      const firstChargeAt = new Date();
      const nextBillingDate = addInterval(firstChargeAt, record.billingPeriod);

      const updated = await prisma.payment.update({
        where: { subscriptionId },
        data: {
          status: "ACTIVE",
          isTrial: false,
          paidAt: firstChargeAt,
          paymentId: paymentId,
          nextBillingDate: nextBillingDate,
          expiryDate: nextBillingDate,
        },
      });

      return res.json({ success: true, message: "Payment verified and activated", updated });
    }

    return res.json({ success: false, error: "Subscription not active yet" });
  } catch (err) {
    console.error("verify-payment-localhost error:", err);
    return res.status(500).json({ success: false, error: err.message });
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
      return res.status(500).json({ success: false, error: "Webhook secret missing" });
    }

    // 🔥 Always raw buffer
    const payloadBuffer = req.body;

    const signature = req.headers["x-razorpay-signature"];
    if (!signature) {
      console.error("Missing signature");
      return res.status(400).json({ success: false, error: "Missing signature" });
    }

    // Verify signature
    const expected = crypto
      .createHmac("sha256", secret)
      .update(payloadBuffer)
      .digest("hex");

    if (expected !== signature) {
      console.error("❌ Invalid signature");
      return res.status(400).json({ success: false, error: "Invalid signature" });
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


/* ----------------------------------------------
   4️⃣ FETCH USER PLAN (ACTIVE)
---------------------------------------------- */
router.get("/user-plan/:email", async (req, res) => {
  try {
    let { email } = req.params;
    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const allPayments = await prisma.payment.findMany({
      where: { email: normalizedEmail },
      orderBy: { createdAt: "desc" },
    });

    if (allPayments.length === 0) {
      return res.json({
        success: false,
        message: "No payment records found for this user",
      });
    }

    const currentPlan = allPayments[0];
    const previousPlan = allPayments.length > 1 ? allPayments[1] : null;

    return res.json({
      success: true,
      currentPlan,
      previousPlan,
      history: allPayments   
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      error: "Error fetching plan",
      details: err.message,
    });
  }
});

export default router;
