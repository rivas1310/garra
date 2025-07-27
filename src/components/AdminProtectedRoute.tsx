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
      toast.error('Acceso denegado. Debes iniciar sesión como administrador.')
      router.push(`/login?returnUrl=${encodeURIComponent(pathname)}`)
    } 
    // Si el usuario está autenticado pero no es administrador
    else if (session && session.user.role !== 'ADMIN') {
      toast.error('Acceso denegado. No tienes permisos de administrador.')
      router.push('/')
    } else {
      setIsAuthorized(true)
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