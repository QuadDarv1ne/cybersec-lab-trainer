/**
 * Unified database adapter interface.
 * Supports Prisma (SQLite, PostgreSQL, MySQL) and Mongoose (MongoDB) backends.
 */

import { PrismaClient } from '@prisma/client';
import mongoose from 'mongoose';
import {
  UserModel, AccountModel, SessionModel, ProgressModel,
  QuizResultModel, ChallengeProgressModel, VerificationTokenModel,
  ItemProgressModel, NoteModel, StudySessionModel,
} from './mongoose-schema';
import { logger } from './logger';

// --- Types ---
export type DatabaseType = 'sqlite' | 'postgresql' | 'mysql' | 'mongodb';

export interface DbAdapter {
  type: DatabaseType;

  // Core models
  progress: {
    findMany: (where: Record<string, unknown>) => Promise<Record<string, unknown>[]>;
    upsert: (where: Record<string, unknown>, create: Record<string, unknown>, update: Record<string, unknown>) => Promise<Record<string, unknown>>;
    deleteMany: (where: Record<string, unknown>) => Promise<void>;
  };

  quizResult: {
    findMany: (where: Record<string, unknown>) => Promise<Record<string, unknown>[]>;
    upsert: (where: Record<string, unknown>, create: Record<string, unknown>, update: Record<string, unknown>) => Promise<Record<string, unknown>>;
    deleteMany: (where: Record<string, unknown>) => Promise<void>;
  };

  challengeProgress: {
    findMany: (where: Record<string, unknown>) => Promise<Record<string, unknown>[]>;
    upsert: (where: Record<string, unknown>, create: Record<string, unknown>, update: Record<string, unknown>) => Promise<Record<string, unknown>>;
    deleteMany: (where: Record<string, unknown>) => Promise<void>;
  };

  itemProgress: {
    findMany: (where: Record<string, unknown>) => Promise<Record<string, unknown>[]>;
    upsert: (where: Record<string, unknown>, create: Record<string, unknown>, update: Record<string, unknown>) => Promise<Record<string, unknown>>;
    deleteMany: (where: Record<string, unknown>) => Promise<void>;
  };

  note: {
    findMany: (where: Record<string, unknown>) => Promise<Record<string, unknown>[]>;
    upsert: (where: Record<string, unknown>, create: Record<string, unknown>, update: Record<string, unknown>) => Promise<Record<string, unknown>>;
    deleteMany: (where: Record<string, unknown>) => Promise<void>;
  };

  studySession: {
    findMany: (where: Record<string, unknown>) => Promise<Record<string, unknown>[]>;
    createMany: (data: Record<string, unknown>[]) => Promise<void>;
    deleteMany: (where: Record<string, unknown>) => Promise<void>;
  };

  // Auth models (used by NextAuth adapter)
  user: {
    findUnique: (where: Record<string, unknown>) => Promise<Record<string, unknown> | null>;
    create: (data: Record<string, unknown>) => Promise<Record<string, unknown>>;
  };

  account: {
    findMany: (where: Record<string, unknown>) => Promise<Record<string, unknown>[]>;
    create: (data: Record<string, unknown>) => Promise<Record<string, unknown>>;
    deleteMany: (where: Record<string, unknown>) => Promise<void>;
  };

  session: {
    findMany: (where: Record<string, unknown>) => Promise<Record<string, unknown>[]>;
    create: (data: Record<string, unknown>) => Promise<Record<string, unknown>>;
    deleteMany: (where: Record<string, unknown>) => Promise<void>;
  };

  verificationToken: {
    create: (data: Record<string, unknown>) => Promise<Record<string, unknown>>;
    delete: (where: Record<string, unknown>) => Promise<void>;
  };

  // Transaction support
  transaction: (operations: (() => Promise<unknown>)[]) => Promise<unknown[]>;

  // Disconnect
  disconnect: () => Promise<void>;
}

