// src/controllers/marketplace.controller.js
import * as marketplaceService from "../services/marketplace.service.js";
import * as bookingService from "../services/booking.service.js";
import { PrismaClient } from "@prisma/client";
import { uploadToR2 } from "../utils/r2Upload.js";
import * as dispatchService from "../services/dispatch.service.js";
import { notifyGarage } from "../services/socket.service.js";

const prisma = new PrismaClient();

// ==============================
// SERVICES (App View)
// ==============================
export const getServices = async (req, res) => {
  try {
    const { vehicleTypeId } = req.query;
    const data = await marketplaceService.getServices(vehicleTypeId);
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
    const { externalServiceId, garageId, clientId, scheduledAt, appPrice } =
      req.body;

    if (!externalServiceId || !garageId || !clientId || !scheduledAt) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    const bookingData = {
      externalServiceId,
      garageId: Number(garageId),
      clientId: Number(clientId),
      scheduledAt,
      appPrice: appPrice ? Number(appPrice) : null,
      carType: req.body.carType || "SEDAN",
      serviceName: req.body.serviceName || null,
    };

    const booking = await marketplaceService.createBooking(bookingData);

    // Notifications & Background Tasks
    try {
      await notifyGarage(garageId, booking);
    } catch (e) {
      console.error("SOCKET ERROR:", e.message);
    }
    try {
      await dispatchService.startDispatch(booking.id);
    } catch (e) {
      console.error("DISPATCH ERROR:", e.message);
    }

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
// ALL BOOKINGS (CRM LIST VIEW)
// ==============================
export const getAllBookings = async (req, res) => {
  try {
    const userId = req.user.id;

    const bookings = await prisma.marketplaceBooking.findMany({
      where: { garageId: userId },
      include: { service: true }, // Updated relation
      orderBy: { scheduledAt: "desc" },
    });

    const formatted = bookings.map((b) => ({
      id: b.id,
      serviceName: b.serviceName || b.service?.name || "Service",
      status: b.status,
      price: b.finalPrice,
      scheduledAt: b.scheduledAt,
      garageId: b.garageId,
    }));

    res.json({ success: true, data: formatted });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ==============================
// GET GARAGE SERVICES (PRICING SETTINGS)
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
    let { serviceId, isActive, duration, pricing } = req.body;

    // ⚡️ FIX: If serviceId is a UUID string, we must resolve it to the INT ID first
    if (isNaN(Number(serviceId))) {
      const resolved = await marketplaceService.resolveService(serviceId);
      serviceId = resolved.id;
    } else {
      serviceId = Number(serviceId);
    }

    const garageService = await prisma.garageMarketplaceService.upsert({
      where: {
        userId_serviceId: {
          userId,
          serviceId: serviceId,
        },
      },
      update: {
        isActive: Boolean(isActive),
        duration: duration ? Number(duration) : null,
      },
      create: {
        userId,
        serviceId: serviceId,
        isActive: Boolean(isActive),
        duration: duration ? Number(duration) : null,
      },
    });

    if (pricing && Array.isArray(pricing)) {
      await prisma.garageServicePricing.deleteMany({
        where: { garageServiceId: garageService.id },
      });

      const pricingData = pricing.map((p) => ({
        garageServiceId: garageService.id,
        carType: p.carType,
        price: parseFloat(p.price) || 0, // Use parseFloat for decimals
        discount: parseFloat(p.discount) || 0,
      }));

      await prisma.garageServicePricing.createMany({ data: pricingData });
    }

    res.json({ success: true, data: garageService });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// ==============================
// PACKAGES (BUNDLED SERVICES)
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
// UPDATE SERVICE DETAILS (CRM METADATA)
// ==============================
// src/controllers/marketplace.controller.js
export const updateServiceDetails = async (req, res) => {
  try {
    const { id } = req.params;
    // Extract everything from req.body
    let { description, isActive, pricing } = req.body;

    const isLocalId = !isNaN(Number(id));

    // ✅ FIX 1: Convert string "true"/"false" to actual Boolean
    const activeStatus = isActive === "true" || isActive === true;

    // ✅ FIX 2: Parse stringified pricing JSON
    let parsedPricing = [];
    if (pricing) {
      try {
        parsedPricing =
          typeof pricing === "string" ? JSON.parse(pricing) : pricing;
      } catch (e) {
        console.error("Pricing Parse Error:", e);
        return res
          .status(400)
          .json({ success: false, message: "Invalid pricing format" });
      }
    }

    let imageUrl;
    if (req.file) {
      const { buffer, mimetype } = req.file;
      const result = await uploadToR2({
        buffer,
        mimeType: mimetype,
        folder: `services/${id}`,
      });
      imageUrl = result.url;
    }

    // Pass the cleaned data to the service layer
    const updatedService = await marketplaceService.updateServiceDetails(
      id,
      {
        description,
        image: imageUrl,
        isActive: activeStatus,
        pricing: parsedPricing,
      },
      isLocalId,
      req.user.id,
    );

    return res.json({ success: true, data: updatedService });
  } catch (err) {
    console.error("UPDATE DETAILS ERROR:", err);
    return res.status(400).json({ success: false, message: err.message });
  }
};

// ==============================
// CLIENT LOOKUP (APP USER SYNC)
// ==============================
export const clientLookup = async (req, res) => {
  try {
    const { phone, name, email } = req.body;

    if (!phone) {
      return res
        .status(400)
        .json({ success: false, message: "Phone number is required" });
    }

    let client = await prisma.client.findFirst({ where: { phone } });

    if (!client) {
      client = await prisma.client.create({
        data: {
          fullName: name || "App User",
          phone,
          email: email || null,
          vehicleMake: "Unknown",
          vehicleModel: "Unknown",
          vehicleYear: new Date().getFullYear(),
          regNumber: `APP-${phone}`,
          userId: null,
        },
      });
    }

    res.json({ success: true, data: { clientId: client.id } });
  } catch (err) {
    console.error("CLIENT LOOKUP ERROR:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};


export const getMyBookings = async (req, res) => {
  try {
    const { phone } = req.query;

    if (!phone) {
      return res.status(400).json({ success: false, message: "Phone required" });
    }

    const client = await prisma.client.findFirst({ where: { phone } });

    if (!client) {
      return res.json({ success: true, data: [] });
    }

    const bookings = await prisma.marketplaceBooking.findMany({
      where: { clientId: client.id },
      include: {
        service: true,
        garage: {
          select: { companyName: true, address: true, phone: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const formatted = bookings.map((b) => ({
      id: b.id,
      serviceName: b.serviceName || b.service?.name || "Service",
      garageName: b.garage?.companyName || "Garage",
      garageAddress: b.garage?.address || "",
      garagePhone: b.garage?.phone || "",
      status: b.status,
      scheduledAt: b.scheduledAt,
      finalPrice: b.finalPrice,
      carType: b.carType,
      createdAt: b.createdAt,
    }));

    res.json({ success: true, data: formatted });
  } catch (err) {
    console.error("MY BOOKINGS ERROR:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};