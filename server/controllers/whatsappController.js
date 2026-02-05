// whatsappController.js
import prisma from "../models/prismaClient.js";
import {
  sendWhatsAppTemplate,
} from "../services/whatsappService.js";

/**
 * ============================================================
 * SEND SERVICE ESTIMATE APPROVAL ON WHATSAPP
 *
 * Template Used:
 * - service_estimate_confirmation
 *
 * Flow:
 * 1️⃣ Validate service + ownership
 * 2️⃣ Normalize phone number
 * 3️⃣ Send ONE interactive template (with buttons)
 * 4️⃣ Log WhatsApp message
 * 5️⃣ Create / update 24h WhatsApp session
 * 6️⃣ Mark service approval as PENDING
 * ============================================================
 */
export const sendServiceApprovalWhatsApp = async (req, res) => {
  try {
    const serviceId = Number(req.params.id);
    if (!serviceId) {
      return res.status(400).json({ message: "Invalid service ID" });
    }

    /* --------------------------------------------------------
       Fetch service with ownership check (multi-garage safe)
    -------------------------------------------------------- */
    const service = await prisma.service.findFirst({
      where: {
        id: serviceId,
        client: {
          userId: req.user.id, // garage owner
        },
      },
      include: {
        client: true,
      },
    });

    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    if (!service.client?.phone) {
      return res.status(400).json({ message: "Client phone number missing" });
    }

    /* --------------------------------------------------------
       Normalize phone number (E.164 – India)
       Example: +91XXXXXXXXXX → 91XXXXXXXXXX
    -------------------------------------------------------- */
    const rawPhone = service.client.phone.replace(/\D/g, "");
    const to = rawPhone.startsWith("91") ? rawPhone : `91${rawPhone}`;

    /* --------------------------------------------------------
       Send INTERACTIVE TEMPLATE (buttons included)
       Template: service_estimate_confirmation
    -------------------------------------------------------- */
const waResponse = await sendWhatsAppTemplate({
  to,
  templateName: "service_estimate_confirmation", // ✅ EXACT
  languageCode: "en_IN",                           // ✅ FIXED
  variables: [
    service.client.fullName,
    service.client.regNumber,
    service.cost?.toString() || "0",
  ],
});


    /* --------------------------------------------------------
       Log WhatsApp message (audit + debugging)
    -------------------------------------------------------- */
    await prisma.whatsAppMessage.create({
      data: {
        phone: to,
        userId: req.user.id,
        serviceId: service.id,
        template: "service_estimate_confirmation",
        messageId: waResponse?.messages?.[0]?.id || null,
        status: "sent",
      },
    });

    /* --------------------------------------------------------
       Create / Update WhatsApp 24h Session
       (Context resolution via phone number)
    -------------------------------------------------------- */
    await prisma.whatsAppSession.upsert({
      where: { phone: to },
      update: {
        serviceId: service.id,
        userId: req.user.id,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
      create: {
        phone: to,
        serviceId: service.id,
        userId: req.user.id,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });

    /* --------------------------------------------------------
       Update service approval state
    -------------------------------------------------------- */
    await prisma.service.update({
      where: { id: service.id },
      data: {
        approvalStatus: "PENDING",
        approvalSource: "whatsapp",
      },
    });

    return res.json({
      message: "WhatsApp service approval request sent successfully",
    });
  } catch (error) {
    console.error(
      "sendServiceApprovalWhatsApp error:",
      error.response?.data || error
    );

    return res.status(500).json({
      message: "Failed to send WhatsApp approval request",
    });
  }
};
