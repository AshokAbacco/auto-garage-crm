import prisma from "../models/prismaClient.js";
import { sendWhatsAppTemplate } from "../services/whatsappService.js";

/* =====================================================
   SAFE DATE CHECK (UTC SAFE)
===================================================== */
function isSameDayUTC(date1, date2) {
  if (!date1) return false;

  const d1 = new Date(date1);
  const d2 = new Date(date2);

  return (
    d1.getUTCFullYear() === d2.getUTCFullYear() &&
    d1.getUTCMonth() === d2.getUTCMonth() &&
    d1.getUTCDate() === d2.getUTCDate()
  );
}

/* =====================================================
   BIKE REMINDER SCHEDULER
===================================================== */
export const runBikeReminderCheck = async () => {
  try {
    console.log("===========================================");
    console.log("🏍️ Checking BIKE service reminders...");
    console.log("===========================================");

    const today = new Date();

    const reminders = await prisma.bikeReminder.findMany({
      where: {
        OR: [{ sent15: false }, { sent7: false }],
      },
      include: {
        bike: true,
        user: true,
      },
    });

    console.log(`📦 Total bike reminders fetched: ${reminders.length}`);

    for (const reminder of reminders) {
      try {
        if (!reminder.bike?.phone) continue;

        const rawPhone = reminder.bike.phone.replace(/\D/g, "");
        const to = rawPhone.startsWith("91") ? rawPhone : `91${rawPhone}`;

        const formattedDate = new Date(reminder.serviceDate).toLocaleDateString(
          "en-IN",
        );

        const formattedTime = new Date(reminder.serviceDate).toLocaleTimeString(
          "en-IN",
          {
            hour: "2-digit",
            minute: "2-digit",
          },
        );

        const variables = [
          reminder.bike.ownerName, // {{1}}
          reminder.bike.regNumber, // {{2}}
          reminder.user?.companyName || "Garage", // {{3}}
          formattedDate, // {{4}}
          formattedTime, // {{5}}
        ];

        /* 🔔 15 DAY REMINDER */
        if (
          reminder.remind15At &&
          !reminder.sent15 &&
          isSameDayUTC(reminder.remind15At, today)
        ) {
          await sendWhatsAppTemplate({
            to,
            templateName: "service_booking_alert",
            languageCode: "en",
            variables,
          });

          await prisma.bikeReminder.update({
            where: { id: reminder.id },
            data: { sent15: true },
          });

          console.log("✅ Bike 15-day reminder sent:", reminder.id);
        }

        /* 🔔 7 DAY REMINDER */
        if (
          reminder.remind7At &&
          !reminder.sent7 &&
          isSameDayUTC(reminder.remind7At, today)
        ) {
          await sendWhatsAppTemplate({
            to,
            templateName: "service_booking_alert",
            languageCode: "en",
            variables,
          });

          await prisma.bikeReminder.update({
            where: { id: reminder.id },
            data: { sent7: true },
          });

          console.log("✅ Bike 7-day reminder sent:", reminder.id);
        }
      } catch (innerError) {
        console.error(
          `❌ Bike reminder failed (ID: ${reminder.id}):`,
          innerError.message,
        );
      }
    }

    console.log("🏁 Bike reminder check completed.");
  } catch (error) {
    console.error("❌ Bike Reminder Scheduler Fatal Error:", error.message);
  }
};
