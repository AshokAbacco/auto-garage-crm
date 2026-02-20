import prisma from "../models/prismaClient.js";
/* ======================================================
   Utility Validators
====================================================== */

const validatePAN = (pan) => {
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  return panRegex.test(pan);
};

const validateIFSC = (ifsc) => {
  const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
  return ifscRegex.test(ifsc);
};

/* ======================================================
   1️⃣ GET MY KYC
====================================================== */
export const getMyKyc = async (req, res) => {
  try {
    if (req.user.type !== "owner") {
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
        kycStatus: true,
        panDocumentType: true,
        bankProofType: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      ...user,
      hasPanDocument: !!user.panDocumentType,
      hasBankProof: !!user.bankProofType,
    });
  } catch (error) {
    console.error("Get KYC error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/* ======================================================
   2️⃣ UPDATE MY KYC DETAILS
====================================================== */
export const updateMyKyc = async (req, res) => {
  try {
    if (req.user.type !== "owner") {
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
    } = req.body;

    if (panNumber && !validatePAN(panNumber)) {
      return res.status(400).json({ message: "Invalid PAN format" });
    }

    if (ifscCode && !validateIFSC(ifscCode)) {
      return res.status(400).json({ message: "Invalid IFSC format" });
    }

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
        kycStatus: "PENDING", // 🔥 Reset on update
      },
      select: {
        upiId: true,
        bankAccount: true,
        accountName: true,
        bankName: true,
        branch: true,
        ifscCode: true,
        panNumber: true,
        kycStatus: true,
      },
    });

    res.json({
      message: "KYC updated successfully. Verification pending.",
      data: updatedUser,
    });
  } catch (error) {
    console.error("Update KYC error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/* ======================================================
   3️⃣ UPLOAD DOCUMENTS
====================================================== */
export const uploadKycDocuments = async (req, res) => {
  try {
    if (req.user.type !== "owner") {
      return res.status(403).json({ message: "Access denied" });
    }

    const panFile = req.files?.panDocument?.[0];
    const bankFile = req.files?.bankProofDocument?.[0];

    if (!panFile && !bankFile) {
      return res.status(400).json({
        message: "No files uploaded",
      });
    }

    const updateData = {
      kycStatus: "PENDING", // 🔥 Reset on document upload
    };

    if (panFile) {
      updateData.panDocument = panFile.buffer;
      updateData.panDocumentType = panFile.mimetype;
    }

    if (bankFile) {
      updateData.bankProofDocument = bankFile.buffer;
      updateData.bankProofType = bankFile.mimetype;
    }

    await prisma.user.update({
      where: { id: req.user.id },
      data: updateData,
    });

    res.json({
      message: "Documents uploaded successfully. Verification pending.",
    });
  } catch (error) {
    console.error("Upload KYC documents error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
