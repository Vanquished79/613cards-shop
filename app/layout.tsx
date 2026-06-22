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
import prisma from "@/lib/prisma";

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
          <CurrencyProvider>
            <CartProvider>
              <ConditionalLayout categories={categories}>
                {children}
              </ConditionalLayout>
            </CartProvider>
          </CurrencyProvider>
        </Providers>
      </body>
    </html>
  );
}
