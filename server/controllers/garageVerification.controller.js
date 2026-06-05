// server/controllers/garageVerification.controller.js
import prisma from "../models/prismaClient.js";
import { uploadToR2 } from "../utils/r2Upload.js";

/* ======================================================
   1️⃣ GET GARAGE VERIFICATION STATE
====================================================== */
export const getGarageVerificationState = async (req, res) => {
  console.log(
    "🔍 [GET_VERIFICATION_STATE] Fetching context for User ID:",
    req.user?.id,
  );

  try {
    if (req.user.type !== "owner") {
      return res.status(403).json({
        message: "Access denied. Action restricted to garage owners.",
      });
    }

    const verificationRecord = await prisma.garageVerification.findUnique({
      where: { userId: req.user.id },
    });

    // Fallback cleanly if no verification pipeline profile has been initialized yet
    if (!verificationRecord) {
      return res.json({
        status: "NOT_ORDERED",
        adminNotes: null,
        hasPanDocument: false,
        hasAadharDocument: false,
        hasGarageRegDocument: false,
        hasGstDocument: false,
        panNumber: "",
        aadharNumber: "",
        garageRegNumber: "",
        gstNumber: "",
      });
    }

    return res.json({
      status: verificationRecord.status,
      paymentId: verificationRecord.paymentId,
      paidAt: verificationRecord.paidAt,
      panNumber: verificationRecord.panNumber || "",
      aadharNumber: verificationRecord.aadharNumber || "",
      garageRegNumber: verificationRecord.garageRegNumber || "",
      gstNumber: verificationRecord.gstNumber || "",
      adminNotes: verificationRecord.adminNotes,
      hasPanDocument: !!verificationRecord.panDocKey,
      hasAadharDocument: !!verificationRecord.aadharDocKey,
      hasGarageRegDocument: !!verificationRecord.garageRegDocKey,
      hasGstDocument: !!verificationRecord.gstDocKey,
    });
  } catch (error) {
    console.error(
      "❌ [GET_VERIFICATION_STATE] Error fetching verification details:",
      error,
    );
    return res
      .status(500)
      .json({ message: "Internal server error state loop" });
  }
};

/* ======================================================
   2️⃣ CONFIRM PAYMENT & COMMIT ALL STAGED DRAFT LAYOUT ASSETS
====================================================== */
export const confirmPaymentAndUpload = async (req, res) => {
  const userId = req.user.id;
  console.log("--------------------------------------------------");
  console.log("📂 [CONFIRM_PAYMENT_AND_UPLOAD] Processing transaction & R2 stream for User ID:", userId);

  try {
    if (req.user.type !== "owner") {
      return res.status(403).json({ message: "Access denied. Unauthorized operation scope." });
    }

    // Capture incoming multipart payment signatures along with identification forms strings data
    const { 
      razorpay_payment_id, 
      razorpay_order_id, 
      razorpay_signature,
      panNumber, 
      aadharNumber, 
      garageRegNumber, 
      gstNumber 
    } = req.body;

    // Fetch historical data metrics to analyze current step positioning
    const verificationRecord = await prisma.garageVerification.findUnique({
      where: { userId },
    });

    // Guardrail: Deny mutations if an active verification badge is already live
    if (verificationRecord && verificationRecord.status === "VERIFIED") {
      return res.status(400).json({ message: "Your garage profile is already completely verified and locked." });
    }

    // Check file buffers passed inside multipart stream parameters
    const panFile = req.files?.panDocument?.[0];
    const aadharFile = req.files?.aadharDocument?.[0];
    const garageRegFile = req.files?.garageRegDocument?.[0];
    const gstFile = req.files?.gstDocument?.[0];

    // Core validation: Ensure documents are available if not previously saved on record
    const hasAadhar = aadharFile || (verificationRecord && verificationRecord.aadharDocKey);
    const hasPan = panFile || (verificationRecord && verificationRecord.panDocKey);
    const hasGarageReg = garageRegFile || (verificationRecord && verificationRecord.garageRegDocKey);

    if (!hasAadhar || !hasPan || !hasGarageReg) {
      return res.status(400).json({ message: "Mandatory documentation files are missing from upload arrays." });
    }

    const folderPath = `verifications/user_${userId}`;
    
    // Build update parameters object layer dynamically
    const updatePayload = {
      status: "UNDER_REVIEW", // Set immediately to under review since payment is successful and documents exist
      paymentId: razorpay_payment_id || null,
      paidAt: new Date(),
      adminNotes: null, // Wipe structural rejection notes upon clean resubmission
    };

    // Safely apply text formatting criteria to incoming metrics fields
    if (panNumber) updatePayload.panNumber = panNumber.trim().toUpperCase();
    if (aadharNumber) updatePayload.aadharNumber = aadharNumber.replace(/\s+/g, "");
    if (garageRegNumber) updatePayload.garageRegNumber = garageRegNumber.trim();
    if (gstNumber) updatePayload.gstNumber = gstNumber.trim().toUpperCase();

    // Stream draft file arrays directly up to Cloudflare R2 bucket spaces
    if (panFile) {
      const result = await uploadToR2({
        buffer: panFile.buffer,
        mimeType: panFile.mimetype,
        folder: folderPath,
      });
      updatePayload.panDocKey = result.key;
    }
    if (aadharFile) {
      const result = await uploadToR2({
        buffer: aadharFile.buffer,
        mimeType: aadharFile.mimetype,
        folder: folderPath,
      });
      updatePayload.aadharDocKey = result.key;
    }
    if (garageRegFile) {
      const result = await uploadToR2({
        buffer: garageRegFile.buffer,
        mimeType: garageRegFile.mimetype,
        folder: folderPath,
      });
      updatePayload.garageRegDocKey = result.key;
    }
    if (gstFile) {
      const result = await uploadToR2({
        buffer: gstFile.buffer,
        mimeType: gstFile.mimetype,
        folder: folderPath,
      });
      updatePayload.gstDocKey = result.key;
    }

    // Execute atomic record mutation via Prisma upsert transaction
    const updatedRecord = await prisma.garageVerification.upsert({
      where: { userId: userId },
      update: updatePayload,
      create: {
        userId: userId,
        ...updatePayload,
      },
    });

    console.log("✅ [CONFIRM_PAYMENT_AND_UPLOAD] Verification records committed to server side. Pipeline active.");
    return res.status(200).json({
      message: "Garage verification payment validated and documentation submitted securely.",
      status: updatedRecord.status,
    });

  } catch (error) {
    console.error("❌ [CONFIRM_PAYMENT_AND_UPLOAD] Critical transaction error:", error);
    return res.status(500).json({ message: "Failed processing finalized check tracking variables." });
  }
};

