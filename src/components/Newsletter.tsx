'use client'

import { useState } from 'react'
import { Mail, Send } from 'lucide-react'
import { toast } from 'react-hot-toast'

export default function Newsletter() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) {
      toast.error('Por favor ingresa tu email')
      return
    }
    
    setLoading(true)
    
    // Simular envío
    setTimeout(() => {
      setLoading(false)
      toast.success('¡Gracias por suscribirte! Te mantendremos informado.')
      setEmail('')
    }, 1000)
  }

  return (
    <section className="bg-gradient-to-r from-blue-600 to-blue-800 py-16">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-6">
          <Mail className="h-8 w-8 text-white" />
        </div>
        
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
          ¡Mantente al día con las últimas tendencias!
        </h2>
        
        <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
          Suscríbete a nuestro newsletter y recibe ofertas exclusivas, 
          nuevos productos y consejos de moda directamente en tu inbox.
        </p>
        
        <form onSubmit={handleSubmit} className="max-w-md mx-auto">
          <div className="flex gap-2">
            <input
              type="email"
              placeholder="Tu email aquí..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 px-4 py-3 rounded-lg border-0 focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-600 bg-white text-gray-900 placeholder-gray-500"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-white text-blue-600 font-semibold px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </button>
          </div>
        </form>
        
        <p className="text-sm text-white/80 mt-4">
          No spam, solo contenido valioso. Puedes cancelar en cualquier momento.
        </p>
        
        
      </div>
    </section>
  )
} 