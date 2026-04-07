import express from "express";
import { updateServiceApproval } from "../controllers/serviceApprovalController.js";
import {protect} from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/services/:id/approval", protect, updateServiceApproval);


export default router;
