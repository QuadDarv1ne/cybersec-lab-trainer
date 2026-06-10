import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  reactStrictMode: true,
  
  // Разрешить кросс-оригинные запросы в режиме разработки
  allowedDevOrigins: ['192.168.31.38'],

  // CSP заголовки для безопасности
  // OAuth домены добавляются только если настроены соответствующие переменные окружения
  headers: async () => {
    const oauthDomains: string[] = [];
    if (process.env.GITHUB_ID && process.env.GITHUB_SECRET) {
      oauthDomains.push("https://github.com");
    }
    if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
      oauthDomains.push("https://accounts.google.com");
    }
    const oauthSrc = oauthDomains.length > 0 ? ` ${oauthDomains.join(" ")}` : "";

    const devCSP = [
      "default-src 'self' blob:",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https: http:",
      "font-src 'self' data: https:",
      "media-src 'self' https:",
      "connect-src 'self' https: wss:" + oauthSrc,
      "frame-src 'self'" + oauthSrc,
      "worker-src 'self' blob:",
      "frame-ancestors 'self'",
      "form-action 'self'",
      "base-uri 'self'",
    ].join('; ');

    const prodCSP = [
      "default-src 'self' blob:",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data: https:",
      "media-src 'self' https:",
      "connect-src 'self' https:" + oauthSrc,
      "frame-src 'self'" + oauthSrc,
      "worker-src 'self' blob:",
      "frame-ancestors 'self'",
      "form-action 'self'",
      "base-uri 'self'",
    ].join('; ');

    return [
      {
        // Page routes — full security headers
        source: '/((?!api).*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: process.env.NODE_ENV === 'development' ? devCSP : prodCSP,
          },
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          ...(process.env.NODE_ENV === 'production'
            ? [{ key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' }]
            : []),
        ],
      },
      {
        // API routes — minimal headers (no CSP, no DNS prefetch)
        source: '/api/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
        ],
      },
    ];
  },
};

export default nextConfig;
