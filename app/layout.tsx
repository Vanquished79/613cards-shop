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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <CartProvider>
          <Navbar />
          <CartSlideOut />
          <div className="container">
            {children}
          </div>
        </CartProvider>
      </body>
    </html>
  );
}
