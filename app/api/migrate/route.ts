import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Manually add the missing columns to the database via SQL
    await prisma.$executeRawUnsafe(`ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "taxAmount" DOUBLE PRECISION NOT NULL DEFAULT 0;`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "taxRate" DOUBLE PRECISION NOT NULL DEFAULT 0;`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "country" TEXT;`);
    
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

    return NextResponse.json({ success: true, message: 'Database schema successfully updated!' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message });
  }
}
