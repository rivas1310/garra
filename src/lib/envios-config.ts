// Configuración centralizada para servicios de envío

/**
 * Configuración para EnvíoClick
 */
export const envioClickConfig = {
  baseUrl: process.env.ENVIOCLICK_API_URL || 'https://api.envioclickpro.com',
  apiKey: process.env.ENVIOCLICK_API_KEY || '',
  userAgent: 'BazarFashion/1.0'
};

/**
 * Configuración para EnvíosPerros
 */
export const enviosPerrosConfig = {
  // URL base según el entorno (producción o pruebas)
  baseUrl: process.env.ENVIOSPERROS_API_URL || 'https://staging-app.enviosperros.com/api/v2',
  
  // API Key proporcionada por EnvíosPerros
  apiKey: process.env.ENVIOSPERROS_API_KEY  ||  '4ExUSFztbANYkmlOkAFNH3JbUSHSYo5VS8Mcg6r1', // API Key de pruebas por defecto
  
  // User Agent para identificar la aplicación
  userAgent: 'BazarFashion/1.0'
};

/**
 * Función para determinar qué servicio de envío utilizar
 * Puede implementarse lógica para elegir el servicio más conveniente según el caso
 */
export function getShippingService(origin: string, destination: string, weight: number): 'envioclick' | 'enviosperros' {
  // Implementar lógica para determinar qué servicio usar
  // Por ejemplo, basado en códigos postales, peso, dimensiones, etc.
  
  // Por ahora, una implementación simple basada en el peso
  if (weight > 30) {
    return 'envioclick'; // EnvíoClick para paquetes más pesados
  } else {
    return 'enviosperros'; // EnvíosPerros para paquetes más ligeros
  }
}

/**
 * Función para obtener la configuración del servicio seleccionado
 */
export function getShippingConfig(service: 'envioclick' | 'enviosperros') {
  return service === 'envioclick' ? envioClickConfig : enviosPerrosConfig;
}

/**
 * Función para obtener la configuración de EnvíoClick
 */
export function getEnvioClickConfig() {
  return envioClickConfig;
}

/**
 * Función para obtener la configuración de EnvíosPerros
 */
export function getEnviosPerrosConfig() {
  return enviosPerrosConfig;
}