import express from "express";
import {
  getDynamicTables,
  getDynamicTableDetails,
} from "../controllers/dynamic-read.controller.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/tables", protect, getDynamicTables);
router.get("/tables/:tableId", protect, getDynamicTableDetails);

export default router;
