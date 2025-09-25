'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

interface Message {
  id: string
  content: string
  senderType: string
  createdAt: string
  sender?: {
    name?: string
    email?: string
  }
  conversation?: {
    id: string
    guestName?: string
    guestEmail?: string
    user?: {
      name?: string
      email?: string
    }
  }
}

export default function MensajesPage() {
  const { data: session } = useSession()
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMessages()
  }, [])

  const fetchMessages = async () => {
    try {
      const response = await fetch('/api/chat/conversations')
      if (response.ok) {
        const conversations = await response.json()
        
        // Extraer todos los mensajes de todas las conversaciones
        const allMessages: Message[] = []
        conversations.forEach((conv: any) => {
          if (conv.messages) {
            conv.messages.forEach((msg: any) => {
              allMessages.push({
                ...msg,
                conversation: {
                  id: conv.id,
                  guestName: conv.guestName,
                  guestEmail: conv.guestEmail,
                  user: conv.user
                }
              })
            })
          }
        })
        
        // Ordenar por fecha (más recientes primero)
        allMessages.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        
        setMessages(allMessages)
      }
    } catch (error) {
      console.error('Error cargando mensajes:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES')
  }

  const getSenderName = (message: Message) => {
    if (message.sender?.name) return message.sender.name
    if (message.conversation?.user?.name) return message.conversation.user.name
    if (message.conversation?.guestName) return message.conversation.guestName
    return 'Usuario Anónimo'
  }

  const getSenderEmail = (message: Message) => {
    if (message.sender?.email) return message.sender.email
    if (message.conversation?.user?.email) return message.conversation.user.email
    if (message.conversation?.guestEmail) return message.conversation.guestEmail
    return 'Sin email'
  }

  if (!session || session.user?.role !== 'ADMIN') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Acceso Denegado</h1>
          <p>Necesitas ser administrador para ver esta página.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Todos los Mensajes</h1>
              <p className="text-gray-600">Historial completo de mensajes del chat</p>
            </div>
            <button
              onClick={fetchMessages}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
            >
              Actualizar
            </button>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p>Cargando mensajes...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No hay mensajes aún.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`p-4 rounded-lg border ${
                    message.senderType === 'USER' 
                      ? 'bg-blue-50 border-blue-200' 
                      : message.senderType === 'ADMIN'
                      ? 'bg-green-50 border-green-200'
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                        message.senderType === 'USER' 
                          ? 'bg-blue-100 text-blue-800' 
                          : message.senderType === 'ADMIN'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {message.senderType}
                      </span>
                      <span className="ml-2 font-medium text-gray-900">
                        {getSenderName(message)}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {formatDate(message.createdAt)}
                    </span>
                  </div>
                  
                  <p className="text-gray-800 mb-2">{message.content}</p>
                  
                  <div className="text-xs text-gray-500">
                    <p><strong>Email:</strong> {getSenderEmail(message)}</p>
                    <p><strong>Conversación:</strong> {message.conversation?.id}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-6 text-center text-sm text-gray-500">
            Total de mensajes: {messages.length}
          </div>
        </div>
      </div>
    </div>
  )
}
