// server/routes/clientRoutes.js
import express from "express";
import {
    getClients,
    getClientById,
    createClient,
    updateClient,
    deleteClient,
} from "../controllers/clientController.js";
import { protect, requireActivePlan  } from "../middleware/authMiddleware.js";

const router = express.Router();

// All routes require auth
router.use(protect);

// CRUD
router.get("/", requireActivePlan, getClients);
router.get("/:id",requireActivePlan, getClientById);
router.post("/",requireActivePlan , createClient);
router.put("/:id",requireActivePlan, updateClient);
router.delete("/:id",requireActivePlan, deleteClient);

export default router;
