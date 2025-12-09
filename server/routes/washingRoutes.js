import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  getWashingClients,
  getWashingClientById,
  createWashingClient,
  updateWashingClient,
  deleteWashingClient,
} from "../controllers/washingClientController.js";

const router = express.Router();

router.use(protect);

router.get("/", getWashingClients);
router.get("/:id", getWashingClientById);
router.post("/", createWashingClient);
router.put("/:id", updateWashingClient);
router.delete("/:id", deleteWashingClient);

export default router;
