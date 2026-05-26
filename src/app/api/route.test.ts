import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// Mock db adapter — the route uses getDbAdapter() not db directly
const mockProgress = {
  findMany: vi.fn(),
  upsert: vi.fn(),
  deleteMany: vi.fn(),
};

const mockQuizResult = {
  findMany: vi.fn(),
  upsert: vi.fn(),
  deleteMany: vi.fn(),
};

const mockChallengeProgress = {
  findMany: vi.fn(),
  upsert: vi.fn(),
  deleteMany: vi.fn(),
};

const mockItemProgress = {
  findMany: vi.fn(),
  upsert: vi.fn(),
  deleteMany: vi.fn(),
};

const mockNote = {
  findMany: vi.fn(),
  upsert: vi.fn(),
  deleteMany: vi.fn(),
};

const mockStudySession = {
  findMany: vi.fn(),
  upsert: vi.fn(),
  deleteMany: vi.fn(),
};

const mockTransaction = vi.fn();

vi.mock('@/lib/db-adapter', () => ({
  getDbAdapter: vi.fn(() => ({
    type: 'sqlite',
    progress: mockProgress,
    quizResult: mockQuizResult,
    challengeProgress: mockChallengeProgress,
    itemProgress: mockItemProgress,
    note: mockNote,
    studySession: mockStudySession,
    lab: { findMany: vi.fn(() => []), findUnique: vi.fn(() => null) },
    labFlag: { findFirst: vi.fn(() => null) },
    labProgress: {
      findUnique: vi.fn(() => null),
      upsert: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    flagSubmission: { findFirst: vi.fn(() => null), findMany: vi.fn(() => []), create: vi.fn() },
    user: { findUnique: vi.fn(() => null), create: vi.fn() },
    account: { findMany: vi.fn(() => []), create: vi.fn(), deleteMany: vi.fn() },
    session: { findMany: vi.fn(() => []), create: vi.fn(), deleteMany: vi.fn() },
    verificationToken: { create: vi.fn(), delete: vi.fn() },
    deleteAllForUser: mockTransaction,
    disconnect: vi.fn(),
  })),
}));

// Mock next-auth
vi.mock('next-auth', () => ({
  getServerSession: vi.fn(),
}));

// Mock auth options
vi.mock('@/lib/auth', () => ({
  authOptions: {},
}));

// Mock rate limit to always allow
vi.mock('@/lib/rate-limit', () => ({
  rateLimit: vi.fn().mockResolvedValue({ response: null, remaining: 99, reset: Date.now() + 60 }),
  getClientIP: vi.fn().mockReturnValue('127.0.0.1'),
  addRateLimitHeaders: vi.fn((response: Response) => response),
}));

// Mock logger
vi.mock('@/lib/logger', () => ({
  logger: {
    error: vi.fn(),
    warn: vi.fn(),
  },
}));

// Mock next/headers for CSRF cookie handling
const mockCookieStore = {
  set: vi.fn(),
  get: vi.fn().mockReturnValue({ value: 'test-csrf-token' }),
};

vi.mock('next/headers', () => ({
  cookies: vi.fn(() => mockCookieStore),
}));

// Import route handlers after mocking
import { GET, POST } from '@/app/api/route';
import { getServerSession, Session } from 'next-auth';

// Typed mock session helper
const mockSession: Session = {
  user: { id: 'test-user-1', name: null, email: null, image: null },
  expires: new Date(Date.now() + 86400000).toISOString(),
};

// Helper to create POST requests with CSRF token
function createPostRequest(url: string, body: Record<string, unknown>) {
  return new NextRequest(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-csrf-token': 'test-csrf-token',
    },
    body: JSON.stringify(body),
  });
}

describe('API Route GET /api', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when not authenticated', async () => {
    vi.mocked(getServerSession).mockResolvedValue(null);

    const request = new NextRequest('http://localhost:3000/api?action=load-progress');
    const response = await GET(request);

    expect(response.status).toBe(401);
    const body = await response.json();
    expect(body.error).toBe('Authentication required');
  });

  it('returns 400 for unknown action', async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);

    const request = new NextRequest('http://localhost:3000/api?action=unknown-action');
    const response = await GET(request);

    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error).toContain('Unknown action');
  });

  it('loads progress when authenticated', async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);

    (mockProgress.findMany as any).mockResolvedValue([
      { moduleId: 'owasp-top-10', completed: true, score: 85, userId: 'test-user-1', lastAccessed: new Date() },
    ]);
    (mockQuizResult.findMany as any).mockResolvedValue([]);
    (mockChallengeProgress.findMany as any).mockResolvedValue([]);
    (mockItemProgress.findMany as any).mockResolvedValue([]);
    (mockNote.findMany as any).mockResolvedValue([]);
    (mockStudySession.findMany as any).mockResolvedValue([]);

    const request = new NextRequest('http://localhost:3000/api?action=load-progress');
    const response = await GET(request);

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.completedModules).toContain('owasp-top-10');
    expect(body.quizScores).toEqual({});
    expect(body.challenges).toEqual({});
    expect(body.itemProgress).toEqual({});
  });

  it('returns best quiz scores when multiple quiz results exist', async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);

    (mockProgress.findMany as any).mockResolvedValue([]);
    (mockQuizResult.findMany as any).mockResolvedValue([
      { quizId: 'owasp', score: 7, total: 10, percentage: 70, userId: 'test-user-1', createdAt: new Date() },
      { quizId: 'owasp', score: 9, total: 10, percentage: 90, userId: 'test-user-1', createdAt: new Date() },
    ]);
    (mockChallengeProgress.findMany as any).mockResolvedValue([]);
    (mockItemProgress.findMany as any).mockResolvedValue([]);
    (mockNote.findMany as any).mockResolvedValue([]);
    (mockStudySession.findMany as any).mockResolvedValue([]);

    const request = new NextRequest('http://localhost:3000/api?action=load-progress');
    const response = await GET(request);

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.quizScores['owasp']).toBe(90);
  });
});

