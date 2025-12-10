// server/prisma/seedBikeServicesManual.js
import prisma from "../models/prismaClient.js";

async function seedBikeServicesManual() {
  console.log("🏍️ Seeding Bike Services Manually...");

  try {
    // ✅ CLEAR OLD DATA (CORRECT MODEL NAMES)
    await prisma.bikeSubService.deleteMany();
    await prisma.bikeServiceCategory.deleteMany();

    console.log("🗑️ Old service data cleared");

    const data = [
      {
        name: "General Service",
        bikeBrand: null, // Universal
        subServices: ["Oil Change", "Air Filter Cleaning", "Chain Lubrication"],
      },
      {
        name: "Engine Service",
        bikeBrand: null,
        subServices: ["Spark Plug Change", "Engine Tuning"],
      },
      {
        name: "Honda Special Service",
        bikeBrand: "Honda",
        subServices: ["Honda ECU Check", "Honda Brake Service"],
      },
      {
        name: "Mahindra Special Service",
        bikeBrand: "Mahindra",
        subServices: ["Mahindra Engine Scan", "Mahindra Clutch Service"],
      },
    ];

    let totalCategories = 0;
    let totalSubServices = 0;

    for (const item of data) {
      const category = await prisma.bikeServiceCategory.create({
        data: {
          name: item.name,
          bikeBrand: item.bikeBrand,
        },
      });

      totalCategories++;

      for (const sub of item.subServices) {
        await prisma.bikeSubService.create({
          data: {
            name: sub,
            categoryId: category.id,
          },
        });

        totalSubServices++;
      }

      console.log(
        `📁 ${category.name} (${category.bikeBrand || "Universal"})`
      );
    }

    console.log("\n✅ MANUAL SEEDING COMPLETED!");
    console.log(`📦 Total Categories: ${totalCategories}`);
    console.log(`🧩 Total Sub-Services: ${totalSubServices}`);
  } catch (err) {
    console.error("❌ Manual seeding failed:", err.message);
  } finally {
    await prisma.$disconnect();
  }
}

seedBikeServicesManual();
