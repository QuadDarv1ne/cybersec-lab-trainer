import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  reactStrictMode: true,

  // CSP заголовки для безопасности
  // Примечание: 'unsafe-inline' необходим для Next.js runtime inline styles.
  // 'unsafe-eval' удалён — в production рекомендуется использовать nonce-based CSP.
  headers: async () => [
    {
      source: '/:path*',
      headers: [
        {
          key: 'Content-Security-Policy',
          value: process.env.NODE_ENV === 'development'
            ? "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://github.com https://accounts.google.com; frame-src 'self' https://github.com https://accounts.google.com; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'"
            : "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://github.com https://accounts.google.com; frame-src 'self' https://github.com https://accounts.google.com; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'",
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
  ],
};

export default nextConfig;
