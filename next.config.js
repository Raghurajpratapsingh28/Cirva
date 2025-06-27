/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  experimental: {
    esmExternals: false,
  },
  swcMinify: true,
  webpack: (config) => {
    config.module.rules.push({
      test: /HeartbeatWorker.*\.js$/,
      type: 'javascript/auto',
    });
    return config;
  },
};

module.exports = nextConfig;
