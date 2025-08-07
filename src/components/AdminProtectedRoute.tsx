'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, usePathname } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { toast } from 'react-hot-toast'

export default function AdminProtectedRoute({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const [isAuthorized, setIsAuthorized] = useState(false)

  useEffect(() => {
    // Si la sesión está cargando, no hacemos nada todavía
    if (status === 'loading') return

    // Si no hay sesión, redirigir al login
    if (status === 'unauthenticated') {
      toast.error('Acceso denegado. Debes iniciar sesión.')
      router.push(`/login?returnUrl=${encodeURIComponent(pathname)}`)
      return
    } 

    // Verificar permisos según el rol
    if (session) {
      // Si es ADMIN, tiene acceso a todo el panel
      if (session.user.role === 'ADMIN') {
        setIsAuthorized(true)
        return
      }
      
      // Si es VENDEDOR o VENDOR, solo tiene acceso a la página de venta-fisica
      if (session.user.role === 'VENDEDOR' || session.user.role === 'VENDOR') {
        // Si intenta acceder a venta-fisica, permitir acceso
        if (pathname === '/admin/venta-fisica') {
          setIsAuthorized(true)
          return
        } else if (pathname === '/admin') {
          // Redirigir al vendedor directamente a la página de venta-fisica
          router.push('/admin/venta-fisica')
          return
        } else {
          // Si intenta acceder a otra página del panel, mostrar error y redirigir
          toast.error('Acceso restringido. Solo puedes acceder a la página de ventas físicas.')
          router.push('/admin/venta-fisica')
          return
        }
      }
      
      // Si tiene otro rol (USER), no tiene acceso al panel
      toast.error('Acceso denegado. No tienes permisos para acceder al panel de administración.')
      router.push('/')
    }
  }, [session, status, router, pathname])

  // Mientras se verifica la autorización, mostrar un loader
  if (status === 'loading' || !isAuthorized) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-neutral-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600 mx-auto" />
          <p className="mt-2 text-neutral-600">Verificando acceso...</p>
        </div>
      </div>
    )
  }

  // Si está autorizado, mostrar el contenido
  return <>{children}</>
}