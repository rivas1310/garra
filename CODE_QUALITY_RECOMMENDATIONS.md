# Recomendaciones para Mejorar la Calidad y Mantenibilidad del Código

## ✅ Implementaciones Completadas

### 1. Sistema de Fallback Automático para APIs
- **✅ Completado**: Cliente robusto con fallback automático (`envios-perros-client.ts`)
- **Beneficios obtenidos**:
  - Resistencia a cambios de endpoints de API
  - Cache de endpoints exitosos para optimización
  - Logging detallado para debugging
  - Configuración automática según entorno

### 2. Gestión Mejorada de Variables de Entorno
- **✅ Completado**: Archivo `.env.example` actualizado con todas las variables necesarias
- **✅ Completado**: Configuración automática de URLs según `NODE_ENV`
- **Beneficios obtenidos**:
  - Documentación clara de variables requeridas
  - Separación automática entre producción y staging

## 🎯 Prioridad Alta (Implementar Siguiente)

### 1. Validación de Variables de Entorno con Zod

### Problema Pendiente
- Falta de validación de variables de entorno al inicio de la aplicación

### Recomendaciones
```typescript
// Crear un archivo src/lib/env.ts
const requiredEnvVars = {
  ENVIOCLICK_API_KEY: process.env.ENVIOCLICK_API_KEY,
  SMTP_USER: process.env.SMTP_USER,
  // ... otras variables
};

// Validar al inicio de la aplicación
for (const [key, value] of Object.entries(requiredEnvVars)) {
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}
```

## 2. Configuración de APIs

### Crear un archivo de configuración centralizado
```typescript
// src/lib/api-config.ts
export const API_CONFIGS = {
  envioClick: {
    baseUrl: process.env.NODE_ENV === 'production' 
      ? 'https://api.envioclickpro.com/api/v2'
      : 'https://staging-api.envioclickpro.com/api/v2',
    apiKey: process.env.ENVIOCLICK_API_KEY!,
    endpoints: {
      createShipment: '/shipments',
      getRates: '/shipping/rates',
      trackShipment: '/track',
    }
  }
};
```

## 3. Manejo de Errores Mejorado

### Implementar clases de error personalizadas
```typescript
// src/lib/errors.ts
export class APIError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public provider: string
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export class ValidationError extends Error {
  constructor(message: string, public field: string) {
    super(message);
    this.name = 'ValidationError';
  }
}
```

### Wrapper para llamadas a API
```typescript
// src/lib/api-client.ts
export async function apiRequest<T>(
  url: string,
  options: RequestInit,
  provider: string
): Promise<T> {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new APIError(
        `API request failed: ${response.statusText}`,
        response.status,
        provider
      );
    }

    return await response.json();
  } catch (error) {
    if (error instanceof APIError) throw error;
    throw new APIError(
      `Network error: ${error.message}`,
      0,
      provider
    );
  }
}
```

## 4. Validación de Datos

### Usar Zod para validación de esquemas
```bash
npm install zod
```

```typescript
// src/lib/schemas.ts
import { z } from 'zod';

export const ShippingOrderSchema = z.object({
  sender: z.object({
    name: z.string().min(1),
    email: z.string().email(),
    phone: z.string().min(10),
    address: z.string().min(1),
    // ...
  }),
  recipient: z.object({
    name: z.string().min(1),
    email: z.string().email(),
    phone: z.string().min(10),
    address: z.string().min(1),
    // ...
  }),
  parcel: z.object({
    weight: z.number().positive(),
    length: z.number().positive(),
    width: z.number().positive(),
    height: z.number().positive(),
    // ...
  })
});

export type ShippingOrder = z.infer<typeof ShippingOrderSchema>;
```

## 5. Logging y Monitoreo

