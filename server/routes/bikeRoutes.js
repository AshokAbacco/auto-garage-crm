import express from "express";
import {
  createBike,
  updateBike,
  getBikes,
  getBikeById,
  deleteBike,
} from "../controllers/bikeControllers.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);
router.post("/", createBike);
router.put("/:id", updateBike);
router.get("/", getBikes);
router.get("/:id", getBikeById);
router.delete("/:id", deleteBike);


export default router;
