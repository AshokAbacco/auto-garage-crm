// server/controllers/serviceController.js
import prisma from "../models/prismaClient.js";
import { uploadToR2 } from "../utils/r2Upload.js";
import { sendWhatsAppTemplate } from "../services/whatsappService.js";
/**
 * Convert a media file record to a data: URI string (defensive for Buffers, Uint8Array, Array, base64 strings).
 * Expects file to have at least: { data, mimeType, type } where data may be Buffer/Uint8Array/Array/string.
 */

function getOwnerUserId(req) {
  return req.user.type === "staff" ? req.user.ownerId : req.user.id;
}

function toDataUri(file) {
  if (!file) return null;
  const mime = file.mimeType || file.type || "application/octet-stream";

  // If there is no data property, return null
  if (file.data === undefined || file.data === null) return null;

  // If already a full data URI, return as-is
  if (typeof file.data === "string") {
    if (file.data.startsWith("data:")) return file.data;
    // If it's a base64 string (no data: prefix), prefix it
    return `data:${mime};base64,${file.data}`;
  }

  // If it's an Array (e.g. [137,80,78,...]) or Uint8Array or Buffer
  try {
    // If it's an Array of numbers
    if (Array.isArray(file.data)) {
      const buf = Buffer.from(file.data);
      return `data:${mime};base64,${buf.toString("base64")}`;
    }

    // If it's an ArrayBuffer (e.g. Web API), convert to Buffer
    if (file.data instanceof ArrayBuffer) {
      const buf = Buffer.from(new Uint8Array(file.data));
      return `data:${mime};base64,${buf.toString("base64")}`;
    }

    // If it's a typed array (Uint8Array, etc.)
    if (ArrayBuffer.isView(file.data)) {
      const buf = Buffer.from(file.data);
      return `data:${mime};base64,${buf.toString("base64")}`;
    }

    // If it's a Buffer already
    if (Buffer.isBuffer(file.data)) {
      return `data:${mime};base64,${file.data.toString("base64")}`;
    }

    // Fallback: attempt to Buffer.from it (handles many cases)
    const buf = Buffer.from(file.data);
    return `data:${mime};base64,${buf.toString("base64")}`;
  } catch (err) {
    console.warn("toDataUri: failed to convert file.data to base64", err);
    return null;
  }
}

function requireAuth(req, res) {
  if (!req.user?.id) {
    res.status(401).json({ message: "Unauthorized" });
    return false;
  }
  return true;
}

/**
 * Map an array of media file records to the API-friendly shape.
 * Ensures `data` is a proper data:<mime>;base64,... string (or null).
 */
function mapMediaFiles(mediaFiles = []) {
  if (!Array.isArray(mediaFiles)) return [];

  return mediaFiles.map((f) => ({
    id: f.id,
    fileName: f.fileName || null,
    mimeType: f.mimeType || null,
    mediaUrl: f.mediaUrl, // ✅ THIS IS WHAT UI NEEDS
  }));
}

/* ============================================================
   📦 Get All Services
   @route   GET /api/services
   @access  Private
============================================================ */
export const getServices = async (req, res) => {
  if (!requireAuth(req, res)) return;

  try {
    const services = await prisma.service.findMany({
      where: { client: { userId: getOwnerUserId(req) } },
      include: {
        client: { select: { id: true, fullName: true, regNumber: true } },
        category: true,
        subService: true,
        serviceCostItems: true,
      },
      orderBy: { date: "desc" },
    });

    const serviceIds = services.map((s) => s.id);
    const media = serviceIds.length
      ? await prisma.serviceMedia.findMany({
          where: { serviceId: { in: serviceIds } },
        })
      : [];

    const mediaByService = media.reduce((acc, m) => {
      (acc[m.serviceId] = acc[m.serviceId] || []).push(m);
      return acc;
    }, {});

    res.json(
      services.map((s) => ({
        ...s,
        mediaFiles: mapMediaFiles(mediaByService[s.id] || []),
        serviceCostItems: s.serviceCostItems,
      })),
    );
  } catch (err) {
    console.error("getServices error:", err);
    res.status(500).json({ message: "Failed to fetch services" });
  }
};

/* ============================================================
   👤 Get All Services by a Specific Client
   @route   GET /api/services/client/:clientId
   @access  Private
============================================================ */
export const getServicesByClient = async (req, res) => {
  try {
    const { clientId } = req.params;
    if (!clientId || isNaN(Number(clientId))) {
      return res.status(400).json({ message: "Invalid client ID" });
    }

    // Verify the client belongs to the authenticated user
    const client = await prisma.client.findFirst({
      where: {
        id: parseInt(clientId),
        userId: getOwnerUserId(req), // Ensure client belongs to current user
      },
      include: {
        services: {
          include: {
            category: { select: { id: true, name: true } },
            subService: { select: { id: true, name: true } },
            serviceCostItems: true,
          },
          orderBy: { date: "desc" },
        },
      },
    });

    if (!client)
      return res
        .status(404)
        .json({ message: "Client not found or access denied" });
    if (!client.services.length)
      return res
        .status(404)
        .json({ message: "No services found for this client" });

    // Collect service IDs and fetch their media
    const serviceIds = client.services.map((s) => s.id);
    const mediaRows = serviceIds.length
      ? await prisma.serviceMedia.findMany({
          where: { serviceId: { in: serviceIds } },
          select: {
            id: true,
            fileName: true,
            mimeType: true,
            mediaUrl: true,
            serviceId: true,
          },
        })
      : [];

    const mediaByService = mediaRows.reduce((acc, m) => {
      (acc[m.serviceId] = acc[m.serviceId] || []).push(m);
      return acc;
    }, {});

    const servicesWithMedia = client.services.map((s) => ({
      ...s,
      mediaFiles: mapMediaFiles(mediaByService[s.id] || []),
      costItems: s.serviceCostItems || [],
    }));

    res.status(200).json({
      client: {
        id: client.id,
        fullName: client.fullName,
        regNumber: client.regNumber,
        vehicleMake: client.vehicleMake,
        vehicleModel: client.vehicleModel,
      },
      services: servicesWithMedia,
    });
  } catch (error) {
    console.error("❌ Error fetching services by client:", error);
    res.status(500).json({
      message: "Error fetching services for client",
      error: String(error),
    });
  }
};

/* ============================================================
   🔍 Get a Single Service by ID
   @route   GET /api/services/:id
   @access  Private
============================================================ */
export const getServiceById = async (req, res) => {
  if (!requireAuth(req, res)) return;

  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ message: "Invalid service ID" });

    const service = await prisma.service.findFirst({
      where: { id, client: { userId: getOwnerUserId(req) } },
      include: {
        client: true,
        category: true,
        subService: true,
        serviceCostItems: true,
      },
    });

    if (!service) return res.status(404).json({ message: "Service not found" });

    const media = await prisma.serviceMedia.findMany({
      where: { serviceId: id },
    });

    res.json({
      ...service,
      serviceCostItems: service.serviceCostItems,
      mediaFiles: mapMediaFiles(media),
    });
  } catch (err) {
    console.error("getServiceById error:", err);
    res.status(500).json({ message: "Failed to fetch service" });
  }
};

/* ============================================================
   ➕ Create a New Service (with GST fields)
   @route   POST /api/services
   @access  Private
============================================================ *

import prisma from "../models/prismaClient.js";

/* ============================================================
   🛡️ SAFE DATE PARSER (CRITICAL FIX)
============================================================ */
function parseDate(value) {
  if (!value) return null;

  const d = new Date(value);
  if (isNaN(d.getTime())) return null;

  return d;
}

/* ============================================================
   🧮 COST CALCULATION HELPER
============================================================ */
function calculateTotals(costItems = []) {
  let partsCost = 0;
  let laborCost = 0;
  let cgstTotal = 0;
  let sgstTotal = 0;

  const normalizedItems = costItems.map((item) => {
    const qty = Number(item.quantity) || 1;
    const price = Number(item.unitPrice) || 0;
    const lineTotal = qty * price;

    const cgstRate = Number(item.cgstRate) || 0;
    const sgstRate = Number(item.sgstRate) || 0;

    const cgst = (lineTotal * cgstRate) / 100;
    const sgst = (lineTotal * sgstRate) / 100;

    if (item.type === "part") partsCost += lineTotal;
    if (item.type === "labor") laborCost += lineTotal;

    cgstTotal += cgst;
    sgstTotal += sgst;

    return {
      type: item.type,
      name: item.name || "",
      quantity: qty,
      unitPrice: price,
      cgstRate,
      sgstRate,
      totalCost: lineTotal + cgst + sgst,
    };
  });

  return {
    partsCost,
    laborCost,
    cgstTotal,
    sgstTotal,
    totalCost: partsCost + laborCost + cgstTotal + sgstTotal,
    normalizedItems,
  };
}

/* ============================================================
   ➕ CREATE SERVICE
============================================================ */
export const createService = async (req, res) => {
  try {
    if (!requireAuth(req, res)) return;

    /* ----------------------------------------
       1️⃣ EXTRACT & VALIDATE INPUT
    ---------------------------------------- */
    const {
      clientId,
      categoryId,
      subServiceId,
      notes,
      serviceInDate,
      serviceOutDate,
      expectedDelivery,
      internalNotes,
      assignedMechanic,
      priority,
      advancePaid,
      costItems,
    } = req.body;

    if (!clientId || !serviceInDate) {
      return res
        .status(400)
        .json({ message: "clientId and serviceInDate are required" });
    }

    const ownerUserId = getOwnerUserId(req);

    const client = await prisma.client.findFirst({
      where: {
        id: parseInt(clientId),
        userId: ownerUserId,
      },
    });

    if (!client) {
      return res.status(403).json({ message: "Unauthorized client access" });
    }

    /* ----------------------------------------
       2️⃣ PARSE DATES SAFELY
    ---------------------------------------- */
    const inDate = parseDate(serviceInDate);
    const outDate = parseDate(serviceOutDate);
    const expectedDate = parseDate(expectedDelivery);

    if (!inDate) {
      return res.status(400).json({ message: "Invalid serviceInDate" });
    }

    /* ----------------------------------------
       3️⃣ PARSE COST ITEMS
    ---------------------------------------- */
    let parsedItems = [];
    if (costItems) {
      parsedItems =
        typeof costItems === "string" ? JSON.parse(costItems) : costItems;
    }

    const totals = calculateTotals(parsedItems);

    /* ----------------------------------------
       4️⃣ CREATE SERVICE
    ---------------------------------------- */
    const service = await prisma.service.create({
      data: {
        date: inDate,
        serviceInDate: inDate,
        serviceOutDate: outDate,
        expectedDelivery: expectedDate,

        notes: notes || null,
        internalNotes: internalNotes || null,
        assignedMechanic: assignedMechanic || null,
        priority: priority || "Normal",
        advancePaid: Number(advancePaid) || 0,

        partsCost: totals.partsCost,
        laborCost: totals.laborCost,
        cost: totals.totalCost,

        status: "Pending",

        clientId: parseInt(clientId),
        categoryId: categoryId ? parseInt(categoryId) : null,
        subServiceId: subServiceId ? parseInt(subServiceId) : null,
      },
    });

    const serviceId = service.id;

    /* ----------------------------------------
       5️⃣ SAVE COST ITEMS
    ---------------------------------------- */
    if (totals.normalizedItems.length) {
      await prisma.serviceCostItem.createMany({
        data: totals.normalizedItems.map((item) => ({
          serviceId,
          type: item.type,
          name: item.name,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          cgstRate: item.cgstRate,
          sgstRate: item.sgstRate,
          totalCost: item.totalCost,
        })),
      });
    }

    /* ----------------------------------------
       6️⃣ UPLOAD MEDIA TO R2
    ---------------------------------------- */
    if (req.files?.length) {
      for (const file of req.files) {
        const { url } = await uploadToR2({
          buffer: file.buffer,
          mimeType: file.mimetype,
          serviceId,
        });

        await prisma.serviceMedia.create({
          data: {
            serviceId,
            fileName: file.originalname,
            mimeType: file.mimetype,
            mediaUrl: url,
          },
        });
      }
    }

    return res.status(201).json({
      message: "Service created successfully",
      service,
    });
  } catch (error) {
    console.error("❌ createService error:", error);
    return res.status(500).json({
      message: "Error creating service",
      error: error.message,
    });
  }
};

