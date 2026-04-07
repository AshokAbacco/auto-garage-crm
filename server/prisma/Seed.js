// prisma/Seed.js
import XLSX from "xlsx";
import prisma from "../models/prismaClient.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  console.log("🏍️ Starting Bike Services FULL Seeding...");

  try {
    /* =====================================================
       GET OWNER USER (REQUIRED)
    ===================================================== */
    const ownerUser = await prisma.user.findFirst({
      where: { role: "user" }, // adjust if needed
      orderBy: { id: "asc" },
    });

    if (!ownerUser) {
      throw new Error("❌ No owner user found. Create a user first.");
    }

    console.log(`👤 Using ownerUserId: ${ownerUser.id}`);

    /* =====================================================
       EXCEL FILE
    ===================================================== */
    const filePath = path.resolve(
      __dirname,
      "../services/BikeServicesList.xlsx"
    );

    console.log(`📂 Reading Excel from: ${filePath}`);

    const workbook = XLSX.readFile(filePath, { cellText: true });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    console.log(`🧾 Total rows read from Excel: ${rows.length}`);

    /* =====================================================
       SAFE CLEANUP (ORDER MATTERS)
    ===================================================== */
    await prisma.bikeService.deleteMany();
    await prisma.bikeSubService.deleteMany();
    await prisma.bikeServiceCategory.deleteMany();

    let currentCategory = null;
    let totalCategories = 0;
    let totalSubServices = 0;

    /* =====================================================
       PROCESS ROWS
    ===================================================== */
    for (let index = 0; index < rows.length; index++) {
      const row = rows[index];
      if (!row) continue;

      const colA = String(row[0] || "").trim(); // Category
      const colB = String(row[1] || "").trim(); // Sub-Service
      const colC = String(row[2] || "").trim(); // Description (unused)
      const colD = String(row[3] || "").trim(); // Brand

      if (!colA && !colB) continue;

      /* ==============================
         CATEGORY ROW
      ============================== */
      if (colA && !colB) {
        const cleanedName = colA
          .replace(/[\r\n\t\uFEFF\u200B\u00A0]/g, "")
          .trim();

        const bikeBrand = colD !== "" ? colD : null;

        const existingCategory =
          await prisma.bikeServiceCategory.findFirst({
            where: {
              name: cleanedName,
              bikeBrand,
              ownerUserId: ownerUser.id,
            },
          });

        if (existingCategory) {
          currentCategory = existingCategory;
          console.log(
            `📁 (SKIPPED) Category: ${cleanedName} (${bikeBrand || "Universal"})`
          );
          continue;
        }

        currentCategory = await prisma.bikeServiceCategory.create({
          data: {
            name: cleanedName,
            bikeBrand,
            ownerUserId: ownerUser.id, // ✅ REQUIRED
          },
        });

        totalCategories++;
        console.log(
          `📁 Added Category: ${cleanedName} (${bikeBrand || "Universal"})`
        );
      }

      /* ==============================
         SUB-SERVICE ROW
      ============================== */
      else if (currentCategory && colB) {
        const cleanedSub = colB
          .replace(/[\r\n\t\uFEFF\u200B\u00A0]/g, "")
          .replace(/^'+/, "")
          .trim();

        if (!cleanedSub) continue;

        const exists = await prisma.bikeSubService.findFirst({
          where: {
            name: cleanedSub,
            categoryId: currentCategory.id,
          },
        });

        if (exists) {
          console.log(`   ➕ (SKIPPED) Sub-Service: ${cleanedSub}`);
          continue;
        }

        await prisma.bikeSubService.create({
          data: {
            name: cleanedSub,
            categoryId: currentCategory.id,
          },
        });

        totalSubServices++;
        console.log(`   ➕ Added Sub-Service: ${cleanedSub}`);
      }
    }

    /* =====================================================
       SUMMARY
    ===================================================== */
    console.log("\n🎉 BIKE SERVICES SEEDING COMPLETED!");
    console.log(`📦 Total Categories Added: ${totalCategories}`);
    console.log(`🧩 Total Sub-Services Added: ${totalSubServices}`);

    const summary = await prisma.bikeServiceCategory.groupBy({
      by: ["bikeBrand"],
      where: { ownerUserId: ownerUser.id },
      _count: true,
    });

    console.log("\n📊 Category Counts By Brand:");
    summary.forEach((row) => {
      console.log(`   ${row.bikeBrand || "Universal"}: ${row._count}`);
    });
  } catch (error) {
    console.error("❌ SEEDING FAILED:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
