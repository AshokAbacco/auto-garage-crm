// server/routes/serviceRoutes.js
import express from "express";
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
  getServiceForBilling, // Add this import
} from "../controllers/serviceController.js";
import { createInvoiceFromService } from "../controllers/invoiceController.js";
import { protect } from "../middleware/authMiddleware.js";
import multer from "multer";

const router = express.Router();

// ✅ Multer memory storage for binary DB storage
const upload = multer({ storage: multer.memoryStorage() });

/* ========================
   SERVICE MANAGEMENT ROUTES
   ======================== */

// ✅ Service types route must be BEFORE :id
router.get("/list", protect, getServiceTypes);

// ✅ NEW: Sub-service search (typing suggestions)
router.get("/sub-services/search", protect, searchSubServices);

// ✅ NEW: Get service for billing
router.get("/:id/billing", protect, getServiceForBilling);

// ✅ List services
router.get("/", protect, getServices);

// ✅ Services by client
router.get("/client/:clientId", protect, getServicesByClient);

// ✅ Get single service
router.get("/:id", protect, getServiceById);

// ✅ Create service (multer must run BEFORE protect)
router.post("/", upload.array("media", 20), protect, createService);

// ✅ Update service (multer must run BEFORE protect)
router.put("/:id", upload.array("media", 20), protect, updateService);

// ✅ Delete service
router.delete("/:id", protect, deleteService);
router.post("/sub-services", protect, createSubService);
// In serviceRoutes.js
router.post("/:id/create-invoice", protect, createInvoiceFromService);

export default router;
