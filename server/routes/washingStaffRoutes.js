import express from "express";
import {
  createWashingStaff,
  getWashingStaff,
  updateWashingStaff,
  deleteWashingStaff,
} from "../controllers/washingStaffController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.post("/", createWashingStaff);
router.get("/", getWashingStaff);
router.put("/:id", updateWashingStaff);
router.delete("/:id", deleteWashingStaff);

export default router;
