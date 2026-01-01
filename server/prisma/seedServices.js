

import XLSX from "xlsx";
import prisma from "../models/prismaClient.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Utility to clean Excel text completely
 * - Removes invisible unicode characters
 * - Removes leading & trailing ', =, ===
 */
function cleanText(value = "") {
  return value
    .toString()
    .replace(/[\r\n\t\uFEFF\u200B\u00A0]/g, "") // invisible chars
    .replace(/^['=]+/, "") // leading ' or =
    .replace(/['=]+$/, "") // trailing ' or =
    .trim();
}

async function seedServices() {
  console.log("Starting Garage Services seeding...");

  try {
    const filePath = path.resolve(__dirname, "../services/List.xlsx");
    console.log(`Reading Excel from: ${filePath}`);

    const workbook = XLSX.readFile(filePath, { cellText: true });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    console.log(`Total rows read from Excel: ${rows.length}`);

    // Uncomment for full reseed
    // await prisma.subService.deleteMany();
    // await prisma.serviceCategory.deleteMany();

    let currentCategory = null;
    let totalCategories = 0;
    let totalSubServices = 0;

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      if (!row) continue;

      const colA = cleanText(row[0]);
      const colB = cleanText(row[1]);

      // Skip empty rows
      if (!colA && !colB) continue;

      /**
       * CATEGORY (Column A only)
       */
      if (colA && !colB) {
        const category = await prisma.serviceCategory.create({
          data: { name: colA },
        });

        currentCategory = category;
        totalCategories++;
        console.log(`Added Category: ${colA}`);
      } else if (currentCategory && colB) {
        /**
         * SUB-SERVICE (Column B)
         */
        await prisma.subService.create({
          data: {
            name: colB,
            categoryId: currentCategory.id,
          },
        });

        totalSubServices++;
        console.log(`   Added Sub-Service: ${colB}`);
      }
    }

    /**
     * Ensure "Other" category exists
     */
    const existingOther = await prisma.serviceCategory.findFirst({
      where: { name: "Other" },
    });

    if (!existingOther) {
      await prisma.serviceCategory.create({
        data: { name: "Other" },
      });
      totalCategories++;
      console.log("Added Category: Other");
    }

    console.log("Seeding completed successfully");
    console.log(`Total Categories: ${totalCategories}`);
    console.log(`Total Sub-Services: ${totalSubServices}`);
  } catch (error) {
    console.error("Error seeding services:", error);
  } finally {
    await prisma.$disconnect();
  }
}

seedServices();
