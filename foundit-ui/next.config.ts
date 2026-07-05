import type { NextConfig } from 'next';

const ngrokDomain = process.env.NGROK_FRONTEND_DOMAIN?.trim();

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  ...(ngrokDomain
    ? {
        allowedDevOrigins: [ngrokDomain],
        async rewrites() {
          return [
            {
              source: '/api/:path*',
              destination: 'http://localhost:3001/api/:path*',
            },
          ];
        },
      }
    : {}),
};

export default nextConfig;
