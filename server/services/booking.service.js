// services/booking.service.js
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const acceptBooking = async (bookingId) => {
  const booking = await prisma.marketplaceBooking.findUnique({
    where: { id: Number(bookingId) },
    include: { service: true },
  });

  console.log("🔥 ACCEPT BOOKING:", bookingId);

  if (!booking) throw new Error("Booking not found");

  if (booking.status !== "PENDING") {
    throw new Error("Booking already processed");
  }

  if (!booking.clientId) {
    throw new Error("Client is required");
  }

  // =========================
  // STEP 1: FIND OR CREATE SUBSERVICE
  // =========================
  let matchedSubService = await prisma.subService.findFirst({
    where: {
      name: {
        equals: booking.service.name,
        mode: "insensitive",
      },
    },
  });

  // 🔥 AUTO CREATE (FINAL FIX)
  if (!matchedSubService) {
    console.log("⚠️ Creating new SubService:", booking.service.name);

    matchedSubService = await prisma.subService.create({
      data: {
        name: booking.service.name,
      },
    });
  }

  let serviceRecord;

  // =========================
  // CAR SERVICE
  // =========================
  if (booking.service.crmType === "CAR") {
    serviceRecord = await prisma.service.create({
      data: {
        date: new Date(),

        client: {
          connect: { id: booking.clientId },
        },

        // ✅ CORRECT RELATION
        subService: {
          connect: { id: matchedSubService.id },
        },

        status: "PENDING",
      },
    });

    await prisma.marketplaceBooking.update({
      where: { id: booking.id },
      data: {
        status: "ACCEPTED",
        carServiceId: serviceRecord.id,
      },
    });
  }

  // =========================
  // BIKE SERVICE
  // =========================
  if (booking.service.crmType === "BIKE") {
    serviceRecord = await prisma.bikeService.create({
      data: {
        date: new Date(),

        client: {
          connect: { id: booking.clientId },
        },

        subService: {
          connect: { id: matchedSubService.id },
        },
      },
    });

    await prisma.marketplaceBooking.update({
      where: { id: booking.id },
      data: {
        status: "ACCEPTED",
        bikeServiceId: serviceRecord.id,
      },
    });
  }

  // =========================
  // WASH SERVICE
  // =========================
  if (booking.service.crmType === "WASH") {
    serviceRecord = await prisma.washingService.create({
      data: {
        date: new Date(),

        client: {
          connect: { id: booking.clientId },
        },

        subService: {
          connect: { id: matchedSubService.id },
        },
      },
    });

    await prisma.marketplaceBooking.update({
      where: { id: booking.id },
      data: {
        status: "ACCEPTED",
        washingServiceId: serviceRecord.id,
      },
    });
  }

  console.log("🎉 BOOKING ACCEPTED:", booking.id);

  // 🆕 Enrich with full details for the socket push — but this is best-effort.
  // The status change above already succeeded; if this extra read fails for
  // any reason (relation issue, schema drift, etc.), we must NOT let that
  // turn a successful accept into a reported failure.
  let updatedBooking = null;
  try {
    updatedBooking = await prisma.marketplaceBooking.findUnique({
      where: { id: booking.id },
      include: {
        service: true,
        client: true,
        garage: { select: { companyName: true, address: true, phone: true } },
      },
    });
  } catch (enrichErr) {
    console.error(
      "⚠️ acceptBooking: enrichment read failed (status change still succeeded):",
      enrichErr.message,
    );
  }

  return { success: true, booking: updatedBooking };
};

export const rejectBooking = async (bookingId) => {
  // 1. Do the actual status change first, with NO include — this must
  //    succeed/fail on its own, independent of any enrichment data.
  const updated = await prisma.marketplaceBooking.update({
    where: { id: Number(bookingId) },
    data: { status: "REJECTED" },
  });

  // 2. Enrichment for the socket push is best-effort only.
  let updatedBooking = updated;
  try {
    updatedBooking = await prisma.marketplaceBooking.findUnique({
      where: { id: updated.id },
      include: {
        service: true,
        client: true,
        garage: { select: { companyName: true, address: true, phone: true } },
      },
    });
  } catch (enrichErr) {
    console.error(
      "⚠️ rejectBooking: enrichment read failed (status change still succeeded):",
      enrichErr.message,
    );
  }

  return { success: true, booking: updatedBooking };
};
