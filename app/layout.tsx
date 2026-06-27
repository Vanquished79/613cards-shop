import type { Metadata } from "next";
import { Fredoka } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/components/CartProvider";
import { ConditionalLayout } from "@/components/ConditionalLayout";

const fredoka = Fredoka({ subsets: ["latin"], variable: "--font-primary", weight: ['400', '500', '600', '700'] });

export const metadata: Metadata = {
  title: "613cards.com",
  description: "The premier shop for trading cards and supplies.",
};

// Session check removed to prevent blocking root layout rendering

import { Providers } from "@/components/Providers";
import { CurrencyProvider } from "@/components/CurrencyProvider";
import { WishlistProvider } from "@/components/WishlistProvider";
import prisma from "@/lib/prisma";
import { unstable_cache } from 'next/cache';

import { ModalProvider } from '@/components/ModalProvider';
import { Toaster } from 'react-hot-toast';

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  
  const getCategories = unstable_cache(
    async () => prisma.category.findMany(),
    ['global-categories'],
    { revalidate: 3600, tags: ['categories'] } // cache for 1 hour, revalidate on demand
  );
  
  const categories = await getCategories();

  return (
    <html lang="en">
      <body className={fredoka.className}>
        <Providers>
          <WishlistProvider>
            <ModalProvider>
              <Toaster 
                position="top-right" 
                toastOptions={{ 
                  style: { background: 'rgba(0,0,0,0.8)', color: '#fff', border: '1px solid var(--glass-border)', backdropFilter: 'blur(8px)' },
                  success: { iconTheme: { primary: '#4ade80', secondary: '#000' } },
                  error: { iconTheme: { primary: '#f87171', secondary: '#000' } }
                }} 
              />
              <CurrencyProvider>
                <CartProvider>
                  <ConditionalLayout categories={categories}>
                    {children}
                  </ConditionalLayout>
                </CartProvider>
              </CurrencyProvider>
            </ModalProvider>
          </WishlistProvider>
        </Providers>
      </body>
    </html>
  );
}
