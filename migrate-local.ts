import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const queries = [
    `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "vipTier" TEXT NOT NULL DEFAULT 'MEMBER';`,
    `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "lifetimeSpend" DOUBLE PRECISION NOT NULL DEFAULT 0;`,
    `ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "shippingMethod" TEXT;`,
    `ALTER TABLE "BuyListItem" ADD COLUMN IF NOT EXISTS "aiGradeEstimate" TEXT;`,
    `ALTER TABLE "BuyListItem" ADD COLUMN IF NOT EXISTS "aiCentering" TEXT;`,
    
    `CREATE TABLE IF NOT EXISTS "PortfolioItem" (
        "id" SERIAL NOT NULL,
        "userId" INTEGER NOT NULL,
        "cardName" TEXT NOT NULL,
        "cardSeries" TEXT,
        "isGraded" BOOLEAN NOT NULL DEFAULT false,
        "gradingCompany" TEXT,
        "grade" TEXT,
        "purchasePrice" DOUBLE PRECISION,
        "currentValue" DOUBLE PRECISION,
        "imageUrl" TEXT,
        "isVaulted" BOOLEAN NOT NULL DEFAULT false,
        "vaultStatus" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "PortfolioItem_pkey" PRIMARY KEY ("id")
    );`,
    
    `DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'PortfolioItem_userId_fkey') THEN
        ALTER TABLE "PortfolioItem" ADD CONSTRAINT "PortfolioItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
      END IF;
    END $$;`
  ];

  console.log("Executing migration queries...");
  for (let i = 0; i < queries.length; i++) {
    await prisma.$executeRawUnsafe(queries[i]);
  }
  console.log("All migrations completed successfully.");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
