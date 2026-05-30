// server/routes/userKyc.routes.js
import express from "express";
import multer from "multer";
import { protect } from "../middleware/authMiddleware.js";
import {
  getMyKyc,
  updateMyKyc,
  uploadKycDocuments,
} from "../controllers/userKyc.controller.js";

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

router.get("/kyc", protect, getMyKyc);
router.put("/kyc", protect, updateMyKyc);

// 🔄 UPDATED: Multi-field file buffer interception allocation array block
router.post(
  "/kyc/documents",
  protect,
  upload.fields([
    { name: "panDocument", maxCount: 1 },
    { name: "bankProofDocument", maxCount: 1 },
    { name: "aadharDocument", maxCount: 1 },
    { name: "gstDocument", maxCount: 1 },
    { name: "incorporationDocument", maxCount: 1 },
  ]),
  uploadKycDocuments,
);

export default router;
