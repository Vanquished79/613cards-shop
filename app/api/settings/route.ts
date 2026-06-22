import { NextResponse } from 'next/response';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { taxEnabled } = await request.json();
    
    // Create or update
    const settings = await prisma.$executeRawUnsafe(`
      INSERT INTO "StoreSettings" ("id", "taxEnabled", "updatedAt")
      VALUES (1, $1, CURRENT_TIMESTAMP)
      ON CONFLICT ("id") DO UPDATE SET "taxEnabled" = $1, "updatedAt" = CURRENT_TIMESTAMP;
    `, taxEnabled);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const settings: any = await prisma.$queryRawUnsafe(`SELECT "taxEnabled" FROM "StoreSettings" WHERE id = 1 LIMIT 1`);
    if (settings && settings.length > 0) {
      return NextResponse.json({ taxEnabled: settings[0].taxEnabled });
    }
    return NextResponse.json({ taxEnabled: false });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to get settings' }, { status: 500 });
  }
}
