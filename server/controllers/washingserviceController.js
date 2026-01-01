import prisma from "../models/prismaClient.js";

/* ================================
   HELPER FUNCTION
================================ */
const calculateTotalWithGst = (cost = 0, gst = 0) => {
  const c = Number(cost);
  const g = Number(gst);

  if (Number.isNaN(c) || Number.isNaN(g)) {
    return 0;
  }

  return c + (c * g) / 100;
};

/* ================================
   GET WASHING SERVICE TYPES
================================ */
export const getWashingServiceTypes = async (req, res) => {
  try {
    const categories = await prisma.washingServiceCategory.findMany({
      include: {
        subServices: true,
      },
    });

    res.json(categories);
  } catch (err) {
    console.error("GET TYPES ERROR:", err);
    res.status(500).json({
      message: "Failed to load washing service types",
    });
  }
};

/* ================================
   GET WASHING CATEGORIES BY BIKE
================================ */
export const getWashingCategoriesByBike = async (req, res) => {
  try {
    const bikeId = Number(req.params.bikeId);

    if (Number.isNaN(bikeId)) {
      return res.status(400).json({ message: "Invalid bike ID" });
    }

    const bike = await prisma.bike.findUnique({
      where: { id: bikeId },
    });

    if (!bike) {
      return res.status(404).json({ message: "Bike not found" });
    }

    const categories = await prisma.washingServiceCategory.findMany({
      where: {
        OR: [{ bikeBrand: bike.brand }, { bikeBrand: null }],
      },
      include: {
        subServices: true,
      },
    });

    res.json(categories);
  } catch (err) {
    console.error("GET BIKE CATEGORIES ERROR:", err);
    res.status(500).json({
      message: "Failed to load categories by bike",
    });
  }
};

/* ================================
   GET ALL WASHING SERVICES
================================ */
export const getWashingServices = async (req, res) => {
  try {
    const services = await prisma.washingService.findMany({
      include: {
        client: true,
        category: true,
        subService: true,
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(services);
  } catch (err) {
    console.error("GET SERVICES ERROR:", err);
    res.status(500).json({
      message: "Failed to fetch washing services",
    });
  }
};

/* ================================
   GET WASHING SERVICES BY CLIENT
================================ */
export const getWashingServicesByClient = async (req, res) => {
  try {
    const clientId = Number(req.params.clientId);

    const services = await prisma.washingService.findMany({
      where: {
        clientId,
        client: { userId: req.user.id },
      },
      include: {
        category: true,
        subService: true,
      },
    });

    res.json(services);
  } catch (err) {
    console.error("GET CLIENT SERVICES ERROR:", err);
    res.status(500).json({
      message: "Failed to fetch client services",
    });
  }
};

/* ================================
   GET SINGLE WASHING SERVICE
================================ */
export const getWashingServiceById = async (req, res) => {
  try {
    const service = await prisma.washingService.findUnique({
      where: { id: Number(req.params.id) },
      include: {
        client: true,
        category: true,
        subService: true,
        media: true,
      },
    });

    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    res.json(service);
  } catch (err) {
    res.status(500).json({ message: "Failed to load service" });
  }
};

/* ================================
   CREATE WASHING SERVICE
================================ */
export const createWashingService = async (req, res) => {
  try {
    const {
      clientId,
      categoryId,
      subServiceId,
      date,
      notes,
      partsCost,
      partsGst,
      status,
    } = req.body;

    const estimatedTotal = calculateTotalWithGst(partsCost, partsGst);

    const service = await prisma.washingService.create({
      data: {
        clientId: Number(clientId),
        categoryId: Number(categoryId),
        subServiceId: subServiceId ? Number(subServiceId) : null,
        date: new Date(date),
        notes,
        partsCost: Number(partsCost || 0),
        partsGst: Number(partsGst || 0),
        estimatedTotal,
        status: status || "PENDING",
      },
    });

    res.status(201).json(service);
  } catch (err) {
    console.error("CREATE ERROR:", err);
    res.status(500).json({ message: "Failed to create washing service" });
  }
};

/* ================================
   UPDATE WASHING SERVICE
================================ */
export const updateWashingService = async (req, res) => {
  try {
    const serviceId = Number(req.params.id);

    const {
      clientId,
      categoryId,
      subServiceId,
      date,
      notes,
      partsCost,
      partsGst,
      status,
    } = req.body;

    const estimatedTotal =
      partsCost !== undefined || partsGst !== undefined
        ? calculateTotalWithGst(partsCost ?? 0, partsGst ?? 0)
        : undefined;

    const updatedService = await prisma.washingService.update({
      where: { id: serviceId },
      data: {
        clientId: clientId ? Number(clientId) : undefined,
        categoryId: categoryId ? Number(categoryId) : undefined,
        subServiceId: subServiceId ? Number(subServiceId) : undefined,
        date: date ? new Date(date) : undefined,
        notes,
        partsCost:
          partsCost !== undefined ? Number(partsCost) : undefined,
        partsGst:
          partsGst !== undefined ? Number(partsGst) : undefined,
        estimatedTotal,
        status,
      },
    });

    res.json(updatedService);
  } catch (err) {
    console.error("UPDATE ERROR:", err);
    res.status(500).json({
      message: "Failed to update washing service",
      error: err.message,
    });
  }
};
/* ================================
   CREATE WASHING CATEGORY
================================ */
export const createWashingCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({ message: "Category name is required" });
    }

    const category = await prisma.washingServiceCategory.create({
      data: {
        name: name.trim(),
        description: description || null,
      },
    });

    res.status(201).json(category);
  } catch (err) {
    console.error("CREATE CATEGORY ERROR:", err);

    if (err.code === "P2002") {
      return res.status(409).json({ message: "Category already exists" });
    }

    res.status(500).json({ message: "Failed to create category" });
  }
};

