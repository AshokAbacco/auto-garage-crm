// whatsappWebhookController.js
import prisma from "../models/prismaClient.js";

export const handleWhatsAppWebhook = async (req, res) => {
  try {
    const entry = req.body.entry?.[0];
    const change = entry?.changes?.[0];
    const value = change?.value;
    const message = value?.messages?.[0];

    if (!message) return res.sendStatus(200);

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
    const now = new Date();

    /* ========================================================
       HANDLE BUTTON CLICKS
    ======================================================== */
    if (message.type === "button") {
      const actionText = message.button?.text?.trim();
      if (!actionText) return res.sendStatus(200);

      console.log("Button clicked:", actionText);
      console.log("From phone:", fullPhone);

      /* ================= OPT-IN / OPT-OUT ================= */

      if (actionText === "Yes, Send Updates") {
        // CAR
        await prisma.client.updateMany({
          where: { phone: last10 },
          data: {
            whatsappOptin: true,
            whatsappOptinAt: now,
            whatsappOptinSource: "whatsapp_button",
          },
        });

        // BIKE
        await prisma.bike.updateMany({
          where: { phone: last10 },
          data: {
            whatsappOptin: true,
            whatsappOptinAt: now,
            whatsappOptinSource: "whatsapp_button",
          },
        });

        // ✅ STEP 1: WASH
        await prisma.washingClient.updateMany({
          where: { phone: last10 },
          data: {
            whatsappOptin: true,
            whatsappOptinAt: now,
            whatsappOptinSource: "whatsapp_button",
          },
        });

        console.log("✅ Opt-in updated for car, bike & wash");
        return res.sendStatus(200);
      }

      if (actionText === "No, Thanks") {
        await prisma.client.updateMany({
          where: { phone: last10 },
          data: { whatsappOptin: false },
        });

        await prisma.bike.updateMany({
          where: { phone: last10 },
          data: { whatsappOptin: false },
        });

        // ✅ STEP 1: WASH
        await prisma.washingClient.updateMany({
          where: { phone: last10 },
          data: { whatsappOptin: false },
        });

        console.log("❌ Opt-out updated for car, bike & wash");
        return res.sendStatus(200);
      }

      /* ================= REVIEW RATING ================= */

      const ratingMap = {
        "1 - 2 Poor": 2,
        "3 Average": 3,
        "4 - 5 Excellent": 5,
      };

      if (ratingMap[actionText]) {
        const rating = ratingMap[actionText];

        // CAR REVIEW
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
                reviewRating: rating,
                reviewSource: "whatsapp",
              },
            });

            console.log("⭐ Car review saved:", carService.id);
            return res.sendStatus(200);
          }
        }

        // BIKE REVIEW
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
                reviewRating: rating,
                reviewSource: "whatsapp",
              },
            });

            console.log("⭐ Bike review saved:", bikeService.id);
            return res.sendStatus(200);
          }
        }

        // ✅ STEP 2: WASH REVIEW
        const washClient = await prisma.washingClient.findFirst({
          where: { phone: last10 },
        });

        if (washClient) {
          const washService = await prisma.washingService.findFirst({
            where: {
              clientId: washClient.id,
              reviewSentAt: { not: null },
              reviewRating: null,
            },
            orderBy: { reviewSentAt: "desc" },
          });

          if (washService) {
            await prisma.washingService.update({
              where: { id: washService.id },
              data: {
                reviewRating: rating,
                reviewSource: "whatsapp",
              },
            });

            console.log("⭐ Wash review saved:", washService.id);
            return res.sendStatus(200);
          }
        }

        return res.sendStatus(200);
      }

      /* ================= APPROVE / REJECT ================= */

      // Fetch both sessions
      const carSession = await prisma.whatsAppSession.findFirst({
        where: {
          OR: [{ phone: fullPhone }, { phone: last10 }],
        },
      });

      const bikeSession = await prisma.bikeWhatsAppSession.findFirst({
        where: {
          OR: [{ phone: fullPhone }, { phone: last10 }],
        },
      });

      // ✅ STEP 3: Fetch Wash Session
      const washSession = await prisma.washWhatsAppSession.findFirst({
        where: {
          OR: [{ phone: fullPhone }, { phone: last10 }],
        },
      });

      // Filter only valid (not expired)
      const validCar =
        carSession && carSession.expiresAt && carSession.expiresAt > now
          ? carSession
          : null;

      const validBike =
        bikeSession && bikeSession.expiresAt && bikeSession.expiresAt > now
          ? bikeSession
          : null;

      // ✅ STEP 4: Validate Wash Session
      const validWash =
        washSession && washSession.expiresAt && washSession.expiresAt > now
          ? washSession
          : null;

      // ✅ STEP 5: Update Active Session Logic
      let activeType = null;

      const sessions = [
        validCar && { type: "car", expiresAt: validCar.expiresAt },
        validBike && { type: "bike", expiresAt: validBike.expiresAt },
        validWash && { type: "wash", expiresAt: validWash.expiresAt },
      ].filter(Boolean);

      if (sessions.length > 0) {
        sessions.sort((a, b) => b.expiresAt - a.expiresAt);
        activeType = sessions[0].type;
      }

      if (!activeType) {
        console.log("❌ No valid session found");
        return res.sendStatus(200);
      }

      /* ---------- HANDLE BIKE ---------- */
      if (activeType === "bike") {
        if (actionText === "Approve Service") {
          await prisma.bikeService.update({
            where: { id: validBike.bikeServiceId },
            data: {
              approvalStatus: "APPROVED",
              approvalSource: "whatsapp",
              approvalAt: now,
            },
          });

          console.log("✅ Bike service approved:", validBike.bikeServiceId);
        }

        if (actionText === "Reject / Contact Garage") {
          await prisma.bikeService.update({
            where: { id: validBike.bikeServiceId },
            data: {
              approvalStatus: "REJECTED",
              approvalSource: "whatsapp",
              approvalAt: now,
            },
          });

          console.log("❌ Bike service rejected:", validBike.bikeServiceId);
        }

        return res.sendStatus(200);
      }

      // ✅ STEP 6: Add Washing Approval Handling
      /* ---------- HANDLE WASH ---------- */
      if (activeType === "wash") {
        if (actionText === "Approve Service") {
          await prisma.washingService.update({
            where: { id: validWash.washingServiceId },
            data: {
              approvalStatus: "APPROVED",
              approvalSource: "whatsapp",
              approvalAt: now,
            },
          });

          console.log("✅ Wash service approved:", validWash.washingServiceId);
        }

        if (actionText === "Reject / Contact Garage") {
          await prisma.washingService.update({
            where: { id: validWash.washingServiceId },
            data: {
              approvalStatus: "REJECTED",
              approvalSource: "whatsapp",
              approvalAt: now,
            },
          });

          console.log("❌ Wash service rejected:", validWash.washingServiceId);
        }

        return res.sendStatus(200);
      }

      /* ---------- HANDLE CAR ---------- */
      if (activeType === "car") {
        if (actionText === "Approve Service") {
          await prisma.service.update({
            where: { id: validCar.serviceId },
            data: {
              approvalStatus: "APPROVED",
              approvalSource: "whatsapp",
              approvalAt: now,
            },
          });

          console.log("✅ Car service approved:", validCar.serviceId);
        }

        if (actionText === "Reject / Contact Garage") {
          await prisma.service.update({
            where: { id: validCar.serviceId },
            data: {
              approvalStatus: "REJECTED",
              approvalSource: "whatsapp",
              approvalAt: now,
            },
          });

          console.log("❌ Car service rejected:", validCar.serviceId);
        }

        return res.sendStatus(200);
      }

      return res.sendStatus(200);
    }

    /* ========================================================
       HANDLE TEXT (STOP + EXTEND SESSION)
    ======================================================== */
    if (message.type === "text") {
      const text = message.text?.body?.trim().toLowerCase();

      if (text === "stop") {
        await prisma.client.updateMany({
          where: { phone: last10 },
          data: { whatsappOptin: false },
        });

        await prisma.bike.updateMany({
          where: { phone: last10 },
          data: { whatsappOptin: false },
        });

        // ✅ STEP 7: Extend STOP Handling
        await prisma.washingClient.updateMany({
          where: { phone: last10 },
          data: { whatsappOptin: false },
        });

        console.log("❌ STOP opt-out updated for car, bike & wash");
        return res.sendStatus(200);
      }

      // Extend CAR session
      await prisma.whatsAppSession.updateMany({
        where: {
          OR: [{ phone: fullPhone }, { phone: last10 }],
        },
        data: {
          expiresAt: new Date(now.getTime() + 24 * 60 * 60 * 1000),
        },
      });

      // Extend BIKE session
      await prisma.bikeWhatsAppSession.updateMany({
        where: {
          OR: [{ phone: fullPhone }, { phone: last10 }],
        },
        data: {
          expiresAt: new Date(now.getTime() + 24 * 60 * 60 * 1000),
        },
      });

      // ✅ STEP 8: Extend Session Extension Logic
      // Extend WASH session
      await prisma.washWhatsAppSession.updateMany({
        where: {
          OR: [{ phone: fullPhone }, { phone: last10 }],
        },
        data: {
          expiresAt: new Date(now.getTime() + 24 * 60 * 60 * 1000),
        },
      });

      return res.sendStatus(200);
    }

    return res.sendStatus(200);
  } catch (err) {
    console.error("WhatsApp webhook error:", err);
    return res.sendStatus(200);
  }
};
