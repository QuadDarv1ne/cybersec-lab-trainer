import type { NextAuthOptions } from "next-auth";
import type { Adapter, AdapterUser, AdapterSession, AdapterAccount, VerificationToken as AdapterVerificationToken } from "next-auth/adapters";
import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "./db";
import { generateUUID } from './utils';

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
          id: `demo-${generateUUID()}`,
          name,
          email,
          image: null,
        };
      },
    }),
  );
}

// Only use DB adapter when OAuth providers are configured
const hasOAuth = providers.some((p) => p.type === "oauth");
const dbType = process.env.DATABASE_TYPE || 'sqlite';

// Lazily create adapter config to avoid import errors when Prisma isn't generated
let adapterConfig: { adapter: Adapter } | Record<string, never> = {};
if (hasOAuth) {
  if (dbType === 'mongodb') {
    // MongoDB: use custom NextAuth adapter via mongoose
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mongoose = require('mongoose');
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { UserModel, AccountModel, SessionModel, VerificationTokenModel } = require('./mongoose-schema');
    adapterConfig = {
      adapter: {
        createUser: async (data: Record<string, unknown>) => {
          const user = await UserModel.create({ ...data, id: data.id || new mongoose.Types.ObjectId().toString() });
          return { ...user.toObject(), id: user._id.toString() };
        },
        getUser: async (id: string) => {
          const user = await UserModel.findById(id);
          return user ? { ...user.toObject(), id: user._id.toString() } : null;
        },
        getUserByEmail: async (email: string) => {
          const user = await UserModel.findOne({ email });
          return user ? { ...user.toObject(), id: user._id.toString() } : null;
        },
        getUserByAccount: async ({ provider, providerAccountId }: { provider: string; providerAccountId: string }) => {
          const account = await AccountModel.findOne({ provider, providerAccountId });
          if (!account) return null;
          const user = await UserModel.findById(account.userId);
          return user ? { ...user.toObject(), id: user._id.toString() } : null;
        },
        updateUser: async (data: Record<string, unknown>) => {
          const user = await UserModel.findByIdAndUpdate(data.id as string, { $set: data }, { new: true });
          return user ? { ...user.toObject(), id: user._id.toString() } : null;
        },
        linkAccount: async (data: AdapterAccount) => {
          const account = await AccountModel.create(data);
          return { ...account.toObject(), id: account._id.toString() } as AdapterAccount;
        },
        getSessionAndUser: async (sessionToken: string) => {
          const session = await SessionModel.findOne({ sessionToken });
          if (!session) return null;
          const user = await UserModel.findById(session.userId);
          if (!user) return null;
          return {
            user: { ...user.toObject(), id: user._id.toString() } as AdapterUser,
            session: { ...session.toObject(), id: session._id.toString() } as AdapterSession,
          };
        },
        createSession: async (data: Record<string, unknown>) => {
          const session = await SessionModel.create(data);
          return { ...session.toObject(), id: session._id.toString() };
        },
        updateSession: async (data: Record<string, unknown>) => {
          const session = await SessionModel.findOneAndUpdate({ sessionToken: data.sessionToken as string }, { $set: data }, { new: true });
          return session ? { ...session.toObject(), id: session._id.toString() } : null;
        },
        deleteSession: async (sessionToken: string) => {
          await SessionModel.deleteOne({ sessionToken });
        },
        createVerificationToken: async (data: AdapterVerificationToken) => {
          return VerificationTokenModel.create(data);
        },
        useVerificationToken: async ({ identifier, token }) => {
          const result = await VerificationTokenModel.findOneAndDelete({ identifier, token });
          return result ? (result.toObject() as AdapterVerificationToken) : null;
        },
      },
    };
  } else {
    // SQL: use PrismaAdapter
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { PrismaAdapter } = require('@next-auth/prisma-adapter');
    adapterConfig = { adapter: PrismaAdapter(db) };
  }
}

export const authOptions: NextAuthOptions = {
  ...adapterConfig,
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
