import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.feishucdn.com',
      },
      {
        protocol: 'https',
        hostname: '**.bitablecdn.com',
      },
    ],
    unoptimized: false,
  },
};

export default nextConfig;