/* ============================================================
   ✏️ UPDATE SERVICE
============================================================ */
export const updateService = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await prisma.service.findFirst({
      where: {
        id: parseInt(id),
        client: { userId: getOwnerUserId(req) },
      },
    });

    if (!existing) {
      return res.status(404).json({ message: "Service not found" });
    }

    const {
      categoryId,
      subServiceId,
      notes,
      serviceInDate,
      serviceOutDate,
      expectedDelivery,
      internalNotes,
      assignedMechanic,
      priority,
      advancePaid,
      costItems,
    } = req.body;

    const inDate = parseDate(serviceInDate);
    const outDate = parseDate(serviceOutDate);
    const expectedDate = parseDate(expectedDelivery);

    let parsedItems = [];
    if (costItems) {
      parsedItems =
        typeof costItems === "string" ? JSON.parse(costItems) : costItems;
    }

    const totals = calculateTotals(parsedItems);

    const updateData = {
      date: inDate || undefined,
      serviceInDate: inDate || undefined,
      serviceOutDate: outDate || undefined,
      expectedDelivery: expectedDate || undefined,

      notes: notes ?? undefined,
      internalNotes: internalNotes ?? undefined,
      assignedMechanic: assignedMechanic ?? undefined,
      priority: priority ?? undefined,
      advancePaid: advancePaid !== undefined ? Number(advancePaid) : undefined,

      partsCost: totals.partsCost,
      laborCost: totals.laborCost,
      cost: totals.totalCost,

      categoryId: categoryId ? parseInt(categoryId) : undefined,
      subServiceId: subServiceId ? parseInt(subServiceId) : undefined,
    };

    Object.keys(updateData).forEach(
      (k) => updateData[k] === undefined && delete updateData[k],
    );

    const service = await prisma.service.update({
      where: { id: parseInt(id) },
      data: updateData,
    });

    // 🔄 REPLACE COST ITEMS
    await prisma.serviceCostItem.deleteMany({
      where: { serviceId: service.id },
    });

    if (totals.normalizedItems.length) {
      await prisma.serviceCostItem.createMany({
        data: totals.normalizedItems.map((item) => ({
          serviceId: service.id,
          type: item.type,
          name: item.name,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          cgstRate: item.cgstRate,
          sgstRate: item.sgstRate,
          totalCost: item.totalCost,
        })),
      });
    }

    // 🔥 FIXED: SAVE MEDIA FILES ON UPDATE
    if (req.files?.length) {
      for (const file of req.files) {
        // 1️⃣ Upload to R2
        const { url } = await uploadToR2({
          buffer: file.buffer,
          mimeType: file.mimetype,
          serviceId: service.id, // ✅ FIX
        });

        // 2️⃣ Save metadata + URL
        await prisma.serviceMedia.create({
          data: {
            serviceId: service.id, // ✅ FIX
            fileName: file.originalname,
            mimeType: file.mimetype,
            mediaUrl: url, // ✅ REQUIRED
          },
        });
      }
    }

    return res.json({
      message: "Service updated successfully",
      service,
    });
  } catch (error) {
    console.error("❌ updateService error:", error);
    return res.status(500).json({ message: "Error updating service" });
  }
};

/* ============================================================
   🗑️ Delete Service
   @route   DELETE /api/services/:id
   @access  Private
============================================================ */
export const deleteService = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || isNaN(Number(id))) {
      return res.status(400).json({ message: "Invalid service ID" });
    }

    // Verify the service belongs to the authenticated user
    const service = await prisma.service.findFirst({
      where: {
        id: parseInt(id),
        client: {
          userId: getOwnerUserId(req), // Ensure service belongs to current user's client
        },
      },
    });

    if (!service)
      return res
        .status(404)
        .json({ message: "Service not found or access denied" });

    await prisma.service.delete({ where: { id: parseInt(id) } });

    res.json({ message: "🗑️ Service deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting service:", error);
    res
      .status(500)
      .json({ message: "Error deleting service", error: String(error) });
  }
};

