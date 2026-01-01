import prisma from "../models/prismaClient.js";
import { getOwnerUserId } from "../utils/getAdminId.js";
import { BikeparseOCRText } from "../utils/BikeOCRUtils.js";
import * as bikeOcrService from "../services/BikeOCRServices.js";

/* =====================================================
   UPLOAD OCR RECORD
   POST /api/bike-ocr
===================================================== */
export const uploadRecord = async (req, res, next) => {
  try {
    const ownerUserId = getOwnerUserId(req.user);

    const {
      bikeClientId,
      rawText,
      confidence,
      parsedData,
    } = req.body;

    if (!bikeClientId) {
      return res.status(400).json({
        success: false,
        message: "bikeClientId is required",
      });
    }

    const imageUrl = req.file
      ? `/uploads/bike-ocr/${req.file.filename}`
      : null;

    // 🔄 Safe parse
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

    const conf = confidence !== undefined ? Number(confidence) : null;

    if (!parsed && rawText) {
      parsed = BikeparseOCRText(rawText, conf || 0);
    }

    // 🔁 Duplicate RC check (owner + bike scope)
    const regNo = parsed?.regNo?.trim();
    if (regNo) {
      const existing = await prisma.bikeOcrRecord.findFirst({
        where: {
          ownerUserId,
          bikeClientId: Number(bikeClientId),
          parsedData: {
            path: ["regNo"],
            string_contains: regNo,
          },
        },
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

    // ✅ FINAL CORRECT CREATE
    const record = await prisma.bikeOcrRecord.create({
      data: {
        // required relations
        bike: {
          connect: { id: Number(bikeClientId) },
        },
        ownerUser: {
          connect: { id: ownerUserId },
        },
        createdBy: {
          connect: { id: req.user.id },
        },

        // data
        rawText: rawText || "",
        parsedData: parsed || {},
        confidence: conf,
        imageUrl,
      },
    });

    return res.status(201).json({
      success: true,
      record,
    });

  } catch (err) {
    console.error("uploadRecord error:", err);
    next(err);
  }
};

/* =====================================================
   LIST OCR RECORDS
   GET /api/bike-ocr
===================================================== */
export const listRecords = async (req, res, next) => {
  try {
    const ownerUserId = getOwnerUserId(req.user);
    const { bikeClientId } = req.query;

    if (!bikeClientId) {
      return res.status(400).json({
        success: false,
        message: "bikeClientId is required",
      });
    }

    const records = await prisma.bikeOcrRecord.findMany({
      where: {
        ownerUserId: ownerUserId,               // ✅ FIXED
        bikeClientId: Number(bikeClientId),
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        createdBy: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
    });

    return res.json({
      success: true,
      records,
    });

  } catch (err) {
    console.error("listRecords error:", err);
    next(err);
  }
};


/* =====================================================
   DELETE OCR RECORD
   DELETE /api/bike-ocr/:id
===================================================== */
export const deleteRecord = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const ownerUserId = getOwnerUserId(req.user);

    const record = await prisma.bikeOcrRecord.findFirst({
      where:
        req.user.role === "user"
          ? { id, ownerUserId }
          : { id, ownerUserId, createdById: req.user.id },
    });

    if (!record) {
      return res.status(404).json({
        success: false,
        message: "OCR record not found",
      });
    }

    await prisma.bikeOcrRecord.delete({
      where: { id: record.id },
    });

    res.json({
      success: true,
    });
  } catch (err) {
    console.error("deleteRecord error:", err);
    next(err);
  }
};

/* =====================================================
   LIST ALL OCR RECORDS (OWNER ONLY)
   GET /api/bike-ocr/all
===================================================== */
export const listAllRecords = async (req, res, next) => {
  try {
    if (req.user.role !== "user") {
      return res.status(403).json({
        error: "Forbidden",
      });
    }

    const ownerUserId = getOwnerUserId(req.user);

    const records = await prisma.bikeOcrRecord.findMany({
      where: { ownerUserId },
      orderBy: { createdAt: "desc" },
      include: {
        bike: true,
        createdBy: true,
      },
    });

    res.json(records);
  } catch (err) {
    console.error("listAllRecords error:", err);
    next(err);
  }
};
