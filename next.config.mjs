/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: ['images.unsplash.com', 'picsum.photos', 'source.unsplash.com', 'plus.unsplash.com'],
    unoptimized: true,
  },
}

export default nextConfig
