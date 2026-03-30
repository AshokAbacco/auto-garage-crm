import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const acceptBooking = async (bookingId) => {
  const booking = await prisma.marketplaceBooking.findUnique({
    where: { id: Number(bookingId) },
    include: { service: true },
  });

  if (!booking) throw new Error("Booking not found");

  if (booking.status !== "PENDING") {
    throw new Error("Booking already processed");
  }

  if (!booking.clientId) {
    throw new Error("Client is required for service creation");
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

        // ⚠️ REQUIRED depending on your schema
        // You MUST map this properly later
        // Temporary fallback:
        // subServiceId: 1
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

        // subServiceId: 1 (if required)
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

        // subServiceId: 1 (if required)
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

  return { success: true };
};

export const rejectBooking = async (bookingId) => {
  return prisma.marketplaceBooking.update({
    where: { id: Number(bookingId) },
    data: { status: "REJECTED" },
  });
};
