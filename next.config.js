/** @type {import('next').NextConfig} */
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',  // Disable in development
  buildExcludes: [/middleware-manifest\.json$/],  // Fix for manifest generation
})

const nextConfig = {
  reactStrictMode: true,
  output: 'export',  // Enable static exports
  images: {
    unoptimized: true, // Required for static export
  },
  ...(process.env.NODE_ENV === 'production' ? {
    basePath: '/labs/isobutanecalc', // Only add base path in production
    assetPrefix: '/labs/isobutanecalc/', // Only add asset prefix in production
  } : {})
}

module.exports = withPWA(nextConfig) 