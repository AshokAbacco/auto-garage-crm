import cron from "node-cron";
import prisma from "../models/prismaClient.js";
import { sendWhatsAppTemplate } from "./whatsappService.js";

/* =========================================================
   WASH REVIEW SCHEDULER
   Sends review request 1 day after service date
========================================================= */

export const startWashReviewScheduler = () => {
  // Run every minute for testing
  // Change to "0 10 * * *" for 10:00 AM daily in production
  cron.schedule("* 10 * * *", async () => {
    console.log("\n🚿 Running WASH review scheduler...");
    console.log("======================================");

    try {
      const now = new Date();
      console.log("🕒 Server Time (UTC):", now.toISOString());

      /* =====================================================
         STEP 1: Calculate threshold (1 day ago)
      ===================================================== */
      const threshold = new Date();
      threshold.setDate(threshold.getDate() - 1);

      console.log("📅 Threshold (1 day ago UTC):", threshold.toISOString());

      /* =====================================================
         STEP 2: Fetch eligible services directly from DB
      ===================================================== */
      const services = await prisma.washingService.findMany({
        where: {
          status: "COMPLETED",
          date: {
            lte: threshold,
          },
          reviewSentAt: null,
        },
        include: {
          client: true,
        },
      });

      console.log("🚿 Eligible services found:", services.length);

      if (services.length === 0) {
        console.log("ℹ️ No wash services eligible for review.");
        return;
      }

      /* =====================================================
         STEP 3: Send review messages
      ===================================================== */
      for (const service of services) {
        try {
          if (!service.client?.phone) {
            console.log("⚠️ Skipping — no phone for service:", service.id);
            continue;
          }

          /* ===============================
             Normalize phone (India E.164)
          =============================== */
          let rawPhone = service.client.phone.replace(/\D/g, "");

          if (rawPhone.length === 10) rawPhone = `91${rawPhone}`;
          if (!rawPhone.startsWith("91")) rawPhone = `91${rawPhone}`;

          const to = rawPhone;

          console.log("📤 Sending review to:", to);

          /* ===============================
             Send WhatsApp Template
          =============================== */
          const messageId = await sendWhatsAppTemplate({
            to,
            templateName: "service_review_request_v1", // Make sure this exists in Meta
            languageCode: "en",
            variables: [
              service.client.fullName || "Customer", // {{1}}
              service.client.vehicleMake || "Vehicle", // {{2}}
              new Date(service.date).toLocaleDateString("en-IN"), // {{3}}
              service.client.regNumber || "", // {{4}}
            ],
          });

          console.log("✅ Review message sent. ID:", messageId);

          /* ===============================
             Update DB to prevent duplicate send
          =============================== */
          await prisma.washingService.update({
            where: { id: service.id },
            data: {
              reviewSentAt: new Date(),
              reviewMessageId: messageId || null,
            },
          });

          console.log("📝 reviewSentAt updated for service:", service.id);
        } catch (err) {
          console.error(
            "❌ Failed sending review for service:",
            service.id,
            err.response?.data || err.message,
          );
        }
      }

      console.log("🏁 Wash review scheduler cycle completed.");
    } catch (error) {
      console.error("❌ Wash review scheduler error:", error.message);
    }
  });
};
