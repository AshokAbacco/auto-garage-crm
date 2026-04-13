// src/services/marketplace.service.js
import { PrismaClient } from "@prisma/client";
import { queryExternal } from "../config/externalDb.js";

const prisma = new PrismaClient();

// ==============================
// SHARED HELPER
// ==============================
/**
 * Ensures the External UUID has a record in the local CRM DB.
 */
export const resolveService = async (externalServiceId, serviceName) => {
  console.log(
    `[MarketplaceService] Resolving Service for UUID: ${externalServiceId}`,
  );

  let service = await prisma.marketplaceService.findFirst({
    where: { externalServiceId: String(externalServiceId) },
  });

  if (!service) {
    console.log(
      `[MarketplaceService] Syncing new service from App DB: ${serviceName || "Unnamed"}`,
    );
    service = await prisma.marketplaceService.create({
      data: {
        name: serviceName || "App Service",
        externalServiceId: String(externalServiceId),
        description: "Synced from App",
      },
    });
  }
  return service;
};

// ==============================
// SERVICES (HIERARCHICAL)
// ==============================
export const getServices = async (vehicleTypeId = null) => {
  console.log(
    `[MarketplaceService] Fetching Hierarchy. Filter Type: ${vehicleTypeId || "None"}`,
  );

  const sql = `
    SELECT 
      ms.id as main_id, ms.name as main_name,
      ss.id as sec_id, ss.name as sec_name,
      s.id as svc_id, s.name as svc_name, s.price as svc_base_price
    FROM "MainService" ms
    JOIN "ServiceSection" ss ON ss."mainServiceId" = ms.id
    JOIN "Service" s ON s."sectionId" = ss.id
    WHERE ms."isActive" = true 
    ${vehicleTypeId ? 'AND s."vehicleTypeId" = $1' : ""}
    ORDER BY ms.name, ss.name, s.name;
  `;

  const { rows } = await queryExternal(
    sql,
    vehicleTypeId ? [vehicleTypeId] : [],
  );

  const localMeta = await prisma.marketplaceService.findMany();
  const metaMap = new Map(localMeta.map((m) => [m.externalServiceId, m]));

  const hierarchy = {};

  rows.forEach((row) => {
    if (!hierarchy[row.main_id]) {
      hierarchy[row.main_id] = {
        id: row.main_id,
        name: row.main_name,
        sections: {},
      };
    }

    if (!hierarchy[row.main_id].sections[row.sec_id]) {
      hierarchy[row.main_id].sections[row.sec_id] = {
        id: row.sec_id,
        name: row.sec_name,
        services: [],
      };
    }

    const meta = metaMap.get(row.svc_id);

    hierarchy[row.main_id].sections[row.sec_id].services.push({
      id: row.svc_id,
      name: row.svc_name,
      basePrice: row.svc_base_price,
      description: meta?.description || null,
      image: meta?.image || null,
      crmId: meta?.id || null,
    });
  });

  return Object.values(hierarchy).map((main) => ({
    ...main,
    sections: Object.values(main.sections),
  }));
};

// ==============================
// GARAGES BY SERVICE
// ==============================
export const getGaragesByService = async (externalServiceId, carType) => {
  const service = await resolveService(externalServiceId);

  const garages = await prisma.garageMarketplaceService.findMany({
    where: { serviceId: service.id, isActive: true },
    include: {
      pricing: true,
      service: true,
    },
  });

  return garages.map((g) => {
    const selectedPricing = carType
      ? g.pricing.find(
          (p) => p.carType?.toUpperCase() === carType.toUpperCase(),
        )
      : null;

    const garagePrice = selectedPricing ? selectedPricing.price : 0;
    const discount = selectedPricing ? selectedPricing.discount : 0;
    const finalPrice = Math.max(0, garagePrice - discount);

    return {
      garageId: g.userId,
      serviceId: service.id,
      externalServiceId: service.externalServiceId,
      garagePrice,
      discount,
      finalPrice,
      carType: carType || null,
    };
  });
};

