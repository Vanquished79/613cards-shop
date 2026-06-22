'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function markOrderAsDelivered(orderId: number) {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    throw new Error('Not authenticated');
  }

  // Verify the order belongs to this user
  const order = await prisma.order.findUnique({
    where: { id: orderId }
  });

  if (!order || order.email !== session.user.email) {
    throw new Error('Order not found or unauthorized');
  }

  await prisma.order.update({
    where: { id: orderId },
    data: { status: 'DELIVERED' }
  });

  revalidatePath('/account');
}
