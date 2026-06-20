import prisma from '@/lib/prisma';
export const dynamic = 'force-dynamic';

export default async function OrdersPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      items: {
        include: { product: true }
      }
    }
  });

  return (
    <div style={{ padding: '28px' }} className="glass-panel">
      <h1 style={{ marginBottom: '24px' }}>Manage Orders</h1>
      
      {orders.length === 0 ? (
        <p style={{ color: 'var(--text-muted)' }}>No orders yet.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {orders.map((order: any) => (
            <div key={order.id} style={{ background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <div>
                  <h3 style={{ margin: '0 0 4px 0' }}>Order #{order.id}</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: 0 }}>
                    {new Date(order.createdAt).toLocaleString()}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ 
                    background: order.status === 'PAID' ? 'rgba(74, 222, 128, 0.2)' : 'rgba(255, 255, 255, 0.1)', 
                    color: order.status === 'PAID' ? '#4ade80' : 'white',
                    padding: '4px 12px', 
                    borderRadius: '20px', 
                    fontSize: '12px', 
                    fontWeight: 'bold' 
                  }}>
                    {order.status}
                  </span>
                  <div style={{ marginTop: '8px', fontSize: '18px', fontWeight: 'bold', color: 'var(--accent-color)' }}>
                    ${order.totalAmount.toFixed(2)}
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <div>
                  <h4 style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '8px' }}>Customer Details</h4>
                  <p style={{ margin: '0 0 4px 0', fontSize: '14px' }}><strong>{order.customerName}</strong></p>
                  <p style={{ margin: '0 0 4px 0', fontSize: '14px' }}>{order.email}</p>
                  <p style={{ margin: '0 0 4px 0', fontSize: '14px' }}>{order.address}</p>
                  <p style={{ margin: '0 0 4px 0', fontSize: '14px' }}>{order.city}, {order.state} {order.zip}</p>
                  <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>PayPal ID: {order.paypalOrderId}</p>
                </div>

                <div>
                  <h4 style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '8px' }}>Items</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {order.items.map((item: any) => (
                      <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', background: 'rgba(0,0,0,0.2)', padding: '8px 12px', borderRadius: '8px' }}>
                        <span>{item.quantity}x {item.product.name}</span>
                        <span>${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
