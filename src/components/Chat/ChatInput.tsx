'use client'

import { useState, useRef, KeyboardEvent } from 'react'
import { Send, Paperclip, Image } from 'lucide-react'

interface ChatInputProps {
  onSendMessage: (message: string) => void
  onTyping: () => void
  onStopTyping: () => void
  disabled?: boolean
  theme?: 'light' | 'dark'
}

export default function ChatInput({ 
  onSendMessage, 
  onTyping, 
  onStopTyping, 
  disabled = false,
  theme = 'light'
}: ChatInputProps) {
  const [message, setMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const handleInputChange = (value: string) => {
    setMessage(value)
    
    // Manejar indicador de escritura
    if (value.trim() && !isTyping) {
      setIsTyping(true)
      onTyping()
    }

    // Resetear timeout de escritura
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false)
      onStopTyping()
    }, 1000)

    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 100)}px`
    }
  }

  const handleSend = () => {
    const trimmedMessage = message.trim()
    if (!trimmedMessage || disabled) return

    onSendMessage(trimmedMessage)
    setMessage('')
    setIsTyping(false)
    onStopTyping()

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }

    // Clear typing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }
  }

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const themeClasses = {
    light: {
      container: 'bg-gray-50 border-gray-200',
      input: 'bg-white border-gray-300 text-gray-900 placeholder-gray-500',
      button: 'bg-primary-600 hover:bg-primary-700 text-white disabled:bg-gray-300',
      attachButton: 'text-gray-500 hover:text-gray-700'
    },
    dark: {
      container: 'bg-gray-700 border-gray-600',
      input: 'bg-gray-800 border-gray-600 text-white placeholder-gray-400',
      button: 'bg-primary-600 hover:bg-primary-700 text-white disabled:bg-gray-600',
      attachButton: 'text-gray-400 hover:text-gray-200'
    }
  }

  return (
    <div className={`
      flex items-end gap-2 p-2 rounded-lg border
      ${themeClasses[theme].container}
    `}>
      {/* Attachment buttons */}
      <div className="flex gap-1 pb-2">
        <button
          type="button"
          className={`
            p-1.5 rounded-md transition-colors
            ${themeClasses[theme].attachButton}
          `}
          title="Adjuntar archivo"
          disabled={disabled}
        >
          <Paperclip size={16} />
        </button>
        <button
          type="button"
          className={`
            p-1.5 rounded-md transition-colors
            ${themeClasses[theme].attachButton}
          `}
          title="Adjuntar imagen"
          disabled={disabled}
        >
          <Image size={16} />
        </button>
      </div>

      {/* Message input */}
      <div className="flex-1">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={disabled ? 'Conectando...' : 'Escribe tu mensaje...'}
          disabled={disabled}
          rows={1}
          className={`
            w-full px-3 py-2 rounded-md border resize-none transition-colors
            focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
            ${themeClasses[theme].input}
          `}
          style={{ minHeight: '40px', maxHeight: '100px' }}
        />
      </div>

      {/* Send button */}
      <button
        onClick={handleSend}
        disabled={disabled || !message.trim()}
        className={`
          p-2 rounded-md transition-all duration-200 flex items-center justify-center
          ${themeClasses[theme].button}
          ${!disabled && message.trim() ? 'hover:scale-105' : ''}
        `}
        title="Enviar mensaje"
      >
        <Send size={16} />
      </button>
    </div>
  )
}
