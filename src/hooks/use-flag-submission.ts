/**
 * Client-side hook for CTF flag submission.
 * Sends flag to server for verification — flag values are never exposed to the client.
 */

import { useState, useCallback } from 'react';
import { getCsrfCookieName, getCsrfHeaderName } from '@/lib/csrf-constants';
import { logger } from '@/lib/logger';

interface FlagSubmissionResult {
  correct: boolean;
  points: number;
  alreadyFound: boolean;
  message: string;
}

function getCsrfToken(): string | null {
  const name = getCsrfCookieName();
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match?.[2] ?? null;
}

export function useFlagSubmission() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastResult, setLastResult] = useState<FlagSubmissionResult | null>(null);

  const submitFlag = useCallback(async (labId: string, flagKey: string, flagValue: string): Promise<FlagSubmissionResult | null> => {
    setIsSubmitting(true);
    setLastResult(null);

    try {
      const csrfToken = getCsrfToken();
      if (!csrfToken) {
        setLastResult({
          correct: false,
          points: 0,
          alreadyFound: false,
          message: 'CSRF token missing. Refresh the page.',
        });
        return null;
      }

      const response = await fetch('/api/flags', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          [getCsrfHeaderName()]: csrfToken,
        },
        body: JSON.stringify({ labId, flagKey, flagValue }),
      });

      if (!response.ok) {
        let errorMessage = 'Ошибка отправки флага';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch {
          // non-JSON error body — use default message
        }
        setLastResult({
          correct: false,
          points: 0,
          alreadyFound: false,
          message: errorMessage,
        });
        return null;
      }

      const data = await response.json();
      setLastResult(data);
      return data;
    } catch (err) {
      logger.error('[useFlagSubmission] submitFlag error:', err);
      const result: FlagSubmissionResult = {
        correct: false,
        points: 0,
        alreadyFound: false,
        message: 'Ошибка сети. Попробуйте ещё раз.',
      };
      setLastResult(result);
      return result;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const reset = useCallback(() => {
    setLastResult(null);
  }, []);

  return { submitFlag, isSubmitting, lastResult, reset };
}
