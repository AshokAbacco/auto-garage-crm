import cron from "node-cron";
import prisma from "../models/prismaClient.js";
import { sendWhatsAppTemplate } from "./whatsappService.js";

export const startBikeReviewScheduler = () => {
  // Runs every day at 10:00 AM
  cron.schedule("* * * * *", async () => {
    console.log("🏍️ Running BIKE review scheduler...");

    try {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const services = await prisma.bikeService.findMany({
        where: {
          status: "Paid", // or "Completed" depending on your flow
          outDate: {
            lte: sevenDaysAgo,
          },
          reviewSentAt: null,
        },
        include: {
          client: {
            include: {
              ownerUser: true,
            },
          },
        },
      });

      console.log(`🏍️ Found ${services.length} bike services for review`);

      for (const service of services) {
        if (!service.client?.phone) continue;

        const rawPhone = service.client.phone.replace(/\D/g, "");
        const to = rawPhone.startsWith("91") ? rawPhone : `91${rawPhone}`;

        try {
          const messageId = await sendWhatsAppTemplate({
            to,
            templateName: "service_review_request_v1", // Create this in Meta
            languageCode: "en",
            variables: [
              service.client.ownerName, // {{1}}
              service.client.ownerUser?.companyName || "Our Garage", // {{2}}
              service.outDate
                ? service.outDate.toLocaleDateString("en-IN")
                : "", // {{3}}
              service.client.regNumber || "", // {{4}}
            ],
          });

          await prisma.bikeService.update({
            where: { id: service.id },
            data: {
              reviewSentAt: new Date(),
              reviewMessageId: messageId,
            },
          });

          console.log("✅ Bike review sent for service:", service.id);
        } catch (err) {
          console.error(
            "❌ Failed sending bike review:",
            service.id,
            err.message,
          );
        }
      }
    } catch (error) {
      console.error("❌ Bike review scheduler error:", error.message);
    }
  });
};
