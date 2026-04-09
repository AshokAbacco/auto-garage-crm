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

  // 🔥 IMPORTANT:
  // `:id` here is actually externalServiceId (UUID from App DB)
  // NOT CRM service.id (INT)
  // Used to map App Service → MarketplaceService (CRM)
  // Do NOT change this unless both systems share same IDs
  router.get("/services/:id/garages", controller.getGarages);

  // (optional rename → /bookings, keeping /book for now)
  router.post("/book", controller.createBooking);

  router.get("/booking/:id", controller.getBooking);
  router.post("/client-lookup", controller.clientLookup); 

  // ==============================
  // 🆕 SERVICE DETAILS (IMAGE + DESCRIPTION)
  // ==============================
  router.patch(
    "/services/:id/details", // ✅ This uses CRM service.id (INT)
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
