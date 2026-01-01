// server/routes/serviceRoutes.js
import express from "express";
import multer from "multer";
import {
  getServices,
  getServiceById,
  getServicesByClient,
  createService,
  updateService,
  deleteService,
  getServiceTypes,
  searchSubServices,
  createSubService,
  getServiceForBilling,
} from "../controllers/serviceController.js";
import { createInvoiceFromService } from "../controllers/invoiceController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// ✅ Multer memory storage (required for DB storage)
const upload = multer({
  storage: multer.memoryStorage(),
});

/* ========================
   SERVICE MANAGEMENT ROUTES
   ======================== */

// Service types (must be before :id)
router.get("/list", protect, getServiceTypes);

// Sub-service search
router.get("/sub-services/search", protect, searchSubServices);

// Service for billing
router.get("/:id/billing", protect, getServiceForBilling);

// List services
router.get("/", protect, getServices);

// Services by client
router.get("/client/:clientId", protect, getServicesByClient);

// Get single service
router.get("/:id", protect, getServiceById);

// ✅ CREATE SERVICE (IMPORTANT FIX)
// protect FIRST, upload SECOND
// field name MUST be "images"
router.post("/", protect, upload.array("images", 20), createService);

// ✅ UPDATE SERVICE (IMPORTANT FIX)
router.put("/:id", protect, upload.array("images", 20), updateService);

// Delete service
router.delete("/:id", protect, deleteService);

// Create sub-service
router.post("/sub-services", protect, createSubService);

// Create invoice from service
router.post("/:id/create-invoice", protect, createInvoiceFromService);

export default router;
