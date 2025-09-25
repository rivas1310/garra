// Configuración de Ably para Vercel
import Ably from 'ably'

const ablyKey = process.env.NEXT_PUBLIC_ABLY_API_KEY || 'WmvC8Q.fk9jIg:QTbhux1HYhgCpAqW3_3TKiIvcLBNbOEVxybCyT8k0oY'

export const ably = new Ably.Realtime({
  key: ablyKey,
  clientId: 'chat-client',
  logLevel: 1 // Para debugging (1 = info)
})

// Verificar conexión
ably.connection.on('connected', () => {
  console.log('✅ Ably conectado correctamente')
})

ably.connection.on('disconnected', () => {
  console.log('❌ Ably desconectado')
})

ably.connection.on('failed', (error) => {
  console.error('❌ Error en conexión Ably:', error)
})

export default ably