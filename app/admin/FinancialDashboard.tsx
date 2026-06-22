'use client';

import { useState, useEffect } from 'react';

type Order = {
  id: number;
  totalAmount: number;
  createdAt: string;
  customerName: string;
  status: string;
  taxAmount?: number;
  taxRate?: number;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
};

export default function FinancialDashboard({ initialOrders }: { initialOrders: Order[] }) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [taxEnabled, setTaxEnabled] = useState(false);
  const [isUpdatingTax, setIsUpdatingTax] = useState(false);

  useEffect(() => {
    fetch('/api/settings').then(r => r.json()).then(data => {
      if (data.taxEnabled !== undefined) setTaxEnabled(data.taxEnabled);
    }).catch(e => console.error(e));
  }, []);

  const toggleTax = async () => {
    setIsUpdatingTax(true);
    const newValue = !taxEnabled;
    try {
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taxEnabled: newValue })
      });
      setTaxEnabled(newValue);
    } catch (e) {
      console.error(e);
    }
    setIsUpdatingTax(false);
  };

  // Compute metrics
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  const startOfWeek = new Date(startOfDay);
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay()); // Sunday start
  
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfYear = new Date(now.getFullYear(), 0, 1);

  let totalToday = 0;
  let totalWeek = 0;
  let totalMonth = 0;
  let totalYear = 0;
  let totalAllTime = 0;

  initialOrders.forEach(order => {
    const orderDate = new Date(order.createdAt);
    const amount = order.totalAmount;

    totalAllTime += amount;
    if (orderDate >= startOfYear) totalYear += amount;
    if (orderDate >= startOfMonth) totalMonth += amount;
    if (orderDate >= startOfWeek) totalWeek += amount;
    if (orderDate >= startOfDay) totalToday += amount;
  });

  const formatCurrency = (val: number) => `$${val.toFixed(2)}`;

  // Calendar logic
  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = currentMonth.getDay();
  
  const calendarDays = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(null); // Empty slots before the 1st
  }
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i));
  }

  // Filter orders for the selected date
  const selectedDateOrders = initialOrders.filter(order => {
    const orderDate = new Date(order.createdAt);
    return orderDate.getDate() === selectedDate.getDate() &&
           orderDate.getMonth() === selectedDate.getMonth() &&
           orderDate.getFullYear() === selectedDate.getFullYear();
  });

  const selectedDateTotal = selectedDateOrders.reduce((sum, o) => sum + o.totalAmount, 0);

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };
  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const isSameDay = (d1: Date, d2: Date) => {
    return d1.getDate() === d2.getDate() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getFullYear() === d2.getFullYear();
  };

  const hasOrdersOnDay = (date: Date) => {
    return initialOrders.some(order => {
      const orderDate = new Date(order.createdAt);
      return orderDate.getDate() === date.getDate() &&
             orderDate.getMonth() === date.getMonth() &&
             orderDate.getFullYear() === date.getFullYear();
    });
  };

  // --- CSV Export Logic ---
  const exportToCSV = (filterTaxExempt: boolean = false) => {
    const headers = [
      'Order ID', 'Date', 'Customer Name', 'Status', 
      'Total Amount', 'Tax Amount', 'Tax Rate',
      'Address', 'City', 'State/Province', 'ZIP/Postal Code'
    ];
    
    // Filter orders if user wants only tax-exempt orders
    const ordersToExport = filterTaxExempt 
      ? initialOrders.filter(o => !o.taxAmount || o.taxAmount <= 0)
      : initialOrders;

    const rows = ordersToExport.map(order => [
      order.id,
      new Date(order.createdAt).toISOString(),
      `"${order.customerName?.replace(/"/g, '""') || ''}"`,
      order.status,
      order.totalAmount.toFixed(2),
      // @ts-ignore
      (order.taxAmount || 0).toFixed(2),
      // @ts-ignore
      (order.taxRate || 0).toString(),
      `"${order.address?.replace(/"/g, '""') || 'N/A'}"`,
      `"${order.city?.replace(/"/g, '""') || 'N/A'}"`,
      `"${order.state?.replace(/"/g, '""') || 'N/A'}"`,
      `"${order.zip?.replace(/"/g, '""') || 'N/A'}"`
    ]);
    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const filename = filterTaxExempt ? `613cards_tax_exempt_orders_${new Date().toISOString().split('T')[0]}.csv` : `613cards_orders_${new Date().toISOString().split('T')[0]}.csv`;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '-16px', gap: '16px', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: 'var(--text-muted)' }}>Charge Taxes:</span>
          <button 
            onClick={toggleTax}
            disabled={isUpdatingTax}
            style={{ 
              width: '44px', height: '24px', borderRadius: '12px', border: 'none', cursor: 'pointer', position: 'relative',
              background: taxEnabled ? '#4ade80' : 'rgba(255,255,255,0.2)',
              transition: 'background 0.3s'
            }}
          >
            <div style={{
              width: '20px', height: '20px', borderRadius: '50%', background: 'white', position: 'absolute', top: '2px',
              left: taxEnabled ? '22px' : '2px', transition: 'left 0.3s', boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }} />
          </button>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            onClick={() => exportToCSV(true)}
            style={{ padding: '8px 16px', background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid var(--glass-border)', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
            title="Export only orders that did not collect tax"
          >
            Export Tax-Exempt
          </button>
          
          <button 
            onClick={() => exportToCSV(false)}
            style={{ padding: '8px 16px', background: 'var(--accent-color)', color: '#000', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            Export All
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
        {[
          { label: 'Today', value: totalToday },
          { label: 'This Week', value: totalWeek },
          { label: 'This Month', value: totalMonth },
          { label: 'This Year', value: totalYear },
          { label: 'All Time', value: totalAllTime }
        ].map(metric => (
          <div key={metric.label} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '12px', padding: '20px' }}>
            <div style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '8px' }}>{metric.label}</div>
            <div style={{ color: 'var(--accent-color)', fontSize: '24px', fontWeight: 'bold' }}>{formatCurrency(metric.value)}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
        {/* Calendar Section */}
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--glass-border)', borderRadius: '12px', padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '18px' }}>Sales Calendar</h2>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={prevMonth} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', fontSize: '18px' }}>◀</button>
              <span style={{ fontWeight: 'bold', width: '120px', textAlign: 'center' }}>
                {currentMonth.toLocaleDateString('default', { month: 'long', year: 'numeric' })}
              </span>
              <button onClick={nextMonth} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', fontSize: '18px' }}>▶</button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', textAlign: 'center', marginBottom: '8px' }}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} style={{ color: 'var(--text-muted)', fontSize: '12px', fontWeight: 'bold' }}>{day}</div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px' }}>
            {calendarDays.map((date, i) => {
              if (!date) return <div key={i} />;
              
              const isSelected = isSameDay(date, selectedDate);
              const hasOrders = hasOrdersOnDay(date);
              
              return (
                <button
                  key={i}
                  onClick={() => setSelectedDate(date)}
                  style={{
                    padding: '12px 0',
                    background: isSelected ? 'var(--accent-color)' : (hasOrders ? 'rgba(255, 183, 3, 0.15)' : 'transparent'),
                    color: isSelected ? '#1a1025' : (hasOrders ? 'var(--accent-color)' : 'white'),
                    border: '1px solid',
                    borderColor: isSelected ? 'var(--accent-color)' : (hasOrders ? 'rgba(255, 183, 3, 0.3)' : 'var(--glass-border)'),
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: isSelected || hasOrders ? 'bold' : 'normal',
                    transition: 'all 0.2s'
                  }}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Day Orders */}
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--glass-border)', borderRadius: '12px', padding: '24px', display: 'flex', flexDirection: 'column', maxHeight: '500px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid var(--glass-border)' }}>
            <h2 style={{ fontSize: '18px' }}>{selectedDate.toLocaleDateString('default', { weekday: 'long', month: 'long', day: 'numeric' })}</h2>
            <div style={{ color: 'var(--accent-color)', fontWeight: 'bold', fontSize: '18px' }}>
              {formatCurrency(selectedDateTotal)}
            </div>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px', paddingRight: '8px' }}>
            {selectedDateOrders.length === 0 ? (
              <div style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: '40px' }}>No orders on this date.</div>
            ) : (
              selectedDateOrders.map(order => (
                <div key={order.id} style={{ background: 'rgba(255,255,255,0.05)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontWeight: 'bold' }}>Order #{order.id}</span>
                    <span style={{ color: 'var(--accent-color)', fontWeight: 'bold' }}>{formatCurrency(order.totalAmount)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                    <span style={{ color: 'var(--text-main)' }}>{order.customerName}</span>
                    <span style={{ 
                      background: order.status === 'DELIVERED' ? 'rgba(74, 222, 128, 0.2)' : 'rgba(255, 255, 255, 0.1)', 
                      color: order.status === 'DELIVERED' ? '#4ade80' : 'white',
                      padding: '2px 8px', 
                      borderRadius: '12px', 
                      fontSize: '10px',
                      fontWeight: 'bold'
                    }}>{order.status}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
