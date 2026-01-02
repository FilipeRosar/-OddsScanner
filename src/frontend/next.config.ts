/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      'flagsapi.com', 
      'upload.wikimedia.org', 
      'media.api-sports.io', 
      'v3.football.api-sports.io'
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.api-sports.io',
      },
      {
        protocol: 'https',
        hostname: 'upload.wikimedia.org',
      }
    ],
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
        destination: '/?league=Brasileirão Série A',
        permanent: true,
      },
      {
        source: '/premier-league',
        destination: '/?league=Premier League',
        permanent: true,
      },
      {
        source: '/la-liga',
        destination: '/?league=La Liga',
        permanent: true,
      },
      {
        source: '/serie-a',
        destination: '/?league=Serie A Itália',
        permanent: true,
      },
      {
        source: '/bundesliga',
        destination: '/?league=Bundesliga',
        permanent: true,
      },
      {
        source: '/champions-league',
        destination: '/?league=Champions League',
        permanent: true,
      },
      {
        source: '/libertadores',
        destination: '/?league=Libertadores',
        permanent: true,
      },
    ];
  },

  output: "standalone",
  // Nota: reactCompiler é uma feature experimental do React 19/Next 15
  experimental: {
    // reactCompiler: true, // Caso seu Next.js peça para ficar dentro de experimental
  }
};

module.exports = nextConfig;