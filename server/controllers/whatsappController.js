import prisma from "../models/prismaClient.js";
import {
  sendTestMessage,
  sendServiceApprovalTemplate,
  sendServiceApprovalButtons,
} from "../services/whatsappService.js";

/* ============================================================
   SEND SERVICE APPROVAL ON WHATSAPP
   Flow:
   1️⃣ Send utility template (opens 24h window)
   2️⃣ Send interactive approval buttons
============================================================ */
export const sendServiceApprovalWhatsApp = async (req, res) => {
  try {
    const serviceId = Number(req.params.id);

    if (!serviceId) {
      return res.status(400).json({ message: "Invalid service ID" });
    }

    const service = await prisma.service.findFirst({
      where: {
        id: serviceId,
        client: { userId: req.user.id },
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

    /* ======================================================
       Normalize phone number (E.164 – India)
    ====================================================== */
    const rawPhone = service.client.phone.replace(/\D/g, "");
    const to = rawPhone.startsWith("91") ? rawPhone : `91${rawPhone}`;

    /* ======================================================
       STEP 1️⃣ Send approved utility template
       (Mandatory to open 24h window)
    ====================================================== */
    await sendServiceApprovalTemplate({ to });

    /* ======================================================
       STEP 2️⃣ Send interactive approval buttons
    ====================================================== */
    await sendServiceApprovalButtons({ to, service });

    /* ======================================================
       Update approval state in DB
    ====================================================== */
    await prisma.service.update({
      where: { id: service.id },
      data: {
        approvalStatus: "PENDING",
        approvalSource: "whatsapp",
      },
    });

    return res.json({
      message: "WhatsApp approval request sent successfully",
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
