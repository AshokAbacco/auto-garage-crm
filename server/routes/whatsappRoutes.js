import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { sendServiceApprovalWhatsApp } from "../controllers/whatsappController.js";

const router = express.Router();

router.post(
  "/services/:id/send-whatsapp",
  protect,
  sendServiceApprovalWhatsApp
);

export default router;
