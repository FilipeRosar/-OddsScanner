import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['flagsapi.com', 'upload.wikimedia.org'],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
       headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
        ],
      },
    ];
  },
 async redirects() {
    return [
      {
        source: '/brasileirao',
        destination: '/',
        permanent: true,
      },
    ];
  },

  output: "standalone",
  reactCompiler: true,
};

module.exports = nextConfig;