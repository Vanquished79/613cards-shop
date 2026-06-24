import Link from 'next/link';
import { SignOutButton } from './SignOutButton';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const unreadMessagesCount = await prisma.contactMessage.count({
    where: { isRead: false }
  });

  const pendingBuyListsCount = await prisma.buyListSubmission.count({
    where: { status: 'PENDING' }
  });

  return (
    <div style={{ display: 'flex', gap: '24px', paddingTop: '20px', width: '100%' }} className="admin-layout-container">
      <aside className="glass-panel" style={{ width: '250px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px', height: 'fit-content', position: 'sticky', top: '100px' }}>
        <h2 style={{ fontSize: '18px', marginBottom: '12px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '12px' }}>Admin Dashboard</h2>
        <Link href="/admin" style={{ color: 'var(--text-main)', textDecoration: 'none', padding: '8px', borderRadius: '8px' }} className="hover-bg">Overview</Link>
        <Link href="/admin/orders" style={{ color: 'var(--text-main)', textDecoration: 'none', padding: '8px', borderRadius: '8px' }} className="hover-bg">Orders</Link>
        <Link href="/admin/buy-list" style={{ color: 'var(--text-main)', textDecoration: 'none', padding: '8px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} className="hover-bg">
          Buy-List
          {pendingBuyListsCount > 0 && (
            <span style={{ background: '#3b82f6', color: 'white', padding: '2px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}>
              {pendingBuyListsCount}
            </span>
          )}
        </Link>
        <Link href="/admin/products" style={{ color: 'var(--text-main)', textDecoration: 'none', padding: '8px', borderRadius: '8px' }} className="hover-bg">Products</Link>
        <Link href="/admin/categories" style={{ color: 'var(--text-main)', textDecoration: 'none', padding: '8px', borderRadius: '8px' }} className="hover-bg">Categories</Link>
        <Link href="/admin/waitlist" style={{ color: 'var(--text-main)', textDecoration: 'none', padding: '8px', borderRadius: '8px' }} className="hover-bg">Waitlist</Link>
        <Link href="/admin/messages" style={{ color: 'var(--text-main)', textDecoration: 'none', padding: '8px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} className="hover-bg">
          Messages
          {unreadMessagesCount > 0 && (
            <span style={{ background: '#ff6b6b', color: 'white', padding: '2px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}>
              {unreadMessagesCount}
            </span>
          )}
        </Link>

        <div style={{ marginTop: 'auto', borderTop: '1px solid var(--glass-border)', paddingTop: '16px' }}>
          <SignOutButton />
        </div>
      </aside>
      <main style={{ flex: 1 }}>
        {children}
      </main>
      <style dangerouslySetInnerHTML={{__html: `
        .hover-bg:hover { background: rgba(255,255,255,0.1); }
      `}} />
    </div>
  );
}
