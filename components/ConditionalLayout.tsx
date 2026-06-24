'use client';

import { usePathname } from 'next/navigation';
import { Navbar } from './Navbar';
import { CartSlideOut } from './CartSlideOut';
import { Footer } from './Footer';

export function ConditionalLayout({ children, categories = [] }: { children: React.ReactNode, categories?: any[] }) {
  const pathname = usePathname();
  const isComingSoon = pathname === '/coming-soon';

  if (isComingSoon) {
    return <>{children}</>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar categories={categories} />
      <CartSlideOut />
      <div className="container" style={{ flex: 1 }}>
        {children}
      </div>
      <Footer />
    </div>
  );
}
