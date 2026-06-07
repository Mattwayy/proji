import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // Suppress type errors during build
  typescript: { ignoreBuildErrors: true },

  // Don't bundle server-only modules into the client
  serverExternalPackages: ['bcryptjs'],
};

export default nextConfig;
