import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  getWashingServices,
  getWashingServiceById,
  getWashingServicesByClient,
  createWashingService,
  updateWashingService,
  deleteWashingService,
  getWashingServiceTypes,
  getWashingCategoriesByBike,
} from "../controllers/washingserviceController.js";

const router = express.Router();

router.use(protect);

// Categories
router.get("/types/list", getWashingServiceTypes);
router.get("/types/by-bike/:bikeId", getWashingCategoriesByBike);

// Services
router.get("/", getWashingServices);
router.get("/client/:clientId", getWashingServicesByClient);
router.get("/:id", getWashingServiceById);

// JSON ONLY — no multer
router.post("/create", createWashingService);
router.post("/", createWashingService);

router.put("/:id", updateWashingService);
 

export default router;
