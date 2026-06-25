import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Manually add the missing columns to the database via SQL
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "taxAmount" DOUBLE PRECISION NOT NULL DEFAULT 0;
      ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "taxRate" DOUBLE PRECISION NOT NULL DEFAULT 0;
      ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "country" TEXT;
      
      -- Phase 1 Expansions
      ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "isPreorder" BOOLEAN NOT NULL DEFAULT false;
      ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "releaseDate" TIMESTAMP(3);
      ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "isGraded" BOOLEAN NOT NULL DEFAULT false;
      ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "gradingCompany" TEXT;
      ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "grade" TEXT;
      
      -- Phase 2 Expansions
      CREATE TABLE IF NOT EXISTS "WishlistItem" (
        "id" SERIAL NOT NULL,
        "userId" INTEGER NOT NULL,
        "productId" INTEGER NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "WishlistItem_pkey" PRIMARY KEY ("id")
      );
      
      CREATE UNIQUE INDEX IF NOT EXISTS "WishlistItem_userId_productId_key" ON "WishlistItem"("userId", "productId");

      -- Phase 3 Expansions
      CREATE TABLE IF NOT EXISTS "BuyListSubmission" (
        "id" SERIAL NOT NULL,
        "userId" INTEGER NOT NULL,
        "status" TEXT NOT NULL DEFAULT 'PENDING',
        "totalOffered" DOUBLE PRECISION,
        "notes" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "BuyListSubmission_pkey" PRIMARY KEY ("id")
      );

      CREATE TABLE IF NOT EXISTS "BuyListItem" (
        "id" SERIAL NOT NULL,
        "submissionId" INTEGER NOT NULL,
        "cardName" TEXT NOT NULL,
        "cardSeries" TEXT,
        "condition" TEXT NOT NULL,
        "isGraded" BOOLEAN NOT NULL DEFAULT false,
        "gradingCompany" TEXT,
        "grade" TEXT,
        "quantity" INTEGER NOT NULL DEFAULT 1,
        "expectedPrice" DOUBLE PRECISION,
        "offeredPrice" DOUBLE PRECISION,
        "status" TEXT NOT NULL DEFAULT 'PENDING',
        CONSTRAINT "BuyListItem_pkey" PRIMARY KEY ("id")
      );
    `);
    
    // Add additionalImages to Product
    await prisma.$executeRawUnsafe(`ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "additionalImages" TEXT[] DEFAULT ARRAY[]::TEXT[];`);
    
    // Create the StoreSettings table
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "StoreSettings" (
        "id" INTEGER NOT NULL DEFAULT 1,
        "taxEnabled" BOOLEAN NOT NULL DEFAULT false,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "StoreSettings_pkey" PRIMARY KEY ("id")
      );
    `);

    // Insert default settings if not exists
    await prisma.$executeRawUnsafe(`
      INSERT INTO "StoreSettings" ("id", "taxEnabled", "updatedAt")
      VALUES (1, false, CURRENT_TIMESTAMP)
      ON CONFLICT ("id") DO NOTHING;
    `);

    // PHASE 4 MIGRATION (Product Variations)
    console.log('Running Phase 4 Migration...');
    const phase4Sql = `
      -- 1. Create ProductVariation table
      CREATE TABLE IF NOT EXISTS "ProductVariation" (
          "id" SERIAL NOT NULL,
          "productId" INTEGER NOT NULL,
          "condition" TEXT NOT NULL DEFAULT 'N/A',
          "isGraded" BOOLEAN NOT NULL DEFAULT false,
          "gradingCompany" TEXT,
          "grade" TEXT,
          "price" DOUBLE PRECISION NOT NULL,
          "stock" INTEGER NOT NULL DEFAULT 0,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL,
          CONSTRAINT "ProductVariation_pkey" PRIMARY KEY ("id")
      );

      -- Add foreign key from ProductVariation to Product
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ProductVariation_productId_fkey') THEN
          ALTER TABLE "ProductVariation" ADD CONSTRAINT "ProductVariation_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
        END IF;
      END $$;

      -- 2. Migrate existing Product data to ProductVariation
      -- Only insert if the table is empty to avoid duplicates on re-run
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM "ProductVariation") THEN
          INSERT INTO "ProductVariation" ("productId", "condition", "isGraded", "gradingCompany", "grade", "price", "stock", "createdAt", "updatedAt")
          SELECT id, COALESCE("condition", 'N/A'), "isGraded", "gradingCompany", "grade", "price", "stock", "createdAt", "updatedAt" FROM "Product";
        END IF;
      END $$;

      -- 3. Update CartItem
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'CartItem' AND column_name = 'productVariationId') THEN
          ALTER TABLE "CartItem" ADD COLUMN "productVariationId" INTEGER;
          UPDATE "CartItem" SET "productVariationId" = (SELECT id FROM "ProductVariation" WHERE "productId" = "CartItem"."productId" LIMIT 1);
          ALTER TABLE "CartItem" ALTER COLUMN "productVariationId" SET NOT NULL;
          ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_productVariationId_fkey" FOREIGN KEY ("productVariationId") REFERENCES "ProductVariation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
          ALTER TABLE "CartItem" DROP CONSTRAINT IF EXISTS "CartItem_productId_fkey";
          ALTER TABLE "CartItem" DROP COLUMN "productId";
        END IF;
      END $$;

      -- 4. Update OrderItem
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'OrderItem' AND column_name = 'productVariationId') THEN
          ALTER TABLE "OrderItem" ADD COLUMN "productVariationId" INTEGER;
          UPDATE "OrderItem" SET "productVariationId" = (SELECT id FROM "ProductVariation" WHERE "productId" = "OrderItem"."productId" LIMIT 1);
          ALTER TABLE "OrderItem" ALTER COLUMN "productVariationId" SET NOT NULL;
          ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_productVariationId_fkey" FOREIGN KEY ("productVariationId") REFERENCES "ProductVariation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
          ALTER TABLE "OrderItem" DROP CONSTRAINT IF EXISTS "OrderItem_productId_fkey";
          ALTER TABLE "OrderItem" DROP COLUMN "productId";
        END IF;
      END $$;

      -- 5. Update StockReservation
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'StockReservation' AND column_name = 'productVariationId') THEN
          ALTER TABLE "StockReservation" ADD COLUMN "productVariationId" INTEGER;
          UPDATE "StockReservation" SET "productVariationId" = (SELECT id FROM "ProductVariation" WHERE "productId" = "StockReservation"."productId" LIMIT 1);
          ALTER TABLE "StockReservation" ALTER COLUMN "productVariationId" SET NOT NULL;
          ALTER TABLE "StockReservation" ADD CONSTRAINT "StockReservation_productVariationId_fkey" FOREIGN KEY ("productVariationId") REFERENCES "ProductVariation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
          ALTER TABLE "StockReservation" DROP CONSTRAINT IF EXISTS "StockReservation_productId_fkey";
          ALTER TABLE "StockReservation" DROP COLUMN "productId";
        END IF;
      END $$;

      -- 6. Drop old columns from Product
      DO $$ BEGIN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Product' AND column_name = 'price') THEN
          ALTER TABLE "Product" DROP COLUMN "price", DROP COLUMN "stock", DROP COLUMN "condition", DROP COLUMN "isGraded", DROP COLUMN "gradingCompany", DROP COLUMN "grade";
        END IF;
      END $$;
    `;
    await prisma.$executeRawUnsafe(phase4Sql);

    console.log("Starting Phase 4.1 SQL Migration: Adding sessionId to StockReservation");

    await prisma.$executeRawUnsafe(`
      ALTER TABLE "StockReservation" ADD COLUMN IF NOT EXISTS "sessionId" TEXT;
    `);

    console.log("Migration 4.1 successful.");

    console.log("Starting Wanted Catalog Migration: Creating BuyListWantedItem table...");
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "BuyListWantedItem" (
        "id" SERIAL NOT NULL,
        "name" TEXT NOT NULL,
        "series" TEXT,
        "imageUrl" TEXT,
        "price" DOUBLE PRECISION,
        "isRC" BOOLEAN NOT NULL DEFAULT false,
        "isGraded" BOOLEAN NOT NULL DEFAULT false,
        "gradingCompany" TEXT,
        "grade" TEXT,
        "isNumbered" BOOLEAN NOT NULL DEFAULT false,
        "numberedTo" TEXT,
        "parallel" TEXT,
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "BuyListWantedItem_pkey" PRIMARY KEY ("id")
      );
    `);
    console.log("Wanted Catalog Migration successful.");

    return NextResponse.json({ success: true, message: 'Migrations completed successfully' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message });
  }
}
