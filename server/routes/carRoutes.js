import express from "express";
import { protect, requireActivePlan } from "../middleware/authMiddleware.js";
import {
    getMetaData,
    getLocalMakes,
    getLocalModels,
    getLocalImage,
    getBrandAssets
} from "../controllers/carController.js";

const router = express.Router();

// Local Indian dataset
router.get("/local-makes", protect, getLocalMakes);
router.get("/local-models", protect, getLocalModels);

// Local image lookup
router.get("/local-image", protect, getLocalImage);

// Metadata: seats + fuel types
router.get("/meta", protect, getMetaData);

// Brand logos (optional)
router.get("/assets", protect, getBrandAssets);

export default router;
