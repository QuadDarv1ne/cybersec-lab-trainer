/**
 * Unified database adapter interface.
 * Supports Prisma (SQLite, PostgreSQL, MySQL) and Mongoose (MongoDB) backends.
 */

import type {
  User,
  Account,
  Session,
  VerificationToken,
  Progress,
  QuizResult,
  ChallengeProgress,
  ItemProgress,
  Note,
  StudySession,
  Lab,
  LabFlag,
  LabProgress,
  FlagSubmission,
  Prisma,
} from '@prisma/client';
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

type WhereInput = Record<string, unknown>;
type CreateInput = Record<string, unknown>;
type UpdateInput = Record<string, unknown>;

interface AdapterResult<T> {
  findMany: (where: WhereInput) => Promise<T[]>;
  upsert: (where: WhereInput, create: CreateInput, update: UpdateInput) => Promise<T>;
  deleteMany: (where: WhereInput) => Promise<void>;
}

interface AdapterResultWithCreateMany<T> {
  findMany: (where: WhereInput) => Promise<T[]>;
  createMany: (data: CreateInput[]) => Promise<void>;
  deleteMany: (where: WhereInput) => Promise<void>;
}

interface LabFlagAdapter {
  findFirst: (where: WhereInput) => Promise<LabFlag | null>;
}

interface LabProgressAdapter {
  findUnique: (where: WhereInput) => Promise<LabProgress | null>;
  upsert: (where: WhereInput, create: CreateInput, update: UpdateInput) => Promise<LabProgress>;
  create: (data: CreateInput) => Promise<LabProgress>;
  update: (where: WhereInput, data: UpdateInput) => Promise<LabProgress>;
}

interface FlagSubmissionAdapter {
  findFirst: (where: WhereInput) => Promise<FlagSubmission | null>;
  findMany: (where: WhereInput) => Promise<FlagSubmission[]>;
  create: (data: CreateInput) => Promise<FlagSubmission>;
}

interface LabAdapter {
  findMany: (where?: WhereInput, include?: Record<string, boolean>) => Promise<(Lab & { flags?: LabFlag[] })[]>;
  findUnique: (where: WhereInput, include?: Record<string, boolean>) => Promise<(Lab & { flags?: LabFlag[] }) | null>;
}

interface UserAdapter {
  findUnique: (where: WhereInput) => Promise<User | null>;
  create: (data: CreateInput) => Promise<User>;
}

interface AccountAdapter {
  findMany: (where: WhereInput) => Promise<Account[]>;
  create: (data: CreateInput) => Promise<Account>;
  deleteMany: (where: WhereInput) => Promise<void>;
}

interface SessionAdapter {
  findMany: (where: WhereInput) => Promise<Session[]>;
  create: (data: CreateInput) => Promise<Session>;
  deleteMany: (where: WhereInput) => Promise<void>;
}

interface VerificationTokenAdapter {
  create: (data: CreateInput) => Promise<VerificationToken>;
  delete: (where: WhereInput) => Promise<void>;
}

export interface DbAdapter {
  type: DatabaseType;

  // Core models
  progress: AdapterResult<Progress>;
  quizResult: AdapterResult<QuizResult>;
  challengeProgress: AdapterResult<ChallengeProgress>;
  itemProgress: AdapterResult<ItemProgress>;
  note: AdapterResult<Note>;
  studySession: AdapterResultWithCreateMany<StudySession>;

  // CTF lab models
  lab: LabAdapter;
  labFlag: LabFlagAdapter;
  labProgress: LabProgressAdapter;
  flagSubmission: FlagSubmissionAdapter;

  // Auth models (used by NextAuth adapter)
  user: UserAdapter;
  account: AccountAdapter;
  session: SessionAdapter;
  verificationToken: VerificationTokenAdapter;

  // Atomic delete of all user data across all tables
  deleteAllForUser: (userId: string) => Promise<void>;

  // Disconnect
  disconnect: () => Promise<void>;
}

// --- Prisma Adapter ---
function createPrismaAdapter(db: PrismaClient): DbAdapter {
  return {
    type: process.env.DATABASE_TYPE as DatabaseType || 'sqlite',

    progress: {
      findMany: (where) => db.progress.findMany({ where }),
      upsert: (where, create, update) => db.progress.upsert({
        where: where as Prisma.ProgressWhereUniqueInput,
        create: create as Prisma.ProgressCreateInput,
        update: update as Prisma.ProgressUpdateInput,
      }),
      deleteMany: async (where) => { await db.progress.deleteMany({ where }); },
    },

    quizResult: {
      findMany: (where) => db.quizResult.findMany({ where }),
      upsert: (where, create, update) => db.quizResult.upsert({
        where: where as Prisma.QuizResultWhereUniqueInput,
        create: create as Prisma.QuizResultCreateInput,
        update: update as Prisma.QuizResultUpdateInput,
      }),
      deleteMany: async (where) => { await db.quizResult.deleteMany({ where }); },
    },

    challengeProgress: {
      findMany: (where) => db.challengeProgress.findMany({ where }),
      upsert: (where, create, update) => db.challengeProgress.upsert({
        where: where as Prisma.ChallengeProgressWhereUniqueInput,
        create: create as Prisma.ChallengeProgressCreateInput,
        update: update as Prisma.ChallengeProgressUpdateInput,
      }),
      deleteMany: async (where) => { await db.challengeProgress.deleteMany({ where }); },
    },

    itemProgress: {
      findMany: (where) => db.itemProgress.findMany({ where }),
      upsert: (where, create, update) => db.itemProgress.upsert({
        where: where as Prisma.ItemProgressWhereUniqueInput,
        create: create as Prisma.ItemProgressCreateInput,
        update: update as Prisma.ItemProgressUpdateInput,
      }),
      deleteMany: async (where) => { await db.itemProgress.deleteMany({ where }); },
    },

    note: {
      findMany: (where) => db.note.findMany({ where }),
      upsert: (where, create, update) => db.note.upsert({
        where: where as Prisma.NoteWhereUniqueInput,
        create: create as Prisma.NoteCreateInput,
        update: update as Prisma.NoteUpdateInput,
      }),
      deleteMany: async (where) => { await db.note.deleteMany({ where }); },
    },

    studySession: {
      findMany: (where) => db.studySession.findMany({ where }),
      createMany: async (data) => {
        await db.studySession.createMany({
          data: data as Prisma.StudySessionCreateManyInput[],
        });
      },
      deleteMany: async (where) => { await db.studySession.deleteMany({ where }); },
    },

    // CTF lab models
    lab: {
      findMany: (where, include) => db.lab.findMany({ where, include: include as { flags: boolean } }),
      findUnique: (where, include) => db.lab.findFirst({ where, include: include as { flags: boolean } }),
    },

    labFlag: {
      findFirst: (where) => db.labFlag.findFirst({ where }),
    },

    labProgress: {
      findUnique: (where) => db.labProgress.findFirst({ where }),
      upsert: (where, create, update) => db.labProgress.upsert({
        where: where as Prisma.LabProgressWhereUniqueInput,
        create: create as Prisma.LabProgressCreateInput,
        update: update as Prisma.LabProgressUpdateInput,
      }),
      create: (data) => db.labProgress.create({ data: data as Prisma.LabProgressCreateInput }),
      update: (where, data) => db.labProgress.update({ where: where as Prisma.LabProgressWhereUniqueInput, data: data as Prisma.LabProgressUpdateInput }),
    },

    flagSubmission: {
      findFirst: (where) => db.flagSubmission.findFirst({ where }),
      findMany: (where) => db.flagSubmission.findMany({ where }),
      create: (data) => db.flagSubmission.create({ data: data as Prisma.FlagSubmissionCreateInput }),
    },

    user: {
      findUnique: (where) => db.user.findUnique({ where: where as Prisma.UserWhereUniqueInput }),
      create: (data) => db.user.create({ data: data as Prisma.UserCreateInput }),
    },

    account: {
      findMany: (where) => db.account.findMany({ where: where as Prisma.AccountWhereInput }),
      create: (data) => db.account.create({ data: data as Prisma.AccountCreateInput }),
      deleteMany: async (where) => { await db.account.deleteMany({ where: where as Prisma.AccountWhereInput }); },
    },

    session: {
      findMany: (where) => db.session.findMany({ where: where as Prisma.SessionWhereInput }),
      create: (data) => db.session.create({ data: data as Prisma.SessionCreateInput }),
      deleteMany: async (where) => { await db.session.deleteMany({ where: where as Prisma.SessionWhereInput }); },
    },

    verificationToken: {
      create: (data) => db.verificationToken.create({ data: data as Prisma.VerificationTokenCreateInput }),
      delete: async (where) => { await db.verificationToken.delete({ where: where as Prisma.VerificationTokenWhereUniqueInput }); },
    },

    deleteAllForUser: async (userId: string) => {
      await db.$transaction([
        db.progress.deleteMany({ where: { userId } }),
        db.quizResult.deleteMany({ where: { userId } }),
        db.challengeProgress.deleteMany({ where: { userId } }),
        db.itemProgress.deleteMany({ where: { userId } }),
        db.note.deleteMany({ where: { userId } }),
        db.studySession.deleteMany({ where: { userId } }),
        db.labProgress.deleteMany({ where: { userId } }),
        db.flagSubmission.deleteMany({ where: { userId } }),
      ]);
    },

    disconnect: async () => {
      await db.$disconnect();
    },
  };
}

