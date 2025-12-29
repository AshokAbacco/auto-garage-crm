import express from "express";
import { protect } from "../middleware/authMiddleware.js";

import {
  getWashBillings,
  getWashBillingById,
  createWashBilling,
  updateWashBilling,
  deleteWashBilling,
} from "../controllers/washInvoiceController.js";

const router = express.Router();

router.use(protect);

router.get("/", getWashBillings);
router.get("/:id", getWashBillingById);
router.post("/", createWashBilling);
router.put("/:id", updateWashBilling);
router.delete("/:id", deleteWashBilling);

export default router;
