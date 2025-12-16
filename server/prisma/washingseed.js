import XLSX from "xlsx";
import prisma from "../models/prismaClient.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  console.log("🧼 Seeding Washing Services...");

  try {
    const filePath = path.resolve(
      __dirname,
      "../services/WashingServicesList.xlsx"
    );

    const workbook = XLSX.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    await prisma.washingServiceMedia.deleteMany();
    await prisma.washingService.deleteMany();
    await prisma.washingSubService.deleteMany();
    await prisma.washingServiceCategory.deleteMany();

    let currentCategory = null;

    for (const row of rows) {
      const category = (row[0] || "").trim();
      const sub = (row[1] || "").trim();
      const desc = (row[2] || "").trim();

      if (!category && !sub) continue;

      if (category && !sub) {
        currentCategory = await prisma.washingServiceCategory.create({
          data: {
            name: category,
            description: desc || null,
          },
        });

        console.log("Added Category:", category);
      }

      if (currentCategory && sub) {
        await prisma.washingSubService.create({
          data: {
            name: sub,
            description: desc || null,
            categoryId: currentCategory.id,
          },
        });

        console.log("  Added Sub:", sub);
      }
    }

    console.log("✅ Washing seed completed successfully.");
  } catch (err) {
    console.error("❌ Seed failed:", err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
