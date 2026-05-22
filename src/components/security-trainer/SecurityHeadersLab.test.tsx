import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SecurityHeadersLab from './SecurityHeadersLab';

// Mock store
vi.mock('@/lib/store', () => ({
  useAppStore: vi.fn((selector) => {
    const state = {
      completeModule: vi.fn(),
      setCurrentPage: vi.fn(),
      completedModules: [] as string[],
      headersChallengeScores: {
        correct: 0,
        total: 0,
        answered: [] as number[],
        selectedOptions: {} as Record<string, number>,
      },
      setHeadersChallengeScore: vi.fn(),
      getNotesForItem: vi.fn(() => []),
    };
    return selector ? selector(state) : state;
  }),
}));

// Mock intlStub
vi.mock('@/lib/intlStub', () => ({
  useTranslations: () => (key: string, _values?: Record<string, string | number>) => {
    const map: Record<string, string> = {
      'securityHeaders.title': 'Security Headers',
      'securityHeaders.description': 'Learn about HTTP security headers',
      'securityHeaders.overview': 'Overview',
      'securityHeaders.challenges': 'Challenges',
      'securityHeaders.challenge': 'Challenge',
      'securityHeaders.challengeProgress': 'Challenge {current} of {total}',
      'securityHeaders.selectAnswer': 'Select answer',
      'securityHeaders.submitAnswer': 'Submit answer',
      'securityHeaders.nextChallenge': 'Next challenge',
      'securityHeaders.previousChallenge': 'Previous challenge',
      'securityHeaders.correct': 'Correct!',
      'securityHeaders.incorrect': 'Incorrect',
      'securityHeaders.explanation': 'Explanation',
      'securityHeaders.completed': 'Completed',
      'securityHeaders.completeModule': 'Complete module',
      'securityHeaders.backToDashboard': 'Back to dashboard',
    };
    return map[key] ?? key;
  },
}));

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.HTMLAttributes<HTMLElement>) => <div {...props}>{children}</div>,
    section: ({ children, ...props }: React.HTMLAttributes<HTMLElement>) => <section {...props}>{children}</section>,
    h1: ({ children, ...props }: React.HTMLAttributes<HTMLElement>) => <h1 {...props}>{children}</h1>,
    h2: ({ children, ...props }: React.HTMLAttributes<HTMLElement>) => <h2 {...props}>{children}</h2>,
    p: ({ children, ...props }: React.HTMLAttributes<HTMLElement>) => <p {...props}>{children}</p>,
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock security-headers-data
vi.mock('@/lib/data/security-headers-data', () => ({
  securityHeaders: [
    {
      id: 'csp',
      name: 'Content-Security-Policy',
      description: 'Prevents XSS attacks',
      example: "Content-Security-Policy: default-src 'self'",
      importance: 'high',
      mitigations: ['Prevents XSS', 'Controls resource loading'],
    },
    {
      id: 'hsts',
      name: 'Strict-Transport-Security',
      description: 'Enforces HTTPS',
      example: 'Strict-Transport-Security: max-age=31536000; includeSubDomains',
      importance: 'high',
      mitigations: ['Enforces HTTPS', 'Prevents SSL stripping'],
    },
  ],
  headerChallenges: [
    {
      id: 1,
      question: 'Which header prevents XSS attacks?',
      options: [
        'Content-Security-Policy',
        'Strict-Transport-Security',
        'X-Frame-Options',
        'Referrer-Policy',
      ],
      correctAnswer: 0,
      explanation: 'Content-Security-Policy (CSP) is designed to prevent XSS attacks.',
    },
    {
      id: 2,
      question: 'Which header enforces HTTPS?',
      options: [
        'Content-Security-Policy',
        'Strict-Transport-Security',
        'X-Content-Type-Options',
        'Permissions-Policy',
      ],
      correctAnswer: 1,
      explanation: 'Strict-Transport-Security (HSTS) enforces HTTPS connections.',
    },
  ],
}));

