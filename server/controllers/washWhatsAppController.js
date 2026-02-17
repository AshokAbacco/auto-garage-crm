import prisma from "../models/prismaClient.js";
import {
  sendWhatsAppTemplate,
  sendWhatsAppImage,
  sendWhatsAppDocument,
} from "../services/whatsappService.js";

// ✅ You must create these like bike versions
import { generateWashProformaPDF } from "../services/washProformaService.js";
import { generateWashFinalInvoicePDF } from "../services/washFinalInvoiceService.js";
import { uploadWashServiceImagesToR2 } from "../services/washImageUploadService.js";

/* =========================================================
   OWNER SAFE (USER / STAFF)
========================================================= */
function getOwnerUserId(req) {
  return req.user.type === "staff" ? req.user.ownerId : req.user.id;
}

/* =========================================================
   PHONE NORMALIZER (INDIA SAFE)
========================================================= */
function normalizePhone(phone) {
  const digits = String(phone).replace(/\D/g, "");

  if (digits.length === 10) return `91${digits}`;
  if (digits.length === 12 && digits.startsWith("91")) return digits;

  throw new Error(`Invalid phone format: ${phone}`);
}

/* =========================================================
   SEND WASH SERVICE APPROVAL
========================================================= */
export const sendWashServiceApprovalWhatsApp = async (req, res) => {
  try {
    const serviceId = Number(req.params.id);
    const ownerId = getOwnerUserId(req);

    if (!serviceId) {
      return res.status(400).json({ message: "Invalid service ID" });
    }

    const service = await prisma.washingService.findFirst({
      where: { id: serviceId, client: { userId: ownerId } },
      include: { client: true, media: true },
    });

    if (!service || !service.client?.phone) {
      return res.status(404).json({ message: "Service not found" });
    }

    const owner = await prisma.user.findUnique({
      where: { id: ownerId },
      select: { companyName: true },
    });

    const to = normalizePhone(service.client.phone);

    /* 1️⃣ TEMPLATE */
    await sendWhatsAppTemplate({
      to,
      templateName: "service_estimate_approvel",
      languageCode: "en",
      variables: [
        service.client.fullName,
        owner?.companyName || "Wash Center",
        service.client.regNumber || "Vehicle",
        String(service.estimatedTotal ?? 0),
      ],
    });

    /* 2️⃣ UPLOAD IMAGES TO R2 */
    await uploadWashServiceImagesToR2(service.id);

    const updatedService = await prisma.washingService.findUnique({
      where: { id: service.id },
      include: { media: true },
    });

    /* 3️⃣ SEND IMAGES */
    for (const media of updatedService.media || []) {
      if (media.url) {
        await sendWhatsAppImage({
          to,
          imageUrl: media.url,
          caption: "Wash inspection image",
        });
      }
    }

    /* 4️⃣ GENERATE & SEND PROFORMA */
    let pdfUrl = null;

    try {
      pdfUrl = await generateWashProformaPDF(service.id);
    } catch (err) {
      console.error("❌ Wash proforma error:", err.message);
    }

    if (pdfUrl) {
      await sendWhatsAppDocument({
        to,
        documentUrl: pdfUrl,
        filename: `Wash-Proforma-${service.id}.pdf`,
      });
    }

    /* 5️⃣ LOG MESSAGE */
    await prisma.washWhatsAppMessage.create({
      data: {
        phone: to,
        userId: ownerId,
        washingServiceId: service.id,
        template: "service_estimate_approvel",
        status: "sent",
      },
    });

    /* 6️⃣ UPDATE SESSION */
    await prisma.washWhatsAppSession.upsert({
      where: { phone: to },
      update: {
        washingServiceId: service.id,
        userId: ownerId,
        expiresAt: new Date(Date.now() + 86400000),
      },
      create: {
        phone: to,
        washingServiceId: service.id,
        userId: ownerId,
        expiresAt: new Date(Date.now() + 86400000),
      },
    });

    /* 7️⃣ UPDATE SERVICE STATUS */
    await prisma.washingService.update({
      where: { id: service.id },
      data: {
        approvalStatus: "PENDING",
        approvalSource: "whatsapp",
      },
    });

    return res.json({ message: "Wash approval sent successfully" });
  } catch (error) {
    console.error("❌ Wash Approval Error:", error);
    return res.status(500).json({ message: "WhatsApp send failed" });
  }
};

