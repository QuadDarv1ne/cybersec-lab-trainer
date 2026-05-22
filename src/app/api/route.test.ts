import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// Mock db — all variables must be inside the mock factory since vi.mock is hoisted
vi.mock('@/lib/db', () => ({
  db: {
    progress: {
      findMany: vi.fn(),
      upsert: vi.fn(),
      deleteMany: vi.fn(),
    },
    quizResult: {
      findMany: vi.fn(),
      upsert: vi.fn(),
      deleteMany: vi.fn(),
    },
    challengeProgress: {
      findMany: vi.fn(),
      upsert: vi.fn(),
      deleteMany: vi.fn(),
    },
    itemProgress: {
      findMany: vi.fn(),
      upsert: vi.fn(),
      deleteMany: vi.fn(),
    },
    $transaction: vi.fn(),
  },
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
import { getServerSession } from 'next-auth';
import { db } from '@/lib/db';

// Get mock references after imports
const mockProgress = db.progress;
const mockQuizResult = db.quizResult;
const mockChallengeProgress = db.challengeProgress;
const mockItemProgress = db.itemProgress;
const mockTransaction = db.$transaction;

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
    vi.mocked(getServerSession).mockResolvedValue({ user: { id: 'test-user-1' } } as any);

    const request = new NextRequest('http://localhost:3000/api?action=unknown-action');
    const response = await GET(request);

    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error).toContain('Unknown action');
  });

  it('loads progress when authenticated', async () => {
    vi.mocked(getServerSession).mockResolvedValue({ user: { id: 'test-user-1' } } as any);

    mockProgress.findMany.mockResolvedValue([
      { moduleId: 'owasp-top-10', completed: true, score: 85, userId: 'test-user-1', lastAccessed: new Date() },
    ]);
    mockQuizResult.findMany.mockResolvedValue([]);
    mockChallengeProgress.findMany.mockResolvedValue([]);
    mockItemProgress.findMany.mockResolvedValue([]);

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
    vi.mocked(getServerSession).mockResolvedValue({ user: { id: 'test-user-1' } } as any);

    mockProgress.findMany.mockResolvedValue([]);
    mockQuizResult.findMany.mockResolvedValue([
      { quizId: 'owasp', score: 7, total: 10, percentage: 70, userId: 'test-user-1', createdAt: new Date() },
      { quizId: 'owasp', score: 9, total: 10, percentage: 90, userId: 'test-user-1', createdAt: new Date() },
    ]);
    mockChallengeProgress.findMany.mockResolvedValue([]);
    mockItemProgress.findMany.mockResolvedValue([]);

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
    vi.mocked(getServerSession).mockResolvedValue({ user: { id: 'test-user-1' } } as any);

    mockProgress.upsert.mockResolvedValue({
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
    vi.mocked(getServerSession).mockResolvedValue({ user: { id: 'test-user-1' } } as any);

    mockQuizResult.upsert.mockResolvedValue({
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
    vi.mocked(getServerSession).mockResolvedValue({ user: { id: 'test-user-1' } } as any);

    mockProgress.upsert.mockResolvedValue({ moduleId: 'sql-injection', completed: true, userId: 'test-user-1' });
    mockQuizResult.upsert.mockResolvedValue({ quizId: 'owasp', score: 9, total: 10, userId: 'test-user-1' });

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
    vi.mocked(getServerSession).mockResolvedValue({ user: { id: 'test-user-1' } } as any);

    mockChallengeProgress.upsert.mockResolvedValue({
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
    vi.mocked(getServerSession).mockResolvedValue({ user: { id: 'test-user-1' } } as any);

    mockItemProgress.upsert.mockResolvedValue({
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
    vi.mocked(getServerSession).mockResolvedValue({ user: { id: 'test-user-1' } } as any);

    mockTransaction.mockResolvedValue([{}, {}, {}, {}]);

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
    vi.mocked(getServerSession).mockResolvedValue({ user: { id: 'test-user-1' } } as any);

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
    vi.mocked(getServerSession).mockResolvedValue({ user: { id: 'test-user-1' } } as any);

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
    vi.mocked(getServerSession).mockResolvedValue({ user: { id: 'test-user-1' } } as any);

    mockProgress.upsert.mockResolvedValue({ moduleId: 'sql-injection', completed: true });

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
});
