import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    domains: [
      'img-c.udemycdn.com',
      'images.unsplash.com',
      'via.placeholder.com',
      'picsum.photos',
      'localhost',
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
  },
};

export default nextConfig;
