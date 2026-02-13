//server/services/remiderScheduler.js
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
   MAIN REMINDER SCHEDULER
===================================================== */
export const runReminderCheck = async () => {
  try {
    console.log("===========================================");
    console.log("⏰ Checking service reminders...");
    console.log("🕒 Current Server Time (UTC):", new Date().toISOString());
    console.log("===========================================");

    const today = new Date();

    const reminders = await prisma.reminder.findMany({
      where: {
        OR: [{ sent15: false }, { sent7: false }],
      },
      include: {
        client: true,
        user: true,
      },
    });

    console.log(`📦 Total reminders fetched: ${reminders.length}`);

    for (const reminder of reminders) {
      try {
        console.log("-------------------------------------------");
        console.log("🔍 Checking Reminder ID:", reminder.id);

        if (!reminder.client?.phone) {
          console.log("⚠️ Skipped: No client phone");
          continue;
        }

        const rawPhone = reminder.client.phone.replace(/\D/g, "");
        const to = rawPhone.startsWith("91") ? rawPhone : `91${rawPhone}`;

        console.log("📱 Normalized Phone:", to);
        console.log("📅 Service Date:", reminder.serviceDate);
        console.log("📅 remind15At:", reminder.remind15At);
        console.log("📅 remind7At:", reminder.remind7At);

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
          reminder.client.fullName, // {{1}}
          reminder.client.regNumber, // {{2}}
          reminder.user?.companyName || "Motor Desk", // {{3}}
          formattedDate, // {{4}}
          formattedTime, // {{5}}
        ];

        console.log("📦 Template Variables:", variables);

        /* =====================================================
           🔔 15 DAY REMINDER
        ===================================================== */
        if (
          reminder.remind15At &&
          !reminder.sent15 &&
          isSameDayUTC(reminder.remind15At, today)
        ) {
          console.log("🚀 Sending 15-day reminder...");

          const messageId = await sendWhatsAppTemplate({
            to,
            templateName: "service_booking_alert",
            languageCode: "en",
            variables,
          });

          console.log("✅ 15-day reminder sent. Message ID:", messageId);

          await prisma.reminder.update({
            where: { id: reminder.id },
            data: { sent15: true },
          });
        }

        /* =====================================================
           🔔 7 DAY REMINDER
        ===================================================== */
        if (
          reminder.remind7At &&
          !reminder.sent7 &&
          isSameDayUTC(reminder.remind7At, today)
        ) {
          console.log("🚀 Sending 7-day reminder...");

          const messageId = await sendWhatsAppTemplate({
            to,
            templateName: "service_booking_alert",
            languageCode: "en",
            variables, // ✅ SAME 5 VARIABLES
          });

          console.log("✅ 7-day reminder sent. Message ID:", messageId);

          await prisma.reminder.update({
            where: { id: reminder.id },
            data: { sent7: true },
          });
        }
      } catch (innerError) {
        console.error(
          `❌ Reminder failed (ID: ${reminder.id}):`,
          innerError.response?.data || innerError.message,
        );
      }
    }

    console.log("===========================================");
    console.log("✅ Reminder check completed.");
    console.log("===========================================");
  } catch (error) {
    console.error("❌ Reminder Scheduler Fatal Error:", error.message);
  }
};
