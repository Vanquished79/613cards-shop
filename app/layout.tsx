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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <CartProvider>
            <ConditionalLayout>
              {children}
            </ConditionalLayout>
          </CartProvider>
        </Providers>
      </body>
    </html>
  );
}
