import axios from "axios";

const GRAPH_URL = "https://graph.facebook.com/v18.0";
const PHONE_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const TOKEN = process.env.WHATSAPP_TOKEN;

/* ============================================================
   1️⃣ SIMPLE TEXT MESSAGE (DEBUG / TEST ONLY)
   Use this only to confirm delivery
============================================================ */
export const sendTestMessage = async ({ to }) => {
  const url = `${GRAPH_URL}/${PHONE_ID}/messages`;

  const payload = {
    messaging_product: "whatsapp",
    to,
    type: "text",
    text: {
      body: "✅ Test message from Auto Garage CRM backend",
    },
  };

  const res = await axios.post(url, payload, {
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "Content-Type": "application/json",
    },
  });

  return res.data;
};

/* ============================================================
   2️⃣ SEND UTILITY TEMPLATE (OPENS 24H WINDOW)
   Uses existing approved template: jaspers_market_ord
============================================================ */
export const sendServiceApprovalTemplate = async ({ to }) => {
  const url = `${GRAPH_URL}/${PHONE_ID}/messages`;

  const payload = {
    messaging_product: "whatsapp",
    to,
    type: "template",
    template: {
      name: "hello_world",
      language: { code: "en_US" },
    },
  };

  await axios.post(url, payload, {
    headers: {
      Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
      "Content-Type": "application/json",
    },
  });
};


/* ============================================================
   3️⃣ SEND APPROVAL BUTTONS (AFTER WINDOW IS OPEN)
============================================================ */
export const sendServiceApprovalButtons = async ({ to, service }) => {
  const url = `${GRAPH_URL}/${PHONE_ID}/messages`;

  const payload = {
    messaging_product: "whatsapp",
    to,
    type: "interactive",
    interactive: {
      type: "button",
      body: {
        text:
          `*Service Approval Required*\n\n` +
          `Client: ${service.client.fullName}\n` +
          `Vehicle: ${service.client.vehicleMake} ${service.client.vehicleModel}\n` +
          `Reg No: ${service.client.regNumber}\n\n` +
          `Total Amount: ₹${service.cost}\n\n` +
          `Please select an option below:`,
      },
      action: {
        buttons: [
          {
            type: "reply",
            reply: {
              id: `SERVICE_APPROVE_${service.id}`,
              title: "Approve",
            },
          },
          {
            type: "reply",
            reply: {
              id: `SERVICE_REJECT_${service.id}`,
              title: "Reject",
            },
          },
          {
            type: "reply",
            reply: {
              id: `SERVICE_CONDITION_${service.id}`,
              title: "Approve w Cond",
            },
          },
        ],
      },
    },
  };

  const res = await axios.post(url, payload, {
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "Content-Type": "application/json",
    },
  });

  return res.data;
};
