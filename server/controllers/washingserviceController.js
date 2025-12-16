import prisma from "../models/prismaClient.js";

/* ================================
   GET WASHING SERVICE TYPES
   (Categories + Sub Services)
================================ */
const calculateTotalWithGst = (cost = 0, gst = 0) => {
  const c = Number(cost);
  const g = Number(gst);

  if (Number.isNaN(c) || Number.isNaN(g)) {
    return 0;
  }

  return c + (c * g) / 100;
};

export const getWashingServiceTypes = async (req, res) => {
  try {
    const categories = await prisma.washingServiceCategory.findMany({
      include: {
        subServices: true,
      },
    });
    const calculateTotalWithGst = (cost = 0, gst = 0) => {
  return Number(cost) + (Number(cost) * Number(gst)) / 100;
};


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
   GET ALL WASHING SERVICES (ADMIN)
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
   DELETE WASHING SERVICE
================================ */
export const deleteWashingService = async (req, res) => {
  try {
    const serviceId = Number(req.params.id);

    const service = await prisma.washingService.findFirst({
      where:
        req.user.role === "ADMIN"
          ? { id: serviceId }
          : { id: serviceId, client: { userId: req.user.id } },
    });

    if (!service) {
      return res.status(404).json({
        message: "Service not found or access denied",
      });
    }

    await prisma.washingService.delete({
      where: { id: serviceId },
    });

    res.json({ message: "Washing service deleted successfully" });
  } catch (err) {
    console.error("DELETE ERROR:", err);
    res.status(500).json({
      message: "Failed to delete washing service",
    });
  }
};
