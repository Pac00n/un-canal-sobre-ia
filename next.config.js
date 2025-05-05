/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['images.unsplash.com', 'picsum.photos', 'source.unsplash.com', 'plus.unsplash.com'],
  },
  // Revalidación en tiempo real para contenido dinámico
  experimental: {
    // Habilitar características experimentales que pueden mejorar la revalidación
    serverActions: true,
  },
}

module.exports = nextConfig
