import express from "express";
import { protect } from "../middleware/authMiddleware.js";

import {
  getBikeInvoices,
  getBikeInvoiceById,
  createBikeInvoice,
  updateBikeInvoice,
  deleteBikeInvoice,
} from "../controllers/bikeInvoiceController.js";

const router = express.Router();

router.use(protect);

router.get("/", getBikeInvoices);
router.get("/:id", getBikeInvoiceById);
router.post("/", createBikeInvoice);
router.put("/:id", updateBikeInvoice);
router.delete("/:id", deleteBikeInvoice);

export default router;
