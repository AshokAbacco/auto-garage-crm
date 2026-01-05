// server/routes/bikeServiceRoutes.js
import express from "express";
import { protect } from "../middleware/authMiddleware.js";

import {
  getBikeServices,
  getBikeServiceById,
  getBikeServicesByClient,
  createBikeService,
  updateBikeService,
  deleteBikeService,
  getBikeServiceTypes,
  getCategoriesByBike, // ✅ THIS WAS MISSING — CAUSED ALL ERRORS
} from "../controllers/bikeServiceController.js";

const router = express.Router();
import multer from "multer";

const upload = multer({
  storage: multer.memoryStorage(),
});

router.use(protect);

// ✅ BIKE-BASED CATEGORY API (FRONTEND USES THIS)
router.get("/types/by-bike/:bikeId", getCategoriesByBike);

// ✅ OTHER ROUTES
router.get("/types/list", getBikeServiceTypes);
router.get("/", getBikeServices);
router.get("/client/:clientId", getBikeServicesByClient);
router.get("/:id", getBikeServiceById);
router.post("/", createBikeService);
router.put("/:id", updateBikeService);
router.delete("/:id", deleteBikeService);

export default router;
