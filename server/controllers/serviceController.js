// server/controllers/serviceController.js
import prisma from "../models/prismaClient.js";

/**
 * Convert a media file record to a data: URI string (defensive for Buffers, Uint8Array, Array, base64 strings).
 * Expects file to have at least: { data, mimeType, type } where data may be Buffer/Uint8Array/Array/string.
 */
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

/**
 * Map an array of media file records to the API-friendly shape.
 * Ensures `data` is a proper data:<mime>;base64,... string (or null).
 */
function mapMediaFiles(mediaFiles = []) {
  if (!Array.isArray(mediaFiles)) return [];
  return mediaFiles.map((f) => ({
    id: f.id,
    fileName: f.fileName || f.name || null,
    mimeType: f.mimeType || f.type || null,
    data: toDataUri(f),
  }));
}

/* ============================================================
   📦 Get All Services
   @route   GET /api/services
   @access  Private
============================================================ */
export const getServices = async (req, res) => {
  try {
    // 1) fetch services for the authenticated user only
    const services = await prisma.service.findMany({
      where: {
        client: {
          userId: req.user.id, // Only get services for this user's clients
        },
      },
      include: {
        client: { select: { id: true, fullName: true, regNumber: true } },
        category: { select: { id: true, name: true } },
        subService: { select: { id: true, name: true } },
        serviceCostItems: true,
      },
      orderBy: { date: "desc" },
    });

    // 2) fetch media rows for all services in one query
    const serviceIds = services.map((s) => s.id);
    const mediaRows = serviceIds.length
      ? await prisma.serviceMedia.findMany({
          where: { serviceId: { in: serviceIds } },
          select: {
            id: true,
            fileName: true,
            mimeType: true,
            data: true,
            serviceId: true,
          },
        })
      : [];

    // 3) group media by serviceId
    const mediaByService = mediaRows.reduce((acc, m) => {
      (acc[m.serviceId] = acc[m.serviceId] || []).push(m);
      return acc;
    }, {});

    // 4) attach normalized mediaFiles and costItems
    const formatted = services.map((s) => ({
      ...s,
      mediaFiles: mapMediaFiles(mediaByService[s.id] || []),
      costItems: s.serviceCostItems || [],
    }));

    return res.json(formatted);
  } catch (error) {
    console.error("❌ Error fetching services:", error);
    return res
      .status(500)
      .json({ message: "Error fetching services", error: String(error) });
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
        userId: req.user.id, // Ensure client belongs to current user
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
            data: true,
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
  try {
    const { id } = req.params;

    if (!id || isNaN(Number(id))) {
      return res.status(400).json({ message: "Invalid or missing service ID" });
    }

    // fetch service and verify it belongs to the authenticated user
    const service = await prisma.service.findFirst({
      where: {
        id: parseInt(id),
        client: {
          userId: req.user.id, // Ensure service belongs to current user's client
        },
      },
      include: {
        client: true,
        category: true,
        subService: true,
        serviceCostItems: true,
      },
    });

    if (!service)
      return res
        .status(404)
        .json({ message: "Service not found or access denied" });

    // fetch media for this service
    const media = await prisma.serviceMedia.findMany({
      where: { serviceId: service.id },
      select: { id: true, fileName: true, mimeType: true, data: true },
    });

    // Format the response with all necessary details
    const modified = {
      // Basic service details
      id: service.id,
      date: service.date,
      notes: service.notes,
      partsCost: service.partsCost,
      partsGst: service.partsGst,
      laborCost: service.laborCost,
      laborGst: service.laborGst,
      cost: service.cost,
      status: service.status,

      // Include costItems from the relation
      costItems: service.serviceCostItems || [],

      // Related entities
      client: {
        id: service.client.id,
        fullName: service.client.fullName,
        phone: service.client.phone,
        email: service.client.email,
        address: service.client.address,
        vehicleMake: service.client.vehicleMake,
        vehicleModel: service.client.vehicleModel,
        vehicleYear: service.client.vehicleYear,
        regNumber: service.client.regNumber,
        vin: service.client.vin,
        carImage: service.client.carImage,
        adImage: service.client.adImage,
        staffPerson: service.client.staffPerson,
        receiverName: service.client.receiverName,
        damageImages: service.client.damageImages,
        createdAt: service.client.createdAt,
        updatedAt: service.client.updatedAt,
        userId: service.client.userId,
      },

      category: service.category
        ? {
            id: service.category.id,
            name: service.category.name,
            createdAt: service.category.createdAt,
            updatedAt: service.category.updatedAt,
          }
        : null,

      subService: service.subService
        ? {
            id: service.subService.id,
            name: service.subService.name,
            categoryId: service.subService.categoryId,
            createdAt: service.subService.createdAt,
            updatedAt: service.subService.updatedAt,
          }
        : null,

      // Media files
      mediaFiles: mapMediaFiles(media),

      // Timestamps
      createdAt: service.createdAt,
      updatedAt: service.updatedAt,
    };

    res.json(modified);
  } catch (error) {
    console.error("❌ Error fetching service:", error);
    res
      .status(500)
      .json({ message: "Error fetching service", error: String(error) });
  }
};

/* ============================================================
   ➕ Create a New Service (with GST fields)
   @route   POST /api/services
   @access  Private
============================================================ */
export const createService = async (req, res) => {
  try {
    const {
      clientId,
      categoryId,
      subServiceId,
      notes,
      date,
      partsCost,
      laborCost,
      partsGst,
      laborGst,
      cost,
      status,
      costItems,
    } = req.body;

    if (!clientId || !date) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Verify the client belongs to the authenticated user
    const client = await prisma.client.findFirst({
      where: {
        id: parseInt(clientId),
        userId: req.user.id, // Ensure client belongs to current user
      },
    });

    if (!client) {
      return res.status(403).json({
        message: "You are not authorized to create a service for this client",
      });
    }

    // Handle costItems if provided
    let parsedCostItems = [];
    let totalParts = 0,
      totalLabor = 0,
      totalGst = 0;

    if (costItems) {
      try {
        parsedCostItems =
          typeof costItems === "string" ? JSON.parse(costItems) : costItems;

        // Calculate totals from costItems
        totalParts = parsedCostItems.reduce(
          (sum, item) => sum + (parseFloat(item.partCost) || 0),
          0
        );
        totalLabor = parsedCostItems.reduce(
          (sum, item) => sum + (parseFloat(item.laborCost) || 0),
          0
        );
        totalGst = parsedCostItems.reduce((sum, item) => {
          const partGst =
            ((parseFloat(item.partCost) || 0) *
              (parseFloat(item.partGst) || 0)) /
            100;
          const laborGst =
            ((parseFloat(item.laborCost) || 0) *
              (parseFloat(item.laborGst) || 0)) /
            100;
          return sum + partGst + laborGst;
        }, 0);
      } catch (e) {
        console.error("Error parsing costItems:", e);
        return res.status(400).json({ message: "Invalid costItems format" });
      }
    } else {
      // Use legacy fields
      const pCost = parseFloat(partsCost || 0);
      const lCost = parseFloat(laborCost || 0);
      const pGst = parseFloat(partsGst || 0);
      const lGst = parseFloat(laborGst || 0);

      totalParts = pCost;
      totalLabor = lCost;
      totalGst = (pCost * pGst) / 100 + (lCost * lGst) / 100;
    }

    const computedCost =
      cost !== undefined && cost !== null
        ? parseFloat(cost)
        : totalParts + totalLabor + totalGst;

    // Create the service
    const service = await prisma.service.create({
      data: {
        date: new Date(date),
        partsCost: totalParts,
        partsGst: totalParts > 0 ? (totalGst / totalParts) * 100 : 0,
        laborCost: totalLabor,
        laborGst: totalLabor > 0 ? (totalGst / totalLabor) * 100 : 0,
        cost: computedCost,
        status: status || "Pending",
        notes: notes || null,
        clientId: parseInt(clientId),
        categoryId: categoryId ? parseInt(categoryId) : null,
        subServiceId: subServiceId ? parseInt(subServiceId) : null,
      },
    });

    // Create cost items if provided
    if (parsedCostItems.length > 0) {
      await prisma.serviceCostItem.createMany({
        data: parsedCostItems.map((item) => ({
          serviceId: service.id,
          partName: item.partName || "",
          partCost: parseFloat(item.partCost) || 0,
          partGst: parseFloat(item.partGst) || 0,
          laborCost: parseFloat(item.laborCost) || 0,
          laborGst: parseFloat(item.laborGst) || 0,
          totalCost:
            (parseFloat(item.partCost) || 0) +
            ((parseFloat(item.partCost) || 0) *
              (parseFloat(item.partGst) || 0)) /
              100 +
            (parseFloat(item.laborCost) || 0) +
            ((parseFloat(item.laborCost) || 0) *
              (parseFloat(item.laborGst) || 0)) /
              100,
        })),
      });
    }

    // Save media to DB as binary
    if (req.files?.length) {
      for (const file of req.files) {
        await prisma.serviceMedia.create({
          data: {
            serviceId: service.id,
            fileName: file.originalname,
            mimeType: file.mimetype,
            data: file.buffer,
          },
        });
      }
    }

    // Fetch the created service with cost items
    const createdService = await prisma.service.findUnique({
      where: { id: service.id },
      include: {
        serviceCostItems: true,
      },
    });

    const media = await prisma.serviceMedia.findMany({
      where: { serviceId: service.id },
    });

    res.status(201).json({
      message: "Service created successfully",
      service: {
        ...createdService,
        mediaFiles: mapMediaFiles(media),
      },
    });
  } catch (error) {
    console.error("Error creating service:", error);
    res
      .status(500)
      .json({ message: "Error creating service", error: String(error) });
  }
};

/* ============================================================
   ✏️ Update Existing Service (with GST fields)
   @route   PUT /api/services/:id
   @access  Private
============================================================ */
export const updateService = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || isNaN(Number(id))) {
      return res.status(400).json({ message: "Invalid service ID" });
    }

    // Verify the service belongs to the authenticated user
    const existingService = await prisma.service.findFirst({
      where: {
        id: parseInt(id),
        client: {
          userId: req.user.id, // Ensure service belongs to current user's client
        },
      },
    });

    if (!existingService) {
      return res
        .status(404)
        .json({ message: "Service not found or access denied" });
    }

    const {
      clientId,
      categoryId,
      subServiceId,
      notes,
      date,
      partsCost,
      laborCost,
      partsGst,
      laborGst,
      cost,
      status,
      costItems,
    } = req.body;

    // If changing client, verify the new client belongs to the authenticated user
    if (clientId && parseInt(clientId) !== existingService.clientId) {
      const client = await prisma.client.findFirst({
        where: {
          id: parseInt(clientId),
          userId: req.user.id, // Ensure new client belongs to current user
        },
      });

      if (!client) {
        return res.status(403).json({
          message:
            "You are not authorized to assign this service to the specified client",
        });
      }
    }

    // Handle costItems if provided
    let parsedCostItems = [];
    let totalParts = 0,
      totalLabor = 0,
      totalGst = 0;

    if (costItems) {
      try {
        parsedCostItems =
          typeof costItems === "string" ? JSON.parse(costItems) : costItems;

        // Calculate totals from costItems
        totalParts = parsedCostItems.reduce(
          (sum, item) => sum + (parseFloat(item.partCost) || 0),
          0
        );
        totalLabor = parsedCostItems.reduce(
          (sum, item) => sum + (parseFloat(item.laborCost) || 0),
          0
        );
        totalGst = parsedCostItems.reduce((sum, item) => {
          const partGst =
            ((parseFloat(item.partCost) || 0) *
              (parseFloat(item.partGst) || 0)) /
            100;
          const laborGst =
            ((parseFloat(item.laborCost) || 0) *
              (parseFloat(item.laborGst) || 0)) /
            100;
          return sum + partGst + laborGst;
        }, 0);
      } catch (e) {
        console.error("Error parsing costItems:", e);
        return res.status(400).json({ message: "Invalid costItems format" });
      }
    } else {
      // Use legacy fields
      const pCost = parseFloat(partsCost || 0);
      const lCost = parseFloat(laborCost || 0);
      const pGst = parseFloat(partsGst || 0);
      const lGst = parseFloat(laborGst || 0);

      totalParts = pCost;
      totalLabor = lCost;
      totalGst = (pCost * pGst) / 100 + (lCost * lGst) / 100;
    }

    const computedCost =
      cost !== undefined && cost !== null
        ? parseFloat(cost)
        : totalParts + totalLabor + totalGst;

    const updateData = {
      date: date ? new Date(date) : undefined,
      partsCost: totalParts,
      partsGst: totalParts > 0 ? (totalGst / totalParts) * 100 : 0,
      laborCost: totalLabor,
      laborGst: totalLabor > 0 ? (totalGst / totalLabor) * 100 : 0,
      cost: computedCost,
      status,
      notes: notes || undefined,
      clientId: clientId ? parseInt(clientId) : undefined,
      categoryId: categoryId ? parseInt(categoryId) : undefined,
      subServiceId: subServiceId ? parseInt(subServiceId) : undefined,
    };

    Object.keys(updateData).forEach(
      (k) => updateData[k] === undefined && delete updateData[k]
    );

    // Update the service
    const updatedService = await prisma.service.update({
      where: { id: parseInt(id) },
      data: updateData,
    });

    // If costItems provided, update them
    if (parsedCostItems.length > 0) {
      // Delete existing cost items
      await prisma.serviceCostItem.deleteMany({
        where: { serviceId: parseInt(id) },
      });

      // Create new cost items
      await prisma.serviceCostItem.createMany({
        data: parsedCostItems.map((item) => ({
          serviceId: parseInt(id),
          partName: item.partName || "",
          partCost: parseFloat(item.partCost) || 0,
          partGst: parseFloat(item.partGst) || 0,
          laborCost: parseFloat(item.laborCost) || 0,
          laborGst: parseFloat(item.laborGst) || 0,
          totalCost:
            (parseFloat(item.partCost) || 0) +
            ((parseFloat(item.partCost) || 0) *
              (parseFloat(item.partGst) || 0)) /
              100 +
            (parseFloat(item.laborCost) || 0) +
            ((parseFloat(item.laborCost) || 0) *
              (parseFloat(item.laborGst) || 0)) /
              100,
        })),
      });
    }

    // Save uploaded files
    if (req.files?.length) {
      for (const file of req.files) {
        await prisma.serviceMedia.create({
          data: {
            serviceId: updatedService.id,
            fileName: file.originalname,
            mimeType: file.mimetype,
            data: file.buffer,
          },
        });
      }
    }

    // Fetch the updated service with cost items
    const serviceWithItems = await prisma.service.findUnique({
      where: { id: parseInt(id) },
      include: {
        serviceCostItems: true,
      },
    });

    const media = await prisma.serviceMedia.findMany({
      where: { serviceId: updatedService.id },
    });

    res.json({
      message: "Service updated successfully",
      service: {
        ...serviceWithItems,
        mediaFiles: mapMediaFiles(media),
      },
    });
  } catch (error) {
    console.error("Error updating service:", error);
    res
      .status(500)
      .json({ message: "Error updating service", error: String(error) });
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
          userId: req.user.id, // Ensure service belongs to current user's client
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
          userId: req.user.id
        }
      },
      include: {
        client: {
          select: {
            id: true,
            fullName: true,
            regNumber: true,
            vehicleMake: true,
            vehicleModel: true
          }
        },
        category: {
          select: {
            name: true
          }
        },
        subService: {
          select: {
            name: true
          }
        },
        serviceCostItems: true
      }
    });

    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    res.json({
      ...service,
      costItems: service.serviceCostItems
    });
  } catch (error) {
    console.error("Error fetching service for billing:", error);
    res.status(500).json({ message: "Error fetching service" });
  }
};