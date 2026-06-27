import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import AccountTabs from './AccountTabs';
import { ProfileForm } from './ProfileForm';

export const dynamic = 'force-dynamic';

export default async function AccountPage() {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    redirect('/login');
  }

  // Get user details
  const userQuery = {
    include: {
      orders: {
        orderBy: { createdAt: 'desc' as const },
        include: { items: { include: { productVariation: { include: { product: true } } } } }
      },
      wishlistItems: {
        orderBy: { createdAt: 'desc' as const },
        include: { product: true }
      },
      buyListSubmissions: {
        orderBy: { createdAt: 'desc' as const },
        include: { items: true }
      }
    }
  };

  let user = await prisma.user.findUnique({
    where: { email: session.user.email as string },
    ...userQuery
  });

  if (!user && session.user.role === 'ADMIN') {
    // Create the env admin in the database so they can use the account profile features
    user = await prisma.user.create({
      data: {
        email: session.user.email as string,
        name: session.user.name || 'Admin',
        passwordHash: 'ENV_ADMIN_FALLBACK',
        role: 'ADMIN',
      },
      ...userQuery
    });
  }

  if (!user) {
    return <div>User not found.</div>;
  }

  async function updateProfile(formData: FormData) {
    'use server'
    const name = formData.get('name') as string;
    const address = formData.get('address') as string;
    const city = formData.get('city') as string;
    const state = formData.get('state') as string;
    const zip = formData.get('zip') as string;
    
    if (!name) return;

    await prisma.user.update({
      where: { id: user?.id },
      data: { name, address, city, state, zip }
    });

    revalidatePath('/checkout');
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '40px auto', padding: '0 20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '32px' }}>
        <div>
          <h1 style={{ marginBottom: '8px', fontSize: '28px' }}>Customer Dashboard</h1>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>Manage your profile, shipping information, and order history.</p>
        </div>
        {user.storeCredit > 0 && (
          <div className="glass-panel" style={{ padding: '12px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'rgba(34, 197, 94, 0.1)', border: '1px solid #22c55e', borderRadius: '12px', minWidth: '180px' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Store Credit</span>
            <span style={{ fontSize: '22px', fontWeight: 'bold', color: '#22c55e' }}>${user.storeCredit.toFixed(2)}</span>
          </div>
        )}
      </div>

      {/* VIP Tier Gamification Block */}
      <div className="glass-panel" style={{ padding: '24px', marginBottom: '32px', display: 'flex', flexDirection: 'column', gap: '16px', background: 'var(--glass-bg)', border: 'var(--border-width) solid var(--glass-border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '20px', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ 
                color: user.vipTier === 'OBSIDIAN' ? '#a855f7' : user.vipTier === 'GOLD' ? '#eab308' : user.vipTier === 'SILVER' ? '#94a3b8' : 'var(--text-main)'
              }}>
                {user.vipTier} TIER
              </span>
            </h2>
            <p style={{ margin: '4px 0 0 0', color: 'var(--text-muted)', fontSize: '14px' }}>
              Lifetime Spend: ${user.lifetimeSpend.toFixed(2)}
            </p>
          </div>
          <div style={{ textAlign: 'right', fontSize: '14px', color: 'var(--text-muted)' }}>
            {user.vipTier === 'MEMBER' && <span>Spend ${(500 - user.lifetimeSpend).toFixed(2)} more to reach <strong style={{ color: '#94a3b8'}}>SILVER</strong></span>}
            {user.vipTier === 'SILVER' && <span>Spend ${(2000 - user.lifetimeSpend).toFixed(2)} more to reach <strong style={{ color: '#eab308'}}>GOLD</strong></span>}
            {user.vipTier === 'GOLD' && <span>Spend ${(5000 - user.lifetimeSpend).toFixed(2)} more to reach <strong style={{ color: '#a855f7'}}>OBSIDIAN</strong></span>}
            {user.vipTier === 'OBSIDIAN' && <span style={{ color: '#a855f7' }}>Highest Tier Reached!</span>}
          </div>
        </div>

        {user.vipTier !== 'OBSIDIAN' && (() => {
          const thresholds = { MEMBER: 0, SILVER: 500, GOLD: 2000, OBSIDIAN: 5000 };
          const currentFloor = thresholds[user.vipTier as keyof typeof thresholds];
          let nextCeil = 500;
          if (user.vipTier === 'SILVER') nextCeil = 2000;
          if (user.vipTier === 'GOLD') nextCeil = 5000;
          
          const progress = Math.min(100, Math.max(0, ((user.lifetimeSpend - currentFloor) / (nextCeil - currentFloor)) * 100));

          return (
            <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ 
                height: '100%', 
                width: `${progress}%`, 
                background: user.vipTier === 'MEMBER' ? '#94a3b8' : user.vipTier === 'SILVER' ? '#eab308' : '#a855f7',
                transition: 'width 1s ease-in-out'
              }} />
            </div>
          );
        })()}

        <div style={{ fontSize: '14px', color: 'var(--text-muted)', display: 'flex', gap: '24px', marginTop: '8px' }}>
          <span><strong>Benefits:</strong></span>
          {user.vipTier === 'MEMBER' && <span>Standard access to Store.</span>}
          {user.vipTier === 'SILVER' && <span>+2% bonus on all Store Credit trade-ins.</span>}
          {user.vipTier === 'GOLD' && <span>+5% bonus on Store Credit trade-ins.</span>}
          {user.vipTier === 'OBSIDIAN' && <span>+10% bonus on Store Credit trade-ins & priority shipping.</span>}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
        
        {/* Profile Details & Navigation */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <a href="/account/portfolio" style={{ display: 'block', textDecoration: 'none' }}>
            <div className="glass-panel hover-scale" style={{ padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(59, 130, 246, 0.1)', border: '1px solid #3b82f6', cursor: 'pointer' }}>
              <div>
                <h2 style={{ margin: '0 0 4px 0', color: '#3b82f6', fontSize: '20px' }}>My Portfolio & Vault</h2>
                <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '14px' }}>View your collection value and vaulted items.</p>
              </div>
              <div style={{ fontSize: '24px', color: '#3b82f6' }}>&rarr;</div>
            </div>
          </a>

          <div className="glass-panel" style={{ padding: '32px' }}>
            <h2 style={{ fontSize: '20px', marginBottom: '24px' }}>Profile & Shipping</h2>
            <ProfileForm user={user} />
          </div>
        </div>

        {/* Account Tabs */}
        <div>
          <AccountTabs orders={user.orders} wishlistItems={user.wishlistItems} buyListSubmissions={user.buyListSubmissions} />
        </div>

      </div>
    </div>
  );
}
