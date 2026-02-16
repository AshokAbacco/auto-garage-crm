// whatsappWebhookController.js
import prisma from "../models/prismaClient.js";

export const handleWhatsAppWebhook = async (req, res) => {
  try {
    const entry = req.body.entry?.[0];
    const change = entry?.changes?.[0];
    const value = change?.value;
    const message = value?.messages?.[0];

    if (!message) {
      return res.sendStatus(200);
    }

    console.log("========== INCOMING WHATSAPP ==========");
    console.log(JSON.stringify(message, null, 2));
    console.log("========================================");

    /* ========================================================
       PHONE NORMALIZER
    ======================================================== */
    const normalizePhone = (phone) => {
      const digits = String(phone).replace(/\D/g, "");

      if (digits.length === 10) return `91${digits}`;
      if (digits.length === 12 && digits.startsWith("91")) return digits;

      return digits;
    };

    const fullPhone = normalizePhone(message.from);
    const last10 = fullPhone.slice(-10);

    /* ========================================================
       HANDLE BUTTON CLICKS
    ======================================================== */
    if (message.type === "button") {
      const actionText = message.button?.text?.trim();

      console.log("Button clicked:", actionText);
      console.log("From phone:", fullPhone);

      if (!fullPhone || !actionText) {
        return res.sendStatus(200);
      }

      /* ================= OPT-IN (CAR + BIKE SAFE) ================= */
      if (actionText === "Yes, Send Updates") {
        await prisma.client.updateMany({
          where: { phone: last10 },
          data: {
            whatsappOptin: true,
            whatsappOptinAt: new Date(),
            whatsappOptinSource: "whatsapp_button",
          },
        });

        return res.sendStatus(200);
      }

      if (actionText === "No, Thanks") {
        await prisma.client.updateMany({
          where: { phone: last10 },
          data: { whatsappOptin: false },
        });

        return res.sendStatus(200);
      }

      /* ================= REVIEW RATING ================= */

      const ratingMap = {
        "1 - 2 Poor": 2,
        "3 Average": 3,
        "4 - 5 Excellent": 5,
      };

      if (ratingMap[actionText]) {
        /* ---------- CAR REVIEW ---------- */
        const carClient = await prisma.client.findFirst({
          where: { phone: last10 },
        });

        if (carClient) {
          const carService = await prisma.service.findFirst({
            where: {
              clientId: carClient.id,
              reviewSentAt: { not: null },
              reviewRating: null,
            },
            orderBy: { reviewSentAt: "desc" },
          });

          if (carService) {
            await prisma.service.update({
              where: { id: carService.id },
              data: {
                reviewRating: ratingMap[actionText],
                reviewSource: "whatsapp",
              },
            });

            console.log("⭐ Car review saved:", carService.id);
            return res.sendStatus(200);
          }
        }

        /* ---------- BIKE REVIEW ---------- */
        const bikeClient = await prisma.bike.findFirst({
          where: { phone: last10 },
        });

        if (bikeClient) {
          const bikeService = await prisma.bikeService.findFirst({
            where: {
              clientId: bikeClient.id,
              reviewSentAt: { not: null },
              reviewRating: null,
            },
            orderBy: { reviewSentAt: "desc" },
          });

          if (bikeService) {
            await prisma.bikeService.update({
              where: { id: bikeService.id },
              data: {
                reviewRating: ratingMap[actionText],
                reviewSource: "whatsapp",
              },
            });

            console.log("⭐ Bike review saved:", bikeService.id);
            return res.sendStatus(200);
          }
        }

        return res.sendStatus(200);
      }

      /* ================= APPROVE / REJECT ================= */

      /* ---------- CAR SESSION ---------- */
      const carSession = await prisma.whatsAppSession.findUnique({
        where: { phone: fullPhone },
      });

      if (carSession) {
        if (carSession.expiresAt < new Date()) {
          console.log("❌ Car session expired");
          return res.sendStatus(200);
        }

        if (actionText === "Approve Service") {
          await prisma.service.update({
            where: { id: carSession.serviceId },
            data: {
              approvalStatus: "APPROVED",
              approvalSource: "whatsapp",
              approvalAt: new Date(),
            },
          });

          console.log("✅ Car service approved:", carSession.serviceId);
        }

        if (actionText === "Reject / Contact Garage") {
          await prisma.service.update({
            where: { id: carSession.serviceId },
            data: {
              approvalStatus: "REJECTED",
              approvalSource: "whatsapp",
              approvalAt: new Date(),
            },
          });

          console.log("❌ Car service rejected:", carSession.serviceId);
        }

        return res.sendStatus(200);
      }

      /* ---------- BIKE SESSION ---------- */
      const bikeSession = await prisma.bikeWhatsAppSession.findFirst({
        where: {
          OR: [{ phone: fullPhone }, { phone: last10 }],
        },
      });

      if (bikeSession) {
        if (bikeSession.expiresAt < new Date()) {
          console.log("❌ Bike session expired");
          return res.sendStatus(200);
        }

        if (actionText === "Approve Service") {
          await prisma.bikeService.update({
            where: { id: bikeSession.bikeServiceId },
            data: {
              approvalStatus: "APPROVED",
              approvalSource: "whatsapp",
              approvalAt: new Date(),
            },
          });

          console.log("✅ Bike service approved:", bikeSession.bikeServiceId);
        }

        if (actionText === "Reject / Contact Garage") {
          await prisma.bikeService.update({
            where: { id: bikeSession.bikeServiceId },
            data: {
              approvalStatus: "REJECTED",
              approvalSource: "whatsapp",
              approvalAt: new Date(),
            },
          });

          console.log("❌ Bike service rejected:", bikeSession.bikeServiceId);
        }

        return res.sendStatus(200);
      }

      console.log("❌ No session found for:", fullPhone);
      return res.sendStatus(200);
    }

    /* ========================================================
       HANDLE TEXT (STOP)
    ======================================================== */
    if (message.type === "text") {
      const text = message.text?.body?.trim().toLowerCase();

      if (text === "stop") {
        await prisma.client.updateMany({
          where: { phone: last10 },
          data: { whatsappOptin: false },
        });

        return res.sendStatus(200);
      }

      /* Extend CAR session */
      const carSession = await prisma.whatsAppSession.findUnique({
        where: { phone: fullPhone },
      });

      if (carSession) {
        await prisma.whatsAppSession.update({
          where: { phone: fullPhone },
          data: {
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
          },
        });
      }

      /* Extend BIKE session */
      const bikeSession = await prisma.bikeWhatsAppSession.findUnique({
        where: { phone: fullPhone },
      });

      if (bikeSession) {
        await prisma.bikeWhatsAppSession.update({
          where: { phone: fullPhone },
          data: {
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
          },
        });
      }

      return res.sendStatus(200);
    }

    return res.sendStatus(200);
  } catch (err) {
    console.error("WhatsApp webhook error:", err);
    return res.sendStatus(200);
  }
};