/* ================================
   CREATE WASHING SUB SERVICE
================================ */
export const createWashingSubService = async (req, res) => {
  try {
    const { name, categoryId, description } = req.body;

    if (!name?.trim() || !categoryId) {
      return res.status(400).json({
        message: "Sub-service name and categoryId are required",
      });
    }

    const subService = await prisma.washingSubService.create({
      data: {
        name: name.trim(),
        description: description || null,
        categoryId: Number(categoryId),
      },
    });

    res.status(201).json(subService);
  } catch (err) {
    console.error("CREATE SUB SERVICE ERROR:", err);

    if (err.code === "P2002") {
      return res.status(409).json({ message: "Sub-service already exists" });
    }

    res.status(500).json({ message: "Failed to create sub-service" });
  }
};

/* ================================
   DELETE WASHING SERVICE
   Using Prisma Transaction
================================ */
export const deleteWashingService = async (req, res) => {
  const serviceId = Number(req.params.id);

  try {
    console.log("=".repeat(50));
    console.log("🗑️  DELETE REQUEST RECEIVED");
    console.log("Service ID:", serviceId);
    console.log("Type:", typeof serviceId);
    console.log("=".repeat(50));

    // Validate ID
    if (Number.isNaN(serviceId) || serviceId <= 0) {
      console.error("❌ Invalid service ID");
      return res.status(400).json({ 
        message: "Invalid service ID",
        receivedId: req.params.id 
      });
    }

    // Use Prisma transaction to delete everything atomically
    const result = await prisma.$transaction(async (tx) => {
      // 1. Check if service exists
      const service = await tx.washingService.findUnique({
        where: { id: serviceId },
        include: {
          billings: true,
          media: true,
        },
      });

      if (!service) {
        throw new Error("SERVICE_NOT_FOUND");
      }

      console.log("📋 Service found:", {
        id: service.id,
        clientId: service.clientId,
        billings: service.billings.length,
        media: service.media.length,
      });

      // 2. Delete billing service links
      if (service.billings.length > 0) {
        const deletedBillings = await tx.washBillingService.deleteMany({
          where: { washingServiceId: serviceId },
        });
        console.log("✅ Deleted billing links:", deletedBillings.count);
      }

      // 3. Delete media files
      if (service.media.length > 0) {
        const deletedMedia = await tx.washingServiceMedia.deleteMany({
          where: { washingServiceId: serviceId },
        });
        console.log("✅ Deleted media files:", deletedMedia.count);
      }

      // 4. Delete the service
      const deletedService = await tx.washingService.delete({
        where: { id: serviceId },
      });
      console.log("✅ Service deleted successfully");

      return {
        deletedService,
        clientId: service.clientId,
      };
    });

    console.log("=".repeat(50));
    console.log("✅ DELETE COMPLETED SUCCESSFULLY");
    console.log("=".repeat(50));

    return res.status(200).json({
      success: true,
      message: "Service deleted successfully",
      deletedServiceId: serviceId,
    });

  } catch (err) {
    console.log("=".repeat(50));
    console.error("❌ DELETE FAILED");
    console.error("Error name:", err.name);
    console.error("Error message:", err.message);
    console.error("Error code:", err.code);
    console.error("Full error:", err);
    console.log("=".repeat(50));

    // Handle specific errors
    if (err.message === "SERVICE_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    if (err.code === "P2003") {
      return res.status(409).json({
        success: false,
        message: "Cannot delete: Service has dependent records",
        details: err.meta?.field_name,
      });
    }

    if (err.code === "P2025") {
      return res.status(404).json({
        success: false,
        message: "Service not found or already deleted",
      });
    }

    // Generic error
    return res.status(500).json({
      success: false,
      message: "Failed to delete service",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};