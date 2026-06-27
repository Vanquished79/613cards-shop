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

  const wantedItems = await prisma.buyListWantedItem.findMany({
    where: { isActive: true },
    orderBy: { createdAt: 'desc' }
  });

  const settings = await prisma.storeSettings.findUnique({
    where: { id: 1 }
  });
  const buyListEnabled = settings?.buyListEnabled ?? true;

  if (!buyListEnabled) {
    return (
      <div style={{ maxWidth: '600px', margin: '80px auto', padding: '0 20px', textAlign: 'center' }}>
        <div className="glass-panel" style={{ padding: '48px 32px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
          <div style={{ fontSize: '64px' }}>🔒</div>
          <h1 style={{ fontSize: '28px', color: 'var(--text-main)', margin: 0 }}>Submissions Temporarily Closed</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '16px', lineHeight: '1.6', margin: 0 }}>
            We are not currently accepting any card submissions. Our team is working through current orders and will reopen shortly. Please check back later!
          </p>
          <a href="/" className="btn-primary" style={{ padding: '12px 24px', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold', display: 'inline-block', marginTop: '12px' }}>
            Return to Store
          </a>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '40px auto', padding: '0 20px' }}>
      <h1 style={{ marginBottom: '16px' }}>Sell Us Your Cards</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '32px', fontSize: '18px', lineHeight: '1.6' }}>
        Looking to turn your collection into cash or store credit? Browse the list of cards we are looking for or submit a sell list below!
      </p>

      <BuyListClient initialWantedItems={wantedItems} />
    </div>
  );
}