// --- Prisma Adapter ---
function createPrismaAdapter(db: PrismaClient): DbAdapter {
  return {
    type: process.env.DATABASE_TYPE as DatabaseType || 'sqlite',

    progress: {
      findMany: (where) => db.progress.findMany({ where }) as any,
      upsert: (where, create, update) => db.progress.upsert({ where: where as any, create: create as any, update: update as any }) as any,
      deleteMany: async (where) => { await db.progress.deleteMany({ where }); },
    },

    quizResult: {
      findMany: (where) => db.quizResult.findMany({ where }) as any,
      upsert: (where, create, update) => db.quizResult.upsert({ where: where as any, create: create as any, update: update as any }) as any,
      deleteMany: async (where) => { await db.quizResult.deleteMany({ where }); },
    },

    challengeProgress: {
      findMany: (where) => db.challengeProgress.findMany({ where }) as any,
      upsert: (where, create, update) => db.challengeProgress.upsert({ where: where as any, create: create as any, update: update as any }) as any,
      deleteMany: async (where) => { await db.challengeProgress.deleteMany({ where }); },
    },

    itemProgress: {
      findMany: (where) => db.itemProgress.findMany({ where }) as any,
      upsert: (where, create, update) => db.itemProgress.upsert({ where: where as any, create: create as any, update: update as any }) as any,
      deleteMany: async (where) => { await db.itemProgress.deleteMany({ where }); },
    },

    note: {
      findMany: (where) => db.note.findMany({ where }) as any,
      upsert: (where, create, update) => db.note.upsert({ where: where as any, create: create as any, update: update as any }) as any,
      deleteMany: async (where) => { await db.note.deleteMany({ where }); },
    },

    studySession: {
      findMany: (where) => db.studySession.findMany({ where }) as any,
      createMany: async (data) => {
        await db.studySession.createMany({ data: data as any[] });
      },
      deleteMany: async (where) => { await db.studySession.deleteMany({ where }); },
    },

    user: {
      findUnique: (where) => db.user.findUnique({ where: where as any }) as any,
      create: (data) => db.user.create({ data: data as any }) as any,
    },

    account: {
      findMany: (where) => db.account.findMany({ where: where as any }) as any,
      create: (data) => db.account.create({ data: data as any }) as any,
      deleteMany: async (where) => { await db.account.deleteMany({ where }); },
    },

    session: {
      findMany: (where) => db.session.findMany({ where: where as any }) as any,
      create: (data) => db.session.create({ data: data as any }) as any,
      deleteMany: async (where) => { await db.session.deleteMany({ where }); },
    },

    verificationToken: {
      create: (data) => db.verificationToken.create({ data: data as any }) as any,
      delete: async (where) => { await db.verificationToken.delete({ where: where as any }); },
    },

    transaction: async (operations) => {
      return db.$transaction(operations.map(op => op()) as any) as any;
    },

    disconnect: async () => {
      await db.$disconnect();
    },
  };
}

