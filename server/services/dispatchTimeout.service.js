import { PrismaClient } from "@prisma/client";
import { assignGarage } from "./dispatch.service.js";

const prisma = new PrismaClient();

export const startDispatchTimeout = async (bookingId, garages, index) => {
  setTimeout(async () => {
    const booking = await prisma.marketplaceBooking.findUnique({
      where: { id: Number(bookingId) },
    });

    if (!booking) return;

    // if accepted → stop
    if (booking.status === "ACCEPTED") {
      return;
    }

    // move to next garage
    await assignGarage(booking, garages, index + 1);
  }, 30000); // 30 sec
};
