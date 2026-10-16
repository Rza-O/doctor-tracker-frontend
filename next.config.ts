import type { NextConfig } from 'next';

// Where the Express API lives. Server-side only (no NEXT_PUBLIC_ prefix): the
// browser never learns this URL, it only ever calls /api on this domain.
const API_URL = process.env.API_URL ?? 'http://localhost:4000';

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      '*.css': {
        loaders: ['@tailwindcss/turbopack'],
        as: '*.css',
      },
    },
  },

  // Same-origin proxy: the browser calls /api/... on the frontend's domain and
  // Next forwards it to the API. Auth cookies are therefore first-party
  // (SameSite=Lax works, no third-party-cookie blocking) and no CORS is needed.
  async rewrites() {
    return [{ source: '/api/:path*', destination: `${API_URL}/api/:path*` }];
  },

  // Baseline security headers for every page (the API sets its own via helmet).
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          // Nobody may embed the app in a frame → prevents clickjacking.
          { key: 'X-Frame-Options', value: 'DENY' },
          // Browsers must trust the declared Content-Type, never guess it.
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          // Send only the origin (not full URLs with patient filters) to other sites.
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          // The app needs none of these device features; deny them outright.
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ];
  },
};

export default nextConfig;
