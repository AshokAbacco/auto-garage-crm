import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  getWashingServices,
  getWashingServiceById,
  createWashingService,
  updateWashingService,
  deleteWashingService,
  getWashingServiceTypes,
  getWashingCategoriesByBike,
  getWashingServicesByClient,
  createWashingCategory,
  createWashingSubService
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
// Categories
router.get("/types/list", getWashingServiceTypes);
router.get("/types/by-bike/:bikeId", getWashingCategoriesByBike);

// ✅ ADD THESE
router.post("/types/create", createWashingCategory);
router.post("/sub/create", createWashingSubService);



export default router;
