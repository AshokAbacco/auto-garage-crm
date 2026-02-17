import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  sendWashServiceApprovalWhatsApp,
  sendWashServiceNotification,
} from "../controllers/washWhatsAppController.js";
import { uploadWashServiceImagesToR2 } from "../services/washImageUploadService.js";

const router = express.Router();

// APPROVAL
router.post("/:id/whatsapp-approval", protect, sendWashServiceApprovalWhatsApp);

// READY
router.post("/:id/whatsapp-ready", protect, (req, res) => {
  return sendWashServiceNotification({ ...req, body: { type: "READY" } }, res);
});

// ESTIMATE
router.post("/:id/whatsapp-estimate", protect, (req, res) => {
  return sendWashServiceNotification(
    { ...req, body: { type: "ESTIMATE" } },
    res,
  );
});

// INVOICE
router.post("/:id/whatsapp-invoice", protect, (req, res) => {
  return sendWashServiceNotification(
    { ...req, body: { type: "INVOICE" } },
    res,
  );
});

// IMAGE UPLOAD
router.post("/:id/upload-images", async (req, res) => {
  try {
    const urls = await uploadWashServiceImagesToR2(req.params.id);
    res.json({ success: true, urls });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
