//whatsappWebhookController.js
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
       PHONE NORMALIZER (12 DIGIT E.164 WITHOUT +)
    ======================================================== */
    const normalizePhone = (phone) => {
      const digits = String(phone).replace(/\D/g, "");

      if (digits.length === 10) {
        return `91${digits}`;
      }

      if (digits.length === 12 && digits.startsWith("91")) {
        return digits;
      }

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
      console.log("From phone (normalized):", fullPhone);

      if (!fullPhone || !actionText) {
        return res.sendStatus(200);
      }

      /* ================= OPT-IN ================= */
      if (actionText === "Yes, Send Updates") {
        const result = await prisma.client.updateMany({
          where: { phone: last10 },
          data: {
            whatsappOptin: true,
            whatsappOptinAt: new Date(),
            whatsappOptinSource: "whatsapp_button",
          },
        });

        console.log("Opt-in updated rows:", result.count);
        return res.sendStatus(200);
      }

      /* ================= OPT-OUT ================= */
      if (actionText === "No, Thanks") {
        const result = await prisma.client.updateMany({
          where: { phone: last10 },
          data: { whatsappOptin: false },
        });

        console.log("Opt-out updated rows:", result.count);
        return res.sendStatus(200);
      }

      /* ================= REVIEW RATING ================= */

      const ratingMap = {
        "1 - 2 Poor": 2,
        "3 Average": 3,
        "4 - 5 Excellent": 5,
      };

      if (ratingMap[actionText]) {
        const client = await prisma.client.findFirst({
          where: { phone: last10 },
        });

        if (!client) return res.sendStatus(200);

        const service = await prisma.service.findFirst({
          where: {
            clientId: client.id,
            reviewSentAt: { not: null },
            reviewRating: null,
          },
          orderBy: {
            reviewSentAt: "desc",
          },
        });

        if (!service) return res.sendStatus(200);

        await prisma.service.update({
          where: { id: service.id },
          data: {
            reviewRating: ratingMap[actionText],
            reviewSource: "whatsapp",
          },
        });

        console.log(
          `⭐ Review saved for service ${service.id}:`,
          ratingMap[actionText],
        );

        return res.sendStatus(200);
      }

      /* ================= APPROVE / REJECT ================= */

      const session = await prisma.whatsAppSession.findUnique({
        where: { phone: fullPhone },
      });

      if (!session) {
        console.log("❌ No session found for phone:", fullPhone);
        return res.sendStatus(200);
      }

      if (session.expiresAt < new Date()) {
        console.log("❌ Session expired for phone:", fullPhone);
        return res.sendStatus(200);
      }

      if (actionText === "Approve Service") {
        await prisma.service.update({
          where: { id: session.serviceId },
          data: {
            approvalStatus: "APPROVED",
            approvalSource: "whatsapp",
            approvalAt: new Date(),
          },
        });

        console.log("✅ Service approved:", session.serviceId);
      }

      if (actionText === "Reject / Contact Garage") {
        await prisma.service.update({
          where: { id: session.serviceId },
          data: {
            approvalStatus: "REJECTED",
            approvalSource: "whatsapp",
            approvalAt: new Date(),
          },
        });

        console.log("❌ Service rejected:", session.serviceId);
      }

      return res.sendStatus(200);
    }

    /* ========================================================
       HANDLE TEXT (STOP)
    ======================================================== */
    if (message.type === "text") {
      const text = message.text?.body?.trim().toLowerCase();

      console.log("Text received:", text);
      console.log("From phone (normalized):", fullPhone);

      if (!fullPhone) {
        return res.sendStatus(200);
      }

      if (text === "stop") {
        const result = await prisma.client.updateMany({
          where: { phone: last10 },
          data: { whatsappOptin: false },
        });

        console.log("STOP updated rows:", result.count);
        return res.sendStatus(200);
      }

      const existingSession = await prisma.whatsAppSession.findUnique({
        where: { phone: fullPhone },
      });

      if (existingSession) {
        await prisma.whatsAppSession.update({
          where: { phone: fullPhone },
          data: {
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
          },
        });

        console.log("🔄 Session extended for:", fullPhone);
      }

      return res.sendStatus(200);
    }

    return res.sendStatus(200);
  } catch (err) {
    console.error("WhatsApp webhook error:", err);
    return res.sendStatus(200);
  }
};
