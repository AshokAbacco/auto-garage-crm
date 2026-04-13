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
export const resolveService = async (externalServiceId, fallbackName) => {
  console.log(
    `[MarketplaceService] Resolving Service for UUID: ${externalServiceId}`,
  );

  let service = await prisma.marketplaceService.findFirst({
    where: { externalServiceId: String(externalServiceId) },
  });

  // 🔥 ALWAYS fetch from external DB
  let externalName = null;

  try {
    const result = await queryExternal(
      `SELECT name FROM "Service" WHERE id = $1`,
      [externalServiceId],
    );

    externalName = result.rows?.[0]?.name;
  } catch (err) {
    console.error("External DB fetch failed:", err.message);
  }

  const safeName = externalName || fallbackName || "Unknown Service";

  // ==============================
  // ✅ CASE 1: SERVICE EXISTS → UPDATE IF WRONG
  // ==============================
  if (service) {
    if (
      externalName &&
      (service.name === "App Service" ||
        service.name === "Unknown Service" ||
        service.name !== externalName)
    ) {
      console.log(
        `[MarketplaceService] Updating service name → ${externalName}`,
      );

      service = await prisma.marketplaceService.update({
        where: { id: service.id },
        data: { name: externalName },
      });
    }

    return service;
  }

  // ==============================
  // ✅ CASE 2: CREATE NEW
  // ==============================
  const baseSlug = safeName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  const uniqueSlug = `${baseSlug}-${Date.now()}`;

  service = await prisma.marketplaceService.create({
    data: {
      name: safeName,
      externalServiceId: String(externalServiceId),
      description: "Synced from External DB",
      slug: uniqueSlug,
      crmType: "CAR",
    },
  });

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
  const { name, price, serviceIds, description } = data;

  console.log(
    `[MarketplaceService] Creating Package: ${name} for User: ${userId}`,
  );

  return prisma.$transaction(async (tx) => {
    // 1️⃣ Create Package
    const pkg = await tx.marketplacePackage.create({
      data: {
        userId: Number(userId),
        name,
        price: Number(price),
        description: description || null, // ✅ ADD THIS
      },
    });

    // 2️⃣ Process Services
    if (serviceIds?.length) {
      for (const item of serviceIds) {
        // 🔥 Support BOTH formats:
        // 1. Old → "uuid"
        // 2. New → { id, name }
        const externalId = typeof item === "string" ? item : item.id;

        const serviceName = typeof item === "string" ? undefined : item.name;

        // 🔥 Resolve with name (IMPORTANT FIX)
        const service = await resolveService(externalId, serviceName);

        if (!service) continue;

        await tx.marketplacePackageItem.create({
          data: {
            packageId: pkg.id,
            serviceId: service.id,

            // 🔥 Bridge
            externalServiceId: service.externalServiceId,

            // 🔥 SNAPSHOT (NOW CORRECT)
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
  const packages = await prisma.marketplacePackage.findMany({
    where: { userId: Number(userId) },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          companyName: true,
          phone: true,
          address: true,
        },
      },
      items: true,
    },
    orderBy: { createdAt: "desc" },
  });

  // 🔥 Attach pricing for each service inside package
  const enrichedPackages = await Promise.all(
    packages.map(async (pkg) => {
      const itemsWithPricing = await Promise.all(
        pkg.items.map(async (item) => {
          const garageService = await prisma.garageMarketplaceService.findFirst(
            {
              where: {
                userId: pkg.userId,
                serviceId: item.serviceId,
              },
              include: {
                pricing: true,
              },
            },
          );

          return {
            ...item,
            pricing: garageService?.pricing || [],
          };
        }),
      );

      return {
        ...pkg,
        items: itemsWithPricing,
      };
    }),
  );

  return enrichedPackages;
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
