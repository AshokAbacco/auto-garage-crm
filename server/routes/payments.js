import express from "express";
import Razorpay from "razorpay";
import crypto from "crypto";
import prisma from "../models/prismaClient.js";
import { PlanType } from "@prisma/client";
import { protect } from "../middleware/authMiddleware.js";
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

// Razorpay Plan IDs mapped directly to match your exact .env variables
const RAZORPAY_PLAN_MAP = {
  // Car Categories
  basic: process.env.RAZORPAY_PLAN_CAR_BASIC,
  basicnode: process.env.RAZORPAY_PLAN_CAR_BASIC,
  standard: process.env.RAZORPAY_PLAN_CAR_STANDARD,
  standardnode: process.env.RAZORPAY_PLAN_CAR_STANDARD,
  premium: process.env.RAZORPAY_PLAN_CAR_PREMIUM,
  premiumnode: process.env.RAZORPAY_PLAN_CAR_PREMIUM,

  // Bike Categories (.env values matched here)
  bikebasic: process.env.BIKE_BASIC,
  bikestandard: process.env.BIKE_STANDARD,
  bikepremium: process.env.BIKE_PREMIUM,

  // Wash Categories (.env casing keys matched here)
  washstandard: process.env.WASH_STANDARD,
  washpremium: process.env.Wash_PREMIUM,
};

