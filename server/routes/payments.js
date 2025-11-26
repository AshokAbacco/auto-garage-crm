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

// Log to confirm correct environment values
console.log("Using Razorpay Key:", process.env.RAZORPAY_KEY_ID);
console.log("Loaded Plan IDs:", {
  BASIC: process.env.RAZORPAY_PLAN_CAR_BASIC,
  STANDARD: process.env.RAZORPAY_PLAN_CAR_STANDARD,
  PREMIUM: process.env.RAZORPAY_PLAN_CAR_PREMIUM,
});

/* ----------------------------------------------
   1️⃣ CREATE SUBSCRIPTION (LIVE MODE → NO TRIAL)
---------------------------------------------- */
// payments.js - Update create-subscription endpoint

router.post("/create-subscription", async (req, res) => {
  try {
    const { plan, billingPeriod, customer } = req.body;

    const rawName = plan?.name || "";
    const planName = rawName.toLowerCase().trim().replace(/\s+/g, "");

    const planMapping = {
      basic: process.env.RAZORPAY_PLAN_CAR_BASIC?.trim(),
      standard: process.env.RAZORPAY_PLAN_CAR_STANDARD?.trim(),
      premium: process.env.RAZORPAY_PLAN_CAR_PREMIUM?.trim(),
    };

    const planID = planMapping[planName];

    if (!planID) {
      return res.status(400).json({
        success: false,
        error: `Invalid or missing plan ID for: ${plan?.name}`,
      });
    }

    console.log("Creating subscription for plan:", planName, "→", planID);

    // 🔥 CHECK IF LOCALHOST OR PRODUCTION
    const isLocalhost = req.headers.host?.includes('localhost');

    // 🔥 CREATE SUBSCRIPTION WITH 7-DAY TRIAL (ONLY IN PRODUCTION)
    const subscriptionPayload = {
      plan_id: planID,
      total_count: 12,
      quantity: 1,
      customer_notify: 1,
      notes: { 
        planName: plan.name,
        customerEmail: customer.email,
        customerPhone: customer.phone
      },
    };

    // 🔥 ADD TRIAL ONLY FOR PRODUCTION (NOT LOCALHOST)
    if (!isLocalhost) {
      subscriptionPayload.start_at = Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60); // 7 days from now
      subscriptionPayload.customer_notify = 1; // Notify customer about trial
    }

    const subscription = await razorpay.subscriptions.create(subscriptionPayload);

    // 🔥 CALCULATE TRIAL END DATE (7 days from now)
    const trialEndDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    
    // Calculate actual expiry (after first payment)
    let expiry;
    if (billingPeriod === "monthly") {
      expiry = new Date(trialEndDate.getTime() + 30 * 24 * 60 * 60 * 1000);
    } else {
      expiry = new Date(trialEndDate.getTime() + 365 * 24 * 60 * 60 * 1000);
    }

    // 🔥 SAVE TO DATABASE
    await prisma.payment.create({
      data: {
        customerName: customer.name,
        companyName: customer.companyName,
        email: customer.email,
        phone: customer.phone,
        plan: plan.name,
        billingPeriod,
        amount: plan.numericPrice,
        referralCode: customer.referenceCode || null,
        gstNumber: customer.gstNumber || null,
        subscriptionId: subscription.id,
        
        // 🔥 TRIAL STATUS
        isTrial: !isLocalhost, // Trial only in production
        status: isLocalhost ? "ACTIVE" : "TRIAL", // TRIAL status during 7 days
        trialEndDate: isLocalhost ? null : trialEndDate,
        
        // These will be filled after first payment
        paidAt: isLocalhost ? new Date() : null,
        paymentId: isLocalhost ? `mock_${subscription.id}` : null,
        nextBillingDate: isLocalhost ? expiry : trialEndDate,
        expiryDate: isLocalhost ? expiry : null,
      },
    });

    res.json({ 
      success: true, 
      subscription,
      razorpayKey: process.env.RAZORPAY_KEY_ID,
      isTrial: !isLocalhost,
      trialEndDate: !isLocalhost ? trialEndDate : null
    });

  } catch (err) {
    console.error("Subscription creation error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// payments.js - Add this new endpoint

router.post("/verify-payment-localhost", async (req, res) => {
  try {
    const { subscriptionId, paymentId } = req.body;

    // Verify payment with Razorpay
    const subscription = await razorpay.subscriptions.fetch(subscriptionId);
    
    if (subscription.status === 'active') {
      let expiry;
      const record = await prisma.payment.findFirst({
        where: { subscriptionId }
      });

      if (!record) {
        return res.json({ success: false, error: "Subscription not found" });
      }

      if (record.billingPeriod === "monthly") {
        expiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      } else {
        expiry = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
      }

      await prisma.payment.updateMany({
        where: { subscriptionId },
        data: {
          status: "ACTIVE",
          paidAt: new Date(),
          paymentId: paymentId,
          nextBillingDate: expiry,
          expiryDate: expiry,
        },
      });

      return res.json({ success: true, message: "Payment verified and activated" });
    }

    res.json({ success: false, error: "Subscription not active yet" });

  } catch (err) {
    console.error("Verification error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});
/* ----------------------------------------------
   2️⃣ RAZORPAY WEBHOOK (No Live Trial Logic Needed)
---------------------------------------------- */
// payments.js - Update webhook handler

router.post("/razorpay-webhook", async (req, res) => {
  try {
    const payload = JSON.stringify(req.body);
    const signature = req.headers["x-razorpay-signature"];
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

    const expected = crypto
      .createHmac("sha256", secret)
      .update(payload)
      .digest("hex");

    if (expected !== signature) {
      console.error("❌ Invalid webhook signature");
      return res.status(400).json({ success: false, error: "Invalid signature" });
    }

    const event = req.body.event;
    console.log("📥 Webhook received:", event);

    /* ---------------------------------------------------
       EVENT 1: subscription.activated (trial started)
    --------------------------------------------------- */
    if (event === "subscription.activated") {
      const sub = req.body.payload.subscription.entity;
      
      console.log("✅ Subscription activated:", sub.id);

      const record = await prisma.payment.findFirst({
        where: { subscriptionId: sub.id },
      });

      if (record) {
        await prisma.payment.updateMany({
          where: { subscriptionId: sub.id },
          data: {
            status: "TRIAL",
            isTrial: true,
          },
        });
        console.log("✅ Updated to TRIAL status");
      }

      return res.json({ success: true });
    }

    /* ---------------------------------------------------
       EVENT 2: subscription.charged (FIRST PAYMENT after trial)
    --------------------------------------------------- */
    if (event === "subscription.charged") {
      const sub = req.body.payload.subscription.entity;
      const paymentEntity = req.body.payload.payment.entity;

      console.log("💰 Payment charged:", paymentEntity.id, "for subscription:", sub.id);

      const record = await prisma.payment.findFirst({
        where: { subscriptionId: sub.id },
      });

      if (!record) {
        console.log("⚠️ No record found for subscription:", sub.id);
        return res.json({ success: true });
      }

      // Calculate next billing date
      let expiry;
      if (record.billingPeriod === "monthly") {
        expiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      } else {
        expiry = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
      }

      // 🔥 UPDATE TO ACTIVE (trial ended, payment successful)
      await prisma.payment.updateMany({
        where: { subscriptionId: sub.id },
        data: {
          status: "ACTIVE",
          isTrial: false, // Trial ended
          paidAt: new Date(),
          paymentId: paymentEntity.id,
          nextBillingDate: expiry,
          expiryDate: expiry,
        },
      });

      console.log("✅ Subscription now ACTIVE, trial ended");

      return res.json({ success: true });
    }

    /* ---------------------------------------------------
       EVENT 3: subscription.cancelled (user cancelled)
    --------------------------------------------------- */
    if (event === "subscription.cancelled") {
      const sub = req.body.payload.subscription.entity;
      
      await prisma.payment.updateMany({
        where: { subscriptionId: sub.id },
        data: {
          status: "CANCELLED",
        },
      });

      console.log("❌ Subscription cancelled:", sub.id);
      return res.json({ success: true });
    }

    /* ---------------------------------------------------
       EVENT 4: subscription.paused (payment failed)
    --------------------------------------------------- */
    if (event === "subscription.paused") {
      const sub = req.body.payload.subscription.entity;
      
      await prisma.payment.updateMany({
        where: { subscriptionId: sub.id },
        data: {
          status: "PAUSED",
        },
      });

      console.log("⏸️ Subscription paused:", sub.id);
      return res.json({ success: true });
    }

    res.json({ success: true });

  } catch (err) {
    console.error("❌ Webhook error:", err);
    res.status(500).json({ success: false });
  }
});

/* ----------------------------------------------
   3️⃣ FETCH USER PLAN (ACTIVE)
---------------------------------------------- */
router.get("/user-plan/:email", async (req, res) => {
  try {
    const { email } = req.params;

    let payment = await prisma.payment.findFirst({
      where: { email, status: "ACTIVE" },
      orderBy: { paidAt: "desc" },
    });

    if (!payment)
      return res.json({ success: false, message: "No plan found for this user" });

    return res.json({ success: true, payment });
  } catch (err) {
    console.error("Fetch plan error:", err);
    res.status(500).json({ error: "Error fetching plan" });
  }
});

export default router;
