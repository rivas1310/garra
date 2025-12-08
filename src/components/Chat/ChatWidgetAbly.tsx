'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { useSession } from 'next-auth/react'
import { AblyProvider, ChannelProvider, useChannel } from 'ably/react'
import { Realtime } from 'ably'
import toast from 'react-hot-toast'
import { useNotificationSound } from '@/hooks/useNotificationSound'

const ablyKey = process.env.NEXT_PUBLIC_ABLY_API_KEY || 'WmvC8Q.fk9jIg:QTbhux1HYhgCpAqW3_3TKiIvcLBNbOEVxybCyT8k0oY'

interface Message {
  id: string
  content: string
  senderType: 'USER' | 'ADMIN' | 'SYSTEM'
  createdAt: string
  sender?: {
    name?: string
  }
  conversationId?: string
  isRead?: boolean
}

export default function ChatWidgetAbly() {
  const { data: session } = useSession()
  const [isOpen, setIsOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [hasUnreadMessages, setHasUnreadMessages] = useState(false)
  const [hasShownWelcomeMessage, setHasShownWelcomeMessage] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Hook para sonidos de notificación
  const { playSound } = useNotificationSound({ volume: 0.5, enabled: soundEnabled })

  // Configuración de Ably
  const { channel } = useChannel('chat-widget')
  
  useEffect(() => {
    if (channel) {
      console.log('📡 Chat widget conectado a Ably')
      
      const handleMessage = (message: any) => {
        console.log('📨 Mensaje recibido en widget:', message)
        
        if (message.name === 'new-message') {
          const newMessage = message.data as Message
          console.log('📨 Procesando mensaje:', newMessage)
          
          // Verificar si es para nuestra conversación actual o si no tenemos conversación aún
          if (!conversationId || newMessage.conversationId === conversationId) {
            // Evitar duplicar mensajes
            setMessages(prev => {
              const exists = prev.some(msg => msg.id === newMessage.id)
              if (exists) {
                console.log('⚠️ Mensaje duplicado ignorado:', newMessage.id)
                return prev
              }
              
              console.log('✅ Nuevo mensaje agregado:', newMessage.content)
              return [...prev, newMessage]
            })
            
            // Si es un mensaje del sistema, marcar como mostrado
            if (newMessage.senderType === 'SYSTEM' && newMessage.content.includes('Gracias por tu mensaje')) {
              setHasShownWelcomeMessage(true)
            }
            
            // Mostrar notificación si el chat no está abierto y es un mensaje de admin/sistema
            if (!isOpen && newMessage.senderType !== 'USER') {
              setHasUnreadMessages(true)
              toast.success('Nuevo mensaje recibido')
              // Reproducir sonido de notificación
              playSound('notification')
            }
          } else {
            console.log('⚠️ Mensaje ignorado - conversación diferente:', newMessage.conversationId, 'vs', conversationId)
          }
        }
      }

      channel.subscribe(handleMessage)
      
      return () => {
        console.log('📡 Chat widget desconectado de Ably')
        channel.unsubscribe(handleMessage)
      }
    }
  }, [channel, conversationId, isOpen])

  // Auto-scroll al final de los mensajes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Buscar o crear conversación
  const findOrCreateConversation = async () => {
    try {
      const response = await fetch('/api/chat/conversations')
      if (response.ok) {
        const conversations = await response.json()

        let existingConversation = null

        if (session?.user?.id) {
          existingConversation = conversations.find((conv: any) =>
            conv.userId === session.user.id && conv.status === 'ACTIVE'
          )
        } else {
          existingConversation = conversations.find((conv: any) =>
            conv.guestEmail === 'anonimo@example.com' && conv.status === 'ACTIVE'
          )
        }

        if (existingConversation) {
          setConversationId(existingConversation.id)
          setMessages(existingConversation.messages || [])
          const unreadCount = (existingConversation.messages || []).filter((msg: Message) =>
            msg.senderType !== 'USER' && !msg.isRead
          ).length
          setHasUnreadMessages(unreadCount > 0)
          
          // Verificar si ya tiene mensajes del sistema para no mostrar el mensaje de bienvenida
          const hasSystemMessage = (existingConversation.messages || []).some((msg: Message) =>
            msg.senderType === 'SYSTEM' && msg.content.includes('Gracias por tu mensaje')
          )
          setHasShownWelcomeMessage(hasSystemMessage)
          
          return existingConversation
        }
      }

      // Crear nueva conversación
      const createResponse = await fetch('/api/chat/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: 'Consulta desde widget',
          ...(session ? {} : {
            name: 'Usuario Anónimo',
            email: 'anonimo@example.com'
          })
        })
      })

      if (createResponse.ok) {
        const conversation = await createResponse.json()
        setConversationId(conversation.id)
        setMessages(conversation.messages || [])
        return conversation
      }
    } catch (error) {
      console.error('Error buscando/creando conversación:', error)
    }
  }

  // Enviar mensaje
  const sendMessage = async (content: string) => {
    if (!conversationId || !content.trim()) return

    setIsLoading(true)

    try {
      // Enviar mensaje via API
      const response = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId,
          content
        })
      })

      if (response.ok) {
        const savedMessage = await response.json()
        
        // Agregar el mensaje inmediatamente al estado local para feedback instantáneo
        setMessages(prev => {
          // Verificar si ya existe para evitar duplicados
          const exists = prev.some(msg => msg.id === savedMessage.id)
          if (!exists) {
            console.log('✅ Mensaje agregado inmediatamente al estado local')
            return [...prev, {
              ...savedMessage,
              conversationId,
              senderType: 'USER' as const
            }]
          }
          return prev
        })
        
        // Publicar en Ably para notificar a admins
        console.log('📤 Publicando mensaje en Ably:', savedMessage)
        await channel.publish('new-message', {
          ...savedMessage,
          conversationId,
          senderType: 'USER'
        })
        console.log('✅ Mensaje publicado en Ably correctamente')
        
        // También publicar en el canal del admin
        const adminChannel = ably.channels.get('chat-admin')
        await adminChannel.publish('new-message', {
          ...savedMessage,
          conversationId,
          senderType: 'USER'
        })
        console.log('✅ Mensaje publicado en canal admin también')
        
        toast.success('Mensaje enviado')
        // Reproducir sonido de confirmación
        playSound('message')
        
        // Simular respuesta automática solo si no se ha mostrado antes
        if (!hasShownWelcomeMessage) {
          setTimeout(() => {
            const autoResponse: Message = {
              id: (Date.now() + 1).toString(),
              content: '¡Gracias por tu mensaje! Un miembro de nuestro equipo te responderá pronto.',
              senderType: 'SYSTEM',
              createdAt: new Date().toISOString(),
              sender: { name: 'Sistema' },
              conversationId
            }
            
            // Notificar respuesta automática
            channel.publish('new-message', autoResponse)
            setHasShownWelcomeMessage(true)
          }, 1000)
        }
      }
    } catch (error) {
      toast.error('Error enviando mensaje')
      console.error('Error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleOpen = async () => {
    setIsOpen(true)
    setHasUnreadMessages(false)
    await findOrCreateConversation()
  }

  const handleSend = () => {
    if (message.trim()) {
      sendMessage(message)
      setMessage('')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={handleOpen}
          className="relative bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-110"
          aria-label="Abrir chat"
        >
          💬
          {hasUnreadMessages && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold">
              !
            </span>
          )}
        </button>
      </div>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80 h-96 bg-white rounded-lg shadow-xl border border-gray-200 flex flex-col">
      {/* Header */}
      <div className="bg-blue-600 text-white p-3 rounded-t-lg flex justify-between items-center">
        <h3 className="font-semibold">Chat de Soporte</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="text-white hover:text-gray-200 transition-colors"
            title={soundEnabled ? 'Sonidos habilitados' : 'Sonidos deshabilitados'}
          >
            {soundEnabled ? '🔊' : '🔇'}
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="text-white hover:text-gray-200"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.senderType === 'USER' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs p-2 rounded-lg text-sm ${
                msg.senderType === 'USER'
                  ? 'bg-blue-500 text-white'
                  : msg.senderType === 'ADMIN'
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-200 text-gray-800'
              }`}
            >
              <div className="font-medium text-xs mb-1">
                {msg.sender?.name || 'Sistema'}
              </div>
              <div>{msg.content}</div>
              <div className="text-xs opacity-75 mt-1">
                {new Date(msg.createdAt).toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-200 text-gray-800 p-2 rounded-lg text-sm">
              Enviando...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-gray-200">
        <div className="flex space-x-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Escribe tu mensaje..."
            className="flex-1 p-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={!message.trim() || isLoading}
            className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ➤
          </button>
        </div>
      </div>
    </div>
  )
}

// Envolver con proveedor para asegurar contexto incluso si no está en RootLayout
export function ChatWidgetAblyWithProvider() {
  // Crear cliente de Ably solo en el cliente
  const ablyClient = useMemo(() => {
    if (typeof window === 'undefined') {
      return null
    }
    
    try {
      const client = new Realtime({
        key: ablyKey,
        clientId: 'chat-client',
        logLevel: 1
      })

      // Verificar conexión
      client.connection.on('connected', () => {
        console.log('✅ Ably conectado correctamente')
      })

      client.connection.on('disconnected', () => {
        console.log('❌ Ably desconectado')
      })

      client.connection.on('failed', (error) => {
        console.error('❌ Error en conexión Ably:', error)
      })

      return client
    } catch (error) {
      console.error('Error inicializando Ably:', error)
      return null
    }
  }, [])

  if (!ablyClient) {
    return null
  }

  return (
    <AblyProvider client={ablyClient}>
      <ChannelProvider channelName="chat-widget">
        <ChatWidgetAbly />
      </ChannelProvider>
    </AblyProvider>
  )
}
