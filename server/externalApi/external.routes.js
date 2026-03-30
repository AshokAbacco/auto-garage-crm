import express from "express";
import { getExternalUsers } from "./external.controller.js";
import { verifyExternalApiKey } from "./external.middleware.js";

const router = express.Router();

// GET /api/v1/external/users
router.get("/users", verifyExternalApiKey, getExternalUsers);

export default router;
