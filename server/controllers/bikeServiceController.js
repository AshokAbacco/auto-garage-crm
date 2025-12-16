import prisma from "../models/prismaClient.js";

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
    res.status(500).json({
      message: "Failed to load service types",
      error: err.message,
    });
  }
};

/* =====================================================
   ALL BIKE SERVICES (USER-SCOPED) ✅ FIXED
===================================================== */
export const getBikeServices = async (req, res) => {
  try {
    const services = await prisma.bikeService.findMany({
      where: {
        client: {
          userId: req.user.id, // ✅ CORRECT RELATION FILTER
        },
      },
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

/* =====================================================
   SERVICES BY CLIENT
===================================================== */
export const getBikeServicesByClient = async (req, res) => {
  try {
    const services = await prisma.bikeService.findMany({
      where: {
        clientId: Number(req.params.clientId),
        client: {
          userId: req.user.id,
        },
      },
      include: {
        category: true,
        subService: true,
      },
    });

    res.json(services);
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch client services",
      error: err.message,
    });
  }
};


/* =====================================================
   SINGLE SERVICE (DETAILS PAGE) ✅ FIXED
===================================================== */
export const getBikeServiceById = async (req, res) => {
  try {
    const service = await prisma.bikeService.findFirst({
      where: {
        id: Number(req.params.id),
        client: {
          userId: req.user.id, // ✅ IMPORTANT
        },
      },
      include: {
        client: true,
        category: true,
        subService: true,
      },
    });

    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    res.json(service);
  } catch (err) {
    res.status(500).json({
      message: "Failed to load service",
      error: err.message,
    });
  }
};


/* =====================================================
   CREATE SERVICE ✅ FIXED (userId ADDED)
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
      },
    });

    res.status(201).json(service);
  } catch (err) {
    console.error("❌ createBikeService error:", err);
    res.status(500).json({
      message: "Service creation failed",
      error: err.message,
    });
  }
};


/* =====================================================
   UPDATE SERVICE
===================================================== */
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
    } = req.body;

    if (!clientId || !categoryId || !subServiceId || !date) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const total =
      Number(partsCost || 0) +
      (Number(partsCost || 0) * Number(partsGst || 0)) / 100 +
      Number(laborCost || 0) +
      (Number(laborCost || 0) * Number(laborGst || 0)) / 100;

    const updated = await prisma.bikeService.update({
      where: {
        id: Number(req.params.id), // ✅ ONLY ID
      },
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

    res.json(updated);
  } catch (err) {
    console.error("❌ updateBikeService error:", err);
    res.status(500).json({
      message: "Failed to update bike service",
      error: err.message,
    });
  }
};

/* =====================================================
   BIKE-BASED CATEGORIES
===================================================== */
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
        OR: [{ bikeBrand: bike.brand }, { bikeBrand: null }],
      },
      include: {
        subServices: true,
      },
    });

    res.json(categories);
  } catch (error) {
    console.error("❌ Fetch categories error:", error);
    res.status(500).json({
      message: "Failed to load categories",
    });
  }
};

/* =====================================================
   DELETE SERVICE
===================================================== */
export const deleteBikeService = async (req, res) => {
  try {
    await prisma.bikeService.delete({
      where: {
        id: Number(req.params.id),
        userId: req.user.id,
      },
    });

    res.json({ message: "Service Deleted" });
  } catch (err) {
    res.status(500).json({
      message: "Failed to delete service",
      error: err.message,
    });
  }
};
