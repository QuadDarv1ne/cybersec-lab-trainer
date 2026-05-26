import mongoose, { Schema, Model } from 'mongoose';

// --- User ---
export interface IUser {
  id: string;
  email: string;
  name?: string;
  image?: string;
  emailVerified?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true },
  name: String,
  image: String,
  emailVerified: Date,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}, { collection: 'users' });

export const UserModel: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

// --- Account ---
export interface IAccount {
  id: string;
  userId: string;
  type: string;
  provider: string;
  providerAccountId: string;
  refresh_token?: string;
  access_token?: string;
  expires_at?: number;
  token_type?: string;
  scope?: string;
  id_token?: string;
  session_state?: string;
}

const AccountSchema = new Schema<IAccount>({
  userId: { type: String, required: true },
  type: { type: String, required: true },
  provider: { type: String, required: true },
  providerAccountId: { type: String, required: true },
  refresh_token: String,
  access_token: String,
  expires_at: Number,
  token_type: String,
  scope: String,
  id_token: String,
  session_state: String,
}, { collection: 'accounts' });

AccountSchema.index({ provider: 1, providerAccountId: 1 }, { unique: true });

export const AccountModel: Model<IAccount> = mongoose.models.Account || mongoose.model<IAccount>('Account', AccountSchema);

// --- Session ---
export interface ISession {
  id: string;
  sessionToken: string;
  userId: string;
  expires: Date;
}

const SessionSchema = new Schema<ISession>({
  sessionToken: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  expires: { type: Date, required: true },
}, { collection: 'sessions' });

export const SessionModel: Model<ISession> = mongoose.models.Session || mongoose.model<ISession>('Session', SessionSchema);

// --- Progress ---
export interface IProgress {
  id: string;
  userId: string;
  moduleId: string;
  completed: boolean;
  score?: number;
  lastAccessed: Date;
  updatedAt: Date;
}

const ProgressSchema = new Schema<IProgress>({
  userId: { type: String, required: true },
  moduleId: { type: String, required: true },
  completed: { type: Boolean, default: false },
  score: Number,
  lastAccessed: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}, { collection: 'progress' });

ProgressSchema.index({ userId: 1, moduleId: 1 }, { unique: true });

export const ProgressModel: Model<IProgress> = mongoose.models.Progress || mongoose.model<IProgress>('Progress', ProgressSchema);

// --- QuizResult ---
export interface IQuizResult {
  id: string;
  userId: string;
  quizId: string;
  score: number;
  total: number;
  percentage: number;
  createdAt: Date;
}

const QuizResultSchema = new Schema<IQuizResult>({
  userId: { type: String, required: true },
  quizId: { type: String, required: true },
  score: { type: Number, required: true },
  total: { type: Number, required: true },
  percentage: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
}, { collection: 'quiz_results' });

QuizResultSchema.index({ userId: 1, quizId: 1 }, { unique: true });

export const QuizResultModel: Model<IQuizResult> = mongoose.models.QuizResult || mongoose.model<IQuizResult>('QuizResult', QuizResultSchema);

// --- ChallengeProgress ---
export interface IChallengeProgress {
  id: string;
  userId: string;
  challengeType: string;
  correct: number;
  total: number;
  answered?: string;
  selectedOptions?: string;
  updatedAt: Date;
}

const ChallengeProgressSchema = new Schema<IChallengeProgress>({
  userId: { type: String, required: true },
  challengeType: { type: String, required: true },
  correct: { type: Number, default: 0 },
  total: { type: Number, default: 0 },
  answered: String,
  selectedOptions: String,
  updatedAt: { type: Date, default: Date.now },
}, { collection: 'challenge_progress' });

ChallengeProgressSchema.index({ userId: 1, challengeType: 1 }, { unique: true });

export const ChallengeProgressModel: Model<IChallengeProgress> = mongoose.models.ChallengeProgress || mongoose.model<IChallengeProgress>('ChallengeProgress', ChallengeProgressSchema);

// --- VerificationToken ---
export interface IVerificationToken {
  identifier: string;
  token: string;
  expires: Date;
}

const VerificationTokenSchema = new Schema<IVerificationToken>({
  identifier: { type: String, required: true },
  token: { type: String, required: true, unique: true },
  expires: { type: Date, required: true },
}, { collection: 'verification_tokens' });

VerificationTokenSchema.index({ identifier: 1, token: 1 }, { unique: true });

export const VerificationTokenModel: Model<IVerificationToken> = mongoose.models.VerificationToken || mongoose.model<IVerificationToken>('VerificationToken', VerificationTokenSchema);

// --- ItemProgress ---
export interface IItemProgress {
  id: string;
  userId: string;
  moduleId: string;
  itemIds: string;
  updatedAt: Date;
}

const ItemProgressSchema = new Schema<IItemProgress>({
  userId: { type: String, required: true },
  moduleId: { type: String, required: true },
  itemIds: { type: String, required: true },
  updatedAt: { type: Date, default: Date.now },
}, { collection: 'item_progress' });

ItemProgressSchema.index({ userId: 1, moduleId: 1 }, { unique: true });

export const ItemProgressModel: Model<IItemProgress> = mongoose.models.ItemProgress || mongoose.model<IItemProgress>('ItemProgress', ItemProgressSchema);

// --- Note ---
export interface INote {
  id: string;
  userId: string;
  itemId: string;
  moduleId: string;
  moduleName: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

const NoteSchema = new Schema<INote>({
  userId: { type: String, required: true },
  itemId: { type: String, required: true },
  moduleId: { type: String, required: true },
  moduleName: { type: String, required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}, { collection: 'notes' });

NoteSchema.index({ userId: 1, moduleId: 1 });
NoteSchema.index({ userId: 1, itemId: 1 });

export const NoteModel: Model<INote> = mongoose.models.Note || mongoose.model<INote>('Note', NoteSchema);

// --- StudySession ---
export interface IStudySession {
  id: string;
  userId: string;
  date: string;
  durationMs: number;
  pageType: string;
  xpEarned: number;
  createdAt: Date;
}

const StudySessionSchema = new Schema<IStudySession>({
  userId: { type: String, required: true },
  date: { type: String, required: true },
  durationMs: { type: Number, required: true },
  pageType: { type: String, required: true },
  xpEarned: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
}, { collection: 'study_sessions' });

StudySessionSchema.index({ userId: 1, date: 1 });
StudySessionSchema.index({ userId: 1, pageType: 1 });

export const StudySessionModel: Model<IStudySession> = mongoose.models.StudySession || mongoose.model<IStudySession>('StudySession', StudySessionSchema);

// --- LabProgress ---
export interface ILabProgress {
  id: string;
  userId: string;
  labId: string;
  completed: boolean;
  hintsUsed: number;
  attempts: number;
  lastAccessed: Date;
  createdAt: Date;
  updatedAt: Date;
}

const LabProgressSchema = new Schema<ILabProgress>({
  userId: { type: String, required: true },
  labId: { type: String, required: true },
  completed: { type: Boolean, default: false },
  hintsUsed: { type: Number, default: 0 },
  attempts: { type: Number, default: 0 },
  lastAccessed: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}, { collection: 'lab_progress' });

LabProgressSchema.index({ userId: 1, labId: 1 }, { unique: true });

export const LabProgressModel: Model<ILabProgress> = mongoose.models.LabProgress || mongoose.model<ILabProgress>('LabProgress', LabProgressSchema);

// --- FlagSubmission ---
export interface IFlagSubmission {
  id: string;
  userId: string;
  labId: string;
  flagId: string;
  submittedAt: Date;
  correct: boolean;
}

const FlagSubmissionSchema = new Schema<IFlagSubmission>({
  userId: { type: String, required: true },
  labId: { type: String, required: true },
  flagId: { type: String, required: true },
  submittedAt: { type: Date, default: Date.now },
  correct: { type: Boolean, default: false },
}, { collection: 'flag_submissions' });

FlagSubmissionSchema.index({ userId: 1, labId: 1, flagId: 1 }, { unique: true });

export const FlagSubmissionModel: Model<IFlagSubmission> = mongoose.models.FlagSubmission || mongoose.model<IFlagSubmission>('FlagSubmission', FlagSubmissionSchema);
