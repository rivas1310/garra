import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import SessionProviderWrapper from '@/components/SessionProviderWrapper'
import CartNotification from '@/components/CartNotification'
import CookieConsent from '@/components/CookieConsent'
import PWAInstaller from '@/components/PWAInstaller'
import PerformanceMonitor from '@/components/PerformanceMonitor'
import ErrorBoundary from '@/components/ErrorBoundary'


const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'Garras Felinas - Tu tienda de moda online',
    template: '%s | Garras Felinas'
  },
  description: 'Descubre las últimas tendencias en moda. Ropa, calzado, accesorios y más en Garras Felinas. Envíos a toda la República Mexicana.',
  keywords: 'moda, ropa, calzado, accesorios, tienda online, México, envíos, tendencias, garras felinas',
  authors: [{ name: 'Garras Felinas' }],
  creator: 'Garras Felinas',
  publisher: 'Garras Felinas',
  icons: {
      icon: '/logos/garras.png',
      shortcut: '/logos/garras.png',
      apple: '/logos/garras.png',
      other: [
        {
          rel: 'icon',
          type: 'image/png',
          sizes: '32x32',
          url: '/logos/garras.png',
        },
        {
          rel: 'icon',
          type: 'image/png',
          sizes: '16x16',
          url: '/logos/garras.png',
        },
      ],
    },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'es_ES',
    url: 'https://garrasfelinas.com',
    siteName: 'Garras Felinas',
    title: 'Garras Felinas - Tu tienda de moda online',
    description: 'Descubre las últimas tendencias en moda. Ropa, calzado, accesorios y más en Garras Felinas.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Garras Felinas - Tu tienda de moda online',
    description: 'Descubre las últimas tendencias en moda. Ropa, calzado, accesorios y más en Garras Felinas.',
    creator: '@garrasfelinas',
  },
  verification: {
    google: 'google-site-verification-code',
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Garras Felinas',
  },
  formatDetection: {
    telephone: false,
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'apple-mobile-web-app-title': 'Garras Felinas',
    'application-name': 'Garras Felinas',
    'msapplication-TileColor': '#3b82f6',
    'msapplication-config': '/browserconfig.xml',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <SessionProviderWrapper>
          <ErrorBoundary>
            <div className="min-h-screen flex flex-col">
              <Header />
              <main className="flex-1">
                {children}
              </main>
              <Footer />
            </div>
            <CartNotification />
            <CookieConsent />
            <PWAInstaller />
            <PerformanceMonitor />
            <Toaster position="top-right" />
          </ErrorBoundary>
        </SessionProviderWrapper>
      </body>
    </html>
  )
}