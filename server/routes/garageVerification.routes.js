// server/routes/garageVerification.routes.js
import express from "express";
import multer from "multer";
import { protect } from "../middleware/authMiddleware.js";
import {
  getGarageVerificationState,
  confirmPaymentAndUpload,
  resubmitVerificationDocuments,
} from "../controllers/garageVerification.controller.js";

const router = express.Router();

// Configure memory allocation parameters for incoming multipart file streams
const multerInterceptor = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // Strict 5MB size ceiling limit allocation per file block
  },
});

// 🔒 Protected Verification Tracking Endpoints
router.get("/state", protect, getGarageVerificationState);

/**
 * 🪙 1️⃣ INITIAL TRANSACTION COMPLETE HANDSHAKE
 * Processes payment confirmation tracking logs and uploads draft file binaries together
 */
router.post(
  "/confirm-payment-and-upload",
  protect,
  multerInterceptor.fields([
    { name: "panDocument", maxCount: 1 },
    { name: "aadharDocument", maxCount: 1 },
    { name: "garageRegDocument", maxCount: 1 },
    { name: "gstDocument", maxCount: 1 },
  ]),
  confirmPaymentAndUpload,
);

/**
 * 🔄 2️⃣ RE-SUBMISSION & REVISION TUNNEL
 * Allows post-payment modifications, draft adjustments, and admin rejection re-uploads
 */
router.put(
  "/resubmit-documents",
  protect,
  multerInterceptor.fields([
    { name: "panDocument", maxCount: 1 },
    { name: "aadharDocument", maxCount: 1 },
    { name: "garageRegDocument", maxCount: 1 },
    { name: "gstDocument", maxCount: 1 },
  ]),
  resubmitVerificationDocuments,
);

export default router;
