// seed-external-ids.js
// Run ONCE from CRM root: node seed-external-ids.js
// Then DELETE this file — it's not needed again.

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  // Step 1: See what services exist in CRM right now
  const all = await prisma.marketplaceService.findMany({
    select: { id: true, name: true, slug: true, externalServiceId: true },
  });

  console.log("\n📋 Current CRM MarketplaceServices:");
  console.table(all);

  // Step 2: Map App UUID → CRM slug
  // Replace these values with your real App service UUIDs
  // You can find them from the cart log: item.id = "b3cb2e00-..."
  const mappings = [
    {
      slug: "standard-service",              // ← CRM slug (from table above)
      externalServiceId: "b3cb2e00-a6ba-4bca-abe0-db57512d4489", // ← App UUID
    },
    // Add more here as needed:
    // { slug: "basic-service", externalServiceId: "uuid-from-app-here" },
  ];

  for (const m of mappings) {
    try {
      const updated = await prisma.marketplaceService.update({
        where: { slug: m.slug },
        data: { externalServiceId: m.externalServiceId },
      });
      console.log(`✅ Linked: ${updated.name} → ${m.externalServiceId}`);
    } catch (err) {
      console.error(`❌ Failed for slug "${m.slug}":`, err.message);
    }
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());