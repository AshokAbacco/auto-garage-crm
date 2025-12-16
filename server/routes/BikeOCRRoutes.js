import express from "express";
import multer from "multer";
import path from "path";
import { protect } from "../middleware/authMiddleware.js";
import { requirePlan } from "../middleware/planMiddleware.js";
import prisma from "../models/prismaClient.js";
import * as bikeOcrController from "../controllers/BikeOCRController.js";

const router = express.Router();

const UPLOAD_DIR = "./uploads/bike-ocr";

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, name);
  },
});

const upload = multer({ storage, limits: { fileSize: 8 * 1024 * 1024 } });

/* ================= UPLOAD ================= */
router.post(
  "/upload",
  protect,
  async (req, res, next) => {
    const { plan, id } = req.user;

    if (plan === "BASIC") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const count = await prisma.bikeOcrRecord.count({
        where: {
          userId: id,
          createdAt: { gte: today },
        },
      });

      if (count >= 10) {
        return res.status(403).json({
          success: false,
          message: "Daily upload limit reached for BASIC plan.",
        });
      }
    }

    next();
  },
  upload.single("image"),
  bikeOcrController.uploadRecord
);

/* ================= HISTORY ================= */
router.get("/history", protect, bikeOcrController.listRecords);

/* ================= DELETE ================= */
router.delete("/:id", protect, bikeOcrController.deleteRecord);

/* ================= ADMIN ================= */
router.get(
  "/all",
  protect,
  requirePlan(["PREMIUM"]),
  bikeOcrController.listAllRecords
);

export default router;
