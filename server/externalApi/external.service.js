// external.service.js
//
// ✅ FIX: `crmType` (CAR/BIKE/WASH) was available on `gs.service.crmType`
// in step 3 (it's a real field on your MarketplaceService model) but was
// being discarded — userServiceMap only kept a Set of externalServiceId
// strings, so nothing about category ever reached the final response.
// This is the root cause of the app's category filter buttons doing
// nothing: there was no field to read at all, at any layer.
//
// Only two things changed below, both marked with ✅ FIX:
//   1. userServiceMap is now a Map(externalServiceId -> crmType) instead
//      of a Set(externalServiceId).
//   2. buildUserServices() reads that crmType and includes it as
//      `vehicleType` on each pushed service object.
//
// 🔍 DEBUG: added logging at 3 checkpoints to find why every garage
// comes back with services: []. Remove this whole block once confirmed.

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
        companyAddress: true,
        companyLatitude: true,
        companyLongitude: true,
        gstNumber: true,
        role: true,
        isSuspended: true,
        plan: true,
        planExpiry: true,
        kycStatus: true,
        pickupDrop: true,
        towingService: true,
        createdAt: true,
        updatedAt: true,
        garageVerification: {
          select: {
            status: true,
          },
        },
      },
    }),
    prisma.user.count({ where }),
  ]);

  console.log(
    `🔍 [DEBUG] users fetched: ${users.length} (total matching: ${total})`,
  );

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
      service: true, // MarketplaceService — has crmType, externalServiceId
    },
  });

  // 🔍 DEBUG CHECKPOINT 1 — is GarageMarketplaceService even populated?
  console.log(`🔍 [DEBUG] activeServices count: ${activeServices.length}`);
  if (activeServices.length) {
    console.log(
      "🔍 [DEBUG] sample activeService:",
      JSON.stringify(activeServices[0], null, 2),
    );
  } else {
    console.log(
      "🔍 [DEBUG] NO active GarageMarketplaceService rows found for these userIds — " +
        "either no garage has an active service yet (isActive: true), or userIds don't match.",
    );
  }

  // ✅ FIX: Map: userId → Map(externalServiceId → crmType)
  // Was: userId → Set(externalServiceId). crmType was sitting right on
  // gs.service.crmType this whole time and was simply never captured.
  const userServiceMap = {};
  activeServices.forEach((gs) => {
    const extId = gs.service?.externalServiceId;
    if (!extId) return;

    console.log("================================");
    console.log("GarageMarketplaceService");
    console.log({
      garage: gs.userId,
      marketplaceServiceId: gs.service.id,
      serviceName: gs.service.name,
      externalServiceId: extId,
      crmType: gs.service.crmType,
    });
    console.log("================================");

    if (!userServiceMap[gs.userId]) {
      userServiceMap[gs.userId] = new Map();
    }

    userServiceMap[gs.userId].set(extId, gs.service?.crmType || null);
  });

  console.log(
    `🔍 [DEBUG] userServiceMap size (users with >=1 mapped service): ${Object.keys(userServiceMap).length}`,
  );

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

  console.log(`🔍 [DEBUG] pricingRows count: ${pricingRows.length}`);
  if (pricingRows.length) {
    console.log("🔍 [DEBUG] sample pricingRow:", pricingRows[0]);
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

  // 🔍 DEBUG CHECKPOINT 2 — is the external hierarchy query returning anything?
  console.log(`🔍 [DEBUG] external hierarchy rows count: ${rows.length}`);
  if (rows.length) {
    console.log("🔍 [DEBUG] sample hierarchy row:", rows[0]);
  } else {
    console.log(
      "🔍 [DEBUG] NO rows from MainService/ServiceSection/Service join — " +
        "check queryExternal's DB connection, or whether ms.isActive=true matches anything.",
    );
  }

  // -------------------------------
  // 6. Build user-specific hierarchy
  // -------------------------------
  const buildUserServices = (userId) => {
    const allowedServices = userServiceMap[userId]; // ✅ now a Map, not a Set
    if (!allowedServices) return [];

    const userPricing = pricingMap[userId] || {};
    const hierarchy = {};

    rows.forEach((row) => {
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
        // ✅ FIX: the real category, straight from MarketplaceService.crmType
        // (values: "CAR" | "BIKE" | "WASH" | null). This is what the app's
        // ServiceCard/search.service.js category filter should read —
        // no more guessing from garage/group names needed for any
        // service where this is populated.
        vehicleType: allowedServices.get(row.svc_id) || null,
      });
      console.log({
        main: row.main_name,
        service: row.svc_name,
        vehicleType: allowedServices.get(row.svc_id),
      });
    });

    return Object.values(hierarchy).map((main) => ({
      ...main,
      sections: Object.values(main.sections),
    }));
  };

  // -------------------------------
  // 7. Final Response Transformation
  // -------------------------------
  const usersWithData = users.map((user) => {
    const isVerified =
      user.kycStatus === "APPROVED" ||
      user.garageVerification?.status === "VERIFIED";

    const builtServices = buildUserServices(user.id);

    // 🔍 DEBUG CHECKPOINT 3 — per-user final service count, to see if it's
    // truly ALL users at 0, or just some.
    console.log(
      `🔍 [DEBUG] user ${user.id} (${user.companyName || user.username}) -> ${builtServices.length} built main-service group(s)`,
    );

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      phone: user.phone,
      companyName: user.companyName,
      address: user.address,
      companyAddress: user.companyAddress,

      latitude: user.companyLatitude,
      longitude: user.companyLongitude,

      gstNumber: user.gstNumber,
      role: user.role,
      isSuspended: user.isSuspended,
      plan: user.plan,
      planExpiry: user.planExpiry,

      pickupDrop: user.pickupDrop,
      towingService: user.towingService,

      kycStatus: user.kycStatus,
      verificationStatus: user.garageVerification?.status || "NOT_ORDERED",
      isVerified: isVerified,

      avgRating: 4.0,
      services: builtServices,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  });

  return { users: usersWithData, total };
};
