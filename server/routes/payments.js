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

/* ----------------------------------------------
   1️⃣ CREATE SUBSCRIPTION
   - Uses USE_TRIAL + NODE_ENV to decide start_at
   - In dev: quick 60s trial to test flow
   - In prod: real 7 day trial
---------------------------------------------- */
/* ----------------------------------------------
   CREATE SUBSCRIPTION (robust: better logging + validation)
---------------------------------------------- */
router.post("/create-subscription", async (req, res) => {
  try {
    const { plan, billingPeriod, customer } = req.body || {};

    // Basic input validation
    if (!plan || !plan.name || typeof plan.numericPrice !== "number") {
      return res.status(400).json({ success: false, error: "Invalid 'plan' object. Expect { name, numericPrice }" });
    }
    if (!billingPeriod || !["monthly", "yearly"].includes(billingPeriod)) {
      return res.status(400).json({ success: false, error: "Invalid 'billingPeriod'. Use 'monthly' or 'yearly'." });
    }
    if (!customer || !customer.email || !customer.name || !customer.phone) {
      return res.status(400).json({ success: false, error: "Invalid 'customer' object. Expect { name, email, phone }" });
    }

    // Check Razorpay config
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      console.error("Razorpay keys missing in env!");
      return res.status(500).json({ success: false, error: "Server misconfiguration: missing Razorpay keys" });
    }

    const rawName = (plan?.name || "").toLowerCase().trim().replace(/\s+/g, "");
    const planMapping = {
      basic: process.env.RAZORPAY_PLAN_CAR_BASIC?.trim(),
      standard: process.env.RAZORPAY_PLAN_CAR_STANDARD?.trim(),
      premium: process.env.RAZORPAY_PLAN_CAR_PREMIUM?.trim(),
    };

    const planID = planMapping[rawName];
    if (!planID) {
      console.warn("No mapping for plan:", rawName, "planMapping:", planMapping);
      return res.status(400).json({ success: false, error: `Invalid plan name '${plan.name}'. Contact admin.` });
    }

    // Build payload
    const subscriptionPayload = {
      plan_id: planID,
      total_count: 12,
      quantity: 1,
      customer_notify: 1,
      notes: {
        planName: plan.name,
        customerEmail: customer.email,
        customerPhone: customer.phone,
      },
    };

    // Apply trial window
    if (useTrial && isProduction) {
      subscriptionPayload.start_at = Math.floor((Date.now() + 7 * 24 * 60 * 60 * 1000) / 1000);
    }


    // Create subscription with Razorpay
    let subscription;
    try {
      subscription = await razorpay.subscriptions.create(subscriptionPayload);
    } catch (razErr) {
      console.error("Razorpay subscription creation error:", razErr && razErr.error ? razErr.error : razErr);
      // If Razorpay returned structured error, return it to client in dev
      const razorMsg = razErr && razErr.error && razErr.error.description
        ? razErr.error.description
        : razErr.message || "Razorpay error";
      return res.status(502).json({ success: false, error: `Razorpay create subscription failed: ${razorMsg}` });
    }

    // Build DB fields
    const trialEndDate = subscriptionPayload.start_at ? new Date(subscriptionPayload.start_at * 1000) : null;
    const nextBillingDate = trialEndDate ? trialEndDate : addInterval(new Date(), billingPeriod);

    // Save to DB
    let created;
    try {
      created = await prisma.payment.create({
        data: {
          customerName: customer.name,
          companyName: customer.companyName || null,
          email: customer.email,
          phone: customer.phone,
          plan: plan.name,
          billingPeriod,
          amount: plan.numericPrice,
          referralCode: customer.referenceCode || null,
          gstNumber: customer.gstNumber || null,
          subscriptionId: subscription.id,
          isTrial: !!subscriptionPayload.start_at,
          status: subscriptionPayload.start_at ? "TRIAL" : "PENDING",
          trialEndDate: trialEndDate,
          nextBillingDate: nextBillingDate,
        },
      });
    } catch (dbErr) {
      console.error("Prisma DB save error:", dbErr);
      // If subscription already exists in DB (unique constraint) handle gracefully
      if (dbErr.code === "P2002") {
        // Unique constraint violation - subscriptionId or paymentId duplicate
        return res.status(409).json({ success: false, error: "Duplicate subscription (already exists in DB)" });
      }
      // Return detailed error in dev, generic in prod
      return res.status(500).json({ success: false, error: isProduction ? "DB error saving subscription" : dbErr.message });
    }

    // Success
    return res.json({
      success: true,
      subscription,
      razorpayKey: process.env.RAZORPAY_KEY_ID,
      isTrial: !!subscriptionPayload.start_at,
      trialEndDate,
      paymentRecordId: created.id,
    });

  } catch (err) {
    // Unexpected
    console.error("create-subscription unexpected error:", err);
    return res.status(500).json({ success: false, error: process.env.NODE_ENV === "production" ? "Server error" : (err.stack || err.message) });
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
   IMPORTANT:
   - app must mount express.raw({ type: 'application/json' }) on this path
     e.g. app.use('/api/payments/razorpay-webhook', express.raw({ type: 'application/json' }))
   - If you cannot mount raw, this handler will *try* to compute signature using a JSON string fallback,
     but best practice is to use raw body for signature verification.
---------------------------------------------- */
router.post("/razorpay-webhook", async (req, res) => {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!secret) {
      console.error("Webhook secret not set in env (RAZORPAY_WEBHOOK_SECRET)");
      return res.status(500).json({ success: false, error: "Webhook secret not configured" });
    }

    // Determine payload raw buffer & compute signature
    // If req.body is a Buffer (when express.raw used), use it directly.
    // Otherwise fall back to stringified JSON (less ideal).
    let payloadBuffer;
    if (Buffer.isBuffer(req.body)) {
      payloadBuffer = req.body;
    } else {
      // fallback: stringify parsed body (works only if express.json parsed it and no whitespace changes)
      payloadBuffer = Buffer.from(JSON.stringify(req.body));
    }

    const signature = req.headers["x-razorpay-signature"];
    if (!signature) {
      console.error("Missing x-razorpay-signature header");
      return res.status(400).json({ success: false, error: "Missing signature" });
    }

    const expected = crypto.createHmac("sha256", secret).update(payloadBuffer).digest("hex");
    if (expected !== signature) {
      console.error("❌ Invalid webhook signature - expected does not match provided");
      return res.status(400).json({ success: false, error: "Invalid signature" });
    }

    // Parse body
    const body = JSON.parse(payloadBuffer.toString());
    const event = body.event;
    console.log("📥 Razorpay webhook event:", event);

    /* ---------------------------------------------------
       EVENT: subscription.activated (subscription created/activated)
    --------------------------------------------------- */
    if (event === "subscription.activated") {
      const sub = body.payload.subscription.entity;
      console.log("subscription.activated:", sub.id);

      const record = await prisma.payment.findUnique({ where: { subscriptionId: sub.id } });
      if (record) {
        const trialDate = sub.start_at ? new Date(sub.start_at * 1000) : record.trialEndDate;
        await prisma.payment.update({
          where: { subscriptionId: sub.id },
          data: {
            status: "TRIAL",
            isTrial: true,
            trialEndDate: trialDate,
            // nextBillingDate likely already set to trialEndDate during creation
          },
        });
        console.log("Updated DB to TRIAL for subscription:", sub.id);
      } else {
        console.warn("No DB record found for subscription.activated:", sub.id);
      }

      return res.json({ success: true });
    }

    /* ---------------------------------------------------
       EVENT: subscription.charged (invoice/payment created & paid)
       This is where we flip TRIAL -> ACTIVE on first charge and update paidAt/paymentId
    --------------------------------------------------- */
    if (event === "subscription.charged") {
      const sub = body.payload.subscription.entity;
      const paymentEntity = body.payload.payment.entity;
      console.log("subscription.charged for:", sub.id, "payment:", paymentEntity?.id);

      const record = await prisma.payment.findUnique({ where: { subscriptionId: sub.id } });
      if (!record) {
        console.warn("No DB record for subscription.charged:", sub.id);
        return res.json({ success: true });
      }

      // Determine created time for paymentEntity (Razorpay uses created_at as unix seconds)
      const firstChargeAt = paymentEntity && paymentEntity.created_at
        ? new Date(paymentEntity.created_at * 1000)
        : new Date();

      const nextBillingDate = addInterval(firstChargeAt, record.billingPeriod);

      await prisma.payment.update({
        where: { subscriptionId: sub.id },
        data: {
          status: "ACTIVE",
          isTrial: false,
          paidAt: firstChargeAt,
          paymentId: paymentEntity?.id || null,
          nextBillingDate: nextBillingDate,
          expiryDate: nextBillingDate,
        },
      });

      console.log("Subscription charged -> status ACTIVE for:", sub.id);
      return res.json({ success: true });
    }

    /* ---------------------------------------------------
       EVENT: subscription.cancelled
    --------------------------------------------------- */
    if (event === "subscription.cancelled") {
      const sub = body.payload.subscription.entity;
      console.log("subscription.cancelled:", sub.id);

      // Use update (unique subscriptionId)
      await prisma.payment.updateMany({
        where: { subscriptionId: sub.id },
        data: { status: "CANCELLED" },
      });

      return res.json({ success: true });
    }

    /* ---------------------------------------------------
       EVENT: subscription.paused (could be due to failed payments)
    --------------------------------------------------- */
    if (event === "subscription.paused") {
      const sub = body.payload.subscription.entity;
      console.log("subscription.paused:", sub.id);

      await prisma.payment.updateMany({
        where: { subscriptionId: sub.id },
        data: { status: "PAUSED" },
      });

      return res.json({ success: true });
    }

    // Unhandled events - return success so Razorpay won't retry excessively
    return res.json({ success: true });
  } catch (err) {
    console.error("❌ Webhook handler error:", err);
    return res.status(500).json({ success: false, error: err.message || "Webhook error" });
  }
});

