import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  getBikeMakes,
  getBikeModels,
  getBikeImage,
} from "../controllers/bikeMetaController.js";

const router = express.Router();

router.get("/local-makes", protect, getBikeMakes);
router.get("/local-models", protect, getBikeModels);
router.get("/local-image",  getBikeImage);

export default router;
