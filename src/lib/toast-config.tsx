// Configuración personalizada para React Hot Toast
import { toast, Toaster as HotToaster } from 'react-hot-toast'
import React from 'react'

// Configuración personalizada para el Toaster
export const toastConfig = {
  position: 'top-right' as const,
  duration: 4000,
  style: {
    background: '#fff',
    color: '#374151',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    fontSize: '14px',
    fontWeight: '500',
  },
  success: {
    iconTheme: {
      primary: '#10b981', // Verde
      secondary: '#fff',
    },
    style: {
      border: '1px solid #d1fae5',
      background: '#f0fdf4',
    },
  },
  error: {
    iconTheme: {
      primary: '#ef4444', // Rojo
      secondary: '#fff',
    },
    style: {
      border: '1px solid #fecaca',
      background: '#fef2f2',
    },
  },
  loading: {
    iconTheme: {
      primary: '#6366f1', // Azul
      secondary: '#fff',
    },
    style: {
      border: '1px solid #c7d2fe',
      background: '#eef2ff',
    },
  },
}

// Funciones personalizadas para diferentes tipos de notificaciones
export const customToast = {
  success: (message: string, options?: any) => {
    return toast.success(message, {
      ...toastConfig.success,
      ...options,
    })
  },
  
  error: (message: string, options?: any) => {
    return toast.error(message, {
      ...toastConfig.error,
      duration: 6000, // Errores se muestran más tiempo
      ...options,
    })
  },
  
  loading: (message: string, options?: any) => {
    return toast.loading(message, {
      ...toastConfig.loading,
      ...options,
    })
  },
  
  // Notificación específica para 2FA
  twoFactorSuccess: (message: string = '¡Verificación exitosa! Bienvenido') => {
    return toast.success(message, {
      ...toastConfig.success,
      duration: 5000,
      style: {
        ...toastConfig.success.style,
        border: '1px solid #10b981',
        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        color: '#fff',
      },
    })
  },
  
  // Notificación específica para códigos 2FA
  twoFactorCode: (message: string = 'Código de verificación enviado a tu correo') => {
    return toast.success(message, {
      ...toastConfig.success,
      duration: 5000,
      icon: '📧',
      style: {
        ...toastConfig.success.style,
        border: '1px solid #6366f1',
        background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
        color: '#fff',
      },
    })
  },
  
  // Notificación de error específica para 2FA
  twoFactorError: (message: string = 'Código inválido o expirado') => {
    return toast.error(message, {
      ...toastConfig.error,
      duration: 6000,
      icon: '🔐',
      style: {
        ...toastConfig.error.style,
        border: '1px solid #ef4444',
        background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
        color: '#fff',
      },
    })
  }
}

// Componente Toaster personalizado
export function CustomToaster(): JSX.Element {
  return (
    <HotToaster
      position={toastConfig.position}
      toastOptions={{
        duration: toastConfig.duration,
        style: toastConfig.style,
        success: toastConfig.success,
        error: toastConfig.error,
        loading: toastConfig.loading,
      }}
    />
  )
}
