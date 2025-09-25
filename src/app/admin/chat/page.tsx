'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useChannel } from 'ably/react'
import ably from '@/lib/ably'
import { 
  MessageCircle, 
  Users, 
  Clock, 
  AlertCircle, 
  Send,
  Search
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useNotificationSound } from '@/hooks/useNotificationSound'

interface Message {
  id: string
  content: string
  senderType: 'USER' | 'ADMIN' | 'SYSTEM'
  createdAt: string
  sender?: {
    name?: string
    email?: string
  }
  conversationId?: string // Para mensajes de Ably
}

interface Conversation {
  id: string
  status: string
  priority: string
  subject?: string
  createdAt: string
  updatedAt: string
  user?: {
    name?: string
    email?: string
  }
  guestName?: string
  guestEmail?: string
  messages: Message[]
}

export default function AdminChatPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null)
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(true)

  // Hook para sonidos de notificación
  const { playSound } = useNotificationSound({ volume: 0.7, enabled: soundEnabled })

  // Configuración de Ably
  const { channel } = useChannel('chat-admin')
  
  useEffect(() => {
    if (channel) {
      console.log('📡 Admin chat conectado a Ably')
      
      const handleMessage = (message: any) => {
        console.log('📨 Mensaje recibido en admin:', message)
        
        if (message.name === 'new-message') {
          const newMessage = message.data as Message
          
          // Actualizar conversaciones
          setConversations(prev => prev.map(conv => {
            if (conv.id === newMessage.conversationId) {
              // Evitar duplicar mensajes
              const messageExists = conv.messages.some(msg => msg.id === newMessage.id)
              if (messageExists) {
                console.log('⚠️ Mensaje duplicado ignorado en admin:', newMessage.id)
                return conv
              }
              
              console.log('✅ Nuevo mensaje agregado en admin:', newMessage.content)
              const updatedConv = {
                ...conv,
                messages: [...conv.messages, newMessage],
                updatedAt: newMessage.createdAt
              }
              
              // Si es la conversación activa, actualizarla también
              if (activeConversation?.id === conv.id) {
                setActiveConversation(updatedConv)
              }
              
              return updatedConv
            }
            return conv
          }))

                 // Mostrar notificación si es mensaje de usuario
                 if (newMessage.senderType === 'USER') {
                   toast.success(`Nuevo mensaje de ${newMessage.sender?.name || 'Usuario'}`)
                   // Reproducir sonido de alerta para admin
                   playSound('alert')
                 }
        }
      }

      channel.subscribe(handleMessage)
      
      return () => {
        console.log('📡 Admin chat desconectado de Ably')
        channel.unsubscribe(handleMessage)
      }
    }
  }, [channel, activeConversation])

  useEffect(() => {
    if (channel) {
      setIsConnected(true)
    }
  }, [channel])

  // Verificar que sea admin
  useEffect(() => {
    if (status === 'loading') return
    
    if (!session || (session.user?.role !== 'ADMIN' && session.user?.role !== 'VENDEDOR')) {
      router.push('/admin/login')
      return
    }
  }, [session, status, router])

  // Cargar conversaciones
  const loadConversations = async () => {
    try {
      const response = await fetch('/api/chat/conversations')
      if (response.ok) {
        const data = await response.json()
        setConversations(data)
        setIsConnected(true)
      }
    } catch (error) {
      console.error('Error cargando conversaciones:', error)
      setIsConnected(false)
    }
  }

  useEffect(() => {
    if (session?.user?.role === 'ADMIN' || session?.user?.role === 'VENDEDOR') {
      loadConversations()
    }
  }, [session])

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !activeConversation || loading) return

    setLoading(true)
    const messageContent = newMessage.trim()
    setNewMessage('')

    try {
      // Enviar mensaje via API
      const response = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: activeConversation.id,
          content: messageContent
        })
      })

      if (response.ok) {
        const savedMessage = await response.json()
        
        // Agregar el mensaje inmediatamente al estado local
        setConversations(prev => prev.map(conv => {
          if (conv.id === activeConversation.id) {
            // Verificar si ya existe para evitar duplicados
            const messageExists = conv.messages.some(msg => msg.id === savedMessage.id)
            if (!messageExists) {
              console.log('✅ Mensaje de admin agregado inmediatamente al estado local')
              const updatedConv = {
                ...conv,
                messages: [...conv.messages, {
                  ...savedMessage,
                  senderType: 'ADMIN' as const
                }],
                updatedAt: savedMessage.createdAt
              }
              
              // Actualizar también la conversación activa
              setActiveConversation(updatedConv)
              return updatedConv
            }
          }
          return conv
        }))
        
        // Publicar en Ably para notificar al widget
        if (channel) {
          console.log('📤 Admin publicando mensaje en Ably:', savedMessage)
          await channel.publish('new-message', {
            ...savedMessage,
            conversationId: activeConversation.id,
            senderType: 'ADMIN'
          })
          console.log('✅ Mensaje de admin publicado en Ably correctamente')
          
          // También publicar en el canal del widget
          const widgetChannel = ably.channels.get('chat-widget')
          await widgetChannel.publish('new-message', {
            ...savedMessage,
            conversationId: activeConversation.id,
            senderType: 'ADMIN'
          })
          console.log('✅ Mensaje de admin publicado en canal widget también')
        }
        
        toast.success('Mensaje enviado')
        // Reproducir sonido de confirmación
        playSound('message')
      } else {
        toast.error('Error enviando mensaje')
        setNewMessage(messageContent) // Restaurar el mensaje
      }
    } catch (error) {
      toast.error('Error enviando mensaje')
      setNewMessage(messageContent) // Restaurar el mensaje
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES')
  }

  const getSenderName = (conversation: Conversation) => {
    if (conversation.user?.name) return conversation.user.name
    if (conversation.guestName) return conversation.guestName
    return 'Usuario Anónimo'
  }

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!session || (session.user?.role !== 'ADMIN' && session.user?.role !== 'VENDEDOR')) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <MessageCircle className="text-primary-600" />
                Panel de Chat
              </h1>
              <p className="text-gray-600 mt-2">
                Gestiona las conversaciones de soporte
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className={`
                flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium
                ${isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
              `}>
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                {isConnected ? 'Conectado' : 'Desconectado'}
              </div>

              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  soundEnabled 
                    ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                title={soundEnabled ? 'Sonidos habilitados' : 'Sonidos deshabilitados'}
              >
                {soundEnabled ? '🔊' : '🔇'}
                {soundEnabled ? 'Sonido ON' : 'Sonido OFF'}
              </button>

              <button
                onClick={loadConversations}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
              >
                Actualizar
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Conversaciones</p>
                <p className="text-2xl font-bold text-gray-900">{conversations.length}</p>
              </div>
              <MessageCircle className="h-8 w-8 text-primary-600" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Activas</p>
                <p className="text-2xl font-bold text-green-600">
                  {conversations.filter(c => c.status === 'ACTIVE').length}
                </p>
              </div>
              <Users className="h-8 w-8 text-green-600" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pendientes</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {conversations.filter(c => c.status === 'PENDING').length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Mensajes</p>
                <p className="text-2xl font-bold text-blue-600">
                  {conversations.reduce((total, conv) => total + conv.messages.length, 0)}
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Conversations List */}
          <div className="lg:col-span-1 bg-white rounded-lg shadow-sm border">
            <div className="p-4 border-b">
              <h3 className="font-semibold text-gray-900 mb-4">Conversaciones</h3>
            </div>
            
            <div className="max-h-96 overflow-y-auto">
              {conversations.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No hay conversaciones</p>
                </div>
              ) : (
                conversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    onClick={() => setActiveConversation(conversation)}
                    className={`
                      p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors
                      ${activeConversation?.id === conversation.id ? 'bg-blue-50 border-blue-200' : ''}
                    `}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {getSenderName(conversation)}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {conversation.user?.email || conversation.guestEmail}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`
                        px-2 py-1 text-xs font-medium rounded-full
                        ${conversation.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 
                          conversation.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'}
                      `}>
                        {conversation.status}
                      </span>
                      <span className="text-xs text-gray-400">
                        {conversation.messages.length} mensajes
                      </span>
                    </div>
                    
                    <p className="text-xs text-gray-500">
                      {formatDate(conversation.updatedAt)}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border flex flex-col">
            {activeConversation ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {getSenderName(activeConversation)}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {activeConversation.user?.email || activeConversation.guestEmail}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 p-4 overflow-y-auto max-h-96 space-y-4">
                  {activeConversation.messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.senderType === 'USER' ? 'justify-start' : 'justify-end'}`}
                    >
                      <div className={`
                        max-w-xs px-4 py-2 rounded-lg shadow-sm
                        ${message.senderType === 'USER' 
                          ? 'bg-gray-100 text-gray-900' 
                          : 'bg-blue-600 text-white'
                        }
                      `}>
                        <div className="text-xs font-medium opacity-75 mb-1">
                          {message.sender?.name || (message.senderType === 'ADMIN' ? 'Admin' : 'Sistema')}
                        </div>
                        <div className="text-sm">
                          {message.content}
                        </div>
                        <div className="text-xs opacity-50 mt-1">
                          {formatDate(message.createdAt)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Input */}
                <div className="p-4 border-t">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Escribe tu respuesta..."
                      disabled={loading}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={loading || !newMessage.trim()}
                      className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-md flex items-center gap-2"
                    >
                      <Send size={16} />
                      {loading ? 'Enviando...' : 'Enviar'}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <MessageCircle className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">Selecciona una conversación</p>
                  <p className="text-sm">Elige una conversación de la lista para comenzar a chatear</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}