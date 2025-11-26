// server/routes/userRoutes.js

import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  getProfile,
  updateProfile,
  changePassword,
  uploadProfileImage,
} from "../controllers/userController.js";

const router = express.Router();
import multer from "multer";

// Multer upload storage
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });
// Get user profile
router.get("/profile", protect, getProfile);

// Update username / email
router.put("/update", protect, updateProfile);

// Change password
router.put("/change-password", protect, changePassword);

// Upload profile image

router.post("/upload-image", protect, uploadProfileImage);


export default router;
