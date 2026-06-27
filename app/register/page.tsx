import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import Link from 'next/link';
import Image from 'next/image';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export const dynamic = 'force-dynamic';

export default async function RegisterPage({ searchParams }: { searchParams: { error?: string } }) {
  const session = await getServerSession(authOptions);
  
  if (session) {
    redirect('/account');
  }

  async function registerUser(formData: FormData) {
    'use server'
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    
    if (!name || !email || !password || password.length < 6) {
      redirect('/register?error=Please+fill+out+all+fields+correctly');
    }

    try {
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        redirect('/register?error=Email+already+in+use');
      }

      const passwordHash = await bcrypt.hash(password, 10);

      await prisma.user.create({
        data: {
          name,
          email,
          passwordHash,
          role: 'CUSTOMER'
        }
      });
    } catch (e: any) {
      if (e.message !== 'NEXT_REDIRECT') {
        console.error(e);
        redirect('/register?error=An+error+occurred');
      } else {
        throw e; // rethrow NEXT_REDIRECT
      }
    }
    
    redirect('/login?registered=true');
  }

  return (
    <div style={{ padding: '60px 20px', display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: '80vh', alignItems: 'center', gap: '28px' }}>
      <Image src="/logo.png" alt="613cards.com" width={260} height={130} style={{ objectFit: 'contain', mixBlendMode: 'lighten' }} />
      <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', padding: '40px' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '8px' }}>Create Account</h1>
        <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginBottom: '32px' }}>
          Join 613cards to save your address and track orders.
        </p>

        {searchParams.error && (
          <div style={{ padding: '12px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', color: '#ef4444', borderRadius: '8px', marginBottom: '24px', fontSize: '14px', textAlign: 'center' }}>
            {searchParams.error}
          </div>
        )}

        <form action={registerUser} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--text-muted)' }}>Full Name</label>
            <input name="name" type="text" required style={inputStyle} placeholder="John Doe" />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--text-muted)' }}>Email</label>
            <input name="email" type="email" required style={inputStyle} placeholder="john@example.com" />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--text-muted)' }}>Password (min 6 chars)</label>
            <input name="password" type="password" required minLength={6} style={inputStyle} placeholder="••••••••" />
          </div>
          <button type="submit" className="btn-primary" style={{ padding: '14px', marginTop: '16px', fontSize: '16px' }}>
            Sign Up
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', color: 'var(--text-muted)' }}>
          Already have an account? <Link href="/login" style={{ color: 'var(--accent-color)', textDecoration: 'none' }}>Log in</Link>
        </div>
      </div>
    </div>
  );
}

const inputStyle = { width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: '#ffffff', color: 'var(--text-main)', boxSizing: 'border-box' as const };
