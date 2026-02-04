// whatsappService.js
import axios from "axios";

const GRAPH_URL = "https://graph.facebook.com/v18.0";
const PHONE_ID = process.env.WA_PHONE_NUMBER_ID;
const TOKEN = process.env.WA_ACCESS_TOKEN;

if (!PHONE_ID || !TOKEN) {
  throw new Error("WhatsApp env variables are missing");
}

/* ============================================================
   COMMON AXIOS CONFIG
============================================================ */
const axiosInstance = axios.create({
  baseURL: GRAPH_URL,
  headers: {
    Authorization: `Bearer ${TOKEN}`,
    "Content-Type": "application/json",
  },
});

/* ============================================================
   1️⃣ SEND WHATSAPP TEMPLATE (GENERIC – ALL TEMPLATES)
============================================================ */
export const sendWhatsAppTemplate = async ({
  to,
  templateName,
  languageCode, // ❗ no default
  variables = [],
}) => {
  if (!languageCode) {
    throw new Error("WhatsApp template languageCode is required");
  }

  const payload = {
    messaging_product: "whatsapp",
    to,
    type: "template",
    template: {
      name: templateName,
      language: { code: languageCode },
      ...(variables.length > 0 && {
        components: [
          {
            type: "body",
            parameters: variables.map((value) => ({
              type: "text",
              text: value,
            })),
          },
        ],
      }),
    },
  };

  const res = await axiosInstance.post(`/${PHONE_ID}/messages`, payload);
  return res.data;
};


/* ============================================================
   2️⃣ SEND IMAGE (ONLY DURING ACTIVE SESSION)
============================================================ */
export const sendWhatsAppImage = async ({ to, imageUrl, caption }) => {
  const payload = {
    messaging_product: "whatsapp",
    to,
    type: "image",
    image: {
      link: imageUrl,
      ...(caption && { caption }),
    },
  };

  const res = await axiosInstance.post(`/${PHONE_ID}/messages`, payload);
  return res.data;
};

/* ============================================================
   3️⃣ SEND DOCUMENT / PDF (INVOICE, PROFORMA, ETC.)
============================================================ */
export const sendWhatsAppDocument = async ({
  to,
  documentUrl,
  filename,
}) => {
  const payload = {
    messaging_product: "whatsapp",
    to,
    type: "document",
    document: {
      link: documentUrl,
      filename,
    },
  };

  const res = await axiosInstance.post(`/${PHONE_ID}/messages`, payload);
  return res.data;
};

/* ============================================================
   4️⃣ SIMPLE TEXT MESSAGE (DEBUG ONLY – DO NOT USE IN PROD)
============================================================ */
export const sendTestMessage = async ({ to, text }) => {
  const payload = {
    messaging_product: "whatsapp",
    to,
    type: "text",
    text: {
      body: text || "Test message from Auto Garage CRM",
    },
  };

  const res = await axiosInstance.post(`/${PHONE_ID}/messages`, payload);
  return res.data;
};
