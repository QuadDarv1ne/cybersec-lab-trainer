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
      name: "Demo",
      credentials: {},
      async authorize() {
        return {
          id: `demo-${crypto.randomUUID()}`,
          name: "Demo User",
          email: "demo@example.com",
          image: null,
        };
      },
    }),
  );
}

// Only use PrismaAdapter when OAuth providers are configured
// Demo mode (CredentialsProvider) doesn't need DB-backed sessions
const hasOAuth = providers.length > 0 && !providers.some(p => p.type === "credentials");

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
        session.user.id = (token.id as string) ?? token.sub ?? "";
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
