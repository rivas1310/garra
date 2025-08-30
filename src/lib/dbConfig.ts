import { PrismaClient } from '@prisma/client'

// Configuración optimizada para Prisma
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: ['error', 'warn'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
})

// Configurar middleware para logging y manejo de errores
prisma.$use(async (params, next) => {
  const start = Date.now()
  
  try {
    const result = await next(params)
    const duration = Date.now() - start
    
    // Log de consultas lentas (> 1000ms)
    if (duration > 1000) {
      console.warn(`⚠️ Consulta lenta detectada: ${params.model}.${params.action} - ${duration}ms`)
    }
    
    return result
  } catch (error) {
    const duration = Date.now() - start
    console.error(`❌ Error en consulta: ${params.model}.${params.action} - ${duration}ms`, error)
    throw error
  }
})

// Manejar desconexión limpia
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma
