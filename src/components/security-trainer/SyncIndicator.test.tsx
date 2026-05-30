import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import SyncIndicator from './SyncIndicator';

vi.mock('@/hooks/use-session', () => ({
  useSession: vi.fn(),
}));

vi.mock('@/lib/store', () => ({
  useAppStore: vi.fn(),
}));

const { useSession } = await import('@/hooks/use-session');
const { useAppStore } = await import('@/lib/store');

const mockUseSession = vi.mocked(useSession);
const mockUseAppStore = vi.mocked(useAppStore);

function createMockSession() {
  return {
    user: { id: 'user-123', name: 'Test User', email: null, image: null },
    expires: new Date(Date.now() + 86400000).toISOString(),
  };
}

function createAppStoreMock(overrides: Partial<{ syncStatus: 'idle' | 'syncing' | 'synced' | 'error'; lastSyncedAt: number | null; userId: string | null }> = {}) {
  const state = {
    syncStatus: 'idle' as const,
    lastSyncedAt: null,
    userId: null,
    ...overrides,
  };
  return state;
}

describe('SyncIndicator', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseSession.mockReturnValue({
      isAuthenticated: false,
      session: null,
      isLoading: false,
      status: 'unauthenticated' as const,
      user: undefined,
      update: vi.fn(),
    });

    mockUseAppStore.mockImplementation((selector) => {
      const state = createAppStoreMock();
      return selector ? selector(state) : state;
    });
  });

  it('returns null when user is not authenticated', () => {
    const { container } = render(<SyncIndicator />);
    expect(container.firstChild).toBeNull();
  });

  it('returns null when user is authenticated but no userId', () => {
    mockUseSession.mockReturnValue({
      isAuthenticated: true,
      session: createMockSession(),
      isLoading: false,
      status: 'authenticated' as const,
      user: createMockSession().user,
      update: vi.fn(),
    });

    mockUseAppStore.mockImplementation((selector) => {
      const state = createAppStoreMock({ userId: null });
      return selector ? selector(state) : state;
    });

    const { container } = render(<SyncIndicator />);
    expect(container.firstChild).toBeNull();
  });

  it('renders when user is authenticated and has userId', () => {
    mockUseSession.mockReturnValue({
      isAuthenticated: true,
      session: createMockSession(),
      isLoading: false,
      status: 'authenticated' as const,
      user: createMockSession().user,
      update: vi.fn(),
    });

    mockUseAppStore.mockImplementation((selector) => {
      const state = createAppStoreMock({ userId: 'user-123' });
      return selector ? selector(state) : state;
    });

    render(<SyncIndicator />);
    expect(screen.getByText('Offline')).toBeDefined();
  });

  it('shows idle state with offline icon', () => {
    mockUseSession.mockReturnValue({
      isAuthenticated: true,
      session: createMockSession(),
      isLoading: false,
      status: 'authenticated' as const,
      user: createMockSession().user,
      update: vi.fn(),
    });

    mockUseAppStore.mockImplementation((selector) => {
      const state = createAppStoreMock({ userId: 'user-123' });
      return selector ? selector(state) : state;
    });

    render(<SyncIndicator />);
    expect(screen.getByText('Offline')).toBeDefined();
  });

  it('shows syncing state with pulsing icon', () => {
    mockUseSession.mockReturnValue({
      isAuthenticated: true,
      session: createMockSession(),
      isLoading: false,
      status: 'authenticated' as const,
      user: createMockSession().user,
      update: vi.fn(),
    });

    mockUseAppStore.mockImplementation((selector) => {
      const state = createAppStoreMock({ syncStatus: 'syncing', userId: 'user-123' });
      return selector ? selector(state) : state;
    });

    render(<SyncIndicator />);
    expect(screen.getByText('Syncing...')).toBeDefined();
  });

  it('shows synced state with check icon', () => {
    mockUseSession.mockReturnValue({
      isAuthenticated: true,
      session: createMockSession(),
      isLoading: false,
      status: 'authenticated' as const,
      user: createMockSession().user,
      update: vi.fn(),
    });

    mockUseAppStore.mockImplementation((selector) => {
      const state = createAppStoreMock({ syncStatus: 'synced', lastSyncedAt: Date.now() - 3000, userId: 'user-123' });
      return selector ? selector(state) : state;
    });

    render(<SyncIndicator />);
    expect(screen.getByText(/Synced/)).toBeDefined();
  });

  it('shows error state with alert icon', () => {
    mockUseSession.mockReturnValue({
      isAuthenticated: true,
      session: createMockSession(),
      isLoading: false,
      status: 'authenticated' as const,
      user: createMockSession().user,
      update: vi.fn(),
    });

    mockUseAppStore.mockImplementation((selector) => {
      const state = createAppStoreMock({ syncStatus: 'error', userId: 'user-123' });
      return selector ? selector(state) : state;
    });

    render(<SyncIndicator />);
    expect(screen.getByText('Sync failed')).toBeDefined();
  });

  it('formats time correctly for "just now"', () => {
    mockUseSession.mockReturnValue({
      isAuthenticated: true,
      session: createMockSession(),
      isLoading: false,
      status: 'authenticated' as const,
      user: createMockSession().user,
      update: vi.fn(),
    });

    mockUseAppStore.mockImplementation((selector) => {
      const state = createAppStoreMock({ syncStatus: 'synced', lastSyncedAt: Date.now() - 2000, userId: 'user-123' });
      return selector ? selector(state) : state;
    });

    render(<SyncIndicator />);
    expect(screen.getByText('Synced just now')).toBeDefined();
  });

  it('formats time correctly for seconds ago', () => {
    mockUseSession.mockReturnValue({
      isAuthenticated: true,
      session: createMockSession(),
      isLoading: false,
      status: 'authenticated' as const,
      user: createMockSession().user,
      update: vi.fn(),
    });

    mockUseAppStore.mockImplementation((selector) => {
      const state = createAppStoreMock({ syncStatus: 'synced', lastSyncedAt: Date.now() - 45000, userId: 'user-123' });
      return selector ? selector(state) : state;
    });

    render(<SyncIndicator />);
    expect(screen.getByText('Synced 45s ago')).toBeDefined();
  });

  it('formats time correctly for minutes ago', () => {
    mockUseSession.mockReturnValue({
      isAuthenticated: true,
      session: createMockSession(),
      isLoading: false,
      status: 'authenticated' as const,
      user: createMockSession().user,
      update: vi.fn(),
    });

    mockUseAppStore.mockImplementation((selector) => {
      const state = createAppStoreMock({ syncStatus: 'synced', lastSyncedAt: Date.now() - 120000, userId: 'user-123' });
      return selector ? selector(state) : state;
    });

    render(<SyncIndicator />);
    expect(screen.getByText('Synced 2m ago')).toBeDefined();
  });

  it('has accessible text for screen readers', () => {
    mockUseSession.mockReturnValue({
      isAuthenticated: true,
      session: createMockSession(),
      isLoading: false,
      status: 'authenticated' as const,
      user: createMockSession().user,
      update: vi.fn(),
    });

    mockUseAppStore.mockImplementation((selector) => {
      const state = createAppStoreMock({ syncStatus: 'synced', lastSyncedAt: Date.now(), userId: 'user-123' });
      return selector ? selector(state) : state;
    });

    render(<SyncIndicator />);
    const syncText = screen.getByText(/Synced/);
    expect(syncText).toBeDefined();
  });
});
