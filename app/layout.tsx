import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/components/CartProvider";
import { ConditionalLayout } from "@/components/ConditionalLayout";

const inter = Inter({ subsets: ["latin"], variable: "--font-primary" });

export const metadata: Metadata = {
  title: "613cards.com",
  description: "The premier shop for trading cards and supplies.",
};

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

import { Providers } from "@/components/Providers";
import { CurrencyProvider } from "@/components/CurrencyProvider";
import { WishlistProvider } from "@/components/WishlistProvider";
import prisma from "@/lib/prisma";

import { ModalProvider } from '@/components/ModalProvider';
import { Toaster } from 'react-hot-toast';

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);
  const categories = await prisma.category.findMany();

  return (
    <html lang="en">
      <body className={inter.className}>
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
