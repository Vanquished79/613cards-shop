import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from 'next/navigation';
import BuyListClient from './BuyListClient';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function BuyListPage() {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    redirect('/login?callbackUrl=/buy-list');
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email as string }
  });

  if (!user) {
    redirect('/');
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '40px auto', padding: '0 20px' }}>
      <h1 style={{ marginBottom: '16px' }}>Sell Us Your Cards</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '32px', fontSize: '18px', lineHeight: '1.6' }}>
        Looking to turn your collection into cash or store credit? Submit a buy-list below and our team will review it and get back to you with an offer!
      </p>

      <BuyListClient />
    </div>
  );
}
