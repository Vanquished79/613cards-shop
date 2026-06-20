import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: 'Email or Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null;

        // 1. Check fallback .env admin first
        const adminUsername = process.env.ADMIN_USERNAME;
        const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;

        if (
          adminUsername && adminPasswordHash &&
          credentials.username === adminUsername &&
          (await bcrypt.compare(credentials.password, adminPasswordHash))
        ) {
          return { id: 'admin', name: 'Admin', email: 'admin@613cards.online', role: 'ADMIN' };
        }

        // 2. Check Database Users
        const user = await prisma.user.findUnique({
          where: { email: credentials.username }
        });

        if (user && (await bcrypt.compare(credentials.password, user.passwordHash))) {
          return {
            id: user.id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
            address: user.address,
            city: user.city,
            state: user.state,
            zip: user.zip
          };
        }

        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
        token.address = user.address;
        token.city = user.city;
        token.state = user.state;
        token.zip = user.zip;
      }
      return token;
    },
    async session({ session, token }: any) {
      if (session?.user) {
        session.user.role = token.role;
        session.user.id = token.id;
        session.user.address = token.address;
        session.user.city = token.city;
        session.user.state = token.state;
        session.user.zip = token.zip;
      }
      return session;
    }
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt' as const,
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
