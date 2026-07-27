// src/controllers/marketplace.controller.js
import * as marketplaceService from "../services/marketplace.service.js";
import * as bookingService from "../services/booking.service.js";
import * as notificationService from "../services/notification.service.js"; // 🔔 Notification triggers
import { PrismaClient } from "@prisma/client";
import { uploadToR2 } from "../utils/r2Upload.js";
import * as dispatchService from "../services/dispatch.service.js";
import { notifyGarage, notifyClient } from "../services/socket.service.js";

const prisma = new PrismaClient();

// 🆕 Must match booking.service.js's RESPONSE_WINDOW_MS (30s) and the
// popup's countdown. Run before any booking list is returned so the UI
// always reflects the true current state, not just at accept-time.
const RESPONSE_WINDOW_MS = 30 * 1000;

const sweepExpiredBookings = async (where) => {
  try {
    const cutoff = new Date(Date.now() - RESPONSE_WINDOW_MS);
    await prisma.marketplaceBooking.updateMany({
      where: { ...where, status: "PENDING", createdAt: { lt: cutoff } },
      data: { status: "TIMEOUT" },
    });
  } catch (e) {
    console.error("⚠️ sweepExpiredBookings failed:", e.message);
  }
};

// ==============================
// SERVICES (App View / Catalog Builder)
// ==============================
export const getServices = async (req, res) => {
  try {
    // 🧼 FORCE CACHE PURGING VIA HTTP HEADERS (Bypasses browser 304 caching completely)
    res.set(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate",
    );
    res.set("Pragma", "no-cache");
    res.set("Expires", "0");

    const { vehicleTypeId, vehicleType } = req.query;

    // 🎯 Resolve workspace context, prioritizing explicit frontend query inputs over fallback JWT keys
    const activeCrmType = vehicleType || req.user?.crmType;

    console.log("====================================================");
    console.log(
      "🔍 [DEBUG] [MARKETPLACE CONTROLLER] -> getServices API Route Triggered",
    );
    console.log(
      `   ↳ req.query.vehicleType (URL Query): ${vehicleType ? `"${vehicleType}"` : "None Provided"}`,
    );
    console.log(
      `   ↳ req.user.crmType (Token Auth Payload): ${req.user?.crmType ? `"${req.user.crmType}"` : "None Provided"}`,
    );
    console.log(
      `   🚀 FINAL RESOLVED CRM FILTER PASSED DOWNSTREAM: "${activeCrmType ? activeCrmType.toUpperCase() : "CAR"}"`,
    );
    console.log("====================================================");

    const data = await marketplaceService.getServices(
      vehicleTypeId,
      activeCrmType,
    );
    res.json({ success: true, data });
  } catch (err) {
    console.error(
      "❌ [DEBUG] [MARKETPLACE CONTROLLER] Failure inside getServices:",
      err.message,
    );
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
    const {
      externalServiceId,
      garageId,
      clientId,
      scheduledAt,
      appPrice,
      carType,
      serviceName,

      // 🆕 Structured multi-service / package breakdown
      services,
      packageId,
      packageName,

      // 🆕 Customer notes / special instructions
      notes,

      // 🆕 Pickup / drop details
      pickupRequired,
      pickupAddress,
      dropAddress,

      // 🆕 Vehicle details snapshot
      vehicleMake,
      vehicleModel,
      vehicleRegNumber,
      vehicleYear,
      vehicleFuelType,
    } = req.body;

    // 1. Validation check
    if (!externalServiceId || !garageId || !clientId || !scheduledAt) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    // 2. Prepare Data
    const bookingData = {
      externalServiceId,
      garageId: garageId,
      clientId: clientId,
      scheduledAt,
      appPrice: appPrice ? Number(appPrice) : null,
      carType: carType || "SEDAN",
      serviceName: serviceName || null,

      // 🆕 Pass through the previously-dropped fields
      services: Array.isArray(services) ? services : null,
      packageId: packageId ? Number(packageId) : null,
      packageName: packageName || null,

      notes: notes || null,

      pickupRequired: Boolean(pickupRequired),
      pickupAddress: pickupAddress || null,
      dropAddress: dropAddress || null,

      vehicleMake: vehicleMake || null,
      vehicleModel: vehicleModel || null,
      vehicleRegNumber: vehicleRegNumber || null,
      vehicleYear: vehicleYear ? Number(vehicleYear) : null,
      vehicleFuelType: vehicleFuelType || null,
    };

    // 3. Call Service Layer
    const booking = await marketplaceService.createBooking(bookingData);

    // 4. Fire-and-forget side effects
    const targetGarageId = booking.garageId || garageId;

    try {
      await notifyGarage(targetGarageId, booking);
    } catch (e) {
      console.error("SOCKET ERROR:", e.message);
    }

    try {
      await dispatchService.startDispatch(booking.id);
    } catch (e) {
      console.error("DISPATCH ERROR:", e.message);
    }

    // 5. Success Response
    res.json({ success: true, data: booking });
  } catch (err) {
    console.error("BOOKING ERROR DETAILS:", err);
    res.status(400).json({
      success: false,
      message: err.message || "An error occurred while creating the booking",
    });
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
// ==============================
export const acceptBooking = async (req, res) => {
  try {
    const result = await bookingService.acceptBooking(req.params.id);

    notificationService
      .notifyBookingAccepted(req.params.id)
      .catch((e) => console.error("NOTIFICATION (accept) ERROR:", e.message));

    // 🆕 Real-time push to Motor Konnect (customer app)
    const clientPhone = result?.booking?.client?.phone;
    if (clientPhone) {
      notifyClient(clientPhone, result.booking).catch((e) =>
        console.error("SOCKET NOTIFY (accept) ERROR:", e.message),
      );
    } else {
      console.warn(
        "⚠️ acceptBooking: no client phone available, skipping socket push",
      );
    }

    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// ==============================
// REJECT BOOKING
// ==============================
export const rejectBooking = async (req, res) => {
  try {
    const result = await bookingService.rejectBooking(req.params.id);

    notificationService
      .notifyBookingRejected(req.params.id)
      .catch((e) => console.error("NOTIFICATION (reject) ERROR:", e.message));

    // 🆕 Real-time push to Motor Konnect (customer app)
    const clientPhone = result?.booking?.client?.phone;
    if (clientPhone) {
      notifyClient(clientPhone, result.booking).catch((e) =>
        console.error("SOCKET NOTIFY (reject) ERROR:", e.message),
      );
    } else {
      console.warn(
        "⚠️ rejectBooking: no client phone available, skipping socket push",
      );
    }

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

    await sweepExpiredBookings({ garageId: userId }); // 🆕

    const bookings = await prisma.marketplaceBooking.findMany({
      where: { garageId: userId },
      include: {
        service: true,
        client: {
          select: {
            fullName: true,
            phone: true,
            email: true,
            vehicleMake: true,
            vehicleModel: true,
            vehicleYear: true,
            regNumber: true,
            fuel: true,
          },
        },
      },
      orderBy: { scheduledAt: "desc" },
    });

    const formatted = bookings.map((b) => ({
      id: b.id,
      serviceName: b.serviceName || b.service?.name || "Service",
      status: b.status,
      price: b.finalPrice,
      scheduledAt: b.scheduledAt,
      garageId: b.garageId,

      // 🆕 Client details (from the Client/App-User record)
      clientName: b.client?.fullName || null,
      clientPhone: b.client?.phone || null,
      clientEmail: b.client?.email || null,

      // 🆕 Vehicle details — booking-specific snapshot takes priority
      // (this is what the customer selected for THIS booking), falling
      // back to the client's generic profile vehicle if not sent.
      vehicleMake: b.vehicleMake || b.client?.vehicleMake || null,
      vehicleModel: b.vehicleModel || b.client?.vehicleModel || null,
      vehicleYear: b.vehicleYear || b.client?.vehicleYear || null,
      vehicleRegNumber: b.vehicleRegNumber || b.client?.regNumber || null,
      vehicleFuelType: b.vehicleFuelType || b.client?.fuel || null,
      carType: b.carType || null,

      // 🆕 Full booking details for the garage owner
      services: b.services || null,
      packageName: b.packageName || null,
      notes: b.notes || null,
      pickupRequired: b.pickupRequired || false,
      pickupAddress: b.pickupAddress || null,
      dropAddress: b.dropAddress || null,
    }));

    res.json({ success: true, data: formatted });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ==============================
// GET GARAGE SERVICES (PRICING SETTINGS)
// Reads pricing from external App DB filtered contextualized by crmType
// ==============================
export const getGarageServices = async (req, res) => {
  try {
    // 🧼 FORCE CACHE PURGING VIA HTTP HEADERS (Bypasses browser 304 caching completely)
    res.set(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate",
    );
    res.set("Pragma", "no-cache");
    res.set("Expires", "0");

    const userId = req.user.id;
    const { vehicleType } = req.query;

    // 🎯 Resolve workspace context, prioritizing explicit frontend query inputs over fallback JWT keys
    const activeCrmType = vehicleType || req.user?.crmType;

    console.log("====================================================");
    console.log(
      "🔍 [DEBUG] [MARKETPLACE CONTROLLER] -> getGarageServices API Route Triggered",
    );
    console.log(
      `   ↳ req.query.vehicleType (URL Query): ${vehicleType ? `"${vehicleType}"` : "None Provided"}`,
    );
    console.log(
      `   ↳ req.user.crmType (Token Auth Payload): ${req.user?.crmType ? `"${req.user.crmType}"` : "None Provided"}`,
    );
    console.log(
      `   🚀 FINAL RESOLVED CRM FILTER PASSED DOWNSTREAM: "${activeCrmType ? activeCrmType.toUpperCase() : "CAR"}"`,
    );
    console.log("====================================================");

    // Pass dynamic workspace target to restrict returned service configurations
    const services = await marketplaceService.getGarageServicesWithPricing(
      userId,
      activeCrmType,
    );

    res.json({ success: true, data: services });
  } catch (err) {
    console.error(
      "❌ [DEBUG] [MARKETPLACE CONTROLLER] Failure inside getGarageServices:",
      err.message,
    );
    res.status(500).json({ success: false, message: err.message });
  }
};

// ==============================
// SAVE GARAGE SERVICE + PRICING
// ==============================
export const saveGarageService = async (req, res) => {
  try {
    console.log("BODY:", req.body);
    const userId = req.user.id;
    const { serviceId, isActive, duration, pricing } = req.body;

    if (!serviceId) {
      return res
        .status(400)
        .json({ success: false, message: "serviceId is required" });
    }

    const garageService = await marketplaceService.saveGarageServicePricing(
      userId,
      serviceId,
      isActive,
      duration,
      pricing,
    );

    res.json({ success: true, data: garageService });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// ==============================
// PACKAGES — CREATE
// ==============================
export const createPackage = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, price, serviceIds, description } = req.body;

    if (
      !name ||
      !price ||
      !Array.isArray(serviceIds) ||
      serviceIds.length === 0
    ) {
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

    notificationService
      .notifyNewPackage(data.id, userId)
      .catch((e) =>
        console.error("NOTIFICATION (new package) ERROR:", e.message),
      );

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
      return res
        .status(400)
        .json({ success: false, message: "Package ID is required" });
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
// UPDATE SERVICE DETAILS (CRM METADATA + PRICING → App DB)
// ==============================
export const updateServiceDetails = async (req, res) => {
  try {
    console.log("BODY:", req.body);
    const { id } = req.params;
    let { description, isActive, pricing } = req.body;
    const isLocalId = !isNaN(Number(id));
    const activeStatus = isActive === "true" || isActive === true;

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

// ==============================
// MY BOOKINGS (App)
// ==============================
export const getMyBookings = async (req, res) => {
  try {
    const { phone } = req.query;

    if (!phone) {
      return res
        .status(400)
        .json({ success: false, message: "Phone required" });
    }

    const client = await prisma.client.findFirst({ where: { phone } });

    if (!client) {
      return res.json({ success: true, data: [] });
    }

    await sweepExpiredBookings({ clientId: client.id }); // 🆕

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

      // 🆕 Full booking details for the customer
      services: b.services || null,
      packageName: b.packageName || null,
      notes: b.notes || null,
      pickupRequired: b.pickupRequired || false,
      pickupAddress: b.pickupAddress || null,
      dropAddress: b.dropAddress || null,
      vehicleMake: b.vehicleMake || null,
      vehicleModel: b.vehicleModel || null,
      vehicleRegNumber: b.vehicleRegNumber || null,
    }));

    res.json({ success: true, data: formatted });
  } catch (err) {
    console.error("MY BOOKINGS ERROR:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};
