import cron from "node-cron";
import prisma from "../models/prismaClient.js";
import { sendWhatsAppTemplate } from "./whatsappService.js";

export const startReviewScheduler = () => {
  // Runs every day at 10:00 AM
  cron.schedule("* * * * *", async () => {
    console.log("🔄 Running review scheduler...");

    try {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const services = await prisma.service.findMany({
        where: {
          status: "Paid",
          serviceOutDate: {
            lte: sevenDaysAgo,
          },
          reviewSentAt: null,
        },
        include: {
          client: {
            include: {
              user: true,
            },
          },
        },
      });

      console.log(`Found ${services.length} services for review`);

      for (const service of services) {
        if (!service.client?.phone) continue;

        const rawPhone = service.client.phone.replace(/\D/g, "");
        const to = rawPhone.startsWith("91") ? rawPhone : `91${rawPhone}`;

        try {
          const messageId = await sendWhatsAppTemplate({
            to,
            templateName: "service_review_request_v1",
            languageCode: "en",
            variables: [
              service.client.fullName, // {{1}}
              service.client.user?.companyName || "Our Garage", // {{2}}
              service.serviceOutDate
                ? service.serviceOutDate.toLocaleDateString()
                : "", // {{3}}
              service.client.regNumber || "", // {{4}}
            ],
          });

          await prisma.service.update({
            where: { id: service.id },
            data: {
              reviewSentAt: new Date(),
              reviewMessageId: messageId,
            },
          });

          console.log("✅ Review sent for service:", service.id);
        } catch (err) {
          console.error(
            "❌ Failed sending review for service:",
            service.id,
            err.message,
          );
        }
      }
    } catch (error) {
      console.error("❌ Review scheduler error:", error.message);
    }
  });
};