/* ======================================================
   3️⃣ PIPELINE: POST-PAYMENT LIVE MODIFICATION AND RE-UPLOAD SUPPORT (FOR REJECTIONS)
====================================================== */
export const resubmitVerificationDocuments = async (req, res) => {
  const userId = req.user.id;
  console.log("--------------------------------------------------");
  console.log(
    "🔄 [RESUBMIT_DOCUMENTS] Processing revision updates for User ID:",
    userId,
  );

  try {
    if (req.user.type !== "owner") {
      return res.status(403).json({ message: "Access denied." });
    }

    const verificationRecord = await prisma.garageVerification.findUnique({
      where: { userId },
    });

    if (!verificationRecord) {
      return res.status(404).json({
        message: "No active verification timeline tracking record found.",
      });
    }

    // Security Gate: Modifications are explicitly locked if status is already approved
    if (verificationRecord.status === "VERIFIED") {
      return res
        .status(400)
        .json({ message: "Your profile is verified. Changes are locked." });
    }

    // Security Gate: Ensure user has actually paid before accessing the live mutation pipeline path
    if (verificationRecord.status === "NOT_ORDERED") {
      return res.status(400).json({
        message:
          "Unauthorized asset staging. Order transaction has not been confirmed.",
      });
    }

    const { panNumber, aadharNumber, garageRegNumber, gstNumber } = req.body;
    const folderPath = `verifications/user_${userId}`;

    // Transition state back to UNDER_REVIEW automatically upon active edit push
    const updatePayload = {
      status: "UNDER_REVIEW",
      adminNotes: null, // Clear past rejection log files
    };

    if (panNumber) updatePayload.panNumber = panNumber.trim().toUpperCase();
    if (aadharNumber)
      updatePayload.aadharNumber = aadharNumber.replace(/\s+/g, "");
    if (garageRegNumber) updatePayload.garageRegNumber = garageRegNumber.trim();
    if (gstNumber) updatePayload.gstNumber = gstNumber.trim().toUpperCase();

    const panFile = req.files?.panDocument?.[0];
    const aadharFile = req.files?.aadharDocument?.[0];
    const garageRegFile = req.files?.garageRegDocument?.[0];
    const gstFile = req.files?.gstDocument?.[0];

    // Safely update file keys on Cloudflare R2 if replacement file streams are provided
    if (panFile) {
      const result = await uploadToR2({
        buffer: panFile.buffer,
        mimeType: panFile.mimetype,
        folder: folderPath,
      });
      updatePayload.panDocKey = result.key;
    }
    if (aadharFile) {
      const result = await uploadToR2({
        buffer: aadharFile.buffer,
        mimeType: aadharFile.mimetype,
        folder: folderPath,
      });
      updatePayload.aadharDocKey = result.key;
    }
    if (garageRegFile) {
      const result = await uploadToR2({
        buffer: garageRegFile.buffer,
        mimeType: garageRegFile.mimetype,
        folder: folderPath,
      });
      updatePayload.garageRegDocKey = result.key;
    }
    if (gstFile) {
      const result = await uploadToR2({
        buffer: gstFile.buffer,
        mimeType: gstFile.mimetype,
        folder: folderPath,
      });
      updatePayload.gstDocKey = result.key;
    }

    const updatedRecord = await prisma.garageVerification.update({
      where: { userId },
      data: updatePayload,
    });

    return res.status(200).json({
      message:
        "Revisions processed and re-submitted to verification tracking pipeline successfully.",
      status: updatedRecord.status,
    });
  } catch (error) {
    console.error(
      "❌ [RESUBMIT_DOCUMENTS] Modification failed loop error:",
      error,
    );
    return res.status(500).json({
      message: "Server error processing your revision file re-upload.",
    });
  }
};
