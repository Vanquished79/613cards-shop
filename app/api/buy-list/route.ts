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

    const userId = parseInt(session.user.id as string);
    if (isNaN(userId)) {
      return NextResponse.json({ error: 'You are logged in as the default Admin account which cannot submit buy-lists. Please create a normal customer account to test this form.' }, { status: 400 });
    }

    const formData = await req.formData();
    const notes = formData.get('notes') as string || '';
    const itemsString = formData.get('items') as string;
    
    if (!itemsString) {
      return NextResponse.json({ error: 'Items are required' }, { status: 400 });
    }

    const items = JSON.parse(itemsString);

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Items are required' }, { status: 400 });
    }

    // Process image uploads
    for (let i = 0; i < items.length; i++) {
      const file = formData.get(`image_${i}`) as File;
      if (file && file.size > 0) {
        const uploadedUrl = await uploadProductImage(file);
        if (uploadedUrl) {
          items[i].imageUrl = uploadedUrl;
        }
      }
    }

    const submission = await prisma.buyListSubmission.create({
      data: {
        userId,
        notes,
        items: {
          create: items.map((item: any) => ({
            cardName: item.cardName,
            cardSeries: item.cardSeries,
            condition: item.condition,
            isGraded: item.isGraded || false,
            gradingCompany: item.gradingCompany,
            grade: item.grade,
            quantity: item.quantity || 1,
            expectedPrice: item.expectedPrice ? parseFloat(item.expectedPrice) : null,
            imageUrl: item.imageUrl || null,
          }))
        }
      }
    });

    return NextResponse.json({ success: true, submissionId: submission.id });

  } catch (error: any) {
    console.error('BuyList submission error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
