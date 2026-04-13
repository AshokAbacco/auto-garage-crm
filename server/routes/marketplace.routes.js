// src/routes/marketplace.routes.js
import express from "express";
import * as controller from "../controllers/marketplace.controller.js";
import { protect } from "../middleware/authMiddleware.js";
import upload from "../middleware/upload.js";

const router = express.Router();

// ============================================================
// App APIs (Mobile/Consumer Facing)
// ============================================================

/**
 * @route   GET /api/marketplace/services
 * @desc    Fetch hierarchical services (Main -> Section -> Service)
 */
router.get("/services", controller.getServices);

/**
 * @route   GET /api/marketplace/services/:id/garages
 * @param   id - externalServiceId (UUID)
 * @desc    Find garages offering a specific service
 */
router.get("/services/:id/garages", controller.getGarages);

/**
 * @route   POST /api/marketplace/book
 * @desc    Create a booking using externalServiceId (UUID)
 */
router.post("/book", controller.createBooking);

/**
 * @route   GET /api/marketplace/booking/:id
 * @desc    Get detailed booking info
 */
router.get("/booking/:id", controller.getBooking);

/**
 * @route   POST /api/marketplace/client-lookup
 * @desc    Find or create a CRM client based on App User info
 */
router.post("/client-lookup", controller.clientLookup);

// ============================================================
// CRM Metadata & Pricing APIs (Admin/Garage Facing)
// ============================================================

/**
 * @route   PATCH /api/marketplace/services/:id/details
 * @param   id - Local INT ID or External UUID
 * @desc    Unified Save: Metadata (Image/Desc) + Toggle + Pricing Overrides
 */
router.patch(
  "/services/:id/details",
  protect,
  upload.single("image"),
  controller.updateServiceDetails,
);

// ============================================================
// CRM Operations (Booking Management)
// ============================================================

router.post("/booking/:id/accept", protect, controller.acceptBooking);
router.post("/booking/:id/reject", protect, controller.rejectBooking);

/**
 * @route   GET /api/marketplace/bookings
 * @desc    Garage owner's list of requests
 */
router.get("/bookings", protect, controller.getAllBookings);

// ============================================================
// Garage Service Settings
// ============================================================

/**
 * @route   GET /api/marketplace/garage-services
 */
router.get("/garage-services", protect, controller.getGarageServices);

/**
 * @route   POST /api/marketplace/garage-services
 * @desc    Standalone UPSERT for pricing/toggle
 */
router.post("/garage-services", protect, controller.saveGarageService);

// ============================================================
// Packages (Bundled Services)
// ============================================================

router.post("/packages", protect, controller.createPackage);
router.get("/packages", protect, controller.getPackages);
router.delete("/packages/:id", protect, controller.deletePackage);
router.patch("/packages/:id/toggle", protect, controller.togglePackage);

export default router;
