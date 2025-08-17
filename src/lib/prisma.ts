import { PrismaClient } from '@prisma/client';
import { log } from '@/lib/secureLogger'

// Función para crear un cliente Prisma con reintentos
function createPrismaClient() {
  const client = new PrismaClient({
    log: ['query', 'error', 'warn'],
  });

  // Agregar manejo de errores y reconexión
  client.$use(async (params, next) => {
    const MAX_RETRIES = 3;
    let retries = 0;
    let result;

    while (retries < MAX_RETRIES) {
      try {
        result = await next(params);
        return result;
      } catch (error: unknown) {
        // Si es un error de conexión, intentar reconectar
        if (
          typeof error === 'object' && 
          error !== null && 
          'code' in error && 
          ((error as { code: string }).code === 'P1001' || // Error de conexión a la base de datos
           (error as { code: string }).code === 'P1002') || // Error de timeout
          (typeof error === 'object' && 
           error !== null && 
           'message' in error && 
           typeof (error as { message?: string }).message === 'string' && 
           (error as { message: string }).message.includes('Can\'t reach database server'))
        ) {
          log.error(`Error de conexión a la base de datos. Reintento ${retries + 1}/${MAX_RETRIES}`);
          retries++;
          // Esperar antes de reintentar (backoff exponencial)
          await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retries)));
        } else {
          // Si no es un error de conexión, lanzar el error
          throw error;
        }
      }
    }

    // Si llegamos aquí, se agotaron los reintentos
    throw new Error(`No se pudo conectar a la base de datos después de ${MAX_RETRIES} intentos`);
  });

  return client;
}

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || createPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;