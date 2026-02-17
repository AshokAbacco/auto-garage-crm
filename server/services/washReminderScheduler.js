import prisma from "../models/prismaClient.js";
import { sendWhatsAppTemplate } from "../services/whatsappService.js";

/* =====================================================
   SAFE UTC DATE MATCH
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
   WASH REMINDER SCHEDULER
===================================================== */
export const washReminderscheduler = async () => {
  try {
    console.log("===========================================");
    console.log("🚿 Checking WASH service reminders...");
    console.log("===========================================");

    const today = new Date();

    const reminders = await prisma.washingReminder.findMany({
      where: {
        OR: [{ sent3Days: false }, { sent1Day: false }],
      },
      include: {
        washingClient: true,
        user: true,
      },
    });

    console.log(`📦 Total wash reminders fetched: ${reminders.length}`);

    for (const reminder of reminders) {
      try {
        if (!reminder.washingClient?.phone) continue;

        const rawPhone = reminder.washingClient.phone.replace(/\D/g, "");
        const to = rawPhone.startsWith("91") ? rawPhone : `91${rawPhone}`;

        const formattedDate = new Date(
          reminder.nextWashDate,
        ).toLocaleDateString("en-IN");

        const formattedTime = new Date(
          reminder.nextWashDate,
        ).toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
        });

        /* ✅ NOW 5 VARIABLES (MATCH TEMPLATE) */
        const variables = [
          reminder.washingClient.fullName || "Customer", // {{1}}
          reminder.vehicleNumber ||
            reminder.washingClient.regNumber ||
            "Vehicle", // {{2}}
          reminder.user?.companyName || "Wash Center", // {{3}}
          formattedDate, // {{4}}
          formattedTime, // {{5}}
        ];

        /* ===============================
           3 DAYS REMINDER
        =============================== */
        if (
          reminder.remind3DaysAt &&
          !reminder.sent3Days &&
          isSameDayUTC(reminder.remind3DaysAt, today)
        ) {
          await sendWhatsAppTemplate({
            to,
            templateName: "service_booking_alert",
            languageCode: "en",
            variables,
          });

          await prisma.washingReminder.update({
            where: { id: reminder.id },
            data: { sent3Days: true },
          });

          console.log("✅ Wash 3-day reminder sent:", reminder.id);
        }

        /* ===============================
           1 DAY REMINDER
        =============================== */
        if (
          reminder.remind1DayAt &&
          !reminder.sent1Day &&
          isSameDayUTC(reminder.remind1DayAt, today)
        ) {
          await sendWhatsAppTemplate({
            to,
            templateName: "service_booking_alert",
            languageCode: "en",
            variables,
          });

          await prisma.washingReminder.update({
            where: { id: reminder.id },
            data: { sent1Day: true },
          });

          console.log("✅ Wash 1-day reminder sent:", reminder.id);
        }
      } catch (innerError) {
        console.error(
          `❌ Wash reminder failed (ID: ${reminder.id}):`,
          innerError.response?.data || innerError.message,
        );
      }
    }

    console.log("🏁 Wash reminder check completed.");
  } catch (error) {
    console.error("❌ Wash Reminder Scheduler Fatal Error:", error.message);
  }
};
