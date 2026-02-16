import prisma from "../models/prismaClient.js";
import { getOwnerUserId } from "../utils/getAdminId.js";
import { sendWhatsAppTemplate } from "../services/whatsappService.js"; // ✅ Added Import

/* ===========================
   IMAGE SIZE LIMIT (5MB)
=========================== */
const MAX_BASE64_SIZE = 5 * 1024 * 1024;

function isBase64TooLarge(base64) {
  if (!base64) return false;
  const sizeInBytes = Math.ceil((base64.length * 3) / 4);
  return sizeInBytes > MAX_BASE64_SIZE;
}

/* ===========================
   WHATSAPP HELPER FUNCTION (Adapted for Bike)
=========================== */
const triggerBikeReceivedWhatsApp = async (bike, ownerUserId) => {
  try {
    const owner = await prisma.user.findUnique({
      where: { id: ownerUserId },
      select: { companyName: true },
    });

    if (!bike?.phone) {
      console.log("❌ WhatsApp skipped — phone missing");
      return;
    }

    // Normalize phone to E.164 (India example)
    let rawPhone = bike.phone.replace(/\D/g, "");

    if (rawPhone.length === 10) {
      rawPhone = `91${rawPhone}`;
    }

    if (!rawPhone.startsWith("91")) {
      rawPhone = `91${rawPhone}`;
    }

    const to = rawPhone;

    await sendWhatsAppTemplate({
      to,
      templateName: "vehicle_receive",
      languageCode: "en",
      variables: [
        bike.ownerName || "Customer", // ✅ Bike uses ownerName
        bike.regNumber || "N/A",
        owner?.companyName || "Motor Desk",
      ],
    });

    console.log(`✅ Opt-in template sent to ${to}`);
  } catch (error) {
    console.error(
      `❌ Failed to send WhatsApp template to ${bike?.phone}`,
      error?.response?.data || error.message,
    );
  }
};

/* ===========================
   CREATE BIKE
   POST /api/bikes
=========================== */
export const createBike = async (req, res) => {
  try {
    // 1. Separate the WhatsApp flag from the data
    const { sendWhatsApp, ...data } = req.body;

    const ownerUserId = getOwnerUserId(req.user);

    if (
      !data.fullName ||
      !data.phone ||
      !data.vehicleMake ||
      !data.vehicleModel ||
      !data.regNumber
    ) {
      return res.status(400).json({
        message:
          "Full Name, Phone, Vehicle Make, Vehicle Model, and Reg Number are required",
      });
    }

    // 🔁 Duplicate Reg check (OWNER SCOPE)
    const existingReg = await prisma.bike.findFirst({
      where: {
        regNumber: data.regNumber,
        ownerUserId,
      },
    });

    if (existingReg) {
      return res.status(400).json({
        message: "This vehicle is already registered",
      });
    }

    // 🖼 Image size validation
    if (
      isBase64TooLarge(data.carImage) ||
      isBase64TooLarge(data.adImage) ||
      (Array.isArray(data.damageImages) &&
        data.damageImages.some((img) => isBase64TooLarge(img)))
    ) {
      return res.status(400).json({
        message: "One or more images exceed the 5MB size limit",
      });
    }

    const bike = await prisma.bike.create({
      data: {
        ownerName: data.fullName,
        phone: data.phone,
        email: data.email || null,
        address: data.address || null,
        receiverName: data.receiverName || null,

        bikeBrand: data.vehicleMake,
        bikeModel: data.vehicleModel,
        bikeYear: data.vehicleYear ? Number(data.vehicleYear) : null,

        regNumber: data.regNumber,
        vin: data.vin || null,

        color: data.color || null,
        fuel: data.fuel || null,
        notes: data.notes || null,

        bikeImage: data.carImage || null,
        adImage: data.adImage || null,
        damageImages: data.damageImages || [],

        ownerUserId, // ✅ OWNER (USER)TEAM_MEMBER
        createdById: req.user.id, // ✅ CREATOR (USER / )
      },
    });

    // 2. TRIGGER WHATSAPP IF FLAG IS TRUE
    if (sendWhatsApp) {
      // We don't 'await' this to prevent slowing down the HTTP response
      triggerBikeReceivedWhatsApp(bike, ownerUserId).catch(console.error);
    }

    res.status(201).json(bike);
  } catch (err) {
    console.error("createBike error:", err);
    res.status(500).json({ message: "Bike creation failed" });
  }
};

/* ===========================
   GET ALL BIKES
   GET /api/bikes
=========================== */
export const getBikes = async (req, res) => {
  try {
    const ownerUserId = getOwnerUserId(req.user);

    const role = String(req.user.role).toLowerCase();

    const whereCondition = {
      ownerUserId: ownerUserId,
    };

    const bikes = await prisma.bike.findMany({
      where: whereCondition,
      orderBy: { createdAt: "desc" },
    });

    res.json(bikes);
  } catch (err) {
    console.error("getBikes error:", err);
    res.status(500).json({ message: "Failed to fetch bikes" });
  }
};

/* ===========================
   GET SINGLE BIKE
   GET /api/bikes/:id
=========================== */
export const getBikeById = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const ownerUserId = getOwnerUserId(req.user);
    const role = String(req.user.role).toLowerCase();

    const bike = await prisma.bike.findFirst({
      where: { id, ownerUserId },
    });

    if (!bike) {
      return res.status(404).json({ message: "Bike not found" });
    }

    res.json(bike);
  } catch (err) {
    console.error("getBikeById error:", err);
    res.status(500).json({ message: "Failed to fetch bike" });
  }
};

/* ===========================
   UPDATE BIKE
   PUT /api/bikes/:id
=========================== */
export const updateBike = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const ownerUserId = getOwnerUserId(req.user);
    const role = String(req.user.role).toLowerCase();

    // 1. Separate the WhatsApp flag from the update data
    const { sendWhatsApp, ...data } = req.body;

    // 2. Update using singular 'update' to get the object back (similar to clientController)
    // Note: Using { id, ownerUserId } in where clause ensures ownership security
    const bike = await prisma.bike.update({
      where: { id, ownerUserId },
      data: {
        ownerName: data.fullName,
        phone: data.phone,
        email: data.email || null,
        address: data.address || null,
        receiverName: data.receiverName || null,

        bikeBrand: data.vehicleMake,
        bikeModel: data.vehicleModel,
        bikeYear: data.vehicleYear ? Number(data.vehicleYear) : null,

        regNumber: data.regNumber,
        vin: data.vin || null,

        color: data.color || null,
        fuel: data.fuel || null,
        notes: data.notes || null,

        bikeImage: data.carImage || null,
        adImage: data.adImage || null,
        damageImages: data.damageImages || [],
      },
    });

    // 3. TRIGGER WHATSAPP IF FLAG IS TRUE
    if (sendWhatsApp) {
      triggerBikeReceivedWhatsApp(bike, ownerUserId).catch(console.error);
    }

    // Return the updated bike object
    res.json(bike);
  } catch (err) {
    console.error("updateBike error:", err);

    // Handle case where bike is not found or unauthorized (Prisma P2025 error)
    if (err.code === "P2025") {
      return res
        .status(403)
        .json({ message: "Unauthorized update attempt or Bike not found" });
    }

    res.status(500).json({ message: "Bike update failed" });
  }
};

/* ===========================
   DELETE BIKE
   DELETE /api/bikes/:id
=========================== */
export const deleteBike = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const ownerUserId = getOwnerUserId(req.user);
    const role = String(req.user.role).toLowerCase();

    // 🔒 Check if invoices exist
    const invoiceCount = await prisma.bikeInvoice.count({
      where: { bikeId: id },
    });

    if (invoiceCount > 0) {
      return res.status(400).json({
        message:
          "This bike has invoices. Please delete invoices first or keep the bike.",
      });
    }

    const result = await prisma.bike.deleteMany({
      where: { id, ownerUserId },
    });

    if (result.count === 0) {
      return res.status(403).json({
        message: "You are not authorized to delete this bike",
      });
    }

    res.json({ message: "Bike deleted successfully" });
  } catch (err) {
    console.error("deleteBike error:", err);
    res.status(500).json({ message: "Delete failed" });
  }
};
