// Configuración de Ably para cliente (browser/Electron)
'use client'

import { Realtime } from 'ably'

const ablyKey = process.env.NEXT_PUBLIC_ABLY_API_KEY || 'WmvC8Q.fk9jIg:QTbhux1HYhgCpAqW3_3TKiIvcLBNbOEVxybCyT8k0oY'

// Función para crear el cliente de Ably
function createAblyClient(): Realtime {
  const client = new Realtime({
    key: ablyKey,
    clientId: 'chat-client',
    logLevel: 1 // Para debugging (1 = info)
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
}

// Inicializar Ably solo en el cliente
let ably: Realtime | null = null

if (typeof window !== 'undefined') {
  ably = createAblyClient()
}

export default ably