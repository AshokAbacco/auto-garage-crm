// dispatch.service.js
import { PrismaClient } from "@prisma/client";
import { startDispatchTimeout } from "./dispatchTimeout.service.js";
import { notifyGarage } from "./socket.service.js";

const prisma = new PrismaClient();

// ==============================
// START DISPATCH
// ==============================
export const startDispatch = async (bookingId) => {
  const booking = await prisma.marketplaceBooking.findUnique({
    where: { id: Number(bookingId) },
  });

  if (!booking) throw new Error("Booking not found");

  const garages = await getEligibleGarages(booking.serviceId, booking.carType);

  console.log("ELIGIBLE GARAGES:", garages);

  if (!garages || garages.length === 0) {
    throw new Error("No garages available");
  }

  await assignGarage(booking, garages, 0);
};

// ==============================
// GET ELIGIBLE GARAGES (DYNAMIC)
// ==============================
const getEligibleGarages = async (serviceId, carType) => {
  const garageServices = await prisma.garageMarketplaceService.findMany({
    where: {
      serviceId: Number(serviceId),
      isActive: true,
    },
    include: {
      user: true,
      pricing: true,
    },
  });

  const result = [];

  for (const g of garageServices) {
    // ❌ Skip busy garages
    const active = await prisma.marketplaceBooking.findFirst({
      where: {
        garage: {
          id: g.user.id,
        },
        status: { in: ["PENDING", "ACCEPTED"] },
      },
    });

    if (active) continue;

    // ✅ pricing logic
    const matched = g.pricing.find((p) => p.carType === carType);

    if (carType && !matched) continue;

    const price = matched?.price ?? g.price ?? 0;
    const discount = matched?.discount ?? g.discount ?? 0;
    const finalPrice = price - (price * discount) / 100;

    result.push({
      garageId: g.user.id,
      price,
      discount,
      finalPrice,
    });
  }

  return result;
};

// ==============================
// ASSIGN GARAGE (FIXED)
// ==============================
export const assignGarage = async (booking, garages, index) => {
  if (index >= garages.length) {
    await prisma.marketplaceBooking.update({
      where: { id: booking.id },
      data: { status: "REJECTED" },
    });
    return;
  }

  const g = garages[index];

  // ✅ FIXED: use relation instead of garageId
  const updatedBooking = await prisma.marketplaceBooking.update({
    where: { id: booking.id },
    data: {
      garage: {
        connect: { id: g.garageId },
      },
      priceSnapshot: g.price,
      discountSnapshot: g.discount,
      finalPrice: g.finalPrice,
      status: "PENDING",
    },
  });

  console.log("✅ Garage assigned:", g.garageId);

  // ✅ notify garage (real-time)
  notifyGarage(g.garageId, {
    id: updatedBooking.id,
    serviceId: updatedBooking.serviceId,
    carType: updatedBooking.carType,
    finalPrice: updatedBooking.finalPrice,
  });

  // ✅ timeout handling
  await startDispatchTimeout(updatedBooking.id, garages, index);
};
