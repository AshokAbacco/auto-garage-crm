// src/utils/referralCapture.js
//
// 🆕 New utility — fixes Payment.referralCode always being NULL. The
// backend already saves `customer.referenceCode` correctly (see
// payments.js: `referralCode: customer.referenceCode || null`), but
// nothing was ever populating that field automatically from a referral
// link — it only ever had a value if someone manually typed one into the
// "Reference Code" input. This captures `?ref=CODE` from the URL and
// persists it, so a referral link works the same way it's supposed to,
// without changing the existing field, its label, or its UI at all.

const STORAGE_KEY = "motordesk_referralCode";

export const getStoredReferralCode = () => {
  try {
    return localStorage.getItem(STORAGE_KEY) || "";
  } catch {
    return "";
  }
};

export const saveReferralCode = (code) => {
  try {
    if (code && code.trim()) {
      localStorage.setItem(STORAGE_KEY, code.trim());
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // localStorage may be unavailable (privacy mode, etc.) — non-fatal
  }
};

// Call with `location.search` (from react-router-dom's useLocation) on a
// page that can receive `?ref=`. If present, it's persisted so it survives
// even if the query string is gone by the time checkout happens; otherwise
// falls back to whatever was previously stored.
export const captureReferralCodeFromLocation = (search) => {
  const params = new URLSearchParams(search || "");
  const fromUrl = params.get("ref");

  if (fromUrl && fromUrl.trim()) {
    const normalized = fromUrl.trim();
    saveReferralCode(normalized);
    return normalized;
  }

  return getStoredReferralCode();
};