import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import SessionProviderWrapper from '@/components/SessionProviderWrapper'
import CartNotification from '@/components/CartNotification'


const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'Garra Tienda - Tu tienda de moda online',
    template: '%s | Garra Tienda'
  },
  description: 'Descubre las últimas tendencias en moda. Ropa, calzado, accesorios y más en Garra Tienda. Envíos a toda la República Mexicana.',
  keywords: 'moda, ropa, calzado, accesorios, tienda online, México, envíos, tendencias',
  authors: [{ name: 'Garra Tienda' }],
  creator: 'Garra Tienda',
  publisher: 'Garra Tienda',
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
    url: 'https://garra-tienda.com',
    siteName: 'Garra Tienda',
    title: 'Garra Tienda - Tu tienda de moda online',
    description: 'Descubre las últimas tendencias en moda. Ropa, calzado, accesorios y más en Garra Tienda.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Garra Tienda - Tu tienda de moda online',
    description: 'Descubre las últimas tendencias en moda. Ropa, calzado, accesorios y más en Garra Tienda.',
    creator: '@garra_tienda',
  },
  verification: {
    google: 'google-site-verification-code',
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
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </div>
          <CartNotification />
          <Toaster position="top-right" />
        </SessionProviderWrapper>
      </body>
    </html>
  )
}