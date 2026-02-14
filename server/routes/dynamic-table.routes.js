import express from "express";
import {
  createDynamicTable,
  renameDynamicTable,
  deleteDynamicTable,
} from "../controllers/dynamic-table.controller.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createDynamicTable);
router.patch("/:id", protect, renameDynamicTable);
router.delete("/:id", protect, deleteDynamicTable);

export default router;
