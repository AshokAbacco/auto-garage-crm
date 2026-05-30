// server/controllers/userKyc.controller.js
import prisma from "../models/prismaClient.js";

/* ======================================================
   Utility Validators
====================================================== */
const validatePAN = (pan) => {
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  return panRegex.test(pan);
};

const validateAadhar = (aadhar) => {
  // Strip spaces if any format mask was sent by frontend layout structures
  const cleanAadhar = aadhar.replace(/\s+/g, "");
  const aadharRegex = /^[0-9]{12}$/;
  return aadharRegex.test(cleanAadhar);
};

const validateGST = (gst) => {
  const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  return gstRegex.test(gst);
};

/* ======================================================
   1️⃣ GET MY KYC
====================================================== */
export const getMyKyc = async (req, res) => {
  console.log("--------------------------------------------------");
  console.log("🔍 [GET_MY_KYC] Fetching context for User ID:", req.user?.id);

  try {
    if (req.user.type !== "owner") {
      console.warn(
        "⚠️ [GET_MY_KYC] Access Denied: User is not an owner profile.",
      );
      return res.status(403).json({ message: "Access denied" });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        upiId: true,
        bankAccount: true,
        accountName: true,
        bankName: true,
        branch: true,
        ifscCode: true,
        panNumber: true,
        aadharNumber: true,
        gstNumber: true,
        incorporationNumber: true,
        kycStatus: true,
        panDocumentType: true,
        bankProofType: true,
        aadharDocumentType: true,
        gstDocumentType: true,
        incorporationDocumentType: true,
      },
    });

    if (!user) {
      console.error(
        `❌ [GET_MY_KYC] Record lookup failed for User ID ${req.user.id}`,
      );
      return res.status(404).json({ message: "User not found" });
    }

    console.log(
      "✅ [GET_MY_KYC] Database fetch successful. Processing response shape maps...",
    );
    const formattedPayload = {
      ...user,
      hasPanDocument: !!user.panDocumentType,
      hasBankProof: !!user.bankProofType,
      hasAadharDocument: !!user.aadharDocumentType,
      hasGstDocument: !!user.gstDocumentType,
      hasIncorporationDocument: !!user.incorporationDocumentType,
    };

    console.log(
      "📊 [GET_MY_KYC] Current KYC status on record:",
      formattedPayload.kycStatus,
    );
    return res.json(formattedPayload);
  } catch (error) {
    console.error("❌ [GET_MY_KYC] Error occurred during processing:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

/* ======================================================
   2️⃣ UPDATE MY KYC DETAILS
====================================================== */
export const updateMyKyc = async (req, res) => {
  console.log("--------------------------------------------------");
  console.log(
    "📝 [UPDATE_MY_KYC] Request payload received for User ID:",
    req.user?.id,
  );
  console.log("📦 [UPDATE_MY_KYC] Body parameters parsed:", {
    ...req.body,
    panNumber: req.body.panNumber ? "[PAN_PRESENT]" : null,
    aadharNumber: req.body.aadharNumber ? "[AADHAAR_PRESENT]" : null,
  });

  try {
    if (req.user.type !== "owner") {
      console.warn(
        "⚠️ [UPDATE_MY_KYC] Access Denied: Unauthorized request scope.",
      );
      return res.status(403).json({ message: "Access denied" });
    }

    const {
      upiId,
      bankAccount,
      accountName,
      bankName,
      branch,
      ifscCode,
      panNumber,
      aadharNumber,
      gstNumber,
      incorporationNumber,
    } = req.body;

    // Validation Filters (IFSC condition completely removed)
    if (panNumber && !validatePAN(panNumber)) {
      console.warn(
        "❌ [UPDATE_MY_KYC] Validation Failure: Invalid PAN format string.",
      );
      return res.status(400).json({ message: "Invalid PAN format" });
    }

    if (aadharNumber && !validateAadhar(aadharNumber)) {
      console.warn(
        "❌ [UPDATE_MY_KYC] Validation Failure: Invalid Aadhaar configuration sequence length.",
      );
      return res.status(400).json({
        message: "Invalid Aadhaar Card number format. Must be 12 digits.",
      });
    }

    if (gstNumber && !validateGST(gstNumber)) {
      console.warn(
        "❌ [UPDATE_MY_KYC] Validation Failure: Invalid GSTIN pattern match.",
      );
      return res.status(400).json({ message: "Invalid GSTIN number format." });
    }

    const cleanAadhar = aadharNumber ? aadharNumber.replace(/\s+/g, "") : null;
    console.log(
      "💾 [UPDATE_MY_KYC] Writing database row transaction details directly to user record...",
    );

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        upiId,
        bankAccount,
        accountName,
        bankName,
        branch,
        ifscCode,
        panNumber,
        aadharNumber: cleanAadhar,
        gstNumber,
        incorporationNumber,
        kycStatus: "PENDING",
      },
      select: {
        upiId: true,
        bankAccount: true,
        accountName: true,
        bankName: true,
        branch: true,
        ifscCode: true,
        panNumber: true,
        aadharNumber: true,
        gstNumber: true,
        incorporationNumber: true,
        kycStatus: true,
      },
    });

    console.log(
      "✅ [UPDATE_MY_KYC] Database operation successful. Sync status swapped to PENDING.",
    );
    return res.json({
      message: "KYC updated successfully. Verification pending.",
      data: updatedUser,
    });
  } catch (error) {
    console.error(
      "❌ [UPDATE_MY_KYC] Critical processing transaction exception thrown:",
      error,
    );
    return res.status(500).json({ message: "Server error" });
  }
};

