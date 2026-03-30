//marketplace.controller.js
import * as marketplaceService from "../services/marketplace.service.js";
import * as bookingService from "../services/booking.service.js";
import { PrismaClient } from "@prisma/client";
import { uploadToR2 } from "../utils/r2Upload.js";
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
    const { id } = req.params;

    const data = await marketplaceService.getGaragesByService(id);

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
    const booking = await marketplaceService.createBooking(req.body);

    res.json({ success: true, data: booking });
  } catch (err) {
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
    const userId = req.user.id; // ✅ logged-in garage

    const bookings = await prisma.marketplaceBooking.findMany({
      where: {
        garageId: userId, // ✅ FILTER
      },
      include: {
        service: true,
        client: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const formatted = bookings.map((b) => ({
      id: b.id,
      serviceName: b.service?.name || "Service",
      clientName: b.client?.name || "Client",
      status: b.status,
      price: b.priceSnapshot,
      scheduledAt: b.scheduledAt,
      createdAt: b.createdAt,
      garageId: b.garageId,
    }));

    res.json({ success: true, data: formatted });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ==============================
// 🆕 GET GARAGE SERVICES (PRICING)
// ==============================
export const getGarageServices = async (req, res) => {
  try {
    const userId = req.user.id; // logged-in garage

    const services = await prisma.garageMarketplaceService.findMany({
      where: { userId },
    });

    res.json({ success: true, data: services });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ==============================
// 🆕 UPSERT GARAGE SERVICE
// ==============================
// export const saveGarageService = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const { serviceId, price, isActive, duration } = req.body;

//     const result = await prisma.garageMarketplaceService.upsert({
//       where: {
//         userId_serviceId: {
//           userId,
//           serviceId: Number(serviceId),
//         },
//       },
//       update: {
//         price: Number(price),
//         isActive: Boolean(isActive),
//         duration: duration ? Number(duration) : null,
//       },
//       create: {
//         userId,
//         serviceId: Number(serviceId),
//         price: Number(price),
//         isActive: Boolean(isActive),
//         duration: duration ? Number(duration) : null,
//       },
//     });

//     res.json({ success: true, data: result });
//   } catch (err) {
//     res.status(400).json({ success: false, message: err.message });
//   }
// };

// ==============================
// UPDATE GARAGE SERVICE (ADD DISCOUNT)
// ==============================
export const saveGarageService = async (req, res) => {
  try {
    const userId = req.user.id;
    const { serviceId, price, discount, isActive, duration } = req.body;

    const result = await prisma.garageMarketplaceService.upsert({
      where: {
        userId_serviceId: {
          userId,
          serviceId: Number(serviceId),
        },
      },
      update: {
        price: Number(price),
        discount: Number(discount) || 0, // ✅ NEW
        isActive: Boolean(isActive),
        duration: duration ? Number(duration) : null,
      },
      create: {
        userId,
        serviceId: Number(serviceId),
        price: Number(price),
        discount: Number(discount) || 0, // ✅ NEW
        isActive: Boolean(isActive),
        duration: duration ? Number(duration) : null,
      },
    });

    res.json({ success: true, data: result });
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

export const updateServiceDetails = async (req, res) => {
  try {
    const serviceId = Number(req.params.id);
    const { description } = req.body;

    let imageUrl;

    // 👉 If image is uploaded
    if (req.file) {
      const { buffer, mimetype } = req.file;

      // Upload to R2 (reuse your existing util)
      const result = await uploadToR2({
        buffer,
        mimeType: mimetype,
        folder: `services/${serviceId}`,
      });

      imageUrl = result.url;
    }

    // 👉 Call service layer
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