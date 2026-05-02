// server/models/externalPrismaClient.js

import { PrismaClient } from "@prisma/client";

const externalPrisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.EXTERNAL_CRM_DB, // ✅ override DB here
    },
  },
  log:
    process.env.NODE_ENV === "development"
      ? ["query", "info", "warn", "error"]
      : ["error"],
});

export default externalPrisma;
