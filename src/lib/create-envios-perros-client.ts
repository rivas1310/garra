import { EnviosPerrosClient } from './envios-perros-client';
import { getEnviosPerrosConfig } from './envios-config';

/**
 * Crea una instancia del cliente de EnviosPerros con la configuración adecuada
 */
export function createEnviosPerrosClient() {
  // Obtener configuración de variables de entorno o archivo de configuración
  const config = getEnviosPerrosConfig();
  
  // Crear y devolver el cliente
  return new EnviosPerrosClient({
    baseUrl: config.baseUrl,
    apiKey: config.apiKey,
    userAgent: config.userAgent || 'BazarFashion/1.0'
  });
}