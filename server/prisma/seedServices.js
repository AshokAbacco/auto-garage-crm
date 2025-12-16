

import XLSX from "xlsx";
import prisma from "../models/prismaClient.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function seedServices() {
    console.log("🚗 Starting Garage Services seeding...");

    try {
        const filePath = path.resolve(__dirname, "../services/List.xlsx");
        console.log(`📂 Reading Excel from: ${filePath}`);

        const workbook = XLSX.readFile(filePath, { cellText: true });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

        console.log(`🧾 Total rows read from Excel: ${rows.length}`);

        // Optional cleanup (uncomment for reseeding)
        // await prisma.subService.deleteMany();
        // await prisma.serviceCategory.deleteMany();

        let currentCategory = null;
        let totalCategories = 0;
        let totalSubServices = 0;

        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            if (!row) continue;

            const colA = (row[0] || "").toString().trim();
            const colB = (row[1] || "").toString().trim();

            // Skip completely empty rows
            if (!colA && !colB) continue;

            // 🟢 Detect Category (column A has a name, column B empty)
            if (colA && !colB) {
                const name = colA.replace(/[\r\n\t\uFEFF\u200B\u00A0]/g, "").trim();
                if (!name) continue;

                const category = await prisma.serviceCategory.create({
                    data: { name },
                });

                currentCategory = category;
                totalCategories++;
                console.log(`📁 Added Category: ${name}`);
            }

            // 🟣 Detect Sub-Service (column B has value)
            else if (currentCategory && colB) {
                const cleanName = colB
                    .replace(/[\r\n\t\uFEFF\u200B\u00A0]/g, "")
                    .replace(/^'+/, "")
                    .trim();

                if (!cleanName) continue;

                await prisma.subService.create({
                    data: {
                        name: cleanName,
                        categoryId: currentCategory.id,
                    },
                });
                totalSubServices++;
                console.log(`   ➕ Added Sub-Service: ${cleanName}`);
            }
        }

        console.log("✅ Seeding completed successfully!");
        console.log(`📦 Total Categories: ${totalCategories}`);
        console.log(`🧩 Total Sub-Services: ${totalSubServices}`);
    } catch (error) {
        console.error("❌ Error seeding services:", error);
    } finally {
        await prisma.$disconnect();
    }
}

seedServices();
