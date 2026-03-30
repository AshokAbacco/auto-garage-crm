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

// 🔥 Detect CRM Type from Main Service
function getCrmType(mainService) {
  const name = mainService.toLowerCase();

  if (name.includes("wash")) return "WASH";
  return "CAR"; // default
}

async function main() {
  console.log("📄 Reading Excel file...");

  const filePath = path.join(__dirname, "services.xlsx");

  const workbook = XLSX.readFile(filePath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet);

  for (const row of rows) {
    if (!row["Sub Service"]) continue;

    const name = row["Sub Service"];
    const slug = slugify(name);

    const crmType = getCrmType(row["Main Service"] || "");

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
        crmType,
        description: row["Section"] || null,
        basePrice: Number(row["Price"]) || null,
      },
    });

    console.log(`✅ ${crmType} → ${service.name}`);
  }

  console.log("🎉 Marketplace services (Car/Wash) inserted.");
}

main()
  .catch((error) => {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
