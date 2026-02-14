import express from "express";
import { createDynamicRow } from "../controllers/dynamic-row.controller.js";
import { protect } from "../middleware/authMiddleware.js";
import { updateDynamicRow } from "../controllers/dynamic-row.controller.js";
import { deleteDynamicRow } from "../controllers/dynamic-row.controller.js";



const router = express.Router();

router.post("/", protect, createDynamicRow);

router.patch("/:id", protect, updateDynamicRow);
router.delete("/:id", protect, deleteDynamicRow);

export default router;
