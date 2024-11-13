/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  eslint: {
    ignoreDuringBuilds: true, // Disables linting during build
  },
  experimental: {
    appDir: true,  // Ensure this is enabled
  },
};

export default nextConfig;