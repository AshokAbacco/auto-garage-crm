import prisma from "../models/prismaClient.js";

export const createRecord = async ({
  userId,
  bikeClientId,
  rawText,
  parsedData,
  confidence,
  imageUrl,
}) => {
  const bike = await prisma.bike.findUnique({
    where: { id: bikeClientId },
  });

  if (!bike) throw new Error("Bike client not found");

  return prisma.bikeOcrRecord.create({
    data: {
      userId,
      bikeClientId,
      rawText,
      parsedData,
      confidence,
      imageUrl,
    },
  });
};

export const listRecords = async (userId, bikeClientId) => {
  const where = { userId };
  if (bikeClientId) where.bikeClientId = bikeClientId;

  return prisma.bikeOcrRecord.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });
};

export const deleteRecord = async (userId, id) => {
  const record = await prisma.bikeOcrRecord.findUnique({ where: { id } });
  if (!record) throw new Error("Record not found");
  if (record.userId !== userId) throw new Error("Unauthorized");

  await prisma.bikeOcrRecord.delete({ where: { id } });
};
