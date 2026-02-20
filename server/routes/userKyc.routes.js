import express from "express";
import multer from "multer";
import { protect } from "../middleware/authMiddleware.js";
import {
  getMyKyc,
  updateMyKyc,
  uploadKycDocuments,
} from "../controllers/userKyc.controller.js";

const router = express.Router();

/* ======================================================
   Multer Configuration (Memory Storage for DB Bytes)
====================================================== */

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

/* ======================================================
   Routes
====================================================== */

// GET logged-in user's KYC
router.get("/kyc", protect, getMyKyc);

// UPDATE payout + KYC details
router.put("/kyc", protect, updateMyKyc);

// Upload documents
router.post(
  "/kyc/documents",
  protect,
  upload.fields([
    { name: "panDocument", maxCount: 1 },
    { name: "bankProofDocument", maxCount: 1 },
  ]),
  uploadKycDocuments,
);

export default router;