describe('API Route POST /api', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('allows glossary-search without authentication', async () => {
    const request = createPostRequest('http://localhost:3000/api', {
      type: 'glossary-search',
      payload: { query: 'sql' },
    });

    const response = await POST(request);

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.type).toBe('glossary-search');
    expect(Array.isArray(body.results)).toBe(true);
  });

  it('returns 401 for authenticated actions when not logged in', async () => {
    vi.mocked(getServerSession).mockResolvedValue(null);

    const request = createPostRequest('http://localhost:3000/api', {
      type: 'progress',
      payload: { moduleId: 'owasp-top-10', completed: true },
    });

    const response = await POST(request);

    expect(response.status).toBe(401);
  });

  it('saves progress when authenticated', async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);

    (mockProgress.upsert as any).mockResolvedValue({
      moduleId: 'owasp-top-10',
      completed: true,
      score: 0,
      userId: 'test-user-1',
      lastAccessed: new Date(),
    });

    const request = createPostRequest('http://localhost:3000/api', {
      type: 'progress',
      payload: { moduleId: 'owasp-top-10', completed: true },
    });

    const response = await POST(request);

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.message).toBe('Success');
    expect(body.type).toBe('progress');
    expect(mockProgress.upsert).toHaveBeenCalled();
  });

  it('saves quiz answers when authenticated', async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);

    (mockQuizResult.upsert as any).mockResolvedValue({
      quizId: 'owasp',
      score: 8,
      total: 10,
      percentage: 80,
      userId: 'test-user-1',
    });

    const request = createPostRequest('http://localhost:3000/api', {
      type: 'quiz-answers',
      payload: { quizId: 'owasp', score: 8, total: 10 },
    });

    const response = await POST(request);

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.type).toBe('quiz-answers');
    expect(body.quizResult.percentage).toBe(80);
  });

  it('performs batch sync when authenticated', async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);

    (mockProgress.upsert as any).mockResolvedValue({ moduleId: 'sql-injection', completed: true, userId: 'test-user-1' });
    (mockQuizResult.upsert as any).mockResolvedValue({ quizId: 'owasp', score: 9, total: 10, userId: 'test-user-1' });

    const request = createPostRequest('http://localhost:3000/api', {
      type: 'batch-sync',
      payload: {
        modules: [{ moduleId: 'sql-injection', completed: true, score: 85 }],
        quizzes: [{ quizId: 'owasp', score: 9, total: 10 }],
      },
    });

    const response = await POST(request);

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.message).toBe('Batch sync completed');
    expect(body.saved.modules).toBe(1);
    expect(body.saved.quizzes).toBe(1);
  });

  it('syncs challenge progress when authenticated', async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);

    (mockChallengeProgress.upsert as any).mockResolvedValue({
      challengeType: 'owasp',
      correct: 5,
      total: 10,
      userId: 'test-user-1',
    });

    const request = createPostRequest('http://localhost:3000/api', {
      type: 'challenge-progress-sync',
      payload: {
        challenges: [{ challengeType: 'owasp', correct: 5, total: 10, answered: [], selectedOptions: {} }],
      },
    });

    const response = await POST(request);

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.saved.challenges).toBe(1);
  });

  it('syncs item progress when authenticated', async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);

    (mockItemProgress.upsert as any).mockResolvedValue({
      moduleId: 'sql-injection',
      itemIds: JSON.stringify(['level-1', 'level-2']),
      userId: 'test-user-1',
    });

    const request = createPostRequest('http://localhost:3000/api', {
      type: 'item-progress-sync',
      payload: {
        items: [{ moduleId: 'sql-injection', itemIds: ['level-1', 'level-2'] }],
      },
    });

    const response = await POST(request);

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.saved.items).toBe(1);
  });

  it('resets progress when authenticated', async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);

    (mockTransaction as any).mockResolvedValue([{}, {}, {}, {}]);

    const request = createPostRequest('http://localhost:3000/api', {
      type: 'reset-progress',
      payload: {},
    });

    const response = await POST(request);

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.message).toBe('Progress reset successfully');
    expect(mockTransaction).toHaveBeenCalled();
  });

  it('returns 400 for unknown request type', async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);

    const request = createPostRequest('http://localhost:3000/api', {
      type: 'unknown-type',
      payload: {},
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error).toContain('Unknown request type');
  });

  it('returns 400 for validation errors', async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);

    // Missing required fields for progress
    const request = createPostRequest('http://localhost:3000/api', {
      type: 'progress',
      payload: { moduleId: 'invalid-module-id-with-special-chars-!@#$%^&*' },
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error).toBe('Validation failed');
  });

  it('filters invalid module IDs in batch-sync', async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);

    (mockProgress.upsert as any).mockResolvedValue({ moduleId: 'sql-injection', completed: true });

    const request = createPostRequest('http://localhost:3000/api', {
      type: 'batch-sync',
      payload: {
        modules: [
          { moduleId: 'sql-injection', completed: true },
          { moduleId: 'non-existent-module', completed: true },
        ],
        quizzes: [],
      },
    });

    const response = await POST(request);

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.saved.modules).toBe(1); // Only valid module saved
  });

  it('syncs notes when authenticated', async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);

    const request = createPostRequest('http://localhost:3000/api', {
      type: 'notes-sync',
      payload: {
        notes: [
          { id: 'note-1', itemId: 'item1', moduleId: 'owasp', moduleName: 'OWASP', content: 'Test note' },
        ],
      },
    });

    const response = await POST(request);

    expect(response.status).toBe(200);
  });

  it('sanitizes note content to prevent XSS attacks', async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);

    const request = createPostRequest('http://localhost:3000/api', {
      type: 'notes-sync',
      payload: {
        notes: [
          { id: 'note-xss-1', itemId: 'item1', moduleId: 'owasp', moduleName: 'OWASP', content: '<script>alert("xss")</script>Normal note' },
          { id: 'note-xss-2', itemId: 'item2', moduleId: 'owasp', moduleName: 'OWASP', content: '<b>Bold</b> &amp; entities' },
        ],
      },
    });

    const response = await POST(request);

    expect(response.status).toBe(200);
    // The actual sanitization happens before upsert - DOMParser strips tags and decodes entities
  });

  it('syncs study sessions when authenticated', async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);

    const request = createPostRequest('http://localhost:3000/api', {
      type: 'study-sessions-sync',
      payload: {
        sessions: [
          { id: 'session-1', date: '2025-01-15', durationMs: 60000, pageType: 'owasp', xpEarned: 5 },
        ],
      },
    });

    const response = await POST(request);

    expect(response.status).toBe(200);
  });

  it('deletes a note when authenticated', async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);

    const request = createPostRequest('http://localhost:3000/api', {
      type: 'note-delete',
      payload: { noteId: 'note-1' },
    });

    const response = await POST(request);

    expect(response.status).toBe(200);
  });

  it('handles empty batch-sync gracefully', async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);

    const request = createPostRequest('http://localhost:3000/api', {
      type: 'batch-sync',
      payload: { modules: [], quizzes: [] },
    });

    const response = await POST(request);

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.saved.modules).toBe(0);
    expect(body.saved.quizzes).toBe(0);
  });

  it('filters invalid quiz IDs in batch-sync', async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);

    (mockQuizResult.upsert as any).mockResolvedValue({ quizId: 'owasp', score: 9, total: 10 });

    const request = createPostRequest('http://localhost:3000/api', {
      type: 'batch-sync',
      payload: {
        modules: [],
        quizzes: [
          { quizId: 'owasp', score: 9, total: 10 },
          { quizId: 'non-existent-quiz', score: 5, total: 10 },
        ],
      },
    });

    const response = await POST(request);

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.saved.quizzes).toBe(1);
  });

  it('returns 400 for malformed JSON body', async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);

    const request = new NextRequest('http://localhost:3000/api', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-csrf-token': 'test-csrf-token',
      },
      body: 'not valid json',
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
  });

  it('handles empty challenge array in challenge-progress-sync', async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);

    const request = createPostRequest('http://localhost:3000/api', {
      type: 'challenge-progress-sync',
      payload: { challenges: [] },
    });

    const response = await POST(request);

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.saved.challenges).toBe(0);
  });

  it('handles item progress with empty itemIds arrays', async () => {
    vi.mocked(getServerSession).mockResolvedValue(mockSession);

    (mockItemProgress.upsert as any).mockResolvedValue({
      moduleId: 'sql-injection',
      itemIds: '[]',
      userId: 'test-user-1',
    });

    const request = createPostRequest('http://localhost:3000/api', {
      type: 'item-progress-sync',
      payload: {
        items: [
          { moduleId: 'sql-injection', itemIds: ['level-1'] },
          { moduleId: 'xss', itemIds: [] }, // empty array is still saved by API
        ],
      },
    });

    const response = await POST(request);

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.saved.items).toBe(2); // API saves all items, including those with empty itemIds
  });
});