/* ----------------------------------------------
   4️⃣ FETCH USER PLAN (ACTIVE)
---------------------------------------------- */
router.get("/user-plan/:email", async (req, res) => {
  try {
    const { email } = req.params;
    console.log("Searching for plan with email:", email);

    // Normalize email (trim and lowercase) to ensure consistent matching
    const normalizedEmail = email.trim().toLowerCase();

    // First, let's check if any payment exists for this email at all
    const anyPayment = await prisma.payment.findFirst({
      where: {
        email: {
          equals: normalizedEmail,
          mode: 'insensitive' // Case-insensitive comparison
        }
      }
    });

    console.log("Any payment found:", anyPayment);

    if (!anyPayment) {
      return res.json({ success: false, message: "No payment records found for this user" });
    }

    // Now get the most recent payment with ACTIVE or TRIAL status
    const payment = await prisma.payment.findFirst({
      where: {
        email: {
          equals: normalizedEmail,
          mode: 'insensitive' // Case-insensitive comparison
        },
        status: { in: ["ACTIVE", "TRIAL"] }
      },
      orderBy: { createdAt: "desc" },
    });

    console.log("Active/Trial payment found:", payment);

    if (!payment) {
      // If no active/trial plan, check if there's any payment with different status
      const allPayments = await prisma.payment.findMany({
        where: {
          email: {
            equals: normalizedEmail,
            mode: 'insensitive'
          }
        },
        orderBy: { createdAt: "desc" },
      });

      console.log("All payments for user:", allPayments);

      return res.json({
        success: false,
        message: "No active plan found for this user",
        debug: {
          email: normalizedEmail,
          paymentCount: allPayments.length,
          lastStatus: allPayments.length > 0 ? allPayments[0].status : null
        }
      });
    }

    return res.json({ success: true, payment });
  } catch (err) {
    console.error("Fetch plan error:", err);
    return res.status(500).json({ error: "Error fetching plan" });
  }
});

export default router;
