"use client"

import { useState, useRef, useEffect } from 'react'

interface TwoFactorCodeInputProps {
  onCodeComplete: (code: string) => void
  onCodeChange?: (code: string) => void
  disabled?: boolean
  error?: string
  className?: string
}

export default function TwoFactorCodeInput({
  onCodeComplete,
  onCodeChange,
  disabled = false,
  error,
  className = ''
}: TwoFactorCodeInputProps) {
  const [code, setCode] = useState<string[]>(new Array(8).fill(''))
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    // Auto-focus en el primer campo
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus()
    }
  }, [])

  const handleChange = (index: number, value: string) => {
    // Solo permitir dígitos
    if (!/^\d*$/.test(value)) return

    const newCode = [...code]
    newCode[index] = value
    setCode(newCode)

    // Notificar cambio
    onCodeChange?.(newCode.join(''))

    // Auto-avanzar al siguiente campo
    if (value && index < 7) {
      inputRefs.current[index + 1]?.focus()
    }

    // Notificar código completo
    const fullCode = newCode.join('')
    if (fullCode.length === 8) {
      onCodeComplete(fullCode)
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    // Retroceder con Backspace
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
    
    // Manejar flechas
    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
    if (e.key === 'ArrowRight' && index < 7) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 8)
    
    if (pastedData.length === 8) {
      const newCode = pastedData.split('')
      setCode(newCode)
      onCodeChange?.(pastedData)
      onCodeComplete(pastedData)
      
      // Focus en el último campo
      inputRefs.current[7]?.focus()
    }
  }

  const clearCode = () => {
    setCode(new Array(8).fill(''))
    inputRefs.current[0]?.focus()
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex justify-center gap-2">
        {code.map((digit, index) => (
          <input
            key={index}
            ref={(el) => { inputRefs.current[index] = el }}
            type="text"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            className={`
              w-10 h-12 text-center text-lg font-bold border-2 rounded-lg
              focus:outline-none focus:ring-2 focus:ring-primary-200
              transition-colors duration-200
              ${error 
                ? 'border-red-300 bg-red-50 focus:border-red-500' 
                : 'border-neutral-200 focus:border-primary-500'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-neutral-300'}
            `}
            disabled={disabled}
            autoComplete="off"
            inputMode="numeric"
          />
        ))}
      </div>
      
      {error && (
        <p className="text-red-600 text-sm text-center">{error}</p>
      )}
      
      <div className="text-center">
        <button
          type="button"
          onClick={clearCode}
          disabled={disabled}
          className="text-neutral-500 hover:text-neutral-700 text-sm disabled:opacity-50"
        >
          Limpiar código
        </button>
      </div>
    </div>
  )
}
