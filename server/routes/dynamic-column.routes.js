import express from "express";
import {
  createDynamicColumn,
  updateDynamicColumn,
  deleteDynamicColumn,
} from "../controllers/dynamic-column.controller.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createDynamicColumn);
router.patch("/:id", protect, updateDynamicColumn);
router.delete("/:id", protect, deleteDynamicColumn);

export default router;
