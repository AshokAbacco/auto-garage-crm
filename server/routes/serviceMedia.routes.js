import express from "express";
import multer from "multer";
import { uploadServiceMedia } from "../controllers/serviceMedia.controller.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post(
  "/services/:serviceId/media",
  protect,
  upload.single("file"),
  uploadServiceMedia
);

export default router;
