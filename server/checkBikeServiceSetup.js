// checkBikeServiceSetup.js
// Run this on your server to check database setup

import prisma from "./models/prismaClient.js";

async function checkSetup() {
  console.log("\n🔍 CHECKING BIKE SERVICE SETUP...\n");

  try {
    // 1. Check Bikes
    const bikes = await prisma.bike.findMany({
    select: {
        id: true,
        ownerName: true,
        regNumber: true,
        bikeBrand: true,
        bikeModel: true,
    },
    });

    
    console.log("📋 BIKES IN DATABASE:");
    console.log("Total bikes:", bikes.length);
    bikes.forEach((bike) => {
      console.log(` - ID: ${bike.id}, Owner: ${bike.ownerName}, Model: ${bike.bikeModel}, Brand: ${bike.bikeBrand || "❌ NULL"}, Reg: ${bike.regNumber}`);

    });

    // 2. Check Service Categories
    const categories = await prisma.bikeServiceCategory.findMany({
      include: {
        subServices: true,
      },
    });
    
    console.log("\n📋 SERVICE CATEGORIES:");
    console.log("Total categories:", categories.length);
    
    if (categories.length === 0) {
      console.log("❌ NO CATEGORIES FOUND! You need to seed the database.");
    } else {
      categories.forEach((cat) => {
        console.log(`  - ID: ${cat.id}, Name: ${cat.name}, Brand: ${cat.bikeBrand || "Universal (NULL)"}`);
        if (cat.subServices.length > 0) {
          cat.subServices.forEach((sub) => {
            console.log(`      └─ ${sub.name}`);
          });
        }
      });
    }

    // 3. Test getCategoriesByBike logic
    if (bikes.length > 0) {
      console.log("\n🧪 TESTING CATEGORY RETRIEVAL FOR FIRST BIKE:");
      const testBike = bikes[0];
      console.log(`Testing with: ${testBike.fullName} (${testBike.bikeBrand || "NO BRAND"})`);
      
      const matchingCategories = await prisma.bikeServiceCategory.findMany({
        where: {
          OR: [
            { bikeBrand: testBike.bikeBrand },
            { bikeBrand: null },
          ],
        },
        include: {
          subServices: true,
        },
      });
      
      console.log(`Found ${matchingCategories.length} categories for this bike:`);
      matchingCategories.forEach((cat) => {
        console.log(`  ✅ ${cat.name} (${cat.bikeBrand || "Universal"})`);
      });
      
      if (matchingCategories.length === 0) {
        console.log("❌ NO CATEGORIES MATCH THIS BIKE!");
        console.log("SOLUTION: Either:");
        console.log("  1. Add bikeBrand to your bikes table");
        console.log("  2. Add categories with matching bikeBrand");
        console.log("  3. Add universal categories (bikeBrand = null)");
      }
    }

    // 4. Check for common issues
    console.log("\n⚠️  POTENTIAL ISSUES:");
    
    const bikesWithoutBrand = bikes.filter((b) => !b.bikeBrand);
    if (bikesWithoutBrand.length > 0) {
      console.log(`  ⚠️  ${bikesWithoutBrand.length} bikes have no bikeBrand set`);
    }
    
    const universalCategories = categories.filter((c) => !c.bikeBrand);
    if (universalCategories.length === 0) {
      console.log("  ⚠️  No universal categories found (bikeBrand = null)");
    }

  } catch (error) {
    console.error("❌ ERROR:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkSetup();