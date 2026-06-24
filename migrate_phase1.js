const fs = require('fs');
const envConfig = fs.readFileSync('.env', 'utf8');
envConfig.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    let val = match[2].trim();
    if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
    if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
    process.env[match[1]] = val;
  }
});

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  try {
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "isPreorder" BOOLEAN NOT NULL DEFAULT false;
      ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "releaseDate" TIMESTAMP(3);
      ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "isGraded" BOOLEAN NOT NULL DEFAULT false;
      ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "gradingCompany" TEXT;
      ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "grade" TEXT;
    `);
    console.log("Migration successful");
  } catch (err) {
    console.error("Migration failed:", err);
  } finally {
    await prisma.$disconnect();
  }
}
run();
