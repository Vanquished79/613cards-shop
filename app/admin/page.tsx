import prisma from '@/lib/prisma';
import FinancialDashboard from './FinancialDashboard';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const orders = await prisma.order.findMany({
    where: {
      status: {
        not: 'PENDING'
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  return (
    <div style={{ padding: '28px' }} className="glass-panel">
      <h1 style={{ marginBottom: '24px' }}>Financial Dashboard</h1>
      <FinancialDashboard initialOrders={orders} />
    </div>
  );
}
