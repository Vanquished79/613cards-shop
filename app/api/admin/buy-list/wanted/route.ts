import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';
import { uploadProductImage } from '@/lib/supabase';

// Helper to check if request is by admin
async function checkAdmin() {
  const session = await getServerSession(authOptions);
  return session && session.user?.role === 'ADMIN';
}

export async function GET() {
  try {
    if (!(await checkAdmin())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const items = await prisma.buyListWantedItem.findMany({
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(items);
  } catch (error: any) {
    console.error('Failed to fetch wanted items:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    if (!(await checkAdmin())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const name = formData.get('name') as string;
    const series = formData.get('series') as string || null;
    const priceStr = formData.get('price') as string;
    const price = priceStr ? parseFloat(priceStr) : null;
    
    const isRC = formData.get('isRC') === 'true';
    const isGraded = formData.get('isGraded') === 'true';
    const gradingCompany = formData.get('gradingCompany') as string || null;
    const grade = formData.get('grade') as string || null;
    const isNumbered = formData.get('isNumbered') === 'true';
    const numberedTo = formData.get('numberedTo') as string || null;
    const parallel = formData.get('parallel') as string || null;
    const isActive = formData.get('isActive') !== 'false'; // Default true

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    // Process image file
    const imageFile = formData.get('image') as File;
    let imageUrl = null;
    if (imageFile && imageFile.size > 0) {
      imageUrl = await uploadProductImage(imageFile);
    }

    const newItem = await prisma.buyListWantedItem.create({
      data: {
        name,
        series,
        imageUrl,
        price,
        isRC,
        isGraded,
        gradingCompany,
        grade,
        isNumbered,
        numberedTo,
        parallel,
        isActive
      }
    });

    return NextResponse.json(newItem);
  } catch (error: any) {
    console.error('Failed to create wanted item:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    if (!(await checkAdmin())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const idStr = formData.get('id') as string;
    if (!idStr) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }
    const id = parseInt(idStr);

    const name = formData.get('name') as string;
    const series = formData.get('series') as string || null;
    const priceStr = formData.get('price') as string;
    const price = priceStr ? parseFloat(priceStr) : null;
    
    const isRC = formData.get('isRC') === 'true';
    const isGraded = formData.get('isGraded') === 'true';
    const gradingCompany = formData.get('gradingCompany') as string || null;
    const grade = formData.get('grade') as string || null;
    const isNumbered = formData.get('isNumbered') === 'true';
    const numberedTo = formData.get('numberedTo') as string || null;
    const parallel = formData.get('parallel') as string || null;
    const isActive = formData.get('isActive') !== 'false';

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    // Find existing item
    const existing = await prisma.buyListWantedItem.findUnique({
      where: { id }
    });

    if (!existing) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    // Process image file if updated
    const imageFile = formData.get('image') as File;
    let imageUrl = existing.imageUrl;
    if (imageFile && imageFile.size > 0) {
      const uploadedUrl = await uploadProductImage(imageFile);
      if (uploadedUrl) imageUrl = uploadedUrl;
    } else if (formData.get('removeImage') === 'true') {
      imageUrl = null;
    }

    const updatedItem = await prisma.buyListWantedItem.update({
      where: { id },
      data: {
        name,
        series,
        imageUrl,
        price,
        isRC,
        isGraded,
        gradingCompany: isGraded ? gradingCompany : null,
        grade: isGraded ? grade : null,
        isNumbered,
        numberedTo: isNumbered ? numberedTo : null,
        parallel,
        isActive
      }
    });

    return NextResponse.json(updatedItem);
  } catch (error: any) {
    console.error('Failed to update wanted item:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    if (!(await checkAdmin())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const idStr = searchParams.get('id');
    if (!idStr) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }
    const id = parseInt(idStr);

    await prisma.buyListWantedItem.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Failed to delete wanted item:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
