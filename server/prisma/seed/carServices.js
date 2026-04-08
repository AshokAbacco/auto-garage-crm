import { PrismaClient } from "@prisma/client";
import XLSX from "xlsx";
import path from "path";
import { fileURLToPath } from "url";

const prisma = new PrismaClient();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ==============================
// SLUG
// ==============================
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

// ==============================
// CRM TYPE
// ==============================
function getCrmType(mainService) {
  const name = (mainService || "").toLowerCase();

  if (name.includes("bike")) return "BIKE";
  if (name.includes("wash")) return "WASH";
  return "CAR";
}

// ==============================
// MAIN SEED
// ==============================
async function main() {
  console.log("📄 Reading Excel file...");

  const filePath = path.join(__dirname, "services.xlsx");

  const workbook = XLSX.readFile(filePath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet);

  let currentMainService = null;
  let currentSection = null;

  for (const row of rows) {
    // ==============================
    // HANDLE HIERARCHY
    // ==============================
    if (row["Main Service"]) {
      currentMainService = row["Main Service"].trim();
    }

    if (row["Section"]) {
      currentSection = row["Section"].trim();
    }

    const subService = row["Sub Service"];

    if (!subService) continue;

    if (!currentMainService || !currentSection) {
      console.warn("⚠ Skipping row due to missing hierarchy:", row);
      continue;
    }

    const name = subService.trim();
    const slug = slugify(name);

    const crmType = getCrmType(currentMainService);

    const basePrice = row["Price"] ? Number(row["Price"]) : null;

    const originalPrice = row["Original Price"]
      ? Number(row["Original Price"])
      : null;

    // ==============================
    // PREVENT DUPLICATE
    // ==============================
    const existing = await prisma.marketplaceService.findUnique({
      where: { slug },
    });

    if (existing) {
      console.log(`⚠ Already exists: ${existing.name}`);
      continue;
    }

    // ==============================
    // CREATE SERVICE
    // ==============================
    const service = await prisma.marketplaceService.create({
      data: {
        name,
        slug,

        // 🔥 IMPORTANT FIXES
        externalServiceId: slug, // TEMP (replace with app UUID later)
        mainCategory: currentMainService,
        subCategory: currentSection,

        crmType,

        basePrice,
        description: null,
        image: null,
      },
    });

    console.log(
      `✅ ${crmType} → ${service.name} (${currentMainService} > ${currentSection})`,
    );
  }

  console.log("🎉 Marketplace services inserted successfully.");
}

// ==============================
main()
  .catch((error) => {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
