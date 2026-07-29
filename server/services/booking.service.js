// services/booking.service.js
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// 🆕 Must match the popup's countdown on the CRM frontend (30s).
// If a booking is still PENDING after this window, it's auto-marked TIMEOUT
// and can no longer be accepted/rejected — closing the loophole where a
// garage owner could still accept a booking well after the customer's
// popup/confirm screen had already given up waiting.
const RESPONSE_WINDOW_MS = 30 * 1000;

const isExpired = (booking) =>
  booking.status === "PENDING" &&
  Date.now() - new Date(booking.createdAt).getTime() > RESPONSE_WINDOW_MS;

export const acceptBooking = async (bookingId) => {
  const booking = await prisma.marketplaceBooking.findUnique({
    where: { id: Number(bookingId) },
    include: { service: true },
  });

  console.log("🔥 ACCEPT BOOKING:", bookingId);

  if (!booking) throw new Error("Booking not found");

  // 🆕 Enforce the 30s response window server-side, regardless of whether
  // the customer's popup/countdown ever actually fired a reject call.
  if (isExpired(booking)) {
    await prisma.marketplaceBooking.update({
      where: { id: booking.id },
      data: { status: "TIMEOUT" },
    });
    throw new Error(
      "This booking's 30-second response window has expired and it was automatically marked as Missed.",
    );
  }

  if (booking.status !== "PENDING") {
    throw new Error("Booking already processed");
  }

  if (!booking.clientId) {
    throw new Error("Client is required");
  }

  // =========================
  // STEP 1: FIND OR CREATE GENERIC (CAR) SUBSERVICE
  // Only used for CAR bookings — BIKE/WASH use their own dedicated
  // sub-service models below, since they're different tables entirely.
  // =========================
  let matchedSubService = null;
  if (booking.service.crmType === "CAR") {
    matchedSubService = await prisma.subService.findFirst({
      where: {
        name: {
          equals: booking.service.name,
          mode: "insensitive",
        },
      },
    });

    if (!matchedSubService) {
      console.log("⚠️ Creating new SubService:", booking.service.name);

      matchedSubService = await prisma.subService.create({
        data: {
          name: booking.service.name,
        },
      });
    }
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

        // 🔧 FIXED: the relation field on Service is `subServices` (plural,
        // many-to-many) — it was previously calling `.connect()` on a
        // non-existent `subService` field, which threw on every accept.
        subServices: {
          connect: [{ id: matchedSubService.id }],
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
  // 🔧 FIXED: bikeService.subService connects to the BikeSubService model,
  // not the generic SubService model used for CAR. Using the wrong model's
  // id here would either throw (id not found in BikeSubService) or, worse,
  // silently link to an unrelated record if the ids happened to collide.
  // =========================
  if (booking.service.crmType === "BIKE") {
    const bikeSubService = await prisma.bikeSubService.findFirst({
      where: { name: { equals: booking.service.name, mode: "insensitive" } },
    });

    if (!bikeSubService) {
      throw new Error(
        `No matching BIKE sub-service named "${booking.service.name}" exists in the CRM yet. Please add it under Bike Services first, then accept this booking.`,
      );
    }

    serviceRecord = await prisma.bikeService.create({
      data: {
        date: new Date(),
        inDate: new Date(),

        client: {
          connect: { id: booking.clientId },
        },

        subService: {
          connect: { id: bikeSubService.id },
        },

        category: {
          connect: { id: bikeSubService.categoryId },
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
  // 🔧 FIXED: same issue as BIKE — washingService.subService connects to
  // the WashingSubService model, not the generic SubService model.
  // =========================
  if (booking.service.crmType === "WASH") {
    const washingSubService = await prisma.washingSubService.findFirst({
      where: { name: { equals: booking.service.name, mode: "insensitive" } },
    });

    if (!washingSubService) {
      throw new Error(
        `No matching WASH sub-service named "${booking.service.name}" exists in the CRM yet. Please add it under Washing Services first, then accept this booking.`,
      );
    }

    serviceRecord = await prisma.washingService.create({
      data: {
        date: new Date(),

        client: {
          connect: { id: booking.clientId },
        },

        subService: {
          connect: { id: washingSubService.id },
        },

        category: {
          connect: { id: washingSubService.categoryId },
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
  const existing = await prisma.marketplaceBooking.findUnique({
    where: { id: Number(bookingId) },
  });

  if (!existing) throw new Error("Booking not found");

  // 🆕 If it's already past the response window, record it as TIMEOUT
  // rather than REJECTED — it's a more accurate status either way.
  const finalStatus = isExpired(existing) ? "TIMEOUT" : "REJECTED";

  // 1. Do the actual status change first, with NO include — this must
  //    succeed/fail on its own, independent of any enrichment data.
  const updated = await prisma.marketplaceBooking.update({
    where: { id: Number(bookingId) },
    data: { status: finalStatus },
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
