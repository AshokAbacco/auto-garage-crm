// whatsappWebhookController.js
import prisma from "../models/prismaClient.js";

export const handleWhatsAppWebhook = async (req, res) => {
  try {
    const entry = req.body.entry?.[0];
    const change = entry?.changes?.[0];
    const value = change?.value;
    const message = value?.messages?.[0];

    // Always acknowledge webhook
    if (!message) {
      return res.sendStatus(200);
    }

    /* --------------------------------------------------------
       Handle BUTTON REPLIES (Approve / Reject)
    -------------------------------------------------------- */
    if (message.type === "button") {
      const phone = message.from; // E.164 without +
      const actionText = message.button?.text;

      if (!phone || !actionText) {
        return res.sendStatus(200);
      }

      /* ----------------------------------------------------
         Resolve active WhatsApp session by phone
      ---------------------------------------------------- */
      const session = await prisma.whatsAppSession.findUnique({
        where: { phone },
      });

      // No session or session expired → ignore safely
      if (!session || session.expiresAt < new Date()) {
        return res.sendStatus(200);
      }

      /* ----------------------------------------------------
         Handle APPROVE
      ---------------------------------------------------- */
      if (actionText === "Approve Service") {
        await prisma.service.update({
          where: { id: session.serviceId },
          data: {
            approvalStatus: "APPROVED",
            approvalSource: "whatsapp",
            approvalAt: new Date(),
          },
        });
      }

      /* ----------------------------------------------------
         Handle REJECT
      ---------------------------------------------------- */
      if (actionText === "Reject / Contact Garage") {
        await prisma.service.update({
          where: { id: session.serviceId },
          data: {
            approvalStatus: "REJECTED",
            approvalSource: "whatsapp",
            approvalAt: new Date(),
          },
        });
      }

      return res.sendStatus(200);
    }

    /* --------------------------------------------------------
       Handle USER TEXT MESSAGE (opens / refreshes session)
       This allows staff to send images within 24h
    -------------------------------------------------------- */
    if (message.type === "text") {
      const phone = message.from;

      if (!phone) {
        return res.sendStatus(200);
      }

      // Extend session if exists
      const existingSession = await prisma.whatsAppSession.findUnique({
        where: { phone },
      });

      if (existingSession) {
        await prisma.whatsAppSession.update({
          where: { phone },
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
