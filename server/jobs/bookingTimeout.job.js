import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const handleBookingTimeout = async () => {
  const timeoutMinutes = 5;

  const now = new Date();
  const past = new Date(now.getTime() - timeoutMinutes * 60 * 1000);

  const bookings = await prisma.marketplaceBooking.findMany({
    where: {
      status: "PENDING",
      createdAt: {
        lte: past,
      },
    },
  });

  for (const booking of bookings) {
    await prisma.marketplaceBooking.update({
      where: { id: booking.id },
      data: { status: "TIMEOUT" },
    });
  }

  console.log(`⏱ Timeout processed: ${bookings.length}`);
};