const PRISMA_PLAN_MAP = {
  basic: "BASIC",
  basicnode: "BASIC",
  bikebasic: "BASIC",

  standard: "STANDARD",
  standardnode: "STANDARD",
  bikestandard: "STANDARD",
  washstandard: "STANDARD",

  premium: "PREMIUM",
  premiumnode: "PREMIUM",
  bikepremium: "PREMIUM",
  washpremium: "PREMIUM",
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
  console.log("\n================ CREATE SUBSCRIPTION ================");
  console.log("FULL BODY:");
  console.log(JSON.stringify(req.body, null, 2));

  const { plan, billingPeriod, customer } = req.body || {};

  console.log("\nPLAN OBJECT:", plan);
  console.log("\nCUSTOMER OBJECT:", customer);
  console.log("plan.name =>", plan?.name);
  console.log("plan.numericPrice =>", plan?.numericPrice);
  console.log("billingPeriod =>", billingPeriod);

  const rawPlanName = plan?.name?.toLowerCase()?.trim()?.replace(/\s+/g, "");
  console.log("\nNORMALIZED PLAN NAME:", rawPlanName);

  try {
    if (!plan?.name) {
      console.log("FAILED: PLAN NAME MISSING");
      return res.status(400).json({
        success: false,
        error: "PLAN NAME MISSING",
      });
    }

    if (typeof plan.numericPrice !== "number") {
      console.log("FAILED: PRICE NOT NUMBER");
      return res.status(400).json({
        success: false,
        error: `PRICE TYPE = ${typeof plan.numericPrice}`,
      });
    }

    if (!["monthly", "yearly"].includes(billingPeriod?.toLowerCase?.())) {
      console.log("FAILED: INVALID BILLING");
      return res.status(400).json({
        success: false,
        error: `INVALID BILLING = ${billingPeriod}`,
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

    const razorpayPlanId = RAZORPAY_PLAN_MAP[rawPlanName];
    const prismaPlan = PRISMA_PLAN_MAP[rawPlanName];

    if (!razorpayPlanId || !prismaPlan) {
      console.log("FAILED: PLAN MAP");
      console.log("rawPlanName =>", rawPlanName);
      return res.status(400).json({
        success: false,
        error: `INVALID PLAN MAP = ${rawPlanName}`,
      });
    }

    console.log("\n========== CUSTOMER CHECK ==========");
    const existingActiveSubscription = await prisma.payment.findFirst({
      where: {
        email: customer.email.toLowerCase(),
        subscriptionId: {
          not: null,
        },
      },
    });

    const isUpgrade = !!existingActiveSubscription;
    console.log("EMAIL:", customer.email.toLowerCase());
    console.log("HAS PREVIOUS SUBSCRIPTION:", isUpgrade);
    console.log("TRIAL ELIGIBLE:", !isUpgrade);

    let startAt;

    // 🔥 MODIFIED TRIAL TIMELINES MATRIX
    if (!isUpgrade && useTrial) {
      if (rawPlanName === "basic" || rawPlanName === "bikebasic") {
        // Basic / Bike Basic gets a full 30-day Free Trial node window
        startAt = Math.floor((Date.now() + 30 * 24 * 60 * 60 * 1000) / 1000);
        console.log("\n========== BASIC 1-MONTH TRIAL ENABLED ==========");
      } else {
        // Standard & Premium retain original 7-day trial deployment matrix
        startAt = Math.floor((Date.now() + 7 * 24 * 60 * 60 * 1000) / 1000);
        console.log("\n========== STANDARD/PREMIUM 7-DAY TRIAL ENABLED ==========");
      }
      console.log("FIRST BILLING DATE:", new Date(startAt * 1000));
    } else {
      console.log("\n========== TRIAL ACTIVE: NO ==========");
    }

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
      console.log("\n========== SUBSCRIPTION CREATED ==========");
      console.log("SUBSCRIPTION ID:", subscription.id);
      console.log("RAZORPAY PLAN ID DEPLOYED:", razorpayPlanId);
      console.log("==========================================\n");
    } catch (err) {
      console.error("Razorpay error:", err);
      return res.status(502).json({
        success: false,
        error: err?.error?.description || "Razorpay subscription failed",
      });
    }

    console.log("\n========== PAYMENT RECORD CHECK ==========");
    const existingFirstPayment = await prisma.payment.findFirst({
      where: {
        email: customer.email.toLowerCase(),
        status: "FIRST_PAYMENT_COMPLETED",
        subscriptionId: null,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    let payment;
    if (existingFirstPayment) {
      console.log("FOUND FIRST PAYMENT RECORD:", existingFirstPayment.id);
      payment = await prisma.payment.update({
        where: {
          id: existingFirstPayment.id,
        },
        data: {
          subscriptionId: subscription.id,
          isTrial: !!startAt,
          status: startAt ? "TRIAL" : "PENDING",
          trialEndDate: startAt ? new Date(startAt * 1000) : null,
          nextBillingDate: startAt ? new Date(startAt * 1000) : null,
        },
      });
    } else {
      console.log("NO FIRST PAYMENT RECORD FOUND - CREATING NEW RECORD");
      payment = await prisma.payment.create({
        data: {
          customerName: customer.name,
          companyName: customer.companyName || null,
          email: customer.email.toLowerCase(),
          phone: customer.phone,
          address: customer.address || null,

          plan: prismaPlan,
          billingPeriod,
          amount: Number(plan.numericPrice),

          originalAmount: Number(plan.numericPrice),
          discountAmount: 0,
          discountPercent: 0,
          firstPaymentDiscountUsed: false,

          referralCode: customer.referenceCode || null,
          gstNumber: customer.gstNumber || null,

          subscriptionId: subscription.id,
          isTrial: !!startAt,
          status: startAt ? "TRIAL" : "PENDING",
          trialEndDate: startAt ? new Date(startAt * 1000) : null,
          nextBillingDate: startAt ? new Date(startAt * 1000) : null,
        },
      });
    }

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

router.post("/verify-first-payment-order", async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      customer,
      plan,
      billingPeriod,
    } = req.body;

    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        error: "Invalid signature",
      });
    }

    const existingPayment = await prisma.payment.findFirst({
      where: {
        paymentId: razorpay_payment_id,
      },
    });

    if (existingPayment) {
      return res.json({
        success: true,
        payment: existingPayment,
      });
    }

    const originalAmount = Number(plan.numericPrice);

    const existingDiscount = await prisma.payment.findFirst({
      where: {
        email: customer.email.toLowerCase(),
        firstPaymentDiscountUsed: true,
      },
    });

    const normalizedPlan = plan.name.toLowerCase().trim().replace(/\s+/g, "");
    const isBasicPlan = normalizedPlan.includes("basic");

    // Deny 50% checkout discount calculations explicitly on basic package variants
    const eligible = isBasicPlan ? false : !existingDiscount;

    const discountPercent = eligible ? 50 : 0;
    const discountAmount = eligible ? originalAmount * 0.5 : 0;
    const finalAmount = originalAmount - discountAmount;

    const prismaPlan = PRISMA_PLAN_MAP[normalizedPlan];

    const payment = await prisma.payment.create({
      data: {
        customerName: customer.name,
        companyName: customer.companyName || null,
        email: customer.email.toLowerCase(),
        phone: customer.phone,
        address: customer.address || null,

        plan: prismaPlan,
        billingPeriod,

        amount: finalAmount,

        originalAmount,
        discountAmount,
        discountPercent,

        firstPaymentDiscountUsed: discountPercent > 0,

        paymentId: razorpay_payment_id,
        orderId: razorpay_order_id,

        status: "FIRST_PAYMENT_COMPLETED",
        paidAt: new Date(),

        referralCode: customer.referenceCode || null,
        gstNumber: customer.gstNumber || null,
      },
    });

    return res.json({
      success: true,
      payment,
    });
  } catch (err) {
    console.error("VERIFY FIRST PAYMENT ERROR:", err);
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

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

    if (subscription.status !== "active") {
      return res.json({
        success: false,
        error: "Subscription not active yet",
      });
    }

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
      // 1️⃣ Update payment
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

      // 2️⃣ Update user (PLAN + COMPANY DATA)
      await tx.user.update({
        where: { email: payment.email },
        data: {
          plan: payment.plan,
          planExpiry: nextBillingDate,
          companyName: payment.companyName || undefined,
          phone: payment.phone || undefined,
          gstNumber: payment.gstNumber || undefined,
          address: payment.address || undefined,
        },
      });

      return payment;
    });

    return res.json({ success: true, updated });
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
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!secret) {
      return res
        .status(500)
        .json({ success: false, error: "Webhook secret missing" });
    }

    const payloadBuffer = req.body;
    const signature = req.headers["x-razorpay-signature"];
    if (!signature) {
      return res
        .status(400)
        .json({ success: false, error: "Missing signature" });
    }

    const expected = crypto
      .createHmac("sha256", secret)
      .update(payloadBuffer)
      .digest("hex");

    if (expected !== signature) {
      return res
        .status(400)
        .json({ success: false, error: "Invalid signature" });
    }

    const body = JSON.parse(payloadBuffer.toString());
    const event = body.event;

    if (event === "subscription.authenticated") {
      const sub = body.payload.subscription.entity;
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
      }
      return res.json({ success: true });
    }

    if (event === "subscription.charged") {
      const sub = body.payload.subscription.entity;
      const paymentEntity = body.payload.payment.entity;

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

        await prisma.user.update({
          where: { email: record.email },
          data: {
            plan: record.plan,
            planExpiry: nextBillingDate,
            companyName: record.companyName || undefined,
            phone: record.phone || undefined,
          },
        });
      }
      return res.json({ success: true });
    }

    if (event === "subscription.cancelled") {
      const sub = body.payload.subscription.entity;
      await prisma.payment.updateMany({
        where: { subscriptionId: sub.id },
        data: { status: "CANCELLED" },
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

/* =========================================================
   🏅 5️⃣ NEW: CREATE STANDALONE VERIFICATION BADGE ORDER (₹199)
========================================================= */
router.post("/create-verification-order", protect, async (req, res) => {
  try {
    if (req.user.type !== "owner") {
      return res
        .status(403)
        .json({ success: false, error: "Access restricted to owner accounts" });
    }

    const options = {
      amount: 199 * 100,
      currency: "INR",
      receipt: `receipt_verify_user_${req.user.id}_${Date.now()}`,
      notes: {
        userId: req.user.id,
        purpose: "Garage Verification Badge Activation",
      },
    };

    const order = await razorpay.orders.create(options);

    return res.status(201).json({
      success: true,
      order,
      razorpayKey: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Failed to initialize verification order gateway reference.",
    });
  }
});

router.post("/create-first-payment-order", async (req, res) => {
  try {
    const { plan, billingPeriod, customer } = req.body || {};

    if (!plan?.name || typeof plan.numericPrice !== "number" || !customer?.email) {
      return res.status(400).json({
        success: false,
        error: "Missing required parameters metrics",
      });
    }

    const originalAmount = Number(plan.numericPrice);

    const existingDiscount = await prisma.payment.findFirst({
      where: {
        email: customer.email.toLowerCase(),
        firstPaymentDiscountUsed: true,
      },
    });

    const normalizedPlan = plan.name.toLowerCase().trim().replace(/\s+/g, "");
    const isBasicPlan = normalizedPlan.includes("basic");

    const eligible = isBasicPlan ? false : !existingDiscount;

    const discountPercent = eligible ? 50 : 0;
    const discountAmount = eligible ? originalAmount * 0.5 : 0;
    const finalAmount = originalAmount - discountAmount;

    const order = await razorpay.orders.create({
      amount: Math.round(finalAmount * 100),
      currency: "INR",
      receipt: `launch_${Date.now()}`,
      notes: {
        email: customer.email.toLowerCase(),
        customerName: customer.name || "",
        planName: plan.name,
        billingPeriod,
        originalAmount,
        discountAmount,
        discountPercent,
        finalAmount,
      },
    });

    return res.status(200).json({
      success: true,
      order,
      eligible,
      originalAmount,
      discountAmount,
      discountPercent,
      finalAmount,
      razorpayKey: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    console.error("CREATE FIRST PAYMENT ORDER ERROR:", err);
    return res.status(500).json({
      success: false,
      error: err.message || "Failed to create order",
    });
  }
});

export default router;