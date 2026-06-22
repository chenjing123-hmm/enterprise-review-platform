/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    domains: ['localhost'],
  },
  // Rewrites disabled - backend not running
  // async rewrites() {
  //   return [
  //     { source: '/api/:path*', destination: 'http://localhost:4000/api/:path*' },
  //   ];
  // },
};

module.exports = nextConfig;