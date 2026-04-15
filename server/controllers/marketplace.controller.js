// src/controllers/marketplace.controller.js
import * as marketplaceService from "../services/marketplace.service.js";
import * as bookingService from "../services/booking.service.js";
import * as notificationService from "../services/notification.service.js"; // 🔔 Notification triggers
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
    const data = await marketplaceService.getGaragesByService(externalServiceId, carType);
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
    const { externalServiceId, garageId, clientId, scheduledAt, appPrice } = req.body;

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

    // Fire-and-forget side effects
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
// ACCEPT BOOKING
// 🔔 Stores a USER-scoped AppNotification in CRM DB for that client's phone
// ==============================
export const acceptBooking = async (req, res) => {
  try {
    await bookingService.acceptBooking(req.params.id);

    // Create notification in CRM DB — fire-and-forget so it never breaks the response
    notificationService
      .notifyBookingAccepted(req.params.id)
      .catch((e) => console.error("NOTIFICATION (accept) ERROR:", e.message));

    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// ==============================
// REJECT BOOKING
// 🔔 Stores a USER-scoped AppNotification in CRM DB for that client's phone
// ==============================
export const rejectBooking = async (req, res) => {
  try {
    await bookingService.rejectBooking(req.params.id);

    // Create notification in CRM DB — fire-and-forget
    notificationService
      .notifyBookingRejected(req.params.id)
      .catch((e) => console.error("NOTIFICATION (reject) ERROR:", e.message));

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
      include: { service: true },
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
      include: { pricing: true, service: true },
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

    if (isNaN(Number(serviceId))) {
      const resolved = await marketplaceService.resolveService(serviceId);
      serviceId = resolved.id;
    } else {
      serviceId = Number(serviceId);
    }

    const garageService = await prisma.garageMarketplaceService.upsert({
      where: { userId_serviceId: { userId, serviceId } },
      update: {
        isActive: Boolean(isActive),
        duration: duration ? Number(duration) : null,
      },
      create: {
        userId,
        serviceId,
        isActive: Boolean(isActive),
        duration: duration ? Number(duration) : null,
      },
    });

    if (pricing && Array.isArray(pricing)) {
      await prisma.garageServicePricing.deleteMany({
        where: { garageServiceId: garageService.id },
      });
      await prisma.garageServicePricing.createMany({
        data: pricing.map((p) => ({
          garageServiceId: garageService.id,
          carType: p.carType,
          price: parseFloat(p.price) || 0,
          discount: parseFloat(p.discount) || 0,
        })),
      });
    }

    res.json({ success: true, data: garageService });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// ==============================
// PACKAGES — CREATE
// 🔔 Stores a GLOBAL AppNotification so every app user sees the new bundle
// ==============================
export const createPackage = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, price, serviceIds, description } = req.body;

    if (!name || !price || !Array.isArray(serviceIds) || serviceIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Name, price and at least one service are required",
      });
    }

    const data = await marketplaceService.createPackage(userId, {
      name,
      price,
      serviceIds,
      description,
    });

    // 🔔 Create GLOBAL notification in CRM DB — fire-and-forget
    notificationService
      .notifyNewPackage(data.id, userId)
      .catch((e) => console.error("NOTIFICATION (new package) ERROR:", e.message));

    return res.json({
      success: true,
      message: "Package created successfully",
      data,
    });
  } catch (err) {
    console.error("CREATE PACKAGE ERROR:", err);
    return res.status(400).json({
      success: false,
      message: err.message || "Failed to create package",
    });
  }
};

// ==============================
// PACKAGES — GET (CRM)
// ==============================
export const getPackages = async (req, res) => {
  try {
    const userId = req.user.id;
    const data = await marketplaceService.getPackages(userId);
    return res.json({ success: true, count: data.length, data });
  } catch (err) {
    console.error("GET PACKAGES ERROR:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Failed to fetch packages",
    });
  }
};

// ==============================
// PACKAGES — DELETE
// ==============================
export const deletePackage = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ success: false, message: "Package ID is required" });
    }

    await marketplaceService.deletePackage(id, userId);
    return res.json({ success: true, message: "Package deleted successfully" });
  } catch (err) {
    console.error("DELETE PACKAGE ERROR:", err);
    return res.status(400).json({
      success: false,
      message: err.message || "Failed to delete package",
    });
  }
};

// ==============================
// PACKAGES — TOGGLE
// ==============================
export const togglePackage = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const data = await marketplaceService.togglePackage(id, userId);
    return res.json({
      success: true,
      message: `Package ${data.isActive ? "activated" : "paused"}`,
      data,
    });
  } catch (err) {
    console.error("TOGGLE PACKAGE ERROR:", err);
    return res.status(400).json({
      success: false,
      message: err.message || "Failed to update package status",
    });
  }
};

// ==============================
// UPDATE SERVICE DETAILS (CRM METADATA)
// ==============================
export const updateServiceDetails = async (req, res) => {
  try {
    const { id } = req.params;
    let { description, isActive, pricing } = req.body;
    const isLocalId = !isNaN(Number(id));
    const activeStatus = isActive === "true" || isActive === true;

    let parsedPricing = [];
    if (pricing) {
      try {
        parsedPricing = typeof pricing === "string" ? JSON.parse(pricing) : pricing;
      } catch (e) {
        console.error("Pricing Parse Error:", e);
        return res.status(400).json({ success: false, message: "Invalid pricing format" });
      }
    }

    let imageUrl;
    if (req.file) {
      const { buffer, mimetype } = req.file;
      const result = await uploadToR2({ buffer, mimeType: mimetype, folder: `services/${id}` });
      imageUrl = result.url;
    }

    const updatedService = await marketplaceService.updateServiceDetails(
      id,
      { description, image: imageUrl, isActive: activeStatus, pricing: parsedPricing },
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
      return res.status(400).json({ success: false, message: "Phone number is required" });
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

// ==============================
// MY BOOKINGS (App)
// ==============================
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
        garage: { select: { companyName: true, address: true, phone: true } },
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