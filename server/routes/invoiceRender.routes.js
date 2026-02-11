import express from "express";
import { getInvoiceDraft } from "../utils/invoiceStore.js";

const router = express.Router();

router.get("/invoice/render/:token", (req, res) => {
  const draft = getInvoiceDraft(req.params.token);
  if (!draft) return res.status(404).end();
  res.json(draft);
});

export default router;
