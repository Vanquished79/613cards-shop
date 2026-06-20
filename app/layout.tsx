import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/components/CartProvider";
import { Navbar } from "@/components/Navbar";
import { CartSlideOut } from "@/components/CartSlideOut";

const inter = Inter({ subsets: ["latin"], variable: "--font-primary" });

export const metadata: Metadata = {
  title: "613cards.com",
  description: "The premier shop for trading cards and supplies.",
};

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en">
      <body className={inter.className}>
        <CartProvider>
          <Navbar isAdmin={!!session} />
          <CartSlideOut />
          <div className="container">
            {children}
          </div>
        </CartProvider>
      </body>
    </html>
  );
}
