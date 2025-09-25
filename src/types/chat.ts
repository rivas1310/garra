// Tipos para el sistema de chat en vivo
export interface ChatConversation {
  id: string
  userId?: string
  guestEmail?: string
  guestName?: string
  status: 'ACTIVE' | 'RESOLVED' | 'CLOSED' | 'PENDING'
  isRead: boolean
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT'
  subject?: string
  createdAt: Date
  updatedAt: Date
  lastMessageAt?: Date
  messages?: ChatMessage[]
  user?: {
    id: string
    name?: string
    email: string
    avatar?: string
  }
}

export interface ChatMessage {
  id: string
  conversationId: string
  senderId?: string
  senderType: 'USER' | 'ADMIN' | 'SYSTEM'
  content: string
  messageType: 'TEXT' | 'IMAGE' | 'FILE' | 'SYSTEM'
  attachmentUrl?: string
  isRead: boolean
  createdAt: Date
  updatedAt: Date
  sender?: {
    id: string
    name?: string
    email: string
    avatar?: string
    role: string
  }
}

export interface ChatUser {
  id?: string
  name?: string
  email?: string
  avatar?: string
  isOnline: boolean
  isTyping: boolean
}

// Eventos de Socket.io
export interface ServerToClientEvents {
  'message:new': (message: ChatMessage) => void
  'message:read': (messageId: string) => void
  'conversation:updated': (conversation: ChatConversation) => void
  'user:typing': (data: { conversationId: string; user: ChatUser }) => void
  'user:stop-typing': (data: { conversationId: string; userId: string }) => void
  'user:online': (userId: string) => void
  'user:offline': (userId: string) => void
  'admin:notification': (data: { type: string; message: string; conversationId: string }) => void
}

export interface ClientToServerEvents {
  'message:send': (data: {
    conversationId: string
    content: string
    messageType?: 'TEXT' | 'IMAGE' | 'FILE'
    attachmentUrl?: string
  }) => void
  'message:read': (messageId: string) => void
  'conversation:join': (conversationId: string) => void
  'conversation:leave': (conversationId: string) => void
  'user:typing': (conversationId: string) => void
  'user:stop-typing': (conversationId: string) => void
}

export interface InterServerEvents {
  ping: () => void
}

export interface SocketData {
  userId?: string
  conversationId?: string
  isAdmin: boolean
}

// Estados del chat
export interface ChatState {
  conversations: ChatConversation[]
  activeConversation?: ChatConversation
  isConnected: boolean
  isTyping: boolean
  onlineUsers: string[]
  unreadCount: number
}

// Configuración del chat
export interface ChatConfig {
  maxMessageLength: number
  allowFileUpload: boolean
  allowedFileTypes: string[]
  maxFileSize: number
  autoCloseAfterHours: number
  enableNotifications: boolean
  enableSound: boolean
}
