import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import SyncIndicator from './SyncIndicator';

// Mock modules first (hoisted)
vi.mock('@/hooks/use-session', () => ({
  useSession: vi.fn(),
}));

vi.mock('@/lib/store', () => ({
  useAppStore: vi.fn(),
}));

// Then create mock references using dynamic imports
const mockUseSession = vi.mocked((await import('@/hooks/use-session')).useSession);
const mockUseAppStore = vi.mocked((await import('@/lib/store')).useAppStore);

describe('SyncIndicator', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default mocks
    mockUseSession.mockReturnValue({
      isAuthenticated: false,
      session: null,
      isLoading: false,
    });
    
    mockUseAppStore.mockImplementation((selector) => {
      const state = {
        syncStatus: 'idle' as const,
        lastSyncedAt: null as number | null,
        userId: null as string | null,
      };
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
      session: { user: { id: '123', name: 'Test User' } },
      isLoading: false,
    });

    mockUseAppStore.mockImplementation((selector) => {
      const state = {
        syncStatus: 'idle' as const,
        lastSyncedAt: null,
        userId: null,
      };
      return selector ? selector(state) : state;
    });

    const { container } = render(<SyncIndicator />);
    expect(container.firstChild).toBeNull();
  });

  it('renders when user is authenticated and has userId', () => {
    mockUseSession.mockReturnValue({
      isAuthenticated: true,
      session: { user: { id: '123', name: 'Test User' } },
      isLoading: false,
    });

    mockUseAppStore.mockImplementation((selector) => {
      const state = {
        syncStatus: 'idle' as const,
        lastSyncedAt: null,
        userId: 'user-123',
      };
      return selector ? selector(state) : state;
    });

    render(<SyncIndicator />);
    expect(screen.getByText('Offline')).toBeDefined();
  });

  it('shows idle state with offline icon', () => {
    mockUseSession.mockReturnValue({
      isAuthenticated: true,
      session: { user: { id: '123', name: 'Test User' } },
      isLoading: false,
    });

    mockUseAppStore.mockImplementation((selector) => {
      const state = {
        syncStatus: 'idle' as const,
        lastSyncedAt: null,
        userId: 'user-123',
      };
      return selector ? selector(state) : state;
    });

    render(<SyncIndicator />);
    expect(screen.getByText('Offline')).toBeDefined();
  });

  it('shows syncing state with pulsing icon', () => {
    mockUseSession.mockReturnValue({
      isAuthenticated: true,
      session: { user: { id: '123', name: 'Test User' } },
      isLoading: false,
    });

    mockUseAppStore.mockImplementation((selector) => {
      const state = {
        syncStatus: 'syncing' as const,
        lastSyncedAt: null,
        userId: 'user-123',
      };
      return selector ? selector(state) : state;
    });

    render(<SyncIndicator />);
    expect(screen.getByText('Syncing...')).toBeDefined();
  });

  it('shows synced state with check icon', () => {
    mockUseSession.mockReturnValue({
      isAuthenticated: true,
      session: { user: { id: '123', name: 'Test User' } },
      isLoading: false,
    });

    mockUseAppStore.mockImplementation((selector) => {
      const state = {
        syncStatus: 'synced' as const,
        lastSyncedAt: Date.now() - 3000, // 3 seconds ago
        userId: 'user-123',
      };
      return selector ? selector(state) : state;
    });

    render(<SyncIndicator />);
    expect(screen.getByText(/Synced/)).toBeDefined();
  });

  it('shows error state with alert icon', () => {
    mockUseSession.mockReturnValue({
      isAuthenticated: true,
      session: { user: { id: '123', name: 'Test User' } },
      isLoading: false,
    });

    mockUseAppStore.mockImplementation((selector) => {
      const state = {
        syncStatus: 'error' as const,
        lastSyncedAt: null,
        userId: 'user-123',
      };
      return selector ? selector(state) : state;
    });

    render(<SyncIndicator />);
    expect(screen.getByText('Sync failed')).toBeDefined();
  });

  it('formats time correctly for "just now"', () => {
    mockUseSession.mockReturnValue({
      isAuthenticated: true,
      session: { user: { id: '123', name: 'Test User' } },
      isLoading: false,
    });

    mockUseAppStore.mockImplementation((selector) => {
      const state = {
        syncStatus: 'synced' as const,
        lastSyncedAt: Date.now() - 2000, // 2 seconds ago
        userId: 'user-123',
      };
      return selector ? selector(state) : state;
    });

    render(<SyncIndicator />);
    expect(screen.getByText('Synced just now')).toBeDefined();
  });

  it('formats time correctly for seconds ago', () => {
    mockUseSession.mockReturnValue({
      isAuthenticated: true,
      session: { user: { id: '123', name: 'Test User' } },
      isLoading: false,
    });

    mockUseAppStore.mockImplementation((selector) => {
      const state = {
        syncStatus: 'synced' as const,
        lastSyncedAt: Date.now() - 45000, // 45 seconds ago
        userId: 'user-123',
      };
      return selector ? selector(state) : state;
    });

    render(<SyncIndicator />);
    expect(screen.getByText('Synced 45s ago')).toBeDefined();
  });

  it('formats time correctly for minutes ago', () => {
    mockUseSession.mockReturnValue({
      isAuthenticated: true,
      session: { user: { id: '123', name: 'Test User' } },
      isLoading: false,
    });

    mockUseAppStore.mockImplementation((selector) => {
      const state = {
        syncStatus: 'synced' as const,
        lastSyncedAt: Date.now() - 120000, // 2 minutes ago
        userId: 'user-123',
      };
      return selector ? selector(state) : state;
    });

    render(<SyncIndicator />);
    expect(screen.getByText('Synced 2m ago')).toBeDefined();
  });

  it('has accessible text for screen readers', () => {
    mockUseSession.mockReturnValue({
      isAuthenticated: true,
      session: { user: { id: '123', name: 'Test User' } },
      isLoading: false,
    });

    mockUseAppStore.mockImplementation((selector) => {
      const state = {
        syncStatus: 'synced' as const,
        lastSyncedAt: Date.now(),
        userId: 'user-123',
      };
      return selector ? selector(state) : state;
    });

    render(<SyncIndicator />);
    const syncText = screen.getByText(/Synced/);
    expect(syncText).toBeDefined();
  });
});
