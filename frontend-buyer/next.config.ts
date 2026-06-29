import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Supabase storage
      { protocol: 'https', hostname: '*.supabase.co' },
      // Google profile pictures
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      // Facebook profile pictures
      { protocol: 'https', hostname: '*.fbcdn.net' },
    ],
  },
};

export default nextConfig;
