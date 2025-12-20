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

router.post("/", createWashingService);
router.post("/create", createWashingService);

router.put("/:id", updateWashingService);
router.delete("/:id", deleteWashingService); // ✅ THIS FIXES DELETE


export default router;
