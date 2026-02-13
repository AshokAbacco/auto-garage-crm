import crypto from "crypto";

const store = new Map();

export function saveInvoiceDraft(draft, ttl = 5 * 60 * 1000) {
  const token = crypto.randomBytes(24).toString("hex");
  store.set(token, draft);

  setTimeout(() => store.delete(token), ttl);
  return token;
}

export function getInvoiceDraft(token) {
  return store.get(token);
}
