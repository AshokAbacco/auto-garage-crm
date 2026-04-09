//cntroller/marketplace.controller.js
import * as marketplaceService from "../services/marketplace.service.js";
import * as bookingService from "../services/booking.service.js";
import { PrismaClient } from "@prisma/client";
import { uploadToR2 } from "../utils/r2Upload.js";
import * as dispatchService from "../services/dispatch.service.js";
import { notifyGarage } from "../services/socket.service.js";
const prisma = new PrismaClient();

// ==============================
// SERVICES
// ==============================
export const getServices = async (req, res) => {
  try {
    const { type } = req.query;
    const data = await marketplaceService.getServices(type);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ==============================
// GARAGES BY SERVICE
// ==============================
export const getGarages = async (req, res) => {
  try {
    // 🔥 IMPORTANT:
    // `id` here is externalServiceId (UUID from App DB)
    const { id: externalServiceId } = req.params;
    const { carType } = req.query;

    const data = await marketplaceService.getGaragesByService(
      externalServiceId,
      carType,
    );

    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ==============================
// CREATE BOOKING
// ==============================

export const createBooking = async (req, res) => {
  try {
    console.log("REQUEST BODY:", req.body);

    const { externalServiceId, garageId, clientId, scheduledAt, appPrice } = req.body;

    if (!externalServiceId || !garageId || !clientId || !scheduledAt) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const bookingData = {
      externalServiceId,
      garageId,
      clientId,
      scheduledAt,
      appPrice: appPrice ? Number(appPrice) : null,
      carType: req.body.carType || "SEDAN",
      serviceName: req.body.serviceName || null,
    };

    console.log("📦 bookingData:", bookingData);

    const booking = await marketplaceService.createBooking(bookingData);

    try { await notifyGarage(garageId, booking); } catch (e) { console.error("SOCKET ERROR:", e.message); }
    try { await dispatchService.startDispatch(booking.id); } catch (e) { console.error("DISPATCH ERROR:", e.message); }

    res.json({ success: true, data: booking });
  } catch (err) {
    console.error("BOOKING ERROR:", err);
    res.status(400).json({ success: false, message: err.message });
  }
};

// ==============================
// GET BOOKING
// ==============================
export const getBooking = async (req, res) => {
  try {
    const booking = await marketplaceService.getBookingById(req.params.id);
    res.json({ success: true, data: booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ==============================
// ACCEPT / REJECT
// ==============================
export const acceptBooking = async (req, res) => {
  try {
    await bookingService.acceptBooking(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const rejectBooking = async (req, res) => {
  try {
    await bookingService.rejectBooking(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// ==============================
// ALL BOOKINGS (CRM VIEW)
// ==============================
export const getAllBookings = async (req, res) => {
  try {
    const userId = req.user.id;

    const bookings = await prisma.marketplaceBooking.findMany({
      where: { garageId: userId },
      include: { client: true },
      orderBy: { createdAt: "desc" },
    });

    const formatted = bookings.map((b) => ({
      id: b.id,
      serviceName: b.serviceName || "Service",  // ← shows "Oil Change, Tire Rotation"
      clientName: b.client?.fullName || "Client",
      status: b.status,
      price: b.finalPrice,                      // ← shows total cart price ✅
      scheduledAt: b.scheduledAt,
      createdAt: b.createdAt,
      garageId: b.garageId,
      // ← REMOVE: totalCartPrice line
    }));

    res.json({ success: true, data: formatted });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ==============================
// GET GARAGE SERVICES (WITH PRICING)
// ==============================
export const getGarageServices = async (req, res) => {
  try {
    const userId = req.user.id;

    const services = await prisma.garageMarketplaceService.findMany({
      where: { userId },
      include: {
        pricing: true,
        service: true,
      },
    });

    res.json({ success: true, data: services });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ==============================
// SAVE GARAGE SERVICE + PRICING
// ==============================
export const saveGarageService = async (req, res) => {
  try {
    const userId = req.user.id;

    const { serviceId, price, discount, isActive, duration, pricing } =
      req.body;

    const service = await prisma.garageMarketplaceService.upsert({
      where: {
        userId_serviceId: {
          userId,
          serviceId: Number(serviceId),
        },
      },
      update: {
        price: price ? Number(price) : null,
        discount: Number(discount) || 0,
        isActive: Boolean(isActive),
        duration: duration ? Number(duration) : null,
      },
      create: {
        userId,
        serviceId: Number(serviceId),
        price: price ? Number(price) : null,
        discount: Number(discount) || 0,
        isActive: Boolean(isActive),
        duration: duration ? Number(duration) : null,
      },
    });

    if (pricing && Array.isArray(pricing)) {
      await prisma.garageServicePricing.deleteMany({
        where: { garageServiceId: service.id },
      });

      const pricingData = pricing.map((p) => ({
        garageServiceId: service.id,
        carType: p.carType,
        price: Number(p.price),
        discount: Number(p.discount) || 0,
      }));

      if (pricingData.length > 0) {
        await prisma.garageServicePricing.createMany({
          data: pricingData,
        });
      }
    }

    const finalService = await prisma.garageMarketplaceService.findUnique({
      where: { id: service.id },
      include: { pricing: true },
    });

    res.json({ success: true, data: finalService });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// ==============================
// PACKAGES
// ==============================
export const createPackage = async (req, res) => {
  try {
    const userId = req.user.id;
    const data = await marketplaceService.createPackage(userId, req.body);
    res.json({ success: true, data });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const getPackages = async (req, res) => {
  try {
    const userId = req.user.id;
    const data = await marketplaceService.getPackages(userId);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deletePackage = async (req, res) => {
  try {
    const userId = req.user.id;
    await marketplaceService.deletePackage(req.params.id, userId);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const togglePackage = async (req, res) => {
  try {
    const userId = req.user.id;
    const data = await marketplaceService.togglePackage(req.params.id, userId);
    res.json({ success: true, data });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// ==============================
// UPDATE SERVICE DETAILS
// ==============================
export const updateServiceDetails = async (req, res) => {
  try {
    const serviceId = Number(req.params.id);
    const { description } = req.body;

    let imageUrl;

    if (req.file) {
      const { buffer, mimetype } = req.file;

      const result = await uploadToR2({
        buffer,
        mimeType: mimetype,
        folder: `services/${serviceId}`,
      });

      imageUrl = result.url;
    }

    const updatedService = await marketplaceService.updateServiceDetails(
      serviceId,
      {
        description,
        image: imageUrl,
      },
    );

    return res.json({
      success: true,
      data: updatedService,
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};


export const clientLookup = async (req, res) => {
  try {
    const { phone, name, email } = req.body;
 
    if (!phone) {
      return res.status(400).json({
        success: false,
        message: "Phone number is required",
      });
    }
 
    // Try to find existing Client by phone number
    let client = await prisma.client.findFirst({
      where: { phone },
    });
 
    // Not found — create a minimal Client record so booking can proceed
    if (!client) {
      client = await prisma.client.create({
        data: {
          fullName: name || "App User",
          phone,
          email: email || null,
          // Required fields with safe defaults:
          vehicleMake: "Unknown",
          vehicleModel: "Unknown",
          vehicleYear: new Date().getFullYear(),
          regNumber: `APP-${phone}`,   // temporary unique value
          userId: null,                // not tied to any specific garage owner
        },
      });
      console.log("✅ Created new CRM client for app user:", phone, "id:", client.id);
    }
 
    return res.json({
      success: true,
      data: { clientId: client.id },  // integer — what MarketplaceBooking.clientId expects
    });
  } catch (err) {
    console.error("CLIENT LOOKUP ERROR:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};