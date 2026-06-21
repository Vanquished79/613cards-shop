'use client';

import { usePathname } from 'next/navigation';
import { Navbar } from './Navbar';
import { CartSlideOut } from './CartSlideOut';

export function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isComingSoon = pathname === '/coming-soon';

  if (isComingSoon) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar />
      <CartSlideOut />
      <div className="container">
        {children}
      </div>
    </>
  );
}
