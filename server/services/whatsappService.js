
import axios from "axios";

const GRAPH_URL = "https://graph.facebook.com/v18.0";
const PHONE_ID = process.env.WA_PHONE_NUMBER_ID;
const TOKEN = process.env.WA_ACCESS_TOKEN;

if (!PHONE_ID || !TOKEN) {
  throw new Error("WhatsApp env variables are missing");
}

const axiosInstance = axios.create({
  baseURL: GRAPH_URL,
  headers: {
    Authorization: `Bearer ${TOKEN}`,
    "Content-Type": "application/json",
  },
});

/* TEMPLATE */
export const sendWhatsAppTemplate = async ({
  to,
  templateName,
  languageCode,
  variables = [],
}) => {
  const payload = {
    messaging_product: "whatsapp",
    to,
    type: "template",
    template: {
      name: templateName,
      language: { code: languageCode },
      components: [
        {
          type: "body",
          parameters: variables.map((v) => ({
            type: "text",
            text: String(v),
          })),
        },
      ],
    },
  };

  const res = await axiosInstance.post(`/${PHONE_ID}/messages`, payload);

  // ✅ RETURN ONLY MESSAGE ID (STRING)
  return res.data?.messages?.[0]?.id || null;
};

/* IMAGE */
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

/* DOCUMENT */
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
