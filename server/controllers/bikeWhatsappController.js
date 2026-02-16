import prisma from "../models/prismaClient.js";
import {
  sendWhatsAppTemplate,
  sendWhatsAppImage,
  sendWhatsAppDocument,
} from "../services/whatsappService.js";

// ✅ USE BIKE PDF SERVICES
import { generateBikeProformaPDF } from "../services/bikeProformaService.js";
import { generateBikeFinalInvoicePDF } from "../services/bikeFinalInvoiceService.js";
import { uploadBikeServiceImagesToR2 } from "../services/bikeMediaUploadService.js";

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
   SEND BIKE SERVICE APPROVAL
========================================================= */
export const sendBikeServiceApprovalWhatsApp = async (req, res) => {
  try {
    const serviceId = Number(req.params.id);
    const ownerId = getOwnerUserId(req);

    if (!serviceId) {
      return res.status(400).json({ message: "Invalid service ID" });
    }

    // 🔹 Fetch service
    const service = await prisma.bikeService.findFirst({
      where: { id: serviceId, ownerUserId: ownerId },
      include: { client: true, serviceMedia: true },
    });

    if (!service || !service.client?.phone) {
      return res.status(404).json({ message: "Service not found" });
    }

    const owner = await prisma.user.findUnique({
      where: { id: ownerId },
      select: { companyName: true },
    });

    const to = normalizePhone(service.client.phone);

    /* =====================================================
       1️⃣ SEND TEMPLATE
    ===================================================== */
    await sendWhatsAppTemplate({
      to,
      templateName: "service_estimate_approvel",
      languageCode: "en",
      variables: [
        service.client.ownerName,
        owner?.companyName || "Our Garage",
        service.client.regNumber,
        String(service.grandTotal ?? 0),
      ],
    });

    /* =====================================================
       2️⃣ ENSURE IMAGES ARE IN R2
    ===================================================== */
    await uploadBikeServiceImagesToR2(service.id);

    // Reload service to get updated r2Url
    const updatedService = await prisma.bikeService.findUnique({
      where: { id: service.id },
      include: { serviceMedia: true },
    });

    /* =====================================================
       3️⃣ SEND IMAGES (FROM R2 URL)
    ===================================================== */
    for (const media of updatedService.serviceMedia || []) {
      if (media.r2Url) {
        await sendWhatsAppImage({
          to,
          imageUrl: media.r2Url,
          caption: "Service inspection image",
        });
      }
    }

    /* =====================================================
       4️⃣ GENERATE & SEND PROFORMA PDF
    ===================================================== */
    let pdfUrl = null;

    try {
      pdfUrl = await generateBikeProformaPDF(service.id);
    } catch (err) {
      console.error("❌ Proforma generation error:", err.message);
    }

    if (pdfUrl) {
      await sendWhatsAppDocument({
        to,
        documentUrl: pdfUrl,
        filename: `Bike-Proforma-${service.id}.pdf`,
      });
    }

    /* =====================================================
       5️⃣ LOG MESSAGE
    ===================================================== */
    await prisma.bikeWhatsAppMessage.create({
      data: {
        phone: to,
        userId: ownerId,
        bikeServiceId: service.id,
        template: "service_estimate_approvel",
        status: "sent",
      },
    });

    /* =====================================================
       6️⃣ UPDATE SESSION
    ===================================================== */
    await prisma.bikeWhatsAppSession.upsert({
      where: { phone: to },
      update: {
        bikeServiceId: service.id,
        userId: ownerId,
        expiresAt: new Date(Date.now() + 86400000),
      },
      create: {
        phone: to,
        bikeServiceId: service.id,
        userId: ownerId,
        expiresAt: new Date(Date.now() + 86400000),
      },
    });

    /* =====================================================
       7️⃣ UPDATE SERVICE STATUS
    ===================================================== */
    await prisma.bikeService.update({
      where: { id: service.id },
      data: {
        approvalStatus: "PENDING",
        approvalSource: "whatsapp",
      },
    });

    return res.json({ message: "Bike approval sent successfully" });
  } catch (error) {
    console.error("❌ Bike Approval Error:", error);
    return res.status(500).json({ message: "WhatsApp send failed" });
  }
};

