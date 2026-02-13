import cron from "node-cron";
import prisma from "../models/prismaClient.js";
import axios from "axios";

/* -------------------------------------------------------
   CONFIG
--------------------------------------------------------*/
const WHATSAPP_TOKEN = process.env.WA_ACCESS_TOKEN;
const PHONE_NUMBER_ID = process.env.WA_PHONE_NUMBER_ID;

if (!WHATSAPP_TOKEN || !PHONE_NUMBER_ID) {
  throw new Error("WhatsApp environment variables missing");
}

/* -------------------------------------------------------
   SEND WHATSAPP TEMPLATE (5 PARAM VERSION)
--------------------------------------------------------*/
async function sendReminderTemplate(reminder, type) {
  try {
    if (!reminder.client?.phone) {
      console.log("⚠️ Skipped: No client phone");
      return false;
    }

    const rawPhone = reminder.client.phone.replace(/\D/g, "");
    const phone = rawPhone.startsWith("91") ? rawPhone : `91${rawPhone}`;

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

    const templateName = "service_booking_alert";

    console.log("📤 Sending reminder:", reminder.id);
    console.log("📱 Phone:", phone);
    console.log("📦 Variables:", [
      reminder.client.fullName,
      reminder.client.regNumber,
      reminder.user?.companyName || "Motor Desk",
      formattedDate,
      formattedTime,
    ]);

    const response = await axios.post(
      `https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: "whatsapp",
        to: phone,
        type: "template",
        template: {
          name: templateName,
          language: { code: "en" },
          components: [
            {
              type: "body",
              parameters: [
                { type: "text", text: reminder.client.fullName },
                { type: "text", text: reminder.client.regNumber },
                {
                  type: "text",
                  text: reminder.user?.companyName || "Motor Desk",
                },
                { type: "text", text: formattedDate },
                { type: "text", text: formattedTime },
              ],
            },
          ],
        },
      },
      {
        headers: {
          Authorization: `Bearer ${WHATSAPP_TOKEN}`,
          "Content-Type": "application/json",
        },
      },
    );

    console.log("✅ WhatsApp Sent:", response.data);

    await prisma.whatsAppMessage.create({
      data: {
        phone,
        userId: reminder.userId,
        template: templateName,
        messageId: response.data.messages?.[0]?.id,
        status: "sent",
      },
    });

    return true;
  } catch (error) {
    console.error(
      "❌ WhatsApp send failed:",
      error.response?.data || error.message,
    );

    await prisma.whatsAppMessage.create({
      data: {
        phone: reminder.client?.phone || "unknown",
        userId: reminder.userId,
        template: "service_booking_alert",
        status: "failed",
        error: JSON.stringify(error.response?.data || error.message),
      },
    });

    return false;
  }
}

/* -------------------------------------------------------
   MAIN CRON JOB
--------------------------------------------------------*/
export function startReminderScheduler() {
  cron.schedule("*/1 * * * *", async () => {
    console.log("======================================");
    console.log("⏰ Checking service reminders...");
    console.log("🕒 Server Time:", new Date().toISOString());
    console.log("======================================");

    const now = new Date();

    try {
      const reminders = await prisma.reminder.findMany({
        where: {
          OR: [
            { remind15At: { lte: now }, sent15: false },
            { remind7At: { lte: now }, sent7: false },
          ],
        },
        include: {
          client: true,
          user: true,
        },
      });

      console.log("📦 Reminders Found:", reminders.length);

      for (const reminder of reminders) {
        /* 15 DAY */
        if (reminder.remind15At <= now && !reminder.sent15) {
          const success = await sendReminderTemplate(reminder, "15");
          if (success) {
            await prisma.reminder.update({
              where: { id: reminder.id },
              data: { sent15: true },
            });
          }
        }

        /* 7 DAY */
        if (reminder.remind7At <= now && !reminder.sent7) {
          const success = await sendReminderTemplate(reminder, "7");
          if (success) {
            await prisma.reminder.update({
              where: { id: reminder.id },
              data: { sent7: true },
            });
          }
        }
      }

      console.log("✅ Reminder cycle completed");
    } catch (error) {
      console.error("❌ Reminder scheduler error:", error.message);
    }
  });

  console.log("✅ Reminder Scheduler Started");
}
