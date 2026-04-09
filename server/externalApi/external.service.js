import prisma from "../models/prismaClient.js";

export const fetchExternalUsers = async ({ page, limit, search, crm }) => {
  const skip = (page - 1) * limit;

  const where = {
    AND: [
      search
        ? {
            OR: [
              { email: { contains: search, mode: "insensitive" } },
              { username: { contains: search, mode: "insensitive" } },
              { phone: { contains: search, mode: "insensitive" } },
              { companyName: { contains: search, mode: "insensitive" } },
            ],
          }
        : {},
      crm
        ? {
            allowedCrms: {
              has: crm,
            },
          }
        : {},
    ],
  };

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true, 
        email: true,
        username: true,
        phone: true,
        companyName: true,
        address: true,
        allowedCrms: true,
      },
    }),
    prisma.user.count({ where }),
  ]);

  return {
    users,
    total,
  };
};