/* =========================================================
   BIKE SERVICE NOTIFICATION
========================================================= */
export const sendBikeServiceNotification = async (req, res) => {
  try {
    const serviceId = Number(req.params.id);
    const { type } = req.body;
    const ownerId = getOwnerUserId(req);

    if (!serviceId)
      return res.status(400).json({ message: "Invalid service ID" });

    const service = await prisma.bikeService.findFirst({
      where: { id: serviceId, ownerUserId: ownerId },
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
          service.client.ownerName,
          service.client.regNumber,
          owner?.companyName || "Garage",
        ];
        break;

      case "INVOICE":
        templateName = "final_invoice_summary";
        variables = [
          owner?.companyName || "Garage",
          service.client.regNumber,
          String(service.grandTotal ?? 0),
        ];
        break;

      case "ESTIMATE":
      default:
        templateName = "bike_service_estimate_confirmation";
        variables = [
          service.client.ownerName,
          owner?.companyName || "Garage",
          service.client.regNumber,
          String(service.grandTotal ?? 0),
        ];
        break;
    }

    await sendWhatsAppTemplate({
      to,
      templateName,
      languageCode: "en",
      variables,
    });

    await prisma.bikeWhatsAppMessage.create({
      data: {
        phone: to,
        userId: ownerId,
        bikeServiceId: service.id,
        template: templateName,
        status: "sent",
      },
    });

    return res.json({ message: "Notification sent successfully" });
  } catch (error) {
    console.error("❌ Bike Notification Error:", error);
    return res.status(500).json({ message: "Failed to send notification" });
  }
};

/* =========================================================
   BIKE FINAL INVOICE WHATSAPP (PRODUCTION SAFE)
========================================================= */
export const sendBikeFinalInvoiceWhatsApp = async (invoiceId, ownerUserId) => {
  const numericId = Number(invoiceId);

  if (!numericId) {
    throw new Error("Invalid invoice ID");
  }

  const invoice = await prisma.bikeInvoice.findFirst({
    where: { id: numericId, ownerUserId },
    include: { bike: true, ownerUser: true },
  });

  if (!invoice) {
    throw new Error("Invoice not found");
  }

  if (!invoice.bike?.phone) {
    throw new Error("Customer phone not found");
  }

  const to = normalizePhone(invoice.bike.phone);

  console.log("📄 Generating Final Invoice PDF...");

  /* 1️⃣ Generate PDF (critical) */
  const pdfUrl = await generateBikeFinalInvoicePDF(invoice.id);

  if (!pdfUrl || !pdfUrl.startsWith("http")) {
    throw new Error("PDF generation failed");
  }

  console.log("✅ PDF Generated:", pdfUrl);

  /* 2️⃣ Send Template */
  let messageId = null;

  try {
    messageId = await sendWhatsAppTemplate({
      to,
      templateName: "final_invoice_summary",
      languageCode: "en",
      variables: [
        invoice.ownerUser?.companyName || "Garage",
        invoice.bike.regNumber,
        String(invoice.grandTotal),
      ],
    });

    console.log("✅ Template sent");
  } catch (err) {
    console.error("⚠️ Template send failed:", err.message);
  }

  /* 3️⃣ Send PDF */
  try {
    await sendWhatsAppDocument({
      to,
      documentUrl: pdfUrl,
      filename: `Invoice-${invoice.invoiceNumber}.pdf`,
    });

    console.log("✅ PDF sent via WhatsApp");
  } catch (err) {
    console.error("⚠️ PDF send failed:", err.message);
  }

  /* 4️⃣ Log Message (non-critical) */
  try {
    await prisma.bikeWhatsAppMessage.create({
      data: {
        phone: to,
        userId: ownerUserId,
        bikeInvoiceId: invoice.id,
        template: "final_invoice_summary",
        messageId: messageId,
        status: "sent",
      },
    });
  } catch (err) {
    console.error("⚠️ Logging failed:", err.message);
  }

  console.log("🎉 Final invoice process completed");
};

