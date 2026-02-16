import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  sendBikeServiceApprovalWhatsApp,
  sendBikeServiceNotification,
} from "../controllers/bikeWhatsappController.js";
import {uploadBikeServiceImagesToR2} from "../services/bikeMediaUploadService.js"

const router = express.Router();

// APPROVAL
router.post("/:id/whatsapp-approval", protect, sendBikeServiceApprovalWhatsApp);

// READY
router.post("/:id/whatsapp-ready", protect, (req, res) => {
  return sendBikeServiceNotification({ ...req, body: { type: "READY" } }, res);
});

// ESTIMATE
router.post("/:id/whatsapp-estimate", protect, (req, res) => {
  return sendBikeServiceNotification(
    { ...req, body: { type: "ESTIMATE" } },
    res,
  );
});

// INVOICE
router.post("/:id/whatsapp-invoice", protect, (req, res) => {
  return sendBikeServiceNotification(
    { ...req, body: { type: "INVOICE" } },
    res,
  );
});

router.post("/:id/upload-images", async (req, res) => {
  try {
    const urls = await uploadBikeServiceImagesToR2(req.params.id);
    res.json({ success: true, urls });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