// ==============================
// CREATE BOOKING
// ==============================
export const createBooking = async (data) => {
  console.log(
    `[MarketplaceService] Creating Booking for UUID: ${data.externalServiceId}`,
  );
  const service = await resolveService(
    data.externalServiceId,
    data.serviceName,
  );

  return prisma.marketplaceBooking.create({
    data: {
      serviceId: service.id,
      garageId: Number(data.garageId),
      clientId: Number(data.clientId),
      scheduledAt: new Date(data.scheduledAt),
      carType: data.carType || null,
      serviceName: data.serviceName || service.name || "Service",
      mainCategory: service.mainCategory || "General",
      subCategory: service.subCategory || "General",
      basePriceSnapshot: data.appPrice ? Number(data.appPrice) : 0,
      finalPrice: data.appPrice ? Number(data.appPrice) : 0,
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
    include: { service: true },
  });
};

// ==============================
// UPDATE DETAILS (WITH AUTO-SYNC)
// ==============================
export const updateServiceDetails = async (id, data, isLocalId, userId) => {
  console.log(
    `[MarketplaceService] Updating Details. Target ID: ${id}, Local: ${isLocalId}, Garage: ${userId}`,
  );
  let service;

  // 1. Update core service record
  if (isLocalId) {
    service = await prisma.marketplaceService.update({
      where: { id: Number(id) },
      data: { description: data.description, image: data.image },
    });
  } else {
    service = await resolveService(id, data.description);
    service = await prisma.marketplaceService.update({
      where: { id: service.id },
      data: { image: data.image, description: data.description },
    });
  }

  // 2. Update Garage-specific settings if pricing provided
  if (data.pricing && userId) {
    console.log(
      `[MarketplaceService] Saving Garage-specific pricing for Service ${service.id}`,
    );

    const garageService = await prisma.garageMarketplaceService.upsert({
      where: {
        userId_serviceId: {
          userId: Number(userId),
          serviceId: service.id,
        },
      },
      update: { isActive: data.isActive },
      create: {
        userId: Number(userId),
        serviceId: service.id,
        isActive: data.isActive,
      },
    });

    // Replace pricing segments
    await prisma.garageServicePricing.deleteMany({
      where: { garageServiceId: garageService.id },
    });

    if (data.pricing.length > 0) {
      await prisma.garageServicePricing.createMany({
        data: data.pricing.map((p) => ({
          garageServiceId: garageService.id,
          carType: p.carType,
          price: Number(p.price) || 0,
          discount: Number(p.discount) || 0,
        })),
      });
    }
  }

  return service;
};

// ==============================
// PACKAGES (BUNDLED SERVICES)
// ==============================
export const createPackage = async (userId, data) => {
  const { name, price, serviceIds } = data;
  console.log(
    `[MarketplaceService] Creating Package: ${name} for User: ${userId}`,
  );

  return prisma.$transaction(async (tx) => {
    const pkg = await tx.marketplacePackage.create({
      data: { userId: Number(userId), name, price: Number(price) },
    });

    if (serviceIds?.length) {
      for (const sid of serviceIds) {
        const service = await tx.marketplaceService.findFirst({
          where: {
            OR: [
              { id: !isNaN(Number(sid)) ? Number(sid) : undefined },
              { externalServiceId: String(sid) },
            ],
          },
        });

        if (service) {
          await tx.marketplacePackageItem.create({
            data: {
              packageId: pkg.id,
              serviceId: service.id,
              serviceName: service.name,
              basePrice: 0,
            },
          });
        }
      }
    }
    return pkg;
  });
};

export const getPackages = async (userId) => {
  return prisma.marketplacePackage.findMany({
    where: { userId: Number(userId) },
    include: {
      items: {
        include: { marketplaceService: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
};

export const deletePackage = async (id, userId) => {
  return prisma.marketplacePackage.delete({
    where: { id: Number(id), userId: Number(userId) },
  });
};

export const togglePackage = async (id, userId) => {
  const pkg = await prisma.marketplacePackage.findFirst({
    where: { id: Number(id), userId: Number(userId) },
  });
  if (!pkg) throw new Error("Package not found");

  return prisma.marketplacePackage.update({
    where: { id: pkg.id },
    data: { isActive: !pkg.isActive },
  });
};
