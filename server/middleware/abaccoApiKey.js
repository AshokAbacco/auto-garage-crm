// middleware/abaccoApiKey.js
//
// 🆕 Brand-new middleware, used ONLY by the new Abacco Tech integration
// (routes/abaccoReferral.routes.js). Completely separate from
// middleware/authMiddleware.js and anything the existing referral system
// (routes/referral.js) relies on — nothing here is shared with it.

export const verifyAbaccoApiKey = (req, res, next) => {
  const providedKey = req.headers["x-api-key"];
  const expectedKey = process.env.EXTERNAL_API_KEY;

  if (!expectedKey) {
    // Fail closed: if the key isn't configured on this server, nobody gets in.
    console.error("❌ EXTERNAL_API_KEY is not set in environment variables.");
    return res.status(500).json({
      success: false,
      message: "Server misconfiguration: API key not set",
    });
  }

  if (!providedKey) {
    return res.status(401).json({ success: false, message: "Missing x-api-key header" });
  }

  if (providedKey !== expectedKey) {
    return res.status(403).json({ success: false, message: "Invalid API key" });
  }

  next();
};