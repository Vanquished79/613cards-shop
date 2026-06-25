import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import PortfolioClient from './PortfolioClient';

export const dynamic = 'force-dynamic';

export default async function PortfolioPage() {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    redirect('/login');
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email as string },
    include: {
      portfolioItems: {
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  if (!user) {
    return <div>User not found.</div>;
  }

  const settings = await prisma.storeSettings.findFirst() || { buyListEnabled: true };

  return (
    <div style={{ maxWidth: '1200px', margin: '40px auto', padding: '0 20px', textAlign: 'center' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <h1 style={{ marginBottom: '8px', fontSize: '28px' }}>My Portfolio</h1>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>Track the value of your personal collection and vaulted items.</p>
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <a href="/account" className="btn-secondary" style={{ padding: '8px 16px', borderRadius: '8px', textDecoration: 'none', border: '1px solid var(--glass-border)', color: 'white' }}>&larr; Back to Account</a>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '80px 40px', marginTop: '40px' }}>
        <div style={{ fontSize: '64px', marginBottom: '24px' }}>🚧</div>
        <h2 style={{ fontSize: '32px', marginBottom: '16px', color: 'var(--accent-color)' }}>COMING SOON!</h2>
        <p style={{ fontSize: '18px', color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto', lineHeight: 1.6 }}>
          We are currently training our AI Vision engine to be incredibly accurate with sports cards, holographics, and autographs. The Portfolio feature will be unlocked very soon!
        </p>
      </div>
    </div>
  );
}
