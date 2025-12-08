import express from "express";
import multer from "multer";
import path from "path";
import { protect } from "../middleware/authMiddleware.js";
import { requirePlan } from "../middleware/planMiddleware.js";
import prisma from "../models/prismaClient.js";
import * as ocrController from "../controllers/OCRController.js";

const router = express.Router();

const UPLOAD_DIR = process.env.UPLOAD_DIR || "./uploads/ocr";
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOAD_DIR),
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const name = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
        cb(null, name);
    },
});
const upload = multer({ storage, limits: { fileSize: 8 * 1024 * 1024 } });

// UPLOAD OCR (with plan limit)
router.post(
    "/upload",
    protect,
    async (req, res, next) => {
        const { plan, id } = req.user;

        if (plan === "BASIC") {
            const todayStart = new Date();
            todayStart.setHours(0, 0, 0, 0);

            const count = await prisma.ocrRecord.count({
                where: {
                    userId: id,
                    createdAt: { gte: todayStart }
                }
            });

            if (count >= 10) {
                return res.status(403).json({
                    success: false,
                    message: "Daily upload limit reached for BASIC plan."
                });
            }
        }

        next();
    },
    upload.single("image"),
    ocrController.uploadRecord
);

router.get("/history", protect, ocrController.listRecords);
router.delete("/:id", protect, ocrController.deleteRecord);

// Premium-only: list ALL OCR entries in the system
router.get("/all", protect, requirePlan(["PREMIUM"]), ocrController.listAllRecords);

export default router;
