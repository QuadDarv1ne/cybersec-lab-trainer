import { describe, it, expect } from 'vitest';
import { getClientIP, addRateLimitHeaders } from './rate-limit';
import { NextResponse } from 'next/server';

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

  it('takes the first entry from X-Forwarded-For (original client IP)', () => {
    const prev = process.env.TRUST_PROXY;
    process.env.TRUST_PROXY = '1';
    const req = makeRequest({
      'x-forwarded-for': '10.0.0.5, proxy1, proxy2',
    });
    expect(getClientIP(req)).toBe('10.0.0.5');
    process.env.TRUST_PROXY = prev;
  });

  it('handles single-entry X-Forwarded-For', () => {
    const prev = process.env.TRUST_PROXY;
    process.env.TRUST_PROXY = '1';
    const req = makeRequest({
      'x-forwarded-for': '192.168.1.1',
    });
    expect(getClientIP(req)).toBe('192.168.1.1');
    process.env.TRUST_PROXY = prev;
  });

  it('ignores X-Forwarded-For when TRUST_PROXY is not set', () => {
    const prev = process.env.TRUST_PROXY;
    delete process.env.TRUST_PROXY;
    const req = makeRequest({
      'x-forwarded-for': '192.168.1.1',
    });
    expect(getClientIP(req)).toBe('anonymous');
    process.env.TRUST_PROXY = prev;
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

describe('addRateLimitHeaders', () => {
  it('sets correct rate limit headers', () => {
    const response = new NextResponse();
    addRateLimitHeaders(response, 95, 1700000060);

    expect(response.headers.get('X-RateLimit-Limit')).toBe('100');
    expect(response.headers.get('X-RateLimit-Remaining')).toBe('95');
    // reset is in seconds (ceil of ms/1000)
    expect(response.headers.get('X-RateLimit-Reset')).toBe('1700001');
  });

  it('clamps negative remaining to 0', () => {
    const response = new NextResponse();
    addRateLimitHeaders(response, -5, 1700000060);

    expect(response.headers.get('X-RateLimit-Remaining')).toBe('0');
  });

  it('rounds up reset time to nearest second', () => {
    const response = new NextResponse();
    // 1700000000500 ms = 1700000000.5 seconds -> ceil = 1700000001
    addRateLimitHeaders(response, 50, 1700000000500);

    expect(response.headers.get('X-RateLimit-Reset')).toBe('1700000001');
  });
});
