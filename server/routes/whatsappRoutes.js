// whatsappRoutes.js
import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  sendServiceApprovalWhatsApp,
} from "../controllers/whatsappController.js";

const router = express.Router();

/**
 * ============================================================
 * WHATSAPP SERVICE MESSAGING
 *
 * POST /services/:id/whatsapp
 * Body:
 * {
 *   type: "SERVICE_APPROVAL" // future extensible
 * }
 * ============================================================
 */
router.post(
  "/services/:id/whatsapp",
  protect,
  sendServiceApprovalWhatsApp
);

export default router;

