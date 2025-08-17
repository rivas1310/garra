// Sistema de logging seguro que filtra datos sensibles
export class SecureLogger {
  private static instance: SecureLogger
  private isProduction: boolean
  private sensitivePatterns: RegExp[]
  private sensitiveFields: string[]

  private constructor() {
    this.isProduction = process.env.NODE_ENV === 'production'
    this.sensitivePatterns = [
      /api[_-]?key/gi,
      /password/gi,
      /token/gi,
      /secret/gi,
      /auth/gi,
      /credential/gi,
      /private/gi
    ]
    this.sensitiveFields = [
      'email',
      'phone',
      'address',
      'card',
      'cvv',
      'ssn',
      'dni',
      'rfc',
      'curp',
      'tracking',
      'guia',
      'reference'
    ]
  }

  public static getInstance(): SecureLogger {
    if (!SecureLogger.instance) {
      SecureLogger.instance = new SecureLogger()
    }
    return SecureLogger.instance
  }

  /**
   * Filtra datos sensibles antes de loggear
   */
  private sanitizeData(data: any): any {
    if (typeof data === 'string') {
      return this.sanitizeString(data)
    }
    
    if (typeof data === 'object' && data !== null) {
      if (Array.isArray(data)) {
        return data.map(item => this.sanitizeData(item))
      }
      
      const sanitized: any = {}
      for (const [key, value] of Object.entries(data)) {
        const sanitizedKey = this.sanitizeString(key)
        const sanitizedValue = this.sanitizeData(value)
        sanitized[sanitizedKey] = sanitizedValue
      }
      return sanitized
    }
    
    return data
  }

  /**
   * Filtra strings que contengan datos sensibles
   */
  private sanitizeString(str: string): string {
    let sanitized = str
    
    // Filtrar patrones sensibles
    this.sensitivePatterns.forEach(pattern => {
      sanitized = sanitized.replace(pattern, '[REDACTED]')
    })
    
    // Filtrar campos sensibles conocidos
    this.sensitiveFields.forEach(field => {
      const fieldPattern = new RegExp(`"${field}":\\s*"[^"]*"`, 'gi')
      sanitized = sanitized.replace(fieldPattern, `"${field}": "[REDACTED]"`)
    })
    
    // Filtrar emails
    sanitized = sanitized.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[EMAIL_REDACTED]')
    
    // Filtrar números de teléfono
    sanitized = sanitized.replace(/\b\d{10,}\b/g, '[PHONE_REDACTED]')
    
    // Filtrar códigos postales
    sanitized = sanitized.replace(/\b\d{5}\b/g, '[ZIP_REDACTED]')
    
    return sanitized
  }

  /**
   * Log seguro que filtra datos sensibles
   */
  public secureLog(level: 'info' | 'warn' | 'error' | 'debug', message: string, data?: any): void {
    // En producción, solo loggear errores críticos
    if (this.isProduction && level !== 'error') {
      return
    }

    const sanitizedData = data ? this.sanitizeData(data) : undefined
    const timestamp = new Date().toISOString()
    const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`
    
    // Usar console.log directamente para evitar bucles infinitos
    if (sanitizedData) {
      console.log(logMessage, sanitizedData)
    } else {
      console.log(logMessage)
    }
  }

  /**
   * Log de información general (filtrado)
   */
  public info(message: string, data?: any): void {
    this.secureLog('info', message, data)
  }

  /**
   * Log de advertencias (filtrado)
   */
  public warn(message: string, data?: any): void {
    this.secureLog('warn', message, data)
  }

  /**
   * Log de errores (filtrado)
   */
  public error(message: string, data?: any): void {
    this.secureLog('error', message, data)
  }

  /**
   * Log de debug (filtrado, solo en desarrollo)
   */
  public debug(message: string, data?: any): void {
    if (!this.isProduction) {
      this.secureLog('debug', message, data)
    }
  }

  /**
   * Log de datos sensibles (siempre filtrado)
   */
  public sensitive(message: string, data?: any): void {
    const sanitizedMessage = this.sanitizeString(message)
    this.secureLog('info', `[SENSITIVE_DATA] ${sanitizedMessage}`, data)
  }
}

// Instancia global
export const secureLogger = SecureLogger.getInstance()

// Función helper para uso rápido
export const log = {
  info: (message: string, data?: any) => secureLogger.info(message, data),
  warn: (message: string, data?: any) => secureLogger.warn(message, data),
  error: (message: string, data?: any) => secureLogger.error(message, data),
  debug: (message: string, data?: any) => secureLogger.debug(message, data),
  sensitive: (message: string, data?: any) => secureLogger.sensitive(message, data)
}
