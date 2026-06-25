import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const queries = [
      // Order table additions
      `ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "taxAmount" DOUBLE PRECISION NOT NULL DEFAULT 0;`,
      `ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "taxRate" DOUBLE PRECISION NOT NULL DEFAULT 0;`,
      `ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "country" TEXT;`,
      
      // Phase 1 Expansions (Product)
      `ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "isPreorder" BOOLEAN NOT NULL DEFAULT false;`,
      `ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "releaseDate" TIMESTAMP(3);`,
      `ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "isGraded" BOOLEAN NOT NULL DEFAULT false;`,
      `ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "gradingCompany" TEXT;`,
      `ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "grade" TEXT;`,
      
      // Phase 2 Expansions (Wishlist)
      `CREATE TABLE IF NOT EXISTS "WishlistItem" (
        "id" SERIAL NOT NULL,
        "userId" INTEGER NOT NULL,
        "productId" INTEGER NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "WishlistItem_pkey" PRIMARY KEY ("id")
      );`,
      `CREATE UNIQUE INDEX IF NOT EXISTS "WishlistItem_userId_productId_key" ON "WishlistItem"("userId", "productId");`,
      
      // Phase 3 Expansions (BuyList)
      `CREATE TABLE IF NOT EXISTS "BuyListSubmission" (
        "id" SERIAL NOT NULL,
        "userId" INTEGER NOT NULL,
        "status" TEXT NOT NULL DEFAULT 'PENDING',
        "totalOffered" DOUBLE PRECISION,
        "notes" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "BuyListSubmission_pkey" PRIMARY KEY ("id")
      );`,
      `CREATE TABLE IF NOT EXISTS "BuyListItem" (
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
      );`,
      
      // Additional Product fields
      `ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "additionalImages" TEXT[] DEFAULT ARRAY[]::TEXT[];`,
      
      // Store Settings
      `CREATE TABLE IF NOT EXISTS "StoreSettings" (
        "id" INTEGER NOT NULL DEFAULT 1,
        "taxEnabled" BOOLEAN NOT NULL DEFAULT false,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "StoreSettings_pkey" PRIMARY KEY ("id")
      );`,
      `INSERT INTO "StoreSettings" ("id", "taxEnabled", "updatedAt")
       VALUES (1, false, CURRENT_TIMESTAMP)
       ON CONFLICT ("id") DO NOTHING;`,
      
      // Phase 4 (Product Variations)
      `CREATE TABLE IF NOT EXISTS "ProductVariation" (
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
      );`,
      
      // Add foreign key constraint for ProductVariation
      `DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ProductVariation_productId_fkey') THEN
          ALTER TABLE "ProductVariation" ADD CONSTRAINT "ProductVariation_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
        END IF;
      END $$;`,
      
      // Migrate product fields to variations table (uses EXECUTE to avoid compilation failure if columns are already dropped)
      `DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM "ProductVariation") AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Product' AND column_name = 'condition') THEN
          EXECUTE 'INSERT INTO "ProductVariation" ("productId", "condition", "isGraded", "gradingCompany", "grade", "price", "stock", "createdAt", "updatedAt")
          SELECT id, COALESCE("condition", ''N/A''), "isGraded", "gradingCompany", "grade", "price", "stock", "createdAt", "updatedAt" FROM "Product"';
        END IF;
      END $$;`,
      
      // Update CartItem to reference ProductVariation (uses EXECUTE to avoid compilation failure if productId is already dropped)
      `DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'CartItem' AND column_name = 'productVariationId') THEN
          EXECUTE 'ALTER TABLE "CartItem" ADD COLUMN "productVariationId" INTEGER';
          EXECUTE 'UPDATE "CartItem" SET "productVariationId" = (SELECT id FROM "ProductVariation" WHERE "productId" = "CartItem"."productId" LIMIT 1)';
          EXECUTE 'ALTER TABLE "CartItem" ALTER COLUMN "productVariationId" SET NOT NULL';
          EXECUTE 'ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_productVariationId_fkey" FOREIGN KEY ("productVariationId") REFERENCES "ProductVariation"("id") ON DELETE CASCADE ON UPDATE CASCADE';
          EXECUTE 'ALTER TABLE "CartItem" DROP CONSTRAINT IF EXISTS "CartItem_productId_fkey"';
          EXECUTE 'ALTER TABLE "CartItem" DROP COLUMN "productId"';
        END IF;
      END $$;`,
      
      // Update OrderItem to reference ProductVariation (uses EXECUTE to avoid compilation failure if productId is already dropped)
      `DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'OrderItem' AND column_name = 'productVariationId') THEN
          EXECUTE 'ALTER TABLE "OrderItem" ADD COLUMN "productVariationId" INTEGER';
          EXECUTE 'UPDATE "OrderItem" SET "productVariationId" = (SELECT id FROM "ProductVariation" WHERE "productId" = "OrderItem"."productId" LIMIT 1)';
          EXECUTE 'ALTER TABLE "OrderItem" ALTER COLUMN "productVariationId" SET NOT NULL';
          EXECUTE 'ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_productVariationId_fkey" FOREIGN KEY ("productVariationId") REFERENCES "ProductVariation"("id") ON DELETE RESTRICT ON UPDATE CASCADE';
          EXECUTE 'ALTER TABLE "OrderItem" DROP CONSTRAINT IF EXISTS "OrderItem_productId_fkey"';
          EXECUTE 'ALTER TABLE "OrderItem" DROP COLUMN "productId"';
        END IF;
      END $$;`,
      
      // Update StockReservation to reference ProductVariation (uses EXECUTE to avoid compilation failure if productId is already dropped)
      `DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'StockReservation' AND column_name = 'productVariationId') THEN
          EXECUTE 'ALTER TABLE "StockReservation" ADD COLUMN "productVariationId" INTEGER';
          EXECUTE 'UPDATE "StockReservation" SET "productVariationId" = (SELECT id FROM "ProductVariation" WHERE "productId" = "StockReservation"."productId" LIMIT 1)';
          EXECUTE 'ALTER TABLE "StockReservation" ALTER COLUMN "productVariationId" SET NOT NULL';
          EXECUTE 'ALTER TABLE "StockReservation" ADD CONSTRAINT "StockReservation_productVariationId_fkey" FOREIGN KEY ("productVariationId") REFERENCES "ProductVariation"("id") ON DELETE CASCADE ON UPDATE CASCADE';
          EXECUTE 'ALTER TABLE "StockReservation" DROP CONSTRAINT IF EXISTS "StockReservation_productId_fkey"';
          EXECUTE 'ALTER TABLE "StockReservation" DROP COLUMN "productId"';
        END IF;
      END $$;`,
      
      // Drop old columns from Product
      `DO $$ BEGIN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Product' AND column_name = 'price') THEN
          ALTER TABLE "Product" DROP COLUMN "price", DROP COLUMN "stock", DROP COLUMN "condition", DROP COLUMN "isGraded", DROP COLUMN "gradingCompany", DROP COLUMN "grade";
        END IF;
      END $$;`,
      
      // Phase 4.1 StockReservation addition
      `ALTER TABLE "StockReservation" ADD COLUMN IF NOT EXISTS "sessionId" TEXT;`,
      
      // Wanted Catalog Migration
      `CREATE TABLE IF NOT EXISTS "BuyListWantedItem" (
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
      );`,
      
      // BuyListItem multiple images addition
      `ALTER TABLE "BuyListItem" ADD COLUMN IF NOT EXISTS "imageUrls" TEXT[] DEFAULT ARRAY[]::TEXT[];`,
      
      // StoreSettings buyListEnabled addition
      `ALTER TABLE "StoreSettings" ADD COLUMN IF NOT EXISTS "buyListEnabled" BOOLEAN NOT NULL DEFAULT true;`
    ];

    console.log("Executing migration queries...");
    for (let i = 0; i < queries.length; i++) {
      await prisma.$executeRawUnsafe(queries[i]);
    }
    console.log("All migrations completed successfully.");

    return NextResponse.json({ success: true, message: 'Migrations completed successfully' });
  } catch (error: any) {
    console.error("Migration error:", error);
    return NextResponse.json({ success: false, error: error.message });
  }
}
