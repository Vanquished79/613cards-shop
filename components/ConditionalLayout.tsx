'use client';

import { usePathname } from 'next/navigation';
import { Navbar } from './Navbar';
import { CartSlideOut } from './CartSlideOut';

export function ConditionalLayout({ children, categories = [] }: { children: React.ReactNode, categories?: any[] }) {
  const pathname = usePathname();
  const isComingSoon = pathname === '/coming-soon';

  if (isComingSoon) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar categories={categories} />
      <CartSlideOut />
      <div className="container">
        {children}
      </div>
    </>
  );
}
