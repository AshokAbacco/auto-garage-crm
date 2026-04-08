import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ==============================
// SERVICES
// ==============================
export const getServices = async (crmType) => {
  return prisma.marketplaceService.findMany({
    where: {
      isActive: true,
      ...(crmType && { crmType }),
    },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      image: true,
      mainCategory: true,
      subCategory: true,
    },
    orderBy: { name: "asc" },
  });
};

// ==============================
// GARAGES BY SERVICE
// ==============================
export const getGaragesByService = async (externalServiceId, carType) => {
  const service = await prisma.marketplaceService.findUnique({
    where: { externalServiceId },
  });

  if (!service) throw new Error("Service not found");

  const garages = await prisma.garageMarketplaceService.findMany({
    where: {
      serviceId: service.id,
      isActive: true,
    },
    include: {
      user: {
        select: {
          id: true,
          companyName: true,
        },
      },
      pricing: true,
    },
  });

  const results = [];

  for (const g of garages) {
    const activeBooking = await prisma.marketplaceBooking.findFirst({
      where: {
        garageId: g.user.id,
        status: {
          in: ["PENDING", "ACCEPTED"],
        },
      },
    });

    if (activeBooking) continue;

    let selectedPricing = null;

    if (carType) {
      selectedPricing = g.pricing.find((p) => p.carType === carType);
    }

    if (carType && !selectedPricing) continue;

    const basePrice = service.basePrice || 0;

    let garagePrice = 0;
    let discount = 0;

    if (selectedPricing) {
      garagePrice = selectedPricing.price;
      discount = selectedPricing.discount || 0;
    } else {
      garagePrice = g.price || basePrice;
      discount = g.discount || 0;
    }

    const finalPrice = garagePrice - discount;

    results.push({
      garageId: g.user.id,
      name: g.user.companyName,

      serviceId: service.id,
      externalServiceId: service.externalServiceId,

      mainCategory: service.mainCategory || "General",
      subCategory: service.subCategory || "General",
      
      basePrice,
      garagePrice,
      discount,
      finalPrice,

      carType: carType || null,
    });
  }

  return results;
};

// ==============================
// CREATE BOOKING (FINAL FIXED)
// ==============================
export const createBooking = async (data) => {
  const { externalServiceId, garageId, scheduledAt, clientId, carType } = data;

  if (!externalServiceId || !garageId || !clientId || !scheduledAt) {
    throw new Error("Missing required fields");
  }

  const parsedGarageId = Number(garageId);
  const parsedClientId = Number(clientId);
  const parsedDate = new Date(scheduledAt);

  if (isNaN(parsedGarageId) || isNaN(parsedClientId)) {
    throw new Error("Invalid IDs");
  }

  if (isNaN(parsedDate.getTime())) {
    throw new Error("Invalid date");
  }

  // =========================
  // STEP 1: Resolve Service
  // =========================
  const service = await prisma.marketplaceService.findUnique({
    where: { externalServiceId },
  });

  if (!service) throw new Error("Service not found");

  // =========================
  // STEP 2: Get Garage Service
  // =========================
  const garageService = await prisma.garageMarketplaceService.findFirst({
    where: {
      serviceId: service.id,
      userId: parsedGarageId,
    },
    include: {
      pricing: true,
    },
  });

  if (!garageService) throw new Error("Garage service not found");

  // =========================
  // STEP 3: Pricing
  // =========================
  const basePrice = service.basePrice || 0;

  let selectedPricing = null;

  if (carType) {
    selectedPricing = garageService.pricing.find((p) => p.carType === carType);
  }

  let garagePrice = 0;
  let discount = 0;

  if (selectedPricing) {
    garagePrice = selectedPricing.price;
    discount = selectedPricing.discount || 0;
  } else {
    garagePrice = garageService.price || basePrice;
    discount = garageService.discount || 0;
  }

  const finalPrice = garagePrice - discount;

  // =========================
  // STEP 4: CREATE BOOKING
  // =========================
  return prisma.marketplaceBooking.create({
    data: {
      // 🔥 FIXED RELATION (IMPORTANT)
      service: {
        connect: { id: service.id },
      },

      garage: {
        connect: { id: parsedGarageId },
      },
      client: {
        connect: { id: parsedClientId },
      },

      scheduledAt: parsedDate,
      carType: carType || null,

      serviceName: service.name,
      mainCategory: service.mainCategory || "General",
      subCategory: service.subCategory || "General",
     
      basePriceSnapshot: basePrice,
      garagePriceSnapshot: garagePrice,
      discountSnapshot: discount,
      finalPrice: finalPrice,

      status: "PENDING",
    },
  });
};

// ==============================
// GET BOOKING
// ==============================
export const getBookingById = async (id) => {
  return prisma.marketplaceBooking.findUnique({
    where: { id: Number(id) },
  });
};

// ==============================
// PACKAGES
// ==============================
export const createPackage = async (userId, data) => {
  const { name, price, serviceIds } = data;

  return prisma.$transaction(async (tx) => {
    const pkg = await tx.marketplacePackage.create({
      data: {
        userId,
        name,
        price: Number(price),
      },
    });

    if (serviceIds?.length) {
      for (const sid of serviceIds) {
        const service = await tx.marketplaceService.findUnique({
          where: { id: Number(sid) },
        });

        if (!service) continue;

        await tx.marketplacePackageItem.create({
          data: {
            packageId: pkg.id,
            serviceId: service.id,
            serviceName: service.name,
            basePrice: service.basePrice || 0,
          },
        });
      }
    }

    return pkg;
  });
};

// ==============================
// GET PACKAGES
// ==============================
export const getPackages = async (userId) => {
  return prisma.marketplacePackage.findMany({
    where: { userId },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });
};

// ==============================
export const deletePackage = async (id, userId) => {
  return prisma.marketplacePackage.delete({
    where: {
      id: Number(id),
      userId,
    },
  });
};

// ==============================
export const togglePackage = async (id, userId) => {
  const pkg = await prisma.marketplacePackage.findFirst({
    where: { id: Number(id), userId },
  });

  if (!pkg) throw new Error("Package not found");

  return prisma.marketplacePackage.update({
    where: { id: pkg.id },
    data: { isActive: !pkg.isActive },
  });
};

// ==============================
export const updateServiceDetails = async (serviceId, data) => {
  const updateData = {};

  if (data.description !== undefined) {
    updateData.description = data.description;
  }

  if (data.image !== undefined) {
    updateData.image = data.image;
  }

  return prisma.marketplaceService.update({
    where: { id: Number(serviceId) },
    data: updateData,
  });
};
