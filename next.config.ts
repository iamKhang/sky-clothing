import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ['product.hstatic.net', 'localhost'],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8080',
        pathname: '/images/**',
      },
      {
        protocol: 'https',
        hostname: 'product.hstatic.net',
        port: '',
        pathname: '/**',
      }
    ],
  },
};

export default nextConfig;
