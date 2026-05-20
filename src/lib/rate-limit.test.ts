import { describe, it, expect } from 'vitest';
import { getClientIP } from './rate-limit';

describe('getClientIP', () => {
  function makeRequest(headers: Record<string, string>): Request {
    return new Request('http://localhost', { headers });
  }

  it('uses X-Real-IP when available', () => {
    const req = makeRequest({ 'x-real-ip': '10.0.0.1' });
    expect(getClientIP(req)).toBe('10.0.0.1');
  });

  it('prioritizes X-Real-IP over X-Forwarded-For', () => {
    const req = makeRequest({
      'x-forwarded-for': '1.2.3.4',
      'x-real-ip': '10.0.0.1',
    });
    expect(getClientIP(req)).toBe('10.0.0.1');
  });

  it('takes the last entry from X-Forwarded-For (Nginx appends real IP at end)', () => {
    const req = makeRequest({
      'x-forwarded-for': 'spoofed-ip, proxy1, 10.0.0.5',
    });
    expect(getClientIP(req)).toBe('10.0.0.5');
  });

  it('handles single-entry X-Forwarded-For', () => {
    const req = makeRequest({
      'x-forwarded-for': '192.168.1.1',
    });
    expect(getClientIP(req)).toBe('192.168.1.1');
  });

  it('returns "anonymous" when no IP headers are present', () => {
    const req = makeRequest({});
    expect(getClientIP(req)).toBe('anonymous');
  });

  it('trims whitespace from IP addresses', () => {
    const req = makeRequest({ 'x-real-ip': '  10.0.0.1  ' });
    expect(getClientIP(req)).toBe('10.0.0.1');
  });
});
