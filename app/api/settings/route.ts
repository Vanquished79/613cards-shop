import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { taxEnabled, buyListEnabled, maintenanceMode } = await request.json();
    
    const updateData: any = {};
    if (taxEnabled !== undefined) updateData.taxEnabled = taxEnabled;
    if (buyListEnabled !== undefined) updateData.buyListEnabled = buyListEnabled;
    if (maintenanceMode !== undefined) updateData.maintenanceMode = maintenanceMode;

    await prisma.storeSettings.upsert({
      where: { id: 1 },
      update: updateData,
      create: {
        id: 1,
        taxEnabled: taxEnabled !== undefined ? taxEnabled : false,
        buyListEnabled: buyListEnabled !== undefined ? buyListEnabled : true,
        maintenanceMode: maintenanceMode !== undefined ? maintenanceMode : false
      }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Failed to update settings:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const settings = await prisma.storeSettings.findUnique({
      where: { id: 1 }
    });

    return NextResponse.json({
      taxEnabled: settings?.taxEnabled ?? false,
      buyListEnabled: settings?.buyListEnabled ?? true,
      maintenanceMode: settings?.maintenanceMode ?? false
    });
  } catch (error: any) {
    console.error('Failed to get settings:', error);
    return NextResponse.json({ error: 'Failed to get settings' }, { status: 500 });
  }
}