describe('SecurityHeadersLab', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders title and description', () => {
    render(<SecurityHeadersLab />);
    expect(screen.getByText('Security Headers')).toBeDefined();
    expect(screen.getByText('Learn about HTTP security headers')).toBeDefined();
  });

  it('shows overview section', () => {
    render(<SecurityHeadersLab />);
    expect(screen.getByText('Overview')).toBeDefined();
  });

  it('shows challenges section', () => {
    render(<SecurityHeadersLab />);
    expect(screen.getByText('Challenges')).toBeDefined();
  });

  it('displays first challenge question', () => {
    render(<SecurityHeadersLab />);
    expect(screen.getByText('Which header prevents XSS attacks?')).toBeDefined();
  });

  it('shows challenge progress', () => {
    render(<SecurityHeadersLab />);
    expect(screen.getByText(/Challenge.*of.*/)).toBeDefined();
  });

  it('displays answer options', () => {
    render(<SecurityHeadersLab />);
    expect(screen.getByText('Content-Security-Policy')).toBeDefined();
    expect(screen.getByText('Strict-Transport-Security')).toBeDefined();
    expect(screen.getByText('X-Frame-Options')).toBeDefined();
    expect(screen.getByText('Referrer-Policy')).toBeDefined();
  });

  it('allows selecting an answer', () => {
    render(<SecurityHeadersLab />);
    const firstOption = screen.getByText('Content-Security-Policy');
    fireEvent.click(firstOption);
    
    // Check that option is selected
    expect(firstOption.closest('button')).toHaveAttribute('data-state', 'checked');
  });

  it('shows submit button when answer is selected', () => {
    render(<SecurityHeadersLab />);
    const firstOption = screen.getByText('Content-Security-Policy');
    fireEvent.click(firstOption);
    
    expect(screen.getByText('Submit answer')).toBeDefined();
  });

  it('shows correct result when submitting correct answer', async () => {
    render(<SecurityHeadersLab />);
    const correctOption = screen.getByText('Content-Security-Policy');
    fireEvent.click(correctOption);
    
    const submitButton = screen.getByText('Submit answer');
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Correct!')).toBeDefined();
    });
  });

  it('shows explanation after submitting answer', async () => {
    render(<SecurityHeadersLab />);
    const correctOption = screen.getByText('Content-Security-Policy');
    fireEvent.click(correctOption);
    
    const submitButton = screen.getByText('Submit answer');
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Explanation')).toBeDefined();
      expect(screen.getByText('Content-Security-Policy (CSP) is designed to prevent XSS attacks.')).toBeDefined();
    });
  });

  it('shows next challenge button after answering', async () => {
    render(<SecurityHeadersLab />);
    const correctOption = screen.getByText('Content-Security-Policy');
    fireEvent.click(correctOption);
    
    const submitButton = screen.getByText('Submit answer');
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Next challenge')).toBeDefined();
    });
  });

  it('navigates to next challenge', async () => {
    render(<SecurityHeadersLab />);
    const correctOption = screen.getByText('Content-Security-Policy');
    fireEvent.click(correctOption);
    
    const submitButton = screen.getByText('Submit answer');
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      const nextButton = screen.getByText('Next challenge');
      fireEvent.click(nextButton);
    });
    
    expect(screen.getByText('Which header enforces HTTPS?')).toBeDefined();
  });

  it('shows previous challenge button on second challenge', async () => {
    render(<SecurityHeadersLab />);
    
    // Go to second challenge
    const nextButton = screen.getByText('Next challenge');
    fireEvent.click(nextButton);
    
    expect(screen.getByText('Previous challenge')).toBeDefined();
  });

  it('navigates to previous challenge', async () => {
    render(<SecurityHeadersLab />);
    
    // Go to second challenge
    const nextButton = screen.getByText('Next challenge');
    fireEvent.click(nextButton);
    
    const prevButton = screen.getByText('Previous challenge');
    fireEvent.click(prevButton);
    
    expect(screen.getByText('Which header prevents XSS attacks?')).toBeDefined();
  });

  it('shows security headers list in overview', () => {
    render(<SecurityHeadersLab />);
    expect(screen.getByText('Content-Security-Policy')).toBeDefined();
    expect(screen.getByText('Prevents XSS attacks')).toBeDefined();
    expect(screen.getByText('Strict-Transport-Security')).toBeDefined();
    expect(screen.getByText('Enforces HTTPS')).toBeDefined();
  });

  it('shows importance badges', () => {
    render(<SecurityHeadersLab />);
    const highBadges = screen.getAllByText('high');
    expect(highBadges.length).toBeGreaterThan(0);
  });

  it('shows example code blocks', () => {
    render(<SecurityHeadersLab />);
    expect(screen.getByText("Content-Security-Policy: default-src 'self'")).toBeDefined();
    expect(screen.getByText('Strict-Transport-Security: max-age=31536000; includeSubDomains')).toBeDefined();
  });

  it('has accessible navigation', () => {
    render(<SecurityHeadersLab />);
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('shows back to dashboard button', () => {
    render(<SecurityHeadersLab />);
    expect(screen.getByText('Back to dashboard')).toBeDefined();
  });
});
