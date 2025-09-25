'use client'

import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { User, Shield, Bot } from 'lucide-react'
import type { ChatMessage as ChatMessageType } from '@/types/chat'

interface ChatMessageProps {
  message: ChatMessageType
  theme?: 'light' | 'dark'
}

export default function ChatMessage({ message, theme = 'light' }: ChatMessageProps) {
  const isUser = message.senderType === 'USER'
  const isAdmin = message.senderType === 'ADMIN'
  const isSystem = message.senderType === 'SYSTEM'

  const formatTime = (date: Date) => {
    return format(new Date(date), 'HH:mm', { locale: es })
  }

  const getMessageIcon = () => {
    if (isSystem) return <Bot size={16} />
    if (isAdmin) return <Shield size={16} />
    return <User size={16} />
  }

  const getMessageStyles = () => {
    if (theme === 'dark') {
      if (isUser) return 'bg-primary-600 text-white ml-8'
      if (isAdmin) return 'bg-green-600 text-white mr-8'
      if (isSystem) return 'bg-gray-600 text-gray-200 mx-4'
    } else {
      if (isUser) return 'bg-primary-100 text-primary-900 ml-8'
      if (isAdmin) return 'bg-green-100 text-green-900 mr-8'
      if (isSystem) return 'bg-gray-100 text-gray-700 mx-4'
    }
    return ''
  }

  const getSenderName = () => {
    if (isSystem) return 'Sistema'
    if (isAdmin) return message.sender?.name || 'Soporte'
    return message.sender?.name || 'Tú'
  }

  if (isSystem) {
    return (
      <div className="flex justify-center">
        <div className={`
          px-3 py-2 rounded-full text-xs flex items-center gap-2
          ${getMessageStyles()}
        `}>
          {getMessageIcon()}
          <span>{message.content}</span>
        </div>
      </div>
    )
  }

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`
        max-w-xs lg:max-w-md px-4 py-2 rounded-lg shadow-sm
        ${getMessageStyles()}
      `}>
        {/* Sender info */}
        <div className="flex items-center gap-2 mb-1">
          {getMessageIcon()}
          <span className="text-xs font-medium opacity-75">
            {getSenderName()}
          </span>
          <span className="text-xs opacity-50">
            {formatTime(message.createdAt)}
          </span>
        </div>

        {/* Message content */}
        <div className="text-sm">
          {message.messageType === 'IMAGE' && message.attachmentUrl ? (
            <div className="space-y-2">
              <img 
                src={message.attachmentUrl} 
                alt="Imagen adjunta"
                className="max-w-full h-auto rounded-md"
                loading="lazy"
              />
              {message.content && <p>{message.content}</p>}
            </div>
          ) : message.messageType === 'FILE' && message.attachmentUrl ? (
            <div className="space-y-2">
              <a 
                href={message.attachmentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 underline"
              >
                📎 Archivo adjunto
              </a>
              {message.content && <p>{message.content}</p>}
            </div>
          ) : (
            <p className="whitespace-pre-wrap break-words">{message.content}</p>
          )}
        </div>

        {/* Read status */}
        {isUser && (
          <div className="flex justify-end mt-1">
            <span className={`text-xs ${message.isRead ? 'opacity-75' : 'opacity-50'}`}>
              {message.isRead ? '✓✓' : '✓'}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
