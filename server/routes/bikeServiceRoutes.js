// server/routes/bikeServiceRoutes.js
import express from "express";
import multer from "multer";
import { protect } from "../middleware/authMiddleware.js";

import {
  getBikeServices,
  getBikeServiceById,
  getBikeServicesByClient,
  createBikeService,
  updateBikeService,
  deleteBikeService,
  getBikeServiceTypes,
  getCategoriesByBike,
  getServiceMedia,
} from "../controllers/bikeServiceController.js";

const router = express.Router();

/* ================================
   MULTER CONFIG (MEMORY STORAGE)
================================ */
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB per file
  },
});

/* ================================
   AUTH MIDDLEWARE
================================ */
 

/* ================================
   SERVICE CATEGORY / TYPES
================================ */

// Categories filtered by bike brand
router.get("/types/by-bike/:bikeId", getCategoriesByBike);

// All service types
router.get("/types/list", getBikeServiceTypes);

/* ================================
   SERVICE MEDIA (MUST BE BEFORE :id)
================================ */
/* ================================
   SERVICE MEDIA (PUBLIC)
================================ */
router.get("/media/:id", getServiceMedia);

/* ================================
   AUTH MIDDLEWARE
================================ */
router.use(protect);

/* ================================
   BIKE SERVICES
================================ */

// Get all services
router.get("/", getBikeServices);

// Get services by client
router.get("/client/:clientId", getBikeServicesByClient);

// Get single service
router.get("/:id", getBikeServiceById);

// Create service (WITH FILES)
router.post(
  "/",
  upload.array("files"),
  createBikeService
);

// Update service (WITH FILES)
router.put(
  "/:id",
  upload.array("files"),
  updateBikeService
);

// Delete service
router.delete("/:id", deleteBikeService);

export default router;
