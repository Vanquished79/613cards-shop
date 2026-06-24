import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import OrderHistoryTabs from './OrderHistoryTabs';

export const dynamic = 'force-dynamic';

export default async function AccountPage() {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    redirect('/login');
  }

  // Get user details
  let user = await prisma.user.findUnique({
    where: { email: session.user.email as string },
    include: {
      orders: {
        orderBy: { createdAt: 'desc' },
        include: { items: { include: { product: true } } }
      }
    }
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
      include: {
        orders: {
          orderBy: { createdAt: 'desc' },
          include: { items: { include: { product: true } } }
        }
      }
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

    revalidatePath('/account');
    revalidatePath('/checkout');
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '40px auto', padding: '0 20px' }}>
      <h1 style={{ marginBottom: '32px' }}>My Account</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
        
        {/* Profile Details */}
        <div>
          <div className="glass-panel" style={{ padding: '32px' }}>
            <h2 style={{ fontSize: '20px', marginBottom: '24px' }}>Profile & Shipping</h2>
            <form action={updateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={labelStyle}>Full Name</label>
                <input name="name" defaultValue={user.name} required style={inputStyle} />
              </div>
              
              <div>
                <label style={labelStyle}>Email</label>
                <input value={user.email} disabled style={{ ...inputStyle, opacity: 0.5, cursor: 'not-allowed' }} />
              </div>

              <div>
                <label style={labelStyle}>Street Address</label>
                <input name="address" defaultValue={user.address || ''} style={inputStyle} placeholder="123 Main St" />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={labelStyle}>City</label>
                  <input name="city" defaultValue={user.city || ''} style={inputStyle} placeholder="New York" />
                </div>
                <div>
                  <label style={labelStyle}>State</label>
                  <input name="state" defaultValue={user.state || ''} style={inputStyle} placeholder="NY" />
                </div>
                <div>
                  <label style={labelStyle}>ZIP</label>
                  <input name="zip" defaultValue={user.zip || ''} style={inputStyle} placeholder="10001" />
                </div>
              </div>

              <button type="submit" className="btn-primary" style={{ marginTop: '16px' }}>Save Changes</button>
            </form>
          </div>
        </div>

        {/* Order History */}
        <div>
          <OrderHistoryTabs orders={user.orders} />
        </div>

      </div>
    </div>
  );
}

const inputStyle = { width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: 'white', boxSizing: 'border-box' as const };
const labelStyle = { display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--text-muted)' };
