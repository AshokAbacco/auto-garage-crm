import prisma from "../models/prismaClient.js";
import { BikeparseOCRText } from "../utils/BikeOCRUtils.js";
import * as bikeOcrService from "../services/BikeOCRServices.js";

/* ================= UPLOAD ================= */
export const uploadRecord = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const { bikeClientId, rawText, confidence, parsedData } = req.body;
    if (!bikeClientId)
      return res.status(400).json({ error: "bikeClientId is required" });

    const imageUrl = req.file
      ? `/uploads/bike-ocr/${req.file.filename}`
      : null;

    let parsed = null;
    if (parsedData) {
      try {
        parsed =
          typeof parsedData === "string"
            ? JSON.parse(parsedData)
            : parsedData;
      } catch {
        parsed = null;
      }
    }

    const conf = confidence ? Number(confidence) : null;
    if (!parsed && rawText)
      parsed = BikeparseOCRText(rawText, conf || 0);

    /* 🔥 DUPLICATE RC CHECK */
    const regNo = parsed?.regNo?.trim();
    if (regNo) {
      const existing = await prisma.bikeOcrRecord.findFirst({
        where: {
          parsedData: {
            path: ["regNo"],
            string_contains: regNo,
          },
        },
        include: { bike: true },
      });

      if (existing) {
        return res.status(400).json({
          success: false,
          duplicate: true,
          message: `This RC (${regNo}) already exists`,
          bikeClientId: existing.bikeClientId,
        });
      }
    }

    const record = await bikeOcrService.createRecord({
      userId,
      bikeClientId: Number(bikeClientId),
      rawText: rawText || "",
      parsedData: parsed || {},
      confidence: conf,
      imageUrl,
    });

    res.status(201).json({ success: true, record });
  } catch (err) {
    next(err);
  }
};

/* ================= LIST ================= */
export const listRecords = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const bikeClientId = req.query.bikeClientId
      ? Number(req.query.bikeClientId)
      : null;

    const records = await bikeOcrService.listRecords(userId, bikeClientId);
    res.json(records);
  } catch (err) {
    next(err);
  }
};

/* ================= DELETE ================= */
export const deleteRecord = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const id = Number(req.params.id);

    await bikeOcrService.deleteRecord(userId, id);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
};

/* ================= ADMIN ================= */
export const listAllRecords = async (req, res, next) => {
  try {
    const { role, plan } = req.user;

    if (role !== "admin" && plan !== "PREMIUM") {
      return res.status(403).json({ error: "Forbidden" });
    }

    const records = await prisma.bikeOcrRecord.findMany({
      orderBy: { createdAt: "desc" },
      include: { bike: true, user: true },
    });

    res.json(records);
  } catch (err) {
    next(err);
  }
};
