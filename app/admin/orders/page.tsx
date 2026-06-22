import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
export const dynamic = 'force-dynamic';

import Link from 'next/link';

export default async function OrdersPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const resolvedParams = await searchParams;
  const tab = resolvedParams.tab || 'active';
  const allOrders = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      items: {
        include: { product: true }
      }
    }
  });

  const activeOrders = allOrders.filter(o => o.status !== 'DELIVERED');
  const archivedOrders = allOrders.filter(o => o.status === 'DELIVERED');
  const orders = tab === 'active' ? activeOrders : archivedOrders;

  async function updateTracking(formData: FormData) {
    'use server'
    const id = parseInt(formData.get('orderId') as string);
    const trackingNumber = formData.get('trackingNumber') as string;
    const shippingCarrier = formData.get('shippingCarrier') as string;
    const status = formData.get('status') as string;
    
    await prisma.order.update({
      where: { id },
      data: { 
        trackingNumber, 
        shippingCarrier,
        status: status || (trackingNumber ? 'SHIPPED' : 'PAID') // Fallback if status not provided
      }
    });

    revalidatePath('/admin/orders');
  }

  return (
    <div style={{ padding: '28px' }} className="glass-panel">
      <h1 style={{ marginBottom: '24px' }}>Manage Orders</h1>

      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', borderBottom: '1px solid var(--glass-border)' }}>
        <a 
          href="/admin/orders?tab=active"
          style={{ 
            color: tab === 'active' ? 'var(--accent-color)' : 'var(--text-muted)', 
            padding: '8px 0',
            fontWeight: tab === 'active' ? 'bold' : 'normal',
            borderBottom: tab === 'active' ? '2px solid var(--accent-color)' : '2px solid transparent',
            textDecoration: 'none',
            fontSize: '16px'
          }}
        >
          Active Orders ({activeOrders.length})
        </a>
        <a 
          href="/admin/orders?tab=archived"
          style={{ 
            color: tab === 'archived' ? 'var(--accent-color)' : 'var(--text-muted)', 
            padding: '8px 0',
            fontWeight: tab === 'archived' ? 'bold' : 'normal',
            borderBottom: tab === 'archived' ? '2px solid var(--accent-color)' : '2px solid transparent',
            textDecoration: 'none',
            fontSize: '16px'
          }}
        >
          Archived ({archivedOrders.length})
        </a>
      </div>
      
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

                <div style={{ borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '24px' }}>
                  <h4 style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '16px' }}>Shipping & Tracking</h4>
                  <form action={updateTracking} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <input type="hidden" name="orderId" value={order.id} />
                    <select 
                      name="status"
                      defaultValue={order.status}
                      style={{ padding: '8px', borderRadius: '4px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: 'white', fontSize: '12px', marginBottom: '8px' }}
                    >
                      <option value="PAID" style={{ background: '#1a0b2e', color: 'white' }}>Paid</option>
                      <option value="CONFIRMED" style={{ background: '#1a0b2e', color: 'white' }}>Confirmed</option>
                      <option value="PACKING" style={{ background: '#1a0b2e', color: 'white' }}>Packing</option>
                      <option value="SHIPPED" style={{ background: '#1a0b2e', color: 'white' }}>Shipped</option>
                      <option value="DELIVERED" style={{ background: '#1a0b2e', color: 'white' }}>Delivered</option>
                    </select>
                    <input 
                      name="shippingCarrier" 
                      placeholder="Carrier (e.g. USPS, FedEx)" 
                      defaultValue={order.shippingCarrier || ''}
                      style={{ padding: '8px', borderRadius: '4px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: 'white', fontSize: '12px' }} 
                    />
                    <input 
                      name="trackingNumber" 
                      placeholder="Tracking Number" 
                      defaultValue={order.trackingNumber || ''}
                      style={{ padding: '8px', borderRadius: '4px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: 'white', fontSize: '12px' }} 
                    />
                    <button type="submit" style={{ padding: '8px', background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid var(--glass-border)', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', marginTop: '4px' }}>
                      Save Updates
                    </button>
                  </form>
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
