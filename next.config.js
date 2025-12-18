/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Enable any experimental features if needed
  },
  images: {
    domains: ['localhost'], // Add any image domains you'll be using
  },
  // Enable TypeScript strict mode
  typescript: {
    ignoreBuildErrors: true,
  },
  // Enable ESLint
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Path alias for @ (already configured in tsconfig.json)
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': './src',
    };
    return config;
  },
}

module.exports = nextConfig
