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
// SERVICES (HIERARCHICAL) — FILTERED BY CRM DOMAIN
// ==============================
export const getServices = async (
  vehicleTypeId = null,
  activeCrmType = null,
) => {
  console.log("====================================================");
  console.log(
    `📦 [DEBUG] [MARKETPLACE SERVICE] -> getServices Query Triggered`,
  );
  console.log(
    `   ↳ Filtering vehicleTypeId: ${vehicleTypeId || "None Specified"}`,
  );
  console.log(
    `   ↳ Active Workspace Target: ${activeCrmType ? `"${activeCrmType}"` : "None Specified"}`,
  );
  console.log("====================================================");

  let sql = `
    SELECT 
      ms.id as main_id, ms.name as main_name,
      ss.id as sec_id, ss.name as sec_name,
      s.id as svc_id, s.name as svc_name, s.price as svc_base_price,
      vt.name as vehicle_type_name
    FROM "MainService" ms
    JOIN "ServiceSection" ss ON ss."mainServiceId" = ms.id
    JOIN "Service" s ON s."sectionId" = ss.id
    JOIN "VehicleType" vt ON s."vehicleTypeId" = vt.id
    WHERE ms."isActive" = true 
  `;

  const queryParams = [];

  if (vehicleTypeId) {
    sql += ` AND s."vehicleTypeId" = $1`;
    queryParams.push(vehicleTypeId);
  } else if (activeCrmType) {
    // ⚡ FIX: Bulletproof text normalization trimming whitespaces to prevent empty row collections
    sql += ` AND UPPER(TRIM(vt.name)) = UPPER(TRIM($1))`;
    queryParams.push(activeCrmType.toUpperCase());
  }

  sql += ` ORDER BY ms.name, ss.name, s.name;`;

  const { rows } = await queryExternal(sql, queryParams);
  console.log(
    `📦 [DEBUG] [MARKETPLACE SERVICE] -> Database returned ${rows?.length || 0} matching hierarchy rows.`,
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
// Read pricing from App (external) DB
// ==============================
export const getGaragesByService = async (externalServiceId, carType) => {
  const service = await resolveService(externalServiceId);

  // Fetch garage toggle status from CRM DB
  const garages = await prisma.garageMarketplaceService.findMany({
    where: { serviceId: service.id, isActive: true },
    include: { service: true },
  });

  if (garages.length === 0) return [];

  const garageUserIds = garages.map((g) => g.userId);

  // Fetch pricing from external App DB for these garages + service
  let pricingRows = [];
  try {
    const { rows } = await queryExternal(
      `SELECT garage_user_id, car_type, price, discount
       FROM "GarageServicePricing"
       WHERE external_service_id = $1
         AND garage_user_id = ANY($2::int[])`,
      [externalServiceId, garageUserIds],
    );
    pricingRows = rows;
  } catch (err) {
    console.error(
      "[getGaragesByService] External pricing fetch failed:",
      err.message,
    );
  }

  // Build a map: garageUserId → pricing[]
  const pricingMap = {};
  pricingRows.forEach((row) => {
    if (!pricingMap[row.garage_user_id]) pricingMap[row.garage_user_id] = [];
    pricingMap[row.garage_user_id].push({
      carType: row.car_type,
      price: parseFloat(row.price),
      discount: parseFloat(row.discount),
    });
  });

  return garages.map((g) => {
    const garagePricing = pricingMap[g.userId] || [];
    const selectedPricing = carType
      ? garagePricing.find(
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
// GET GARAGE SERVICES WITH PRICING — FILTERED BY CRM DOMAIN
// ==============================
export const getGarageServicesWithPricing = async (
  userId,
  activeCrmType = null,
) => {
  const garageServices = await prisma.garageMarketplaceService.findMany({
    where: { userId },
    include: { service: true },
  });

  if (garageServices.length === 0) return [];

  const externalServiceIds = garageServices
    .map((gs) => gs.service?.externalServiceId)
    .filter(Boolean);

  let pricingRows = [];
  const validExternalIds = new Set();

  if (externalServiceIds.length > 0) {
    try {
      // Fetch pricing rows, joining through service to verify the workspace type match
      let externalSql = `
        SELECT 
           p.external_service_id, 
           p.car_type, 
           p.price, 
           p.discount,
           m.description,
           m.image,
           vt.name as vehicle_type_name
         FROM "GarageServicePricing" p
         LEFT JOIN "GarageServiceMeta" m
           ON p.external_service_id = m.external_service_id
          AND p.garage_user_id = m.garage_user_id
         INNER JOIN "Service" s ON s.id = p.external_service_id
         INNER JOIN "VehicleType" vt ON s."vehicleTypeId" = vt.id
         WHERE p.garage_user_id = $1
           AND p.external_service_id = ANY($2::text[])
      `;

      const externalParams = [userId, externalServiceIds];

      if (activeCrmType) {
        // ⚡ FIX: Robust text normalization tracking added to settings panels
        externalSql += ` AND UPPER(TRIM(vt.name)) = UPPER(TRIM($3))`;
        externalParams.push(activeCrmType.toUpperCase());
      }

      const { rows } = await queryExternal(externalSql, externalParams);
      pricingRows = rows;
    } catch (err) {
      console.error(
        "[getGarageServicesWithPricing] External pricing fetch failed:",
        err.message,
      );
    }
  }

  const pricingMap = {};
  const metaMap = {};

  pricingRows.forEach((row) => {
    validExternalIds.add(row.external_service_id);

    if (!pricingMap[row.external_service_id]) {
      pricingMap[row.external_service_id] = [];
    }

    pricingMap[row.external_service_id].push({
      carType: row.car_type,
      price: parseFloat(row.price),
      discount: parseFloat(row.discount),
    });

    if (!metaMap[row.external_service_id]) {
      metaMap[row.external_service_id] = {
        description: row.description || null,
        image: row.image || null,
      };
    }
  });

  return garageServices
    .map((gs) => {
      const externalId = gs.service?.externalServiceId;

      // Drop/filter services that belong to a different workspace context
      if (activeCrmType && !validExternalIds.has(externalId)) {
        return null;
      }

      const meta = metaMap[externalId] || {};

      return {
        id: gs.id,
        userId: gs.userId,
        isActive: gs.isActive,
        duration: gs.duration,
        description: meta.description,
        image: meta.image,
        service: {
          id: gs.service.id,
          externalServiceId: externalId,
          name: gs.service.name,
        },
        pricing: pricingMap[externalId] || [],
      };
    })
    .filter(Boolean); // Safely purges cross-domain layout mismatches
};

// ==============================
// SAVE GARAGE SERVICE PRICING
// Writes pricing to external App DB, toggle to CRM DB
// ==============================
export const saveGarageServicePricing = async (
  userId,
  serviceId,
  isActive,
  duration,
  pricing,
) => {
  console.log("INPUT:", { userId, serviceId, isActive, pricing });

  let resolvedServiceId = serviceId;
  let externalServiceId = null;

  if (isNaN(Number(serviceId))) {
    const service = await resolveService(serviceId);
    resolvedServiceId = service.id;
    externalServiceId = service.externalServiceId;
  } else {
    const service = await prisma.marketplaceService.findUnique({
      where: { id: Number(serviceId) },
    });
    if (!service) throw new Error(`Service not found: ${serviceId}`);
    resolvedServiceId = service.id;
    externalServiceId = service.externalServiceId;
  }

  // ✅ CRM toggle
  const garageService = await prisma.garageMarketplaceService.upsert({
    where: { userId_serviceId: { userId, serviceId: resolvedServiceId } },
    update: {
      isActive: Boolean(isActive),
      duration: duration ? Number(duration) : null,
    },
    create: {
      userId,
      serviceId: resolvedServiceId,
      isActive: Boolean(isActive),
      duration: duration ? Number(duration) : null,
    },
  });

  // ✅ Pricing → external DB
  if (pricing && Array.isArray(pricing) && externalServiceId) {
    try {
      await queryExternal(
        `DELETE FROM "GarageServicePricing"
         WHERE garage_user_id = $1 AND external_service_id = $2`,
        [userId, externalServiceId],
      );

      for (const p of pricing) {
        if (!p.carType) continue;

        await queryExternal(
          `INSERT INTO "GarageServicePricing"
           (
             garage_user_id,
             external_service_id,
             car_type,
             price,
             discount,
             created_at,
             updated_at
           )
           VALUES ($1, $2, $3, $4, $5, NOW(), NOW())`,
          [
            userId,
            externalServiceId,
            p.carType,
            parseFloat(p.price) || 0,
            parseFloat(p.discount) || 0,
          ],
        );
      }

      console.log(
        `[saveGarageServicePricing] Written ${pricing.length} pricing rows`,
      );
    } catch (err) {
      console.error(
        "[saveGarageServicePricing] External pricing write failed:",
        err.message,
      );
      throw new Error(`Failed to save pricing to App DB: ${err.message}`);
    }
  }

  return garageService;
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
// UPDATE SERVICE METADATA (CRM only — description, image)
// Pricing is handled separately via saveGarageServicePricing
// ==============================
export const updateServiceDetails = async (id, data, isLocalId, userId) => {
  console.log(
    `[MarketplaceService] Updating Details. Target ID: ${id}, Local: ${isLocalId}, Garage: ${userId}`,
  );

  let service;

  // 1. Resolve service
  if (isLocalId) {
    service = await prisma.marketplaceService.findUnique({
      where: { id: Number(id) },
    });
  } else {
    service = await resolveService(id, data.description);
  }

  if (!service) {
    throw new Error("Service not found");
  }

  // 2. Update ONLY toggle in CRM DB
  if (userId) {
    await prisma.garageMarketplaceService.upsert({
      where: {
        userId_serviceId: {
          userId: Number(userId),
          serviceId: service.id,
        },
      },
      update: {
        isActive: data.isActive,
      },
      create: {
        userId: Number(userId),
        serviceId: service.id,
        isActive: data.isActive,
      },
    });

    try {
      // ==============================
      // 🔥 3. UPSERT META (CORRECT TABLE)
      // ==============================
      await queryExternal(
        `INSERT INTO "GarageServiceMeta"
         (garage_user_id, external_service_id, description, image, created_at, updated_at)
         VALUES ($1, $2, $3, $4, NOW(), NOW())
         ON CONFLICT (garage_user_id, external_service_id)
         DO UPDATE SET
           description = EXCLUDED.description,
           image = EXCLUDED.image,
           updated_at = NOW()`,
        [
          userId,
          service.externalServiceId,
          data.description || null,
          data.image || null,
        ],
      );

      // ==============================
      // 🔥 4. UPDATE PRICING (FIXED)
      // ==============================
      if (data.pricing && data.pricing.length > 0) {
        await queryExternal(
          `DELETE FROM "GarageServicePricing"
           WHERE garage_user_id = $1 AND external_service_id = $2`,
          [userId, service.externalServiceId],
        );

        for (const p of data.pricing) {
          if (!p.carType) continue;

          await queryExternal(
            `INSERT INTO "GarageServicePricing"
             (garage_user_id, external_service_id, car_type, price, discount, created_at, updated_at)
             VALUES ($1, $2, $3, $4, $5, NOW(), NOW())`,
            [
              userId,
              service.externalServiceId,
              p.carType,
              Number(p.price) || 0,
              Number(p.discount) || 0,
            ],
          );
        }
      }

      console.log(
        `[updateServiceDetails] Meta + pricing saved for garage ${userId}, service ${service.externalServiceId}`,
      );
    } catch (err) {
      console.error(
        "[updateServiceDetails] External DB write failed:",
        err.message,
      );
      throw new Error(`Failed to save to App DB: ${err.message}`);
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
        description: description || null,
      },
    });

    // 2️⃣ Process Services
    if (serviceIds?.length) {
      for (const item of serviceIds) {
        const externalId = typeof item === "string" ? item : item.id;
        const serviceName = typeof item === "string" ? undefined : item.name;
        const service = await resolveService(externalId, serviceName);

        if (!service) continue;

        await tx.marketplacePackageItem.create({
          data: {
            packageId: pkg.id,
            serviceId: service.id,
            externalServiceId: service.externalServiceId,
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

  // Fetch pricing from external DB for all services in these packages
  const allExternalIds = [
    ...new Set(
      packages.flatMap((pkg) =>
        pkg.items.map((item) => item.externalServiceId).filter(Boolean),
      ),
    ),
  ];

  let pricingMap = {}; // externalServiceId → pricing[]

  if (allExternalIds.length > 0) {
    try {
      const { rows } = await queryExternal(
        `SELECT external_service_id, car_type, price, discount, description, image
         FROM "GarageServicePricing"
         WHERE garage_user_id = $1
           AND external_service_id = ANY($2::text[])`,
        [userId, allExternalIds],
      );
      rows.forEach((row) => {
        if (!pricingMap[row.external_service_id])
          pricingMap[row.external_service_id] = [];
        pricingMap[row.external_service_id].push({
          carType: row.car_type,
          price: parseFloat(row.price),
          discount: parseFloat(row.discount),
          description: row.description,
          image: row.image,
        });
      });
    } catch (err) {
      console.error(
        "[getPackages] External pricing fetch failed:",
        err.message,
      );
    }
  }

  return packages.map((pkg) => ({
    ...pkg,
    items: pkg.items.map((item) => ({
      ...item,
      pricing: pricingMap[item.externalServiceId] || [],
    })),
  }));
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