/* ============================================================
   📘 Get Service Types (Categories + SubServices)
   @route   GET /api/services/types/list
   @access  Private
============================================================ */
export const getServiceTypes = async (req, res) => {
  try {
    const categories = await prisma.serviceCategory.findMany({
      include: {
        subServices: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { id: "asc" },
    });

    res.status(200).json(categories);
  } catch (error) {
    console.error("❌ Error fetching service types:", error);
    res
      .status(500)
      .json({ message: "Error fetching service types", error: String(error) });
  }
};

export const searchSubServices = async (req, res) => {
  try {
    const { q, categoryId } = req.query;

    if (!categoryId) {
      return res.json([]);
    }

    // If no query provided, return all sub-services for the category
    const whereClause = {
      categoryId: Number(categoryId),
    };

    // Add search condition if query is provided
    if (q && q.trim() !== "") {
      whereClause.name = {
        contains: q,
        mode: "insensitive",
      };
    }

    const results = await prisma.subService.findMany({
      where: whereClause,
      take: 20, // Increased limit
      orderBy: { name: "asc" },
    });

    res.json(results);
  } catch (err) {
    console.error("searchSubServices error:", err);
    res.status(500).json({ message: "Failed to search sub-services" });
  }
};

// Add this new function to create a sub-service
export const createSubService = async (req, res) => {
  console.log("SERVICE CREATE USER:", req.user);
  console.log("OWNER USER ID:", getOwnerUserId(req));
  try {
    const { name, categoryId } = req.body;

    if (!name || !categoryId) {
      return res
        .status(400)
        .json({ message: "Name and categoryId are required" });
    }

    // Check if sub-service already exists
    const existing = await prisma.subService.findFirst({
      where: {
        name: {
          equals: name,
          mode: "insensitive",
        },
        categoryId: parseInt(categoryId),
      },
    });

    if (existing) {
      return res
        .status(409)
        .json({ message: "Sub-service already exists", data: existing });
    }

    const newSubService = await prisma.subService.create({
      data: {
        name,
        categoryId: parseInt(categoryId),
      },
    });

    res.status(201).json(newSubService);
  } catch (err) {
    console.error("createSubService error:", err);
    res.status(500).json({ message: "Failed to create sub-service" });
  }
};

// Add this new function to serviceController.js
export const getServiceForBilling = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || isNaN(Number(id))) {
      return res.status(400).json({ message: "Invalid service ID" });
    }

    const service = await prisma.service.findFirst({
      where: {
        id: parseInt(id),
        client: {
          userId: getOwnerUserId(req),
        },
      },
      include: {
        client: {
          select: {
            id: true,
            fullName: true,
            regNumber: true,
            vehicleMake: true,
            vehicleModel: true,
          },
        },
        category: {
          select: {
            name: true,
          },
        },
        subService: {
          select: {
            name: true,
          },
        },
        serviceCostItems: true,
      },
    });

    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    res.json({
      ...service,
      costItems: service.serviceCostItems,
    });
  } catch (error) {
    console.error("Error fetching service for billing:", error);
    res.status(500).json({ message: "Error fetching service" });
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

    await sendWhatsAppTemplate({
      to,
      templateName: "vehicle_ready",
      languageCode: "en",
      variables: [
        service.client.fullName,
        service.client.regNumber,
        owner?.companyName || "Our Garage",
      ],
    });

    // ✅ THIS WAS MISSING
    const updatedService = await prisma.service.update({
      where: { id: service.id },
      data: {
        status: "Paid",
        approvalStatus: "READY_SENT",
        approvalAt: new Date(),
      },
    });

    return res.json({
      message: "Vehicle Ready notification sent!",
      service: updatedService,
    });
  } catch (error) {
    console.error("WhatsApp Ready error:", error);
    res.status(500).json({ message: "Failed to send notification" });
  }
};

