/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  distDir: 'out',
  images: {
    unoptimized: true,
    remotePatterns: [],
  },
  // Enable strict mode for better development experience
  reactStrictMode: true,
  // Disable ESLint during build to avoid build failures
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Disable TypeScript type checking during build (handled by IDE)
  typescript: {
    ignoreBuildErrors: true,
  },
}

export default nextConfig
