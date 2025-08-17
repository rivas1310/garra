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
  title: 'Bazar Fashion - Tu tienda de moda online',
  description: 'Descubre las últimas tendencias en moda. Ropa, accesorios y más en Bazar Fashion.',
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