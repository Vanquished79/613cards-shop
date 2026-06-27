import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      taxEnabled, buyListEnabled, maintenanceMode,
      silverThreshold, silverBonus,
      goldThreshold, goldBonus,
      obsidianThreshold, obsidianBonus
    } = body;
    
    const updateData: any = {};
    if (taxEnabled !== undefined) updateData.taxEnabled = taxEnabled;
    if (buyListEnabled !== undefined) updateData.buyListEnabled = buyListEnabled;
    if (maintenanceMode !== undefined) updateData.maintenanceMode = maintenanceMode;
    if (silverThreshold !== undefined) updateData.silverThreshold = parseFloat(silverThreshold);
    if (silverBonus !== undefined) updateData.silverBonus = parseFloat(silverBonus);
    if (goldThreshold !== undefined) updateData.goldThreshold = parseFloat(goldThreshold);
    if (goldBonus !== undefined) updateData.goldBonus = parseFloat(goldBonus);
    if (obsidianThreshold !== undefined) updateData.obsidianThreshold = parseFloat(obsidianThreshold);
    if (obsidianBonus !== undefined) updateData.obsidianBonus = parseFloat(obsidianBonus);

    await prisma.storeSettings.upsert({
      where: { id: 1 },
      update: updateData,
      create: {
        id: 1,
        ...updateData
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
      maintenanceMode: settings?.maintenanceMode ?? false,
      silverThreshold: settings?.silverThreshold ?? 500,
      silverBonus: settings?.silverBonus ?? 2,
      goldThreshold: settings?.goldThreshold ?? 2000,
      goldBonus: settings?.goldBonus ?? 5,
      obsidianThreshold: settings?.obsidianThreshold ?? 5000,
      obsidianBonus: settings?.obsidianBonus ?? 10
    });
  } catch (error: any) {
    console.error('Failed to get settings:', error);
    return NextResponse.json({ error: 'Failed to get settings' }, { status: 500 });
  }
}
