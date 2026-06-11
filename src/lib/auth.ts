import NextAuth, { type NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { findUser } from './credentials';

declare module 'next-auth' {
  interface Session {
    user: {
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: 'manager' | 'employer';
      allowedDomains: string[];
    };
  }
}

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET ?? 'proji-dev-secret-change-in-prod',
  session: { strategy: 'jwt', maxAge: 8 * 60 * 60 },
  pages: { signIn: '/login' },
  // Required for next-auth v4 compatibility with Next.js 15+
  trustHost: true,

  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email:    { label: 'Email',      type: 'email' },
        password: { label: 'Пароль',     type: 'password' },
        lobbyKey: { label: 'Ключ лобби', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password || !credentials.lobbyKey) return null;

        const user = findUser(credentials.email);
        if (!user) return null;
        if (credentials.lobbyKey !== user.lobbyKey) return null;

        const ok = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!ok) return null;

        return {
          id: user.email,
          email: user.email,
          name: user.role === 'manager' ? 'Sund Serik' : 'Employer',
          role: user.role,
          allowedDomains: user.allowedDomains,
        };
      },
    }),
  ],

  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.allowedDomains = (user as any).allowedDomains;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
        (session.user as any).allowedDomains = token.allowedDomains;
      }
      return session;
    },
  },
};

export default NextAuth(authOptions);
