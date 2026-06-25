import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    // Add columns to PortfolioItem if they don't exist
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "PortfolioItem" 
      ADD COLUMN IF NOT EXISTS "isAutographed" BOOLEAN NOT NULL DEFAULT false,
      ADD COLUMN IF NOT EXISTS "isNumbered" BOOLEAN NOT NULL DEFAULT false,
      ADD COLUMN IF NOT EXISTS "serialNumber" TEXT;
    `);

    return NextResponse.json({ success: true, message: 'Database schema successfully updated!' });
  } catch (error: any) {
    console.error('Migration error:', error);
    return NextResponse.json({ error: 'Migration failed', details: error.message }, { status: 500 });
  }
}