// --- Mongoose Adapter ---
function createMongooseAdapter(): DbAdapter {
  const normalizeDoc = (doc: any): Record<string, unknown> => {
    if (!doc) return {} as Record<string, unknown>;
    const obj = doc.toObject ? doc.toObject() : doc;
    // Convert MongoDB _id to id
    const { _id, ...rest } = obj;
    return { id: String(_id), ...rest } as Record<string, unknown>;
  };

  const normalizeArray = (docs: any[]): Record<string, unknown>[] => docs.map(normalizeDoc);

  return {
    type: 'mongodb',

    progress: {
      findMany: async (where) => normalizeArray(await ProgressModel.find(where)),
      upsert: async (where, create, update) => {
        const doc = await ProgressModel.findOneAndUpdate(where, { $set: { ...create, ...update, updatedAt: new Date() } }, { upsert: true, new: true });
        return normalizeDoc(doc);
      },
      deleteMany: async (where) => { await ProgressModel.deleteMany(where); },
    },

    quizResult: {
      findMany: async (where) => normalizeArray(await QuizResultModel.find(where)),
      upsert: async (where, create, update) => {
        const doc = await QuizResultModel.findOneAndUpdate(where, { $set: { ...create, ...update } }, { upsert: true, new: true });
        return normalizeDoc(doc);
      },
      deleteMany: async (where) => { await QuizResultModel.deleteMany(where); },
    },

    challengeProgress: {
      findMany: async (where) => normalizeArray(await ChallengeProgressModel.find(where)),
      upsert: async (where, create, update) => {
        const doc = await ChallengeProgressModel.findOneAndUpdate(where, { $set: { ...create, ...update, updatedAt: new Date() } }, { upsert: true, new: true });
        return normalizeDoc(doc);
      },
      deleteMany: async (where) => { await ChallengeProgressModel.deleteMany(where); },
    },

    itemProgress: {
      findMany: async (where) => normalizeArray(await ItemProgressModel.find(where)),
      upsert: async (where, create, update) => {
        const doc = await ItemProgressModel.findOneAndUpdate(where, { $set: { ...create, ...update, updatedAt: new Date() } }, { upsert: true, new: true });
        return normalizeDoc(doc);
      },
      deleteMany: async (where) => { await ItemProgressModel.deleteMany(where); },
    },

    note: {
      findMany: async (where) => normalizeArray(await NoteModel.find(where)),
      upsert: async (where, create, update) => {
        const doc = await NoteModel.findOneAndUpdate(where, { $set: { ...create, ...update, updatedAt: new Date() } }, { upsert: true, new: true });
        return normalizeDoc(doc);
      },
      deleteMany: async (where) => { await NoteModel.deleteMany(where); },
    },

    studySession: {
      findMany: async (where) => normalizeArray(await StudySessionModel.find(where)),
      createMany: async (data) => {
        await StudySessionModel.insertMany(data);
      },
      deleteMany: async (where) => { await StudySessionModel.deleteMany(where); },
    },

    user: {
      findUnique: async (where) => {
        const doc = await UserModel.findOne(where);
        return doc ? normalizeDoc(doc) : null;
      },
      create: async (data) => normalizeDoc(await UserModel.create(data)),
    },

    account: {
      findMany: async (where) => normalizeArray(await AccountModel.find(where)),
      create: async (data) => normalizeDoc(await AccountModel.create(data)),
      deleteMany: async (where) => { await AccountModel.deleteMany(where); },
    },

    session: {
      findMany: async (where) => normalizeArray(await SessionModel.find(where)),
      create: async (data) => normalizeDoc(await SessionModel.create(data)),
      deleteMany: async (where) => { await SessionModel.deleteMany(where); },
    },

    verificationToken: {
      create: async (data) => normalizeDoc(await VerificationTokenModel.create(data)),
      delete: async (where) => { await VerificationTokenModel.deleteOne(where); },
    },

    transaction: async (operations) => {
      const session = await mongoose.startSession();
      session.startTransaction();
      try {
        const results = await Promise.all(operations.map(op => op()));
        await session.commitTransaction();
        return results;
      } catch (error) {
        await session.abortTransaction();
        throw error;
      } finally {
        session.endSession();
      }
    },

    disconnect: async () => {
      await mongoose.disconnect();
    },
  };
}

// --- Singleton ---
let adapter: DbAdapter | null = null;

export function getDbAdapter(): DbAdapter {
  if (adapter) return adapter;

  const dbType = (process.env.DATABASE_TYPE || 'sqlite') as DatabaseType;

  if (dbType === 'mongodb') {
    adapter = createMongooseAdapter();
    logger.info('[DB] Using MongoDB (Mongoose) adapter');
  } else {
    // Lazy import to avoid Prisma client not generated errors
    const { db } = require('./db');
    adapter = createPrismaAdapter(db);
    logger.info(`[DB] Using ${dbType} (Prisma) adapter`);
  }

  return adapter;
}