### Implementar logging estructurado
```typescript
// src/lib/logger.ts
export const logger = {
  info: (message: string, meta?: object) => {
    console.log(JSON.stringify({ level: 'info', message, ...meta, timestamp: new Date().toISOString() }));
  },
  error: (message: string, error?: Error, meta?: object) => {
    console.error(JSON.stringify({ 
      level: 'error', 
      message, 
      error: error?.message, 
      stack: error?.stack,
      ...meta, 
      timestamp: new Date().toISOString() 
    }));
  },
  warn: (message: string, meta?: object) => {
    console.warn(JSON.stringify({ level: 'warn', message, ...meta, timestamp: new Date().toISOString() }));
  }
};
```

## 6. Testing

### Configurar Jest y Testing Library
```bash
npm install --save-dev jest @testing-library/react @testing-library/jest-dom jest-environment-jsdom
```

### Ejemplo de test para API
```typescript
// __tests__/api/envioclick.test.ts
import { POST } from '@/app/api/envioclick/create-order/route';
import { NextRequest } from 'next/server';

// Mock fetch
global.fetch = jest.fn();

describe('/api/envioclick/create-order', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create shipping order successfully', async () => {
    const mockResponse = { id: '123', status: 'created' };
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const request = new NextRequest('http://localhost:3000/api/envioclick/create-order', {
      method: 'POST',
      body: JSON.stringify({
        // ... test data
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual(mockResponse);
  });
});
```

## 7. Seguridad

### Rate Limiting
```typescript
// src/lib/rate-limit.ts
import { NextRequest } from 'next/server';

const rateLimitMap = new Map();

export function rateLimit(identifier: string, limit: number = 10, window: number = 60000) {
  const now = Date.now();
  const windowStart = now - window;
  
  if (!rateLimitMap.has(identifier)) {
    rateLimitMap.set(identifier, []);
  }
  
  const requests = rateLimitMap.get(identifier);
  const validRequests = requests.filter((time: number) => time > windowStart);
  
  if (validRequests.length >= limit) {
    return false;
  }
  
  validRequests.push(now);
  rateLimitMap.set(identifier, validRequests);
  return true;
}
```

### Sanitización de datos
```typescript
// src/lib/sanitize.ts
export function sanitizeString(input: string): string {
  return input.trim().replace(/[<>"'&]/g, '');
}

export function sanitizeEmail(email: string): string {
  return email.toLowerCase().trim();
}
```

## 8. Performance

### Implementar caché para respuestas de API
```typescript
// src/lib/cache.ts
const cache = new Map();

export function getCached<T>(key: string): T | null {
  const item = cache.get(key);
  if (!item) return null;
  
  if (Date.now() > item.expiry) {
    cache.delete(key);
    return null;
  }
  
  return item.data;
}

export function setCache<T>(key: string, data: T, ttl: number = 300000): void {
  cache.set(key, {
    data,
    expiry: Date.now() + ttl
  });
}
```

## 9. Documentación de API

### Usar OpenAPI/Swagger
```typescript
// src/lib/api-docs.ts
export const apiDocumentation = {
  openapi: '3.0.0',
  info: {
    title: 'Bazar API',
    version: '1.0.0',
  },
  paths: {
    '/api/envioclick/create-order': {
      post: {
        summary: 'Create shipping order',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                // ... schema definition
              }
            }
          }
        }
      }
    }
  }
};
```

## 10. Monitoreo y Alertas

### Implementar health checks
```typescript
// src/app/api/health/route.ts
export async function GET() {
  const checks = {
    database: await checkDatabase(),
    envioClick: await checkEnvioClickAPI(),
  };
  
  const allHealthy = Object.values(checks).every(check => check.status === 'healthy');
  
  return Response.json(
    { status: allHealthy ? 'healthy' : 'unhealthy', checks },
    { status: allHealthy ? 200 : 503 }
  );
}
```

## Prioridades de Implementación

1. **Alta Prioridad:**
   - Gestión de variables de entorno
   - Manejo de errores mejorado
   - Validación de datos con Zod

2. **Media Prioridad:**
   - Logging estructurado
   - Configuración centralizada de APIs
   - Testing básico

3. **Baja Prioridad:**
   - Rate limiting
   - Caché
   - Documentación OpenAPI
   - Health checks

Estas mejoras incrementarán significativamente la robustez, mantenibilidad y escalabilidad del código.