// whatsappWebhookRoutes.js
import express from "express";
import { handleWhatsAppWebhook } from "../controllers/whatsappWebhookController.js";

const router = express.Router();

/**
 * ============================================================
 * WHATSAPP WEBHOOK VERIFICATION (GET)
 * Used by Meta during webhook setup
 * ============================================================
 */
router.get("/webhook", (req, res) => {
  const VERIFY_TOKEN = process.env.WA_VERIFY_TOKEN; // ✅ use same env everywhere

  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  console.log("Webhook verification request:", {
    mode,
    token,
    challenge,
  });

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    // ⚠️ MUST return raw challenge string (NO JSON)
    return res.status(200).send(challenge);
  }

  return res.sendStatus(403);
});
/* ============================================================
   POST → Incoming WhatsApp events (messages, buttons, status)
============================================================ */
router.post(
  "/webhook",
  express.json(), // ⚠️ REQUIRED or body will be undefined
  handleWhatsAppWebhook,
);

export default router;
