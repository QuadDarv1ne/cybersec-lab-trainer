import type { NextAuthOptions } from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { db } from "./db";

const providers: NextAuthOptions["providers"] = [];

if (process.env.GITHUB_ID && process.env.GITHUB_SECRET) {
  providers.push(
    GitHubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
  );
}

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  );
}

// Fallback: allow anonymous demo access when no OAuth providers are configured
if (providers.length === 0) {
  providers.push(
    CredentialsProvider({
      name: 'Demo',
      credentials: {
        email: { label: 'Email', type: 'email' },
        name: { label: 'Name', type: 'text' },
      },
      async authorize(credentials) {
        const email = (credentials?.email as string) || 'demo@example.com';
        const name = (credentials?.name as string) || 'Demo User';
        return {
          id: `demo-${email.replace(/[^a-zA-Z0-9]/g, '-')}`,
          name,
          email,
          image: null,
        };
      },
    }),
  );
}

// Only use PrismaAdapter when OAuth providers are configured
// Demo mode (CredentialsProvider) doesn't need DB-backed sessions
const hasOAuth = providers.some((p) => p.type === "oauth");

export const authOptions: NextAuthOptions = {
  ...(hasOAuth ? { adapter: PrismaAdapter(db) } : {}),
  providers,
  callbacks: {
    async jwt({ token, user }) {
      if (user?.id) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (typeof token.id === 'string' ? token.id : token.sub) ?? "";
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