// --- Mongoose Adapter ---
function createMongooseAdapter(): DbAdapter {
  const normalizeDoc = <T extends { id: string }>(doc: unknown): T | null => {
    if (!doc) return null;
    const obj = (doc as { toObject: () => Record<string, unknown> }).toObject
      ? (doc as { toObject: () => Record<string, unknown> }).toObject()
      : doc as Record<string, unknown>;
    const { _id, ...rest } = obj;
    return { id: String(_id), ...rest } as T;
  };

  const normalizeArray = <T extends { id: string }>(docs: unknown[]): T[] =>
    docs.map(doc => normalizeDoc<T>(doc)!);

  return {
    type: 'mongodb',

    progress: {
      findMany: async (where) => normalizeArray<Progress>(await ProgressModel.find(where)),
      upsert: async (where, create, update) => {
        const doc = await ProgressModel.findOneAndUpdate(where, { $set: { ...create, ...update, updatedAt: new Date() } }, { upsert: true, new: true });
        return normalizeDoc<Progress>(doc)!;
      },
      deleteMany: async (where) => { await ProgressModel.deleteMany(where); },
    },

    quizResult: {
      findMany: async (where) => normalizeArray<QuizResult>(await QuizResultModel.find(where)),
      upsert: async (where, create, update) => {
        const doc = await QuizResultModel.findOneAndUpdate(where, { $set: { ...create, ...update } }, { upsert: true, new: true });
        return normalizeDoc<QuizResult>(doc)!;
      },
      deleteMany: async (where) => { await QuizResultModel.deleteMany(where); },
    },

    challengeProgress: {
      findMany: async (where) => normalizeArray<ChallengeProgress>(await ChallengeProgressModel.find(where)),
      upsert: async (where, create, update) => {
        const doc = await ChallengeProgressModel.findOneAndUpdate(where, { $set: { ...create, ...update, updatedAt: new Date() } }, { upsert: true, new: true });
        return normalizeDoc<ChallengeProgress>(doc)!;
      },
      deleteMany: async (where) => { await ChallengeProgressModel.deleteMany(where); },
    },

    itemProgress: {
      findMany: async (where) => normalizeArray<ItemProgress>(await ItemProgressModel.find(where)),
      upsert: async (where, create, update) => {
        const doc = await ItemProgressModel.findOneAndUpdate(where, { $set: { ...create, ...update, updatedAt: new Date() } }, { upsert: true, new: true });
        return normalizeDoc<ItemProgress>(doc)!;
      },
      deleteMany: async (where) => { await ItemProgressModel.deleteMany(where); },
    },

    note: {
      findMany: async (where) => normalizeArray<Note>(await NoteModel.find(where)),
      upsert: async (where, create, update) => {
        const doc = await NoteModel.findOneAndUpdate(where, { $set: { ...create, ...update, updatedAt: new Date() } }, { upsert: true, new: true });
        return normalizeDoc<Note>(doc)!;
      },
      deleteMany: async (where) => { await NoteModel.deleteMany(where); },
    },

    studySession: {
      findMany: async (where) => normalizeArray<StudySession>(await StudySessionModel.find(where)),
      createMany: async (data) => {
        await StudySessionModel.insertMany(data);
      },
      deleteMany: async (where) => { await StudySessionModel.deleteMany(where); },
    },

    // CTF lab models (stub — MongoDB uses Prisma for lab data)
    lab: {
      findMany: async () => [],
      findUnique: async () => null,
    },

    labFlag: {
      findFirst: async () => null,
    },

    labProgress: {
      findUnique: async () => { throw new Error('Lab progress not supported on MongoDB'); },
      upsert: async () => { throw new Error('Lab progress not supported on MongoDB'); },
      create: async () => { throw new Error('Lab progress not supported on MongoDB'); },
      update: async () => { throw new Error('Lab progress not supported on MongoDB'); },
    },

    flagSubmission: {
      findFirst: async () => null,
      findMany: async () => [],
      create: async () => { throw new Error('Flag submission not supported on MongoDB'); },
    },

    user: {
      findUnique: async (where) => {
        const doc = await UserModel.findOne(where);
        return doc ? normalizeDoc<User>(doc) : null;
      },
      create: async (data) => normalizeDoc<User>(await UserModel.create(data))!,
    },

    account: {
      findMany: async (where) => normalizeArray<Account>(await AccountModel.find(where)),
      create: async (data) => normalizeDoc<Account>(await AccountModel.create(data))!,
      deleteMany: async (where) => { await AccountModel.deleteMany(where); },
    },

    session: {
      findMany: async (where) => normalizeArray<Session>(await SessionModel.find(where)),
      create: async (data) => normalizeDoc<Session>(await SessionModel.create(data))!,
      deleteMany: async (where) => { await SessionModel.deleteMany(where); },
    },

    verificationToken: {
      create: async (data) => {
        const doc = await VerificationTokenModel.create(data);
        return doc.toObject() as VerificationToken;
      },
      delete: async (where) => { await VerificationTokenModel.deleteOne(where); },
    },

    deleteAllForUser: async (userId: string) => {
      const session = await mongoose.startSession();
      session.startTransaction();
      try {
        await ProgressModel.deleteMany({ userId }, { session });
        await QuizResultModel.deleteMany({ userId }, { session });
        await ChallengeProgressModel.deleteMany({ userId }, { session });
        await ItemProgressModel.deleteMany({ userId }, { session });
        await NoteModel.deleteMany({ userId }, { session });
        await StudySessionModel.deleteMany({ userId }, { session });
        // Lab models use Prisma even on MongoDB — handled server-side
        await session.commitTransaction();
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
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { db } = require('./db');
    adapter = createPrismaAdapter(db);
    logger.info(`[DB] Using ${dbType} (Prisma) adapter`);
  }

  return adapter;
}
