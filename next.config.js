/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['images.unsplash.com', 'picsum.photos', 'source.unsplash.com', 'plus.unsplash.com'],
  },
  // Revalidación en tiempo real para contenido dinámico
  experimental: {
    // Configuración correcta para Next.js 15
  }
}

export default nextConfig
