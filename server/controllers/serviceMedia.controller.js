import prisma from "../models/prismaClient.js";
import { uploadToR2 } from "../utils/r2Upload.js";

export const uploadServiceMedia = async (req, res) => {
  try {
    const serviceId = Number(req.params.serviceId);
    if (!serviceId) {
      return res.status(400).json({ message: "Invalid service ID" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const service = await prisma.service.findFirst({
      where: {
        id: serviceId,
        client: { userId: req.user.id },
      },
    });

    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    // 🔼 Upload to R2
    const { url } = await uploadToR2({
      buffer: req.file.buffer,
      mimeType: req.file.mimetype,
      folder: `services/${serviceId}`,
    });

    // 💾 Save DB record
    const media = await prisma.serviceMedia.create({
      data: {
        serviceId,
        fileName: req.file.originalname,
        mimeType: req.file.mimetype,
        mediaUrl: url,
      },
    });

    return res.json(media);
  } catch (err) {
    console.error("uploadServiceMedia error:", err);
    return res.status(500).json({ message: "Media upload failed" });
  }
};
