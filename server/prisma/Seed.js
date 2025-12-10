import XLSX from "xlsx";
import prisma from "../models/prismaClient.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  console.log("🏍️ Starting Bike Services FULL Seeding...");

  try {
    // 📌 EXCEL FILE LOCATION: server/services/BikeServicesList.xlsx
    const filePath = path.resolve(__dirname, "../services/BikeServicesList.xlsx");
    console.log(`📂 Reading Excel from: ${filePath}`);

    const workbook = XLSX.readFile(filePath, { cellText: true });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[ sheetName ];
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    console.log(`🧾 Total rows read from Excel: ${rows.length}`);

    // ⚠️ OPTIONAL CLEANUP (USE ONLY ONCE TO RESET)
    // ✅ SAFE CLEANUP — WILL NOT CRASH
    if (prisma.bikeService) await prisma.bikeService.deleteMany();
    if (prisma.bikeSubService) await prisma.bikeSubService.deleteMany();
    if (prisma.bikeServiceCategory) await prisma.bikeServiceCategory.deleteMany();


    let currentCategory = null;
    let totalCategories = 0;
    let totalSubServices = 0;

    for (let index = 0; index < rows.length; index++) {
      const row = rows[index];
      if (!row) continue;

      const colA = (row[0] || "").trim(); // Category
      const colB = (row[1] || "").trim(); // Sub-Service
      const colC = (row[2] || "").trim(); // Description
      const colD = (row[3] || "").trim(); // Brand

      // Skip empty row
      if (!colA && !colB) continue;

      // ==============================
      // ✅ CATEGORY ROW
      // ==============================
      if (colA && !colB) {
        const cleanedName = colA.replace(/[\r\n\t\uFEFF\u200B\u00A0]/g, "").trim();
        const bikeBrand = colD !== "" ? colD : null;

        // Prevent duplicates (if Excel repeats category names)
        const existingCategory = await prisma.bikeServiceCategory.findFirst({
          where: {
            name: cleanedName,
            bikeBrand: bikeBrand,
          },
        });

        if (existingCategory) {
          currentCategory = existingCategory;
          console.log(`📁 (SKIPPED - Already Exists) Category: ${cleanedName}`);
          continue;
        }

        // Create new category
        currentCategory = await prisma.bikeServiceCategory.create({
          data: {
            name: cleanedName,
            bikeBrand: bikeBrand,
          },
        });

        totalCategories++;
        const brandLabel = bikeBrand ? `(${bikeBrand})` : "(Universal)";

        console.log(`📁 Added Category: ${cleanedName} ${brandLabel}`);
      }

      // ==============================
      // ✅ SUB-SERVICE ROW
      // ==============================
      else if (currentCategory && colB) {
        const cleanedSub = colB
          .replace(/[\r\n\t\uFEFF\u200B\u00A0]/g, "")
          .replace(/^'+/, "")
          .trim();

        if (!cleanedSub) continue;

        // Avoid duplicate sub-services
        const exists = await prisma.bikeSubService.findFirst({
          where: {
            name: cleanedSub,
            categoryId: currentCategory.id,
          },
        });

        if (exists) {
          console.log(`   ➕ (SKIPPED - Already Exists) Sub-Service: ${cleanedSub}`);
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

    // ==============================
    // ✅ FINAL SUMMARY
    // ==============================
    console.log("\n🎉 BIKE SERVICES SEEDING COMPLETED!");
    console.log(`📦 Total Categories Added: ${totalCategories}`);
    console.log(`🧩 Total Sub-Services Added: ${totalSubServices}`);

    const summary = await prisma.bikeServiceCategory.groupBy({
      by: ["bikeBrand"],
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
