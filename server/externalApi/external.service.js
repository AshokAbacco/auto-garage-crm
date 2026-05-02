// external.service.js

import prisma from "../models/prismaClient.js";
import { queryExternal } from "../config/externalDb.js";

export const fetchExternalUsers = async ({ page, limit, search, crm }) => {
  const skip = (page - 1) * limit;

  // -------------------------------
  // 1. Filters (Users)
  // -------------------------------
  const filters = [];

  if (search) {
    filters.push({
      OR: [
        { email: { contains: search, mode: "insensitive" } },
        { username: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
        { companyName: { contains: search, mode: "insensitive" } },
      ],
    });
  }

  if (crm) {
    filters.push({
      allowedCrms: { has: crm },
    });
  }

  const where = filters.length ? { AND: filters } : {};

  // -------------------------------
  // 2. Users (SAFE FIELDS ONLY)
  // -------------------------------
  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        username: true,
        email: true,
        phone: true,
        companyName: true,
        address: true,
        gstNumber: true,
        role: true,
        isSuspended: true,
        plan: true,
        planExpiry: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
    prisma.user.count({ where }),
  ]);

  if (!users.length) return { users: [], total };

  const userIds = users.map((u) => u.id);

  // -------------------------------
  // 3. Active Services (Internal DB)
  // -------------------------------
  const activeServices = await prisma.garageMarketplaceService.findMany({
    where: {
      userId: { in: userIds },
      isActive: true,
    },
    include: {
      service: true,
    },
  });

  // Map: userId → Set(externalServiceId)
  const userServiceMap = {};
  activeServices.forEach((gs) => {
    const extId = gs.service?.externalServiceId;
    if (!extId) return;

    if (!userServiceMap[gs.userId]) {
      userServiceMap[gs.userId] = new Set();
    }

    userServiceMap[gs.userId].add(extId);
  });

  // -------------------------------
  // 4. Pricing (External DB)
  // -------------------------------
  let pricingRows = [];

  if (userIds.length > 0) {
    try {
      const { rows } = await queryExternal(
        `
        SELECT garage_user_id, external_service_id, car_type, price, discount
        FROM "GarageServicePricing"
        WHERE garage_user_id = ANY($1::int[])
        `,
        [userIds],
      );

      pricingRows = rows;
    } catch (err) {
      console.error("Pricing fetch error:", err.message);
    }
  }

  // Map: userId → serviceId → pricing[]
  const pricingMap = {};

  pricingRows.forEach((row) => {
    const u = row.garage_user_id;
    const s = row.external_service_id;

    if (!pricingMap[u]) pricingMap[u] = {};
    if (!pricingMap[u][s]) pricingMap[u][s] = [];

    pricingMap[u][s].push({
      carType: row.car_type,
      price: parseFloat(row.price),
      discount: parseFloat(row.discount),
    });
  });

  // -------------------------------
  // 5. Full Hierarchy (External DB)
  // -------------------------------
  const { rows } = await queryExternal(`
  SELECT 
    ms.id as main_id, ms.name as main_name,
    ss.id as sec_id, ss.name as sec_name,
    s.id as svc_id, s.name as svc_name,

    gsm.image as image,
    gsm.description as description

  FROM "MainService" ms
  JOIN "ServiceSection" ss ON ss."mainServiceId" = ms.id
  JOIN "Service" s ON s."sectionId" = ss.id

  LEFT JOIN "GarageServiceMeta" gsm
    ON gsm.external_service_id = s.id

  WHERE ms."isActive" = true
  ORDER BY ms.name, ss.name, s.name;
`);

  // -------------------------------
  // 6. Build user-specific hierarchy
  // -------------------------------
  const buildUserServices = (userId) => {
    const allowedServices = userServiceMap[userId];
    if (!allowedServices) return [];

    const userPricing = pricingMap[userId] || {};
    const hierarchy = {};

    rows.forEach((row) => {
      // Skip if not active for user
      if (!allowedServices.has(row.svc_id)) return;

      const pricing = userPricing[row.svc_id];
      if (!pricing || pricing.length === 0) return;

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

      hierarchy[row.main_id].sections[row.sec_id].services.push({
        id: row.svc_id,
        name: row.svc_name,
        pricing,
        image: row.image || null,
        description: row.description || null,
      });
    });

    return Object.values(hierarchy).map((main) => ({
      ...main,
      sections: Object.values(main.sections),
    }));
  };

  // -------------------------------
  // 7. Final Response
  // -------------------------------
  const usersWithData = users.map((user) => {
    return {
      ...user,
      avgRating: 4.0, // static for now (safe fallback)
      services: buildUserServices(user.id),
    };
  });

  return { users: usersWithData, total };
};
