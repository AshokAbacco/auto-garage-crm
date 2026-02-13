//whatsappController.js
import prisma from "../models/prismaClient.js";
import {
  sendWhatsAppTemplate,
  sendWhatsAppImage,
  sendWhatsAppDocument,
} from "../services/whatsappService.js";
import { generateProformaPDF } from "../services/proformaService.js";
import { generateFinalInvoicePDF } from "../services/finalInvoiceService.js";

/* ----------------------------------------
   OWNER SAFE (USER / STAFF)
---------------------------------------- */
function getOwnerUserId(req) {
  return req.user.type === "staff" ? req.user.ownerId : req.user.id;
}

export const sendServiceApprovalWhatsApp = async (req, res) => {
  try {
    const serviceId = Number(req.params.id);
    if (!serviceId) {
      return res.status(400).json({ message: "Invalid service ID" });
    }

    /* =====================================================
       PHONE NORMALIZER (FIXED LOGIC)
    ===================================================== */
    const normalizePhone = (phone) => {
      const digits = String(phone).replace(/\D/g, "");

      // If stored as 10 digit Indian number
      if (digits.length === 10) {
        return `91${digits}`;
      }

      // If already in 12 digit E.164 format
      if (digits.length === 12 && digits.startsWith("91")) {
        return digits;
      }

      throw new Error(`Invalid phone format: ${phone}`);
    };

    /* --------------------------------------------------------
       FETCH SERVICE
    -------------------------------------------------------- */
    const service = await prisma.service.findFirst({
      where: {
        id: serviceId,
        client: { userId: getOwnerUserId(req) },
      },
      include: {
        client: true,
        mediaFiles: true,
      },
    });

    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    if (!service.client?.phone) {
      return res.status(400).json({ message: "Client phone number missing" });
    }

    const owner = await prisma.user.findUnique({
      where: { id: getOwnerUserId(req) },
      select: { companyName: true },
    });

    /* =====================================================
       NORMALIZED PHONE (FIX APPLIED HERE)
    ===================================================== */
    const to = normalizePhone(service.client.phone);

    console.log("📲 Normalized phone:", to);

    /* =====================================================
       1️⃣ TEMPLATE (OPEN SESSION)
    ===================================================== */
    await sendWhatsAppTemplate({
      to,
      templateName: "service_estimate_approvel",
      languageCode: "en",
      variables: [
        service.client.fullName,
        owner?.companyName || "Our Garage",
        service.client.regNumber,
        String(service.cost ?? 0),
      ],
    });

    /* =====================================================
       2️⃣ SEND IMAGES
    ===================================================== */
    for (const media of service.mediaFiles || []) {
      if (!media.mediaUrl) continue;

      await sendWhatsAppImage({
        to,
        imageUrl: media.mediaUrl,
        caption: "Service inspection image",
      });
    }

    /* =====================================================
       3️⃣ PROFORMA PDF
    ===================================================== */
    let pdfUrl = null;

    try {
      pdfUrl = await generateProformaPDF(service.id);
    } catch (err) {
      console.error("❌ Proforma generation failed:", err);
    }

    if (pdfUrl) {
      await sendWhatsAppDocument({
        to,
        documentUrl: pdfUrl,
        filename: `Proforma-Invoice-${service.id}.pdf`,
      });
    }

    /* =====================================================
       4️⃣ LOG MESSAGE (ALWAYS STORES 12 DIGIT FORMAT NOW)
    ===================================================== */
    await prisma.whatsAppMessage.create({
      data: {
        phone: to,
        userId: getOwnerUserId(req),
        serviceId: service.id,
        template: "service_estimate_confirmation",
        status: "sent",
      },
    });

    /* =====================================================
       5️⃣ SESSION (ALWAYS 12 DIGIT FORMAT)
    ===================================================== */
    await prisma.whatsAppSession.upsert({
      where: { phone: to },
      update: {
        serviceId: service.id,
        userId: getOwnerUserId(req),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
      create: {
        phone: to,
        serviceId: service.id,
        userId: getOwnerUserId(req),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });

    /* =====================================================
       6️⃣ UPDATE SERVICE STATUS
    ===================================================== */
    await prisma.service.update({
      where: { id: service.id },
      data: {
        approvalStatus: "PENDING",
        approvalSource: "whatsapp",
      },
    });

    return res.json({
      message: "WhatsApp approval sent successfully",
    });
  } catch (error) {
    console.error("❌ sendServiceApprovalWhatsApp error:", error);
    return res.status(500).json({
      message: "Failed to send WhatsApp approval request",
    });
  }
};

// server/controllers/whatsappController.js

export const sendServiceNotification = async (req, res) => {
  try {
    const serviceId = Number(req.params.id);
    const { type } = req.body; // e.g., "ESTIMATE", "READY", "INVOICE"

    if (!serviceId)
      return res.status(400).json({ message: "Invalid service ID" });

    const service = await prisma.service.findFirst({
      where: { id: serviceId, client: { userId: getOwnerUserId(req) } },
      include: { client: true, mediaFiles: true },
    });

    if (!service || !service.client?.phone) {
      return res
        .status(404)
        .json({ message: "Service or Client Phone not found" });
    }

    const owner = await prisma.user.findUnique({
      where: { id: getOwnerUserId(req) },
      select: { companyName: true },
    });

    const to = service.client.phone.replace(/\D/g, "").startsWith("91")
      ? service.client.phone.replace(/\D/g, "")
      : `91${service.client.phone.replace(/\D/g, "")}`;

    let templateName = "";
    let variables = [];

    // Switch logic to support your active Meta templates
    switch (type) {
      case "READY":
        templateName = "vehicle_ready";
        variables = [service.client.fullName, service.client.regNumber];
        break;
      case "INVOICE":
        templateName = "final_invoice_summary";
        variables = [service.client.fullName, String(service.cost ?? 0)];
        break;
      case "ESTIMATE":
      default:
        templateName = "service_estimate_confirmation";
        variables = [
          service.client.fullName,
          owner?.companyName || "Garage",
          service.client.regNumber,
          String(service.cost ?? 0),
        ];
        break;
    }

    /* 1️⃣ SEND TEMPLATE */
    await sendWhatsAppTemplate({
      to,
      templateName,
      languageCode: "en",
      variables,
    });

    /* 2️⃣ CONDITIONAL MEDIA (Only for Estimates or Invoices) */
    if (type === "ESTIMATE" || type === "INVOICE") {
      // Send Images
      for (const media of service.mediaFiles || []) {
        if (media.mediaUrl) {
          await sendWhatsAppImage({
            to,
            imageUrl: media.mediaUrl,
            caption: "Service Detail Image",
          });
        }
      }
      // Send PDF
      const pdfUrl = await generateProformaPDF(service.id).catch(() => null);
      if (pdfUrl) {
        await sendWhatsAppDocument({
          to,
          documentUrl: pdfUrl,
          filename: `${type}-Invoice-${service.id}.pdf`,
        });
      }
    }

    /* 3️⃣ SESSION & STATUS UPDATE */
    await prisma.whatsAppSession.upsert({
      where: { phone: to },
      update: {
        serviceId: service.id,
        userId: getOwnerUserId(req),
        expiresAt: new Date(Date.now() + 86400000),
      },
      create: {
        phone: to,
        serviceId: service.id,
        userId: getOwnerUserId(req),
        expiresAt: new Date(Date.now() + 86400000),
      },
    });

    await prisma.service.update({
      where: { id: service.id },
      data: { approvalStatus: "PENDING", approvalTemplate: templateName },
    });

    return res.json({ message: `WhatsApp ${type} sent successfully` });
  } catch (error) {
    console.error("❌ WhatsApp Error:", error);
    return res.status(500).json({ message: "Failed to send notification" });
  }
};

export const sendVehicleReadyWhatsApp = async (req, res) => {
  try {
    const serviceId = Number(req.params.id);
    const ownerId = req.user.type === "staff" ? req.user.ownerId : req.user.id;

    const service = await prisma.service.findFirst({
      where: { id: serviceId, client: { userId: ownerId } },
      include: { client: true },
    });

    if (!service || !service.client?.phone) {
      return res
        .status(404)
        .json({ message: "Service or Client phone not found" });
    }

    const owner = await prisma.user.findUnique({
      where: { id: ownerId },
      select: { companyName: true },
    });

    const rawPhone = service.client.phone.replace(/\D/g, "");
    const to = rawPhone.startsWith("91") ? rawPhone : `91${rawPhone}`;

    // STOPSHIP: Meta dashboard shows 'English', which is usually code 'en'
    // Also requires EXACTLY 3 variables: {{1}}, {{2}}, {{3}}
    await sendWhatsAppTemplate({
      to,
      templateName: "vehicle_ready",
      languageCode: "en", // Match your Meta Dashboard
      variables: [
        service.client.fullName, // {{1}}
        service.client.regNumber, // {{2}}
        owner?.companyName || "Our Garage", // {{3}}
      ],
    });

    const updatedService = await prisma.service.update({
      where: { id: service.id },
      data: {
        approvalStatus: "READY_SENT",
        status: "Paid",
        approvalAt: new Date(),
      },
    });

    console.log("✅ DB Updated Successfully:", updatedService.id);

    return res.json({ message: "Vehicle Ready notification sent!" });
  } catch (error) {
    // IMPORTANT: If you don't log this, you won't see the 500 error details!
    console.error("❌ WHATSAPP ERROR:", error.response?.data || error.message);
    return res
      .status(500)
      .json({ error: "Server Error", details: error.message });
  }
};

export const sendFinalInvoiceWhatsApp = async (invoiceId, ownerUserId) => {
  try {
    /* ================================
       1️⃣ FETCH INVOICE
    ================================= */
    const invoice = await prisma.invoice.findFirst({
      where: {
        id: Number(invoiceId),
        ownerUserId,
      },
      include: {
        client: true,
        ownerUser: true,
        invoiceCostItems: true,
      },
    });

    if (!invoice || !invoice.client?.phone) {
      throw new Error("Invoice or client phone not found");
    }

    const rawPhone = invoice.client.phone.replace(/\D/g, "");
    const to = rawPhone.startsWith("91") ? rawPhone : `91${rawPhone}`;

    /* ================================
       2️⃣ SEND TEMPLATE FIRST
    ================================= */
    const messageId = await sendWhatsAppTemplate({
      to,
      templateName: "final_invoice_summary",
      languageCode: "en", // Must match Meta dashboard
      variables: [
        invoice.ownerUser?.companyName || "Motor Desk",
        invoice.client.regNumber,
        String(invoice.grandTotal),
      ],
    });

    console.log("✅ Final invoice template sent");

    /* ================================
       3️⃣ GENERATE FINAL INVOICE PDF
    ================================= */
    let pdfUrl = null;

    try {
      pdfUrl = await generateFinalInvoicePDF(invoice.id);
      console.log("📄 Final Invoice PDF URL:", pdfUrl);
    } catch (err) {
      console.error("❌ Final invoice PDF generation failed:", err.message);
    }

    /* ================================
       4️⃣ SEND DOCUMENT
    ================================= */
    if (pdfUrl) {
      try {
        await sendWhatsAppDocument({
          to,
          documentUrl: pdfUrl,
          filename: `Invoice-${invoice.invoiceNumber}.pdf`,
        });

        console.log("✅ Final invoice PDF sent");
      } catch (err) {
        console.error(
          "❌ Document send error:",
          err.response?.data || err.message,
        );
        throw err;
      }
    } else {
      console.log("⚠ No PDF URL generated");
    }

    /* ================================
       5️⃣ LOG MESSAGE (NO invoiceId FIELD)
    ================================= */
    await prisma.whatsAppMessage.create({
      data: {
        phone: to,
        userId: ownerUserId,
        serviceId: null, // Invoice not linked in schema
        template: "final_invoice_summary",
        messageId: messageId || null,
        status: "sent",
      },
    });

    console.log("📝 WhatsApp message logged");
  } catch (error) {
    console.error("❌ sendFinalInvoiceWhatsApp ERROR:", error.message);
    throw error;
  }
};
