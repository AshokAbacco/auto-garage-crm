import prisma from "../models/prismaClient.js";

export const handleWhatsAppWebhook = async (req, res) => {
  try {
    const entry = req.body.entry?.[0];
    const change = entry?.changes?.[0];
    const value = change?.value;
    const message = value?.messages?.[0];

    if (!message || message.type !== "button") {
      return res.sendStatus(200);
    }

    const payload = message.button.payload;
    // Example: SERVICE_APPROVE_2

    const [_, action, serviceId] = payload.split("_");

    if (!serviceId) return res.sendStatus(200);

    if (action === "APPROVE") {
      await prisma.service.update({
        where: { id: Number(serviceId) },
        data: {
          approvalStatus: "APPROVED",
          approvalSource: "whatsapp",
          approvalAt: new Date(),
        },
      });
    }

    if (action === "REJECT") {
      await prisma.service.update({
        where: { id: Number(serviceId) },
        data: {
          approvalStatus: "REJECTED",
          approvalSource: "whatsapp",
          approvalAt: new Date(),
        },
      });
    }

    if (action === "CONDITION") {
      await prisma.service.update({
        where: { id: Number(serviceId) },
        data: {
          approvalStatus: "CONDITION_REQUESTED",
          approvalSource: "whatsapp",
          approvalAt: new Date(),
        },
      });

      // Ask for condition text
      const phone = message.from;
      // You can now send a follow-up asking:
      // "Please type your conditions for approval."
    }

    return res.sendStatus(200);
  } catch (err) {
    console.error("WhatsApp webhook error:", err);
    return res.sendStatus(200);
  }
};
