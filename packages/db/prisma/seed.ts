import { prisma } from "../lib/prisma"
import { Prisma } from "@prisma/client"  // ✅ import Prisma namespace separately

async function main() {
  await prisma.appSettings.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      listing_fee_usd: new Prisma.Decimal(0.99),  // ✅ correct Decimal syntax
      listing_expiry_days: 30,
    },
  })
}

main()
  .then(() => {
    console.log("✅ Seeded AppSettings successfully.")
  })
  .catch((e) => {
    console.error("❌ Error seeding AppSettings:", e)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
