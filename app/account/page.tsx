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
      <h1 style={{ marginBottom: '8px' }}>Customer Dashboard</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>Manage your profile, shipping information, and order history.</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
        
        {/* Profile Details */}
        <div>
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
