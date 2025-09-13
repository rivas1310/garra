const { withSentryConfig } = require('@sentry/nextjs')

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['images.unsplash.com', 'plus.unsplash.com', 'localhost', 'garrasfelinas.com'],
    formats: ['image/webp', 'image/avif'],
  },
  // Configuración para PWA
  async headers() {
    return [
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
          {
            key: 'Service-Worker-Allowed',
            value: '/',
          },
        ],
      },
      {
        source: '/manifest.json',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]
  },
  // Configuración de redirects
  async redirects() {
    return [
      {
        source: '/politica-privacidad',
        destination: '/privacidad',
        permanent: true,
      },
      {
        source: '/terminos-condiciones',
        destination: '/terminos',
        permanent: true,
      },
    ]
  },
}

// Configuración de Sentry
const sentryWebpackPluginOptions = {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  silent: process.env.NODE_ENV !== 'production',
  widenClientFileUpload: true,
  hideSourceMaps: true,
  disableLogger: true,
  automaticVercelMonitors: true,
}

// Exportar configuración con Sentry
module.exports = withSentryConfig(nextConfig, sentryWebpackPluginOptions)