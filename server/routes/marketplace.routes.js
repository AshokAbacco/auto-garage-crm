// marketplace.routes.js
import express from "express";
import * as controller from "../controllers/marketplace.controller.js";
import { protect } from "../middleware/authMiddleware.js";
import upload from "../middleware/upload.js";

const router = express.Router();

// ==============================
// App APIs
// ==============================
router.get("/services", controller.getServices);
router.get("/services/:id/garages", controller.getGarages);
router.post("/book", controller.createBooking);
router.get("/booking/:id", controller.getBooking);

// ==============================
// 🆕 SERVICE DETAILS (IMAGE + DESCRIPTION)
// ==============================
router.patch(
  "/services/:id/details",
  upload.single("image"),
  protect,
  controller.updateServiceDetails,
);

// ==============================
// CRM APIs
// ==============================
router.post("/booking/:id/accept", controller.acceptBooking);
router.post("/booking/:id/reject", controller.rejectBooking);
router.get("/bookings", protect, controller.getAllBookings);

router.get("/garage-services", protect, controller.getGarageServices);
router.post("/garage-services", protect, controller.saveGarageService);

// ==============================
// PACKAGES
// ==============================
router.post("/packages", protect, controller.createPackage);
router.get("/packages", protect, controller.getPackages);
router.delete("/packages/:id", protect, controller.deletePackage);
router.patch("/packages/:id/toggle", protect, controller.togglePackage);

export default router;
