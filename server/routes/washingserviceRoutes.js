import express from "express";
import {
  getServiceCategories,
  getSubServicesByCategory,
  createService,
} from "../controllers/serviceController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

// If using multer or similar for uploads:
import multer from "multer";
const upload = multer({ dest: "uploads/" });

const router = express.Router();

// GET /api/service-categories
router.get(
  "/service-categories",
  authMiddleware,
  getServiceCategories
);

// GET /api/service-categories/:categoryId/sub-services
router.get(
  "/service-categories/:categoryId/sub-services",
  authMiddleware,
  getSubServicesByCategory
);

// POST /api/services
router.post(
  "/services",
  authMiddleware,
  upload.array("files"),
  createService
);

export default router;
