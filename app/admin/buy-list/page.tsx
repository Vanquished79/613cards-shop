import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import AdminBuyListClient from './AdminBuyListClient';

export const dynamic = 'force-dynamic';

export default async function AdminBuyListPage() {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user?.role !== 'ADMIN') {
    redirect('/');
  }

  const submissions = await prisma.buyListSubmission.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      user: true,
      items: true
    }
  });

  return (
    <div style={{ maxWidth: '1200px', margin: '40px auto', padding: '0 20px' }}>
      <h1 style={{ marginBottom: '24px' }}>Buy-List Submissions</h1>
      
      <AdminBuyListClient initialSubmissions={submissions} />
    </div>
  );
}
