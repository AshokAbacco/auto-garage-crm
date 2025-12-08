// server/routes/carRoutes.js
import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
    getMakes,
    getModels,
    // getBrandAssets,
    getMetaData,
    getLocalMakes,
    getLocalModels
} from "../controllers/carController.js";

const router = express.Router();

// NHTSA API (Standard Plan – optional)
router.get("/makes", protect, getMakes);
router.get("/models", protect, getModels);

// Static metadata: fuel types, seats
router.get("/meta", protect, getMetaData);

// Local Indian dataset (Option A – recommended)
router.get("/local-makes", protect, getLocalMakes);
router.get("/local-models", protect, getLocalModels);

// Premium (Logo only)
// router.get("/assets", protect, getBrandAssets);

export default router;
