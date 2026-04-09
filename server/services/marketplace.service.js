import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ==============================
// SHARED HELPER
// ==============================
const resolveService = async (externalServiceId, serviceName, appPrice) => {
  let service = await prisma.marketplaceService.findFirst({
    where: { externalServiceId: String(externalServiceId) },
  });

  if (!service) {
    service = await prisma.marketplaceService.findFirst({
      where: { slug: String(externalServiceId) },
    });
  }

  if (!service) {
    service = await prisma.marketplaceService.create({
      data: {
        name: serviceName || "App Service",
        slug: externalServiceId,
        crmType: "CAR",
        externalServiceId: String(externalServiceId),
        mainCategory: "General",
        subCategory: "General",
        basePrice: appPrice || 0,
        isActive: true,
      },
    });
    console.log("✅ Auto-created MarketplaceService:", service.id, service.name, "price:", appPrice);
  } else if (appPrice) {
    // Always update with latest price from app
    service = await prisma.marketplaceService.update({
      where: { id: service.id },
      data: { basePrice: appPrice },
    });
    console.log("✅ Updated basePrice for:", service.name, "→", appPrice);
  }

  return service;
};

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
      externalServiceId: true,
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
  const service = await resolveService(externalServiceId);

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
          address: true,
          phone: true,
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
        status: { in: ["PENDING", "ACCEPTED"] },
      },
    });

    if (activeBooking) continue;

    let selectedPricing = null;

    if (carType) {
      selectedPricing = g.pricing.find(
        (p) => p.carType?.toUpperCase() === carType.toUpperCase()
      );
    }

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

    // ✅ FIX: removed "appPrice ??" here — appPrice doesn't exist in this scope
    const finalPrice = Math.max(0, garagePrice - discount);

    results.push({
      garageId: g.user.id,
      name: g.user.companyName,
      address: g.user.address || null,
      phone: g.user.phone || null,
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
// CREATE BOOKING
// ==============================
export const createBooking = async (data) => {
  const { externalServiceId, garageId, scheduledAt, clientId, carType } = data;

  // ✅ FIX: appPrice from App is the total cart price — trust it directly
  const appPrice = data.appPrice ? Number(data.appPrice) : null;

  if (!externalServiceId || !garageId || !clientId || !scheduledAt) {
    throw new Error("Missing required fields");
  }

  const parsedGarageId = Number(garageId);
  const parsedClientId = Number(clientId);
  const parsedDate = new Date(scheduledAt);

  if (isNaN(parsedGarageId) || isNaN(parsedClientId)) {
    throw new Error("garageId and clientId must be valid integers");
  }

  if (isNaN(parsedDate.getTime())) {
    throw new Error("scheduledAt is not a valid date");
  }

  const service = await resolveService(
    externalServiceId,
    data.serviceName,
    appPrice
  );

  console.log("✅ Resolved service:", service.id, service.name);

  const garageService = await prisma.garageMarketplaceService.findFirst({
    where: {
      serviceId: service.id,
      userId: parsedGarageId,
    },
    include: { pricing: true },
  });

  if (!garageService) {
    console.warn(`⚠️ Garage ${parsedGarageId} has no configured pricing. Using app price.`);
  }

  // ✅ KEY FIX: If App sent appPrice, use it as finalPrice directly.
  // Never let CRM garage pricing override the total the user was shown.
  let finalPrice;
  let basePriceSnapshot;
  let garagePriceSnapshot;
  let discountSnapshot = 0;

  if (appPrice !== null) {
    // App sent total cart price — use it directly
    finalPrice = appPrice;
    basePriceSnapshot = appPrice;
    garagePriceSnapshot = appPrice;
    discountSnapshot = 0;
  } else {
    // Fallback: CRM garage pricing (Postman / manual bookings only)
    const basePrice = service.basePrice ?? 0;
    let garagePrice = basePrice;
    let discount = 0;

    if (garageService) {
      let selectedPricing = null;
      if (carType && garageService.pricing?.length) {
        selectedPricing = garageService.pricing.find(
          (p) => p.carType?.toUpperCase() === carType.toUpperCase()
        );
      }
      if (selectedPricing) {
        garagePrice = selectedPricing.price;
        discount = selectedPricing.discount || 0;
      } else if (garageService.price) {
        garagePrice = garageService.price;
        discount = garageService.discount || 0;
      }
    }

    finalPrice = Math.max(0, garagePrice - discount);
    basePriceSnapshot = basePrice;
    garagePriceSnapshot = garagePrice;
    discountSnapshot = discount;
  }

  console.log("💰 Pricing:", { appPrice, finalPrice });

  const booking = await prisma.marketplaceBooking.create({
    data: {
      service: { connect: { id: service.id } },
      garage: { connect: { id: parsedGarageId } },
      client: { connect: { id: parsedClientId } },
      scheduledAt: parsedDate,
      carType: carType || null,
      serviceName: data.serviceName || service.name,
      mainCategory: service.mainCategory || "General",
      subCategory: service.subCategory || "General",
      basePriceSnapshot,
      garagePriceSnapshot,
      discountSnapshot,
      finalPrice,
      status: "PENDING",
    },
  });

  console.log("✅ Booking created:", booking.id, "finalPrice:", finalPrice);

  return booking;
};

// ==============================
// GET BOOKING
// ==============================
export const getBookingById = async (id) => {
  return prisma.marketplaceBooking.findUnique({
    where: { id: Number(id) },
    include: { service: true, client: true },
  });
};

// ==============================
// PACKAGES
// ==============================
export const createPackage = async (userId, data) => {
  const { name, price, serviceIds } = data;

  return prisma.$transaction(async (tx) => {
    const pkg = await tx.marketplacePackage.create({
      data: { userId, name, price: Number(price) },
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

export const getPackages = async (userId) => {
  return prisma.marketplacePackage.findMany({
    where: { userId },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });
};

export const deletePackage = async (id, userId) => {
  return prisma.marketplacePackage.delete({
    where: { id: Number(id), userId },
  });
};

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

export const updateServiceDetails = async (serviceId, data) => {
  const updateData = {};
  if (data.description !== undefined) updateData.description = data.description;
  if (data.image !== undefined) updateData.image = data.image;

  return prisma.marketplaceService.update({
    where: { id: Number(serviceId) },
    data: updateData,
  });
};