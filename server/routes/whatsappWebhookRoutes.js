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
  const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN;

  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  }

  return res.sendStatus(403);
});

/**
 * ============================================================
 * WHATSAPP WEBHOOK EVENTS (POST)
 * IMPORTANT:
 * - DO NOT add auth middleware
 * - Always return 200
 * ============================================================
 */
router.post(
  "/webhook",
  express.json({ type: "*/*" }), // ensure Meta payload is parsed
  async (req, res) => {
    await handleWhatsAppWebhook(req, res);
  }
);

export default router;
