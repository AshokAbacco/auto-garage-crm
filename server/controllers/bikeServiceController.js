import prisma from "../models/prismaClient.js";
import { getOwnerUserId } from "../utils/getAdminId.js";

/* =====================================================
   SERVICE TYPES (GLOBAL)
===================================================== */
export const getBikeServiceTypes = async (req, res) => {
  try {
    const data = await prisma.bikeServiceCategory.findMany({
      include: { subServices: true },
      orderBy: { id: "asc" },
    });

    res.json(data);
  } catch (err) {
    console.error("getBikeServiceTypes error:", err);
    res.status(500).json({
      message: "Failed to load service types",
    });
  }
};

/* =====================================================
   GET ALL BIKE SERVICES
   GET /api/bike-services
===================================================== */
export const getBikeServices = async (req, res) => {
  try {
    const ownerUserId = getOwnerUserId(req.user);

    const whereCondition =
      req.user.role === "user"
        ? { ownerUserId }
        : { ownerUserId, createdById: req.user.id };

    const services = await prisma.bikeService.findMany({
      where: whereCondition,
      include: {
        client: true,
        category: true,
        subService: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // ✅ Ensure cost is always calculated
    const fixedServices = services.map((s) => {
      const total =
        Number(s.partsCost || 0) +
        (Number(s.partsCost || 0) * Number(s.partsGst || 0)) / 100 +
        Number(s.laborCost || 0) +
        (Number(s.laborCost || 0) * Number(s.laborGst || 0)) / 100;

      return {
        ...s,
        cost:
          s.cost && Number(s.cost) > 0
            ? Number(s.cost)
            : Number(total.toFixed(2)),
      };
    });

    res.json(fixedServices);
  } catch (err) {
    console.error("getBikeServices error:", err);
    res.status(500).json({
      message: "Failed to fetch bike services",
    });
  }
};

/* =====================================================
   GET SERVICES BY CLIENT
   GET /api/bike-services/client/:clientId
===================================================== */
export const getBikeServicesByClient = async (req, res) => {
  try {
    const ownerUserId = getOwnerUserId(req.user);
    const clientId = Number(req.params.clientId);

    const whereCondition =
      req.user.role === "user"
        ? { clientId, ownerUserId }
        : { clientId, ownerUserId, createdById: req.user.id };

    const services = await prisma.bikeService.findMany({
      where: whereCondition,
      include: {
        category: true,
        subService: true,
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(services);
  } catch (err) {
    console.error("getBikeServicesByClient error:", err);
    res.status(500).json({
      message: "Failed to fetch services",
    });
  }
};

/* =====================================================
   GET SINGLE SERVICE
   GET /api/bike-services/:id
===================================================== */
export const getBikeServiceById = async (req, res) => {
  try {
    const ownerUserId = getOwnerUserId(req.user);
    const id = Number(req.params.id);

    const service = await prisma.bikeService.findFirst({
      where:
        req.user.role === "user"
          ? { id, ownerUserId }
          : { id, ownerUserId, createdById: req.user.id },
      include: {
        client: true,
        category: true,
        subService: true,
      },
    });

    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    // 🔥 Always calculate correct total
    const calculatedTotal =
      Number(service.partsCost || 0) +
      (Number(service.partsCost || 0) * Number(service.partsGst || 0)) / 100 +
      Number(service.laborCost || 0) +
      (Number(service.laborCost || 0) * Number(service.laborGst || 0)) / 100;

    res.json({
      ...service,
      cost:
        service.cost && Number(service.cost) > 0
          ? Number(service.cost)
          : Number(calculatedTotal.toFixed(2)),
    });
  } catch (err) {
    console.error("getBikeServiceById error:", err);
    res.status(500).json({
      message: "Failed to load service",
    });
  }
};

/* =====================================================
   CREATE SERVICE
   POST /api/bike-services
===================================================== */
export const createBikeService = async (req, res) => {
  try {
    const {
      clientId,
      categoryId,
      subServiceId,
      date,
      notes,
      partsCost,
      partsGst,
      laborCost,
      laborGst,
      status,
    } = req.body;

    if (!clientId || !categoryId || !subServiceId || !date) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const total =
      Number(partsCost || 0) +
      (Number(partsCost || 0) * Number(partsGst || 0)) / 100 +
      Number(laborCost || 0) +
      (Number(laborCost || 0) * Number(laborGst || 0)) / 100;

    const ownerUserId = getOwnerUserId(req.user);

    const service = await prisma.bikeService.create({
      data: {
        clientId: Number(clientId),
        categoryId: Number(categoryId),
        subServiceId: Number(subServiceId),
        date: new Date(date),
        notes,

        partsCost: Number(partsCost || 0),
        partsGst: Number(partsGst || 0),
        laborCost: Number(laborCost || 0),
        laborGst: Number(laborGst || 0),
        cost: Number(total.toFixed(2)),
        status: status || "Pending",

        ownerUserId,
        createdById: req.user.id,
      },
    });

    res.status(201).json(service);
  } catch (err) {
    console.error("createBikeService error:", err);
    res.status(500).json({
      message: "Service creation failed",
    });
  }
};

/* =====================================================
   UPDATE SERVICE
   PUT /api/bike-services/:id
===================================================== */
export const updateBikeService = async (req, res) => {
  try {
    const ownerUserId = getOwnerUserId(req.user);
    const id = Number(req.params.id);

    const {
      clientId,
      categoryId,
      subServiceId,
      date,
      notes,
      partsCost,
      partsGst,
      laborCost,
      laborGst,
      status,
    } = req.body;

    if (!clientId || !categoryId || !subServiceId || !date) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const total =
      Number(partsCost || 0) +
      (Number(partsCost || 0) * Number(partsGst || 0)) / 100 +
      Number(laborCost || 0) +
      (Number(laborCost || 0) * Number(laborGst || 0)) / 100;

    const updated = await prisma.bikeService.updateMany({
      where:
        req.user.role === "user"
          ? { id, ownerUserId }
          : { id, ownerUserId, createdById: req.user.id },
      data: {
        clientId: Number(clientId),
        categoryId: Number(categoryId),
        subServiceId: Number(subServiceId),
        date: new Date(date),
        notes,
        partsCost: Number(partsCost || 0),
        partsGst: Number(partsGst || 0),
        laborCost: Number(laborCost || 0),
        laborGst: Number(laborGst || 0),
        cost: Number(total.toFixed(2)),
        status,
      },
    });

    if (updated.count === 0) {
      return res.status(403).json({ message: "Unauthorized update" });
    }

    res.json({ message: "Service updated successfully" });
  } catch (err) {
    console.error("updateBikeService error:", err);
    res.status(500).json({
      message: "Failed to update bike service",
    });
  }
};

/* =====================================================
   DELETE SERVICE
   DELETE /api/bike-services/:id
===================================================== */
export const deleteBikeService = async (req, res) => {
  try {
    const ownerUserId = getOwnerUserId(req.user);
    const id = Number(req.params.id);

    const result = await prisma.bikeService.deleteMany({
      where:
        req.user.role === "user"
          ? { id, ownerUserId }
          : { id, ownerUserId, createdById: req.user.id },
    });

    if (result.count === 0) {
      return res.status(403).json({
        message: "Unauthorized or service not found",
      });
    }

    res.json({ message: "Service deleted successfully" });
  } catch (err) {
    console.error("deleteBikeService error:", err);
    res.status(500).json({
      message: "Failed to delete service",
    });
  }
};

export const getCategoriesByBike = async (req, res) => {
  try {
    const { bikeId } = req.params;

    const bike = await prisma.bike.findUnique({
      where: { id: Number(bikeId) },
    });

    if (!bike) {
      return res.status(404).json({ message: "Bike not found" });
    }

    const categories = await prisma.bikeServiceCategory.findMany({
      where: {
        OR: [
          { bikeBrand: bike.bikeBrand },
          { bikeBrand: null },
        ],
      },
      include: {
        subServices: true,
      },
      orderBy: { id: "asc" },
    });

    res.json(categories);
  } catch (error) {
    console.error("getCategoriesByBike error:", error);
    res.status(500).json({
      message: "Failed to load categories",
    });
  }
};