import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // Suppress type/eslint errors during build (fix properly before production hardening)
  typescript: { ignoreBuildErrors: true },
  eslint:     { ignoreDuringBuilds: true },

  // Don't bundle server-only modules into the client
  serverExternalPackages: ['bcryptjs'],
};

export default nextConfig;