/* =========================================================
   WASH SERVICE NOTIFICATION
========================================================= */
export const sendWashServiceNotification = async (req, res) => {
  try {
    const serviceId = Number(req.params.id);
    const { type } = req.body;
    const ownerId = getOwnerUserId(req);

    if (!serviceId)
      return res.status(400).json({ message: "Invalid service ID" });

    const service = await prisma.washingService.findFirst({
      where: { id: serviceId, client: { userId: ownerId } },
      include: { client: true },
    });

    if (!service || !service.client?.phone)
      return res.status(404).json({ message: "Service not found" });

    const owner = await prisma.user.findUnique({
      where: { id: ownerId },
      select: { companyName: true },
    });

    const to = normalizePhone(service.client.phone);

    let templateName = "";
    let variables = [];

    switch (type) {
      case "READY":
        templateName = "vehicle_ready";
        variables = [
          service.client.fullName,
          service.client.regNumber || "Vehicle",
          owner?.companyName || "Wash Center",
        ];
        break;

      case "INVOICE":
        templateName = "final_invoice_summary";
        variables = [
          owner?.companyName || "Wash Center",
          service.client.regNumber || "Vehicle",
          String(service.estimatedTotal ?? 0),
        ];
        break;

      case "ESTIMATE":
      default:
        templateName = "wash_service_estimate_confirmation";
        variables = [
          service.client.fullName,
          owner?.companyName || "Wash Center",
          service.client.regNumber || "Vehicle",
          String(service.estimatedTotal ?? 0),
        ];
        break;
    }

    await sendWhatsAppTemplate({
      to,
      templateName,
      languageCode: "en",
      variables,
    });

    await prisma.washWhatsAppMessage.create({
      data: {
        phone: to,
        userId: ownerId,
        washingServiceId: service.id,
        template: templateName,
        status: "sent",
      },
    });

    return res.json({ message: "Wash notification sent successfully" });
  } catch (error) {
    console.error("❌ Wash Notification Error:", error);
    return res.status(500).json({ message: "Failed to send notification" });
  }
};

/* =========================================================
   SEND WASH FINAL INVOICE WHATSAPP
   (Triggered after wash billing creation)
========================================================= */
export const sendWashFinalInvoiceWhatsApp = async (billingId, ownerUserId) => {
  try {
    /* ===============================
       FETCH BILLING + CLIENT
    =============================== */
    const billing = await prisma.washBilling.findUnique({
      where: { id: Number(billingId) },
      include: {
        washingClient: true,
      },
    });

    if (!billing) {
      console.log("❌ Wash billing not found");
      return;
    }

    const client = billing.washingClient;

    if (!client?.phone || !client.whatsappOptin) {
      console.log("ℹ️ WhatsApp skipped.");
      return;
    }

    /* ===============================
       OWNER INFO
    =============================== */
    const owner = await prisma.user.findUnique({
      where: { id: ownerUserId },
      select: { companyName: true },
    });

    /* ===============================
       FORMAT PHONE
    =============================== */
    let rawPhone = client.phone.replace(/\D/g, "");
    if (rawPhone.length === 10) rawPhone = `91${rawPhone}`;
    if (!rawPhone.startsWith("91")) rawPhone = `91${rawPhone}`;
    const to = rawPhone;

    /* ===============================
       SEND TEMPLATE FIRST
    =============================== */
    await sendWhatsAppTemplate({
      to,
      templateName: "final_invoice_summary",
      languageCode: "en",
      variables: [
        owner?.companyName || "Wash Station",
        client.regNumber || "N/A",
        String(billing.grandTotal),
      ],
    });

    console.log("✅ Wash template sent");

    /* ===============================
       GENERATE WASH PDF
    =============================== */
    let pdfUrl = null;

    try {
      pdfUrl = await generateWashFinalInvoicePDF(billing.id);
      console.log("📄 Wash Invoice PDF URL:", pdfUrl);
    } catch (err) {
      console.error("❌ Wash PDF generation failed:", err.message);
    }

    /* ===============================
       SEND DOCUMENT
    =============================== */
    if (pdfUrl) {
      await sendWhatsAppDocument({
        to,
        documentUrl: pdfUrl,
        filename: `Wash-Invoice-${billing.invoiceNumber}.pdf`,
      });

      console.log("✅ Wash invoice PDF sent");
    } else {
      console.log("⚠ No PDF URL generated");
    }
  } catch (error) {
    console.error(
      "❌ Failed to send wash final invoice WhatsApp:",
      error?.response?.data || error.message,
    );
  }
};