/* ======================================================
   3️⃣ UPLOAD DOCUMENTS
====================================================== */
export const uploadKycDocuments = async (req, res) => {
  console.log("--------------------------------------------------");
  console.log(
    "📂 [UPLOAD_KYC_DOCUMENTS] File buffer stream context received for User ID:",
    req.user?.id,
  );

  try {
    if (req.user.type !== "owner") {
      console.warn(
        "⚠️ [UPLOAD_KYC_DOCUMENTS] Access Denied: User type parameters validation failed.",
      );
      return res.status(403).json({ message: "Access denied" });
    }

    console.log("📁 [UPLOAD_KYC_DOCUMENTS] Active field files map overview:", {
      panDocument: req.files?.panDocument
        ? `[${req.files.panDocument[0].mimetype} - ${req.files.panDocument[0].size} bytes]`
        : "Empty",
      bankProofDocument: req.files?.bankProofDocument
        ? `[${req.files.bankProofDocument[0].mimetype} - ${req.files.bankProofDocument[0].size} bytes]`
        : "Empty",
      aadharDocument: req.files?.aadharDocument
        ? `[${req.files.aadharDocument[0].mimetype} - ${req.files.aadharDocument[0].size} bytes]`
        : "Empty",
      gstDocument: req.files?.gstDocument
        ? `[${req.files.gstDocument[0].mimetype} - ${req.files.gstDocument[0].size} bytes]`
        : "Empty",
      incorporationDocument: req.files?.incorporationDocument
        ? `[${req.files.incorporationDocument[0].mimetype} - ${req.files.incorporationDocument[0].size} bytes]`
        : "Empty",
    });

    const panFile = req.files?.panDocument?.[0];
    const bankFile = req.files?.bankProofDocument?.[0];
    const aadharFile = req.files?.aadharDocument?.[0];
    const gstFile = req.files?.gstDocument?.[0];
    const incorporationFile = req.files?.incorporationDocument?.[0];

    if (
      !panFile &&
      !bankFile &&
      !aadharFile &&
      !gstFile &&
      !incorporationFile
    ) {
      console.warn(
        "⚠️ [UPLOAD_KYC_DOCUMENTS] No files uploaded payload found in multipart stream.",
      );
      return res.status(400).json({
        message: "No files uploaded",
      });
    }

    const updateData = {
      kycStatus: "PENDING",
    };

    if (panFile) {
      updateData.panDocument = panFile.buffer;
      updateData.panDocumentType = panFile.mimetype;
    }
    if (bankFile) {
      updateData.bankProofDocument = bankFile.buffer;
      updateData.bankProofType = bankFile.mimetype;
    }
    if (aadharFile) {
      updateData.aadharDocument = aadharFile.buffer;
      updateData.aadharDocumentType = aadharFile.mimetype;
    }
    if (gstFile) {
      updateData.gstDocument = gstFile.buffer;
      updateData.gstDocumentType = gstFile.mimetype;
    }
    if (incorporationFile) {
      updateData.incorporationDocument = incorporationFile.buffer;
      updateData.incorporationDocumentType = incorporationFile.mimetype;
    }

    console.log(
      "💾 [UPLOAD_KYC_DOCUMENTS] Writing binary bytes allocations directly into data clusters...",
    );
    await prisma.user.update({
      where: { id: req.user.id },
      data: updateData,
    });

    console.log(
      "✅ [UPLOAD_KYC_DOCUMENTS] Binary payload update completed successfully.",
    );
    return res.json({
      message: "Documents uploaded successfully. Verification pending.",
    });
  } catch (error) {
    console.error(
      "❌ [UPLOAD_KYC_DOCUMENTS] Critical exception caught during database mutation pipeline:",
      error,
    );
    return res.status(500).json({ message: "Server error" });
  }
};
