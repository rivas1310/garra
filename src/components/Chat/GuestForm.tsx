'use client'

import { useState } from 'react'
import { User, Mail, MessageCircle } from 'lucide-react'

interface GuestFormProps {
  onSubmit: (data: { name: string; email: string; message: string }) => void
  onCancel: () => void
  theme?: 'light' | 'dark'
}

export default function GuestForm({ onSubmit, onCancel, theme = 'light' }: GuestFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido'
    }

    if (!formData.message.trim()) {
      newErrors.message = 'El mensaje es requerido'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (validateForm()) {
      onSubmit(formData)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const themeClasses = {
    light: {
      container: 'bg-white',
      input: 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-primary-500',
      label: 'text-gray-700',
      button: 'bg-primary-600 hover:bg-primary-700 text-white',
      cancelButton: 'bg-gray-200 hover:bg-gray-300 text-gray-700',
      error: 'text-red-600'
    },
    dark: {
      container: 'bg-gray-800',
      input: 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-primary-500',
      label: 'text-gray-200',
      button: 'bg-primary-600 hover:bg-primary-700 text-white',
      cancelButton: 'bg-gray-600 hover:bg-gray-500 text-gray-200',
      error: 'text-red-400'
    }
  }

  return (
    <div className={`p-4 h-80 overflow-y-auto ${themeClasses[theme].container}`}>
      <div className="text-center mb-4">
        <MessageCircle size={32} className="mx-auto mb-2 text-primary-600" />
        <h3 className={`font-semibold text-lg ${themeClasses[theme].label}`}>
          ¡Hola! 👋
        </h3>
        <p className={`text-sm ${themeClasses[theme].label} opacity-75`}>
          Para comenzar, necesitamos algunos datos
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Nombre */}
        <div>
          <label className={`block text-sm font-medium mb-1 ${themeClasses[theme].label}`}>
            <User size={16} className="inline mr-1" />
            Nombre *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="Tu nombre completo"
            className={`
              w-full px-3 py-2 border rounded-md transition-colors
              focus:outline-none focus:ring-2 focus:ring-primary-500
              ${themeClasses[theme].input}
              ${errors.name ? 'border-red-500' : ''}
            `}
          />
          {errors.name && (
            <p className={`text-xs mt-1 ${themeClasses[theme].error}`}>
              {errors.name}
            </p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className={`block text-sm font-medium mb-1 ${themeClasses[theme].label}`}>
            <Mail size={16} className="inline mr-1" />
            Email *
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            placeholder="tu@email.com"
            className={`
              w-full px-3 py-2 border rounded-md transition-colors
              focus:outline-none focus:ring-2 focus:ring-primary-500
              ${themeClasses[theme].input}
              ${errors.email ? 'border-red-500' : ''}
            `}
          />
          {errors.email && (
            <p className={`text-xs mt-1 ${themeClasses[theme].error}`}>
              {errors.email}
            </p>
          )}
        </div>

        {/* Mensaje */}
        <div>
          <label className={`block text-sm font-medium mb-1 ${themeClasses[theme].label}`}>
            <MessageCircle size={16} className="inline mr-1" />
            ¿En qué podemos ayudarte? *
          </label>
          <textarea
            value={formData.message}
            onChange={(e) => handleInputChange('message', e.target.value)}
            placeholder="Describe tu consulta..."
            rows={3}
            className={`
              w-full px-3 py-2 border rounded-md resize-none transition-colors
              focus:outline-none focus:ring-2 focus:ring-primary-500
              ${themeClasses[theme].input}
              ${errors.message ? 'border-red-500' : ''}
            `}
          />
          {errors.message && (
            <p className={`text-xs mt-1 ${themeClasses[theme].error}`}>
              {errors.message}
            </p>
          )}
        </div>

        {/* Buttons */}
        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className={`
              flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors
              ${themeClasses[theme].cancelButton}
            `}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className={`
              flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors
              ${themeClasses[theme].button}
            `}
          >
            Comenzar Chat
          </button>
        </div>
      </form>

      <div className={`text-xs text-center mt-4 ${themeClasses[theme].label} opacity-60`}>
        <p>🔒 Tus datos están seguros con nosotros</p>
      </div>
    </div>
  )
}
