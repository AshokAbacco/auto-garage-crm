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
       HANDLE ALL BUTTON CLICKS (OPT-IN + APPROVE/REJECT)
    ======================================================== */
    if (message.type === "button") {
      const phone = message.from; // 917204986825
      const actionText = message.button?.text;

      console.log("Button clicked:", actionText);
      console.log("From phone:", phone);

      if (!phone || !actionText) {
        return res.sendStatus(200);
      }

      const last10 = phone.slice(-10); // 7204986825

      /* ================= OPT-IN ================= */
      if (actionText === "Yes, Send Updates") {
        const result = await prisma.client.updateMany({
          where: {
            phone: last10, // exact match with DB
          },
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
          where: {
            phone: last10,
          },
          data: {
            whatsappOptin: false,
          },
        });

        console.log("Opt-out updated rows:", result.count);
        return res.sendStatus(200);
      }

      /* ================= APPROVE / REJECT ================= */

      const session = await prisma.whatsAppSession.findUnique({
        where: { phone },
      });

      if (!session || session.expiresAt < new Date()) {
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
      }

      return res.sendStatus(200);
    }

    /* ========================================================
       HANDLE TEXT (STOP)
    ======================================================== */
    if (message.type === "text") {
      const phone = message.from;
      const text = message.text?.body?.trim().toLowerCase();

      console.log("Text received:", text);

      if (!phone) {
        return res.sendStatus(200);
      }

      const last10 = phone.slice(-10);

      if (text === "stop") {
        const result = await prisma.client.updateMany({
          where: {
            phone: last10,
          },
          data: {
            whatsappOptin: false,
          },
        });

        console.log("STOP updated rows:", result.count);
        return res.sendStatus(200);
      }

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
