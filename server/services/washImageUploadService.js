import prisma from "../models/prismaClient.js";
import { uploadBufferToR2 } from "./r2Service.js";

export const uploadWashServiceImagesToR2 = async (serviceId) => {
  try {
    const numericId = Number(serviceId);

    if (!numericId) {
      throw new Error("Invalid serviceId");
    }

    const mediaList = await prisma.washingServiceMedia.findMany({
      where: { washingServiceId: numericId },
    });

    if (!mediaList.length) {
      console.log("⚠️ No images found for wash service:", numericId);
      return [];
    }

    const uploadedUrls = [];

    for (const media of mediaList) {
      // ✅ Already uploaded
      if (media.r2Url) {
        uploadedUrls.push(media.r2Url);
        continue;
      }

      // ✅ Safety: Skip if no buffer
      if (!media.data) {
        console.log("⚠️ Skipping empty image buffer:", media.id);
        continue;
      }

      try {
        const uniqueKey = `wash-services/${numericId}/images/${Date.now()}-${media.id}-${media.fileName || "image.jpg"}`;

        const imageUrl = await uploadBufferToR2({
          buffer: media.data,
          key: uniqueKey,
          contentType: media.mimeType || "image/jpeg",
        });

        await prisma.washingServiceMedia.update({
          where: { id: media.id },
          data: { r2Url: imageUrl },
        });

        uploadedUrls.push(imageUrl);

        console.log("✅ Wash image uploaded to R2:", imageUrl);
      } catch (error) {
        console.error(
          `❌ Failed uploading wash image ID ${media.id}:`,
          error.message,
        );
      }
    }

    return uploadedUrls;
  } catch (error) {
    console.error("❌ uploadWashServiceImagesToR2 error:", error.message);
    throw error;
  }
};
