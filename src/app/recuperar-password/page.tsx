"use client"

import { useState } from 'react'
import { log } from '@/lib/secureLogger'
import { toast } from 'react-hot-toast'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function RecuperarPasswordPage() {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const response = await fetch('/api/auth/recuperar-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })
      
      const data = await response.json()
      
      if (response.ok) {
        setSubmitted(true)
        toast.success('Se ha enviado un enlace a tu correo para restablecer tu contraseña')
      } else {
        toast.error(data.error || 'Error al procesar la solicitud')
      }
    } catch (error) {
      log.error('Error:', error)
      toast.error('Error de conexión. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-elegant py-12">
      <div className="bg-white rounded-xl shadow-elegant p-6 w-full max-w-sm">
        <Link href="/login" className="text-primary-600 hover:text-primary-700 flex items-center gap-1 mb-4 text-sm">
          <ArrowLeft className="h-4 w-4" /> Volver al inicio de sesión
        </Link>
        
        <h1 className="text-xl font-bold text-neutral-700 mb-2 text-center">
          {submitted ? 'Correo enviado' : 'Recuperar contraseña'}
        </h1>
        
        {submitted ? (
          <div className="space-y-4">
            <p className="text-neutral-600 text-center">
              Hemos enviado un enlace a <strong>{email}</strong> con instrucciones para restablecer tu contraseña.
            </p>
            <p className="text-neutral-500 text-sm text-center">
              Si no recibes el correo en unos minutos, revisa tu carpeta de spam o solicita un nuevo enlace.
            </p>
            <button
              onClick={() => setSubmitted(false)}
              className="btn-secondary w-full py-2 rounded-lg font-medium mt-2 text-sm"
            >
              Solicitar nuevo enlace
            </button>
          </div>
        ) : (
          <>
            <p className="text-neutral-600 mb-4 text-center">
              Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña
            </p>
            
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="block text-neutral-700 font-medium mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-neutral-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-300 text-sm"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-2 rounded-lg font-medium mt-2 disabled:opacity-60 text-sm"
              >
                {loading ? 'Enviando...' : 'Enviar enlace de recuperación'}
              </button>
            </form>
          </>
        )}
      </div>
    </main>
  )
}