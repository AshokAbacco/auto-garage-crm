import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ==============================
// SERVICES
// ==============================
export const getServices = async (crmType) => {
  return prisma.marketplaceService.findMany({
    where: {
      // crmType,
      isActive: true,
      ...(crmType && { crmType }), // ✅ SAFE FIX
    },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true, // ✅ ADD
      image: true, // ✅ ADD
    },
    orderBy: { name: "asc" },
  });
};

// ==============================
// GARAGES BY SERVICE (WITH DISCOUNT)
// ==============================
export const getGaragesByService = async (serviceId) => {
  const garages = await prisma.garageMarketplaceService.findMany({
    where: {
      serviceId: Number(serviceId),
      isActive: true,
    },
    include: {
      user: {
        select: {
          id: true,
          companyName: true,
        },
      },
    },
    orderBy: {
      price: "asc",
    },
  });

  return garages.map((g) => {
    const discount = g.discount || 0;
    const finalPrice = g.price - (g.price * discount) / 100;

    return {
      ...g,
      discount,
      finalPrice,
    };
  });
};

// ==============================
// CREATE BOOKING (WITH FINAL PRICE)
// ==============================
export const createBooking = async (data) => {
  const { serviceId, garageId, scheduledAt, clientId } = data;

  const garageService = await prisma.garageMarketplaceService.findFirst({
    where: {
      serviceId: Number(serviceId),
      userId: Number(garageId),
      isActive: true,
    },
  });

  if (!garageService) {
    throw new Error("Service not available for this garage");
  }

  const discount = garageService.discount || 0;
  const finalPrice =
    garageService.price - (garageService.price * discount) / 100;

  return prisma.marketplaceBooking.create({
    data: {
      serviceId: Number(serviceId),
      garageId: Number(garageId),
      clientId: Number(clientId),
      scheduledAt: new Date(scheduledAt),
      priceSnapshot: finalPrice, // ✅ FIXED
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

// CREATE PACKAGE
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

    if (serviceIds && serviceIds.length > 0) {
      await tx.marketplacePackageItem.createMany({
        data: serviceIds.map((sid) => ({
          packageId: pkg.id,
          serviceId: Number(sid),
        })),
      });
    }

    return pkg;
  });
};

// GET PACKAGES
export const getPackages = async (userId) => {
  return prisma.marketplacePackage.findMany({
    where: { userId },
    include: {
      items: {
        include: {
          service: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
};

// DELETE PACKAGE
export const deletePackage = async (id, userId) => {
  return prisma.marketplacePackage.delete({
    where: {
      id: Number(id),
      userId,
    },
  });
};

// TOGGLE PACKAGE
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

  // ✅ Only update if provided
  if (data.description !== undefined) {
    updateData.description = data.description;
  }

  if (data.image !== undefined) {
    updateData.image = data.image;
  }

  // 👉 Update DB
  const updated = await prisma.marketplaceService.update({
    where: { id: Number(serviceId) },
    data: updateData,
  });

  return updated;
};
