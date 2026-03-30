import { PrismaClient } from "@prisma/client";
import XLSX from "xlsx";
import path from "path";
import { fileURLToPath } from "url";

const prisma = new PrismaClient();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function slugify(text) {
  return text
    .toString()
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/--+/g, "-");
}

async function main() {
  console.log("📄 Reading Bike Services Excel...");

  const filePath = path.join(__dirname, "bike-services.xlsx");

  const workbook = XLSX.readFile(filePath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet);

  for (const row of rows) {
    if (!row.serviceName) continue;

    const name = row.serviceName;
    const slug = slugify(name);

    // prevent duplicates
    const existing = await prisma.marketplaceService.findUnique({
      where: { slug },
    });

    if (existing) {
      console.log(`⚠ Already exists: ${existing.name}`);
      continue;
    }

    const service = await prisma.marketplaceService.create({
      data: {
        name,
        slug,
        crmType: "BIKE",
        description: row.section || null,
        basePrice: Number(row.price) || null,
      },
    });

    console.log(`🚲 BIKE → ${service.name}`);
  }

  console.log("🎉 Bike marketplace services inserted.");
}

main()
  .catch((error) => {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

  