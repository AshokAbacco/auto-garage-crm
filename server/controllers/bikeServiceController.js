import prisma from "../models/prismaClient.js";

/* ✅ SERVICE TYPES (GLOBAL - OPTIONAL) */
export const getBikeServiceTypes = async (req, res) => {
  try {
    const data = await prisma.bikeServiceCategory.findMany({
      include: { subServices: true },
      orderBy: { id: "asc" },
    });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: "Failed to load service types", error: err.message });
  }
};

/* ✅ ALL BIKE SERVICES */
export const getBikeServices = async (req, res) => {
  try {
    const services = await prisma.bikeService.findMany({
      include: {
        client: true,
        category: true,
        subService: true,
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(services);
  } catch (err) {
    console.error("❌ getBikeServices error:", err);
    res.status(500).json({
      message: "Failed to fetch bike services",
      error: err.message,
    });
  }
};

/* ✅ SERVICES BY BIKE */
export const getBikeServicesByClient = async (req, res) => {
  try {
    const services = await prisma.bikeService.findMany({
      where: {
        clientId: Number(req.params.clientId),
        client: { userId: req.user.id },
      },
      include: { category: true, subService: true },
    });

    res.json(services);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch client services", error: err.message });
  }
};

/* ✅ SINGLE SERVICE */
export const getBikeServiceById = async (req, res) => {
  try {
    const service = await prisma.bikeService.findFirst({
      where: {
        id: Number(req.params.id),
        client: { userId: req.user.id },
      },
      include: {
        client: true,
        category: true,
        subService: true,
      },
    });

    if (!service) return res.status(404).json({ message: "Service not found" });
    res.json(service);
  } catch (err) {
    res.status(500).json({ message: "Failed to load service", error: err.message });
  }
};

/* ✅ CREATE SERVICE */
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

    const total =
      Number(partsCost || 0) +
      (Number(partsCost || 0) * Number(partsGst || 0)) / 100 +
      Number(laborCost || 0) +
      (Number(laborCost || 0) * Number(laborGst || 0)) / 100;

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
        cost: total,
        status: status || "Pending",
      },
    });

    res.status(201).json(service);
  } catch (err) {
    console.error("❌ createBikeService error:", err);
    res.status(500).json({ message: "Service creation failed", error: err.message });
  }
};

/* ✅ UPDATE */
/* ✅ UPDATE BIKE SERVICE WITH FORM DATA SUPPORT */
export const updateBikeService = async (req, res) => {
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
      cost,
    } = req.body;

    const updated = await prisma.bikeService.update({
      where: { id: Number(req.params.id) },
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
        cost: Number(cost || 0),
        status,
      },
    });

    res.json(updated);
  } catch (err) {
    console.error("❌ updateBikeService error:", err);
    res.status(500).json({
      message: "Failed to update bike service",
      error: err.message,
    });
  }
};


/* ✅ ✅ ✅ BIKE-BASED CATEGORIES (THIS IS WHAT FRONTEND NEEDS) */
export const getCategoriesByBike = async (req, res) => {
  try {
    const { bikeId } = req.params;

    // ✅ Get bike brand from Bike table
    const bike = await prisma.bike.findUnique({
      where: { id: Number(bikeId) },
    });

    if (!bike) {
      return res.status(404).json({ message: "Bike not found" });
    }

    // ✅ Fetch only matching brand + universal categories
    const categories = await prisma.bikeServiceCategory.findMany({
      where: {
        OR: [
          { bikeBrand: bike.brand },
          { bikeBrand: null },
        ],
      },
      include: {
        subServices: true,
      },
    });

    res.json(categories);
  } catch (error) {
    console.error("❌ Fetch categories error:", error);
    res.status(500).json({ message: "Failed to load categories" });
  }
};

/* ✅ DELETE */
export const deleteBikeService = async (req, res) => {
  await prisma.bikeService.delete({
    where: { id: Number(req.params.id) },
  });

  res.json({ message: "Service Deleted" });
};
