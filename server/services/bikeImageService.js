// server/services/bikeImageService.js

import prisma from "../models/prismaClient.js";
import { uploadBufferToR2 } from "./r2Service.js";

export const uploadBikeServiceImagesToR2 = async (serviceId) => {
  const mediaList = await prisma.bikeServiceMedia.findMany({
    where: { bikeServiceId: Number(serviceId) },
  });

  if (!mediaList.length) return [];

  const urls = [];

  for (const media of mediaList) {
    const key = `bike-services/${serviceId}/images/${Date.now()}-${media.fileName}`;

    const url = await uploadBufferToR2({
      buffer: media.data,
      key,
      contentType: media.mimeType,
    });

    urls.push(url);
  }

  return urls;
};
