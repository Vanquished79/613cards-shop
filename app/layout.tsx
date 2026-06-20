import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

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
        <div className="container">
          <nav style={{ padding: '20px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>613cards.com</div>
            <div style={{ display: 'flex', gap: '20px' }}>
              <a href="/" style={{ color: 'var(--text-main)', textDecoration: 'none' }}>Home</a>
              <a href="/shop" style={{ color: 'var(--text-main)', textDecoration: 'none' }}>Shop</a>
              <a href="/admin" style={{ color: 'var(--text-main)', textDecoration: 'none' }}>Admin</a>
            </div>
          </nav>
          {children}
        </div>
      </body>
    </html>
  );
}
