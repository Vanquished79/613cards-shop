const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Running migration...");
  await prisma.$executeRawUnsafe(`ALTER TABLE "Product" ADD COLUMN "serialNumber" TEXT;`);
  console.log("Migration successful!");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
