import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

import { uploadProductImage } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email as string }
    });

    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const contentType = req.headers.get('content-type') || '';
    
    let cardName, cardSeries, isGraded, gradingCompany, grade, purchasePrice, currentValue, imageUrl, isVaulted, vaultStatus, isAutographed, isNumbered, serialNumber;

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      cardName = formData.get('cardName') as string;
      cardSeries = formData.get('cardSeries') as string;
      isGraded = formData.get('isGraded') === 'true';
      gradingCompany = formData.get('gradingCompany') as string;
      grade = formData.get('grade') as string;
      purchasePrice = formData.get('purchasePrice') as string;
      currentValue = formData.get('currentValue') as string;
      isVaulted = formData.get('isVaulted') === 'true';
      vaultStatus = formData.get('vaultStatus') as string;
      isAutographed = formData.get('isAutographed') === 'true';
      isNumbered = formData.get('isNumbered') === 'true';
      serialNumber = formData.get('serialNumber') as string;
      
      const imageFile = formData.get('imageFile') as File;
      if (imageFile && imageFile.size > 0) {
        imageUrl = await uploadProductImage(imageFile);
      } else {
        imageUrl = formData.get('imageUrl') as string;
      }
    } else {
      const body = await req.json();
      ({ cardName, cardSeries, isGraded, gradingCompany, grade, purchasePrice, currentValue, imageUrl, isVaulted, vaultStatus, isAutographed, isNumbered, serialNumber } = body);
    }

    if (!cardName) return NextResponse.json({ error: 'Card name is required' }, { status: 400 });

    const item = await prisma.portfolioItem.create({
      data: {
        userId: user.id,
        cardName,
        cardSeries,
        isGraded: isGraded || false,
        gradingCompany,
        grade,
        purchasePrice: purchasePrice ? parseFloat(purchasePrice as string) : null,
        currentValue: currentValue ? parseFloat(currentValue as string) : null,
        imageUrl,
        isVaulted: isVaulted || false,
        vaultStatus,
        isAutographed: isAutographed || false,
        isNumbered: isNumbered || false,
        serialNumber
      }
    });

    return NextResponse.json(item);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

    const user = await prisma.user.findUnique({
      where: { email: session.user.email as string }
    });

    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const item = await prisma.portfolioItem.findUnique({
      where: { id: parseInt(id) }
    });

    if (!item || item.userId !== user.id) {
      return NextResponse.json({ error: 'Not found or unauthorized' }, { status: 404 });
    }

    await prisma.portfolioItem.delete({
      where: { id: parseInt(id) }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
