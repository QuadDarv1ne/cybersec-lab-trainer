import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  reactStrictMode: true,

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

    const devCSP = `default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self'${oauthSrc}; frame-src 'self'${oauthSrc}; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'`;
    const prodCSP = `default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self'${oauthSrc}; frame-src 'self'${oauthSrc}; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'`;

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
