// controllers/abaccoReferral.controller.js
//
// 🆕 New controller for the Abacco Tech integration — separate from
// anything in controllers used by the existing referral system.

import { getReferredPaymentsForAbacco } from "../services/abaccoReferral.service.js";

// GET /api/abacco/referrals
// Protected by x-api-key (see middleware/abaccoApiKey.js). Called by
// Abacco Tech's sync job, the same way it already pulls from School CRM's
// GET /api/payment/referrals.
export const getAbaccoReferrals = async (req, res) => {
  try {
    const referrals = await getReferredPaymentsForAbacco();
    return res.status(200).json(referrals);
  } catch (err) {
    console.error("❌ Abacco referral fetch error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch referred payments for Abacco Tech.",
    });
  }
};