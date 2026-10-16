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
};

export default nextConfig;
