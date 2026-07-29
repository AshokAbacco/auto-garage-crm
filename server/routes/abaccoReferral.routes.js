// routes/abaccoReferral.routes.js
//
// 🆕 Brand-new route file for the Abacco Tech integration. Deliberately
// separate from routes/referral.js, which stays completely untouched.

import express from "express";
import { getAbaccoReferrals } from "../controllers/abaccoReferral.controller.js";
import { verifyAbaccoApiKey } from "../middleware/abaccoApiKey.js";

const router = express.Router();

// GET /api/abacco/referrals — pull-based endpoint for Abacco Tech's sync
// job. Protected by x-api-key (EXTERNAL_API_KEY), not by user/session auth,
// since the caller is another backend, not a logged-in Motor Desk user.
router.get("/referrals", verifyAbaccoApiKey, getAbaccoReferrals);

export default router;