# Integración con EnvíosPerros

Este documento describe la integración con la API de EnvíosPerros para el envío de paquetes en México.

## Configuración

### Credenciales

- **API Key de Producción**: Disponible en [https://app.enviosperros.com/integrations](https://app.enviosperros.com/integrations) después de registrarse
- **API Key de Pruebas**: Disponible en [https://staging-app.enviosperros.com/integrations](https://staging-app.enviosperros.com/integrations) después de registrarse

### URLs Base

- **Producción**: `https://app.enviosperros.com/api/v2/`
- **Ambiente de pruebas**: `https://staging-app.enviosperros.com/api/v2/`

## Servicios Disponibles

La integración con EnvíosPerros permite utilizar los siguientes servicios de paquetería:

### Estafeta
- **ESTAFETA_EXPRESS**: Entrega al día siguiente hábil (9:00-18:00). Hasta 60 kg.
- **ESTAFETA_ECONOMICO**: Entrega en 3-5 días hábiles (9:00-18:00). Hasta 60 kg.

### Redpack
- **EXPRESS**: Entrega en 1-3 días hábiles. Hasta 70 kg. Paquetes menores a 110 cm.
- **ECOEXPRESS**: Entrega en 3-6 días hábiles. Hasta 70 kg. Paquetes menores a 110 cm.
- **METROPOLITANO**: Mismo día - día siguiente. Solo CDMX, GDL y MTY. Máximo 1 kg.

### JT Express
- **STANDARD_JT**: Entrega en 3-7 días hábiles. Hasta 30 kg.

### Paquete Express
- **STD-T**: Servicio estándar.

## Funcionalidades Implementadas

La integración con EnvíosPerros incluye las siguientes funcionalidades:

1. **Cotización de envíos**: Obtener tarifas de envío basadas en dimensiones, peso y códigos postales.
2. **Creación de órdenes**: Generar guías de envío con información del remitente, destinatario y paquete.
3. **Generación de etiquetas**: Obtener etiquetas de envío en formato PDF.
4. **Cancelación de guías**: Cancelar envíos previamente generados.
5. **Solicitud de recolección**: Programar la recolección de paquetes.
6. **URLs de seguimiento**: Obtener enlaces para rastrear los envíos según la paquetería.

## Uso del Cliente

Se ha implementado un cliente TypeScript para facilitar la integración con la API de EnvíosPerros:

```typescript
import { EnviosPerrosClient, SHIPPING_SERVICES } from '../lib/envios-perros-client';

// Crear instancia del cliente
const client = new EnviosPerrosClient({
  baseUrl: process.env.ENVIOSPERROS_API_URL,
  apiKey: process.env.ENVIOSPERROS_API_KEY
});

// Ejemplo: Cotizar envío
const rates = await client.getShippingRates({
  depth: 20,
  width: 30,
  height: 10,
  weight: 1,
  'origin-codePostal': '45100',
  'destination-codePostal': '06500'
});

// Ejemplo: Crear orden
const order = await client.createOrder({
  sender: { /* datos del remitente */ },
  recipient: { /* datos del destinatario */ },
  parcel: { /* datos del paquete */ },
  service: { service_type: SHIPPING_SERVICES.ESTAFETA.ECONOMICO }
});
```

## Periodos de Recolección

La recolección se puede solicitar en los siguientes periodos de tiempo:

- **Periodo 0**: 11:00 - 16:00
- **Periodo 1**: 12:00 - 17:00
- **Periodo 2**: 13:00 - 18:00
- **Periodo 3**: 14:00 - 19:00

Consideraciones importantes:
- La recolección se realiza a partir del día siguiente de generar la guía
- Solo disponible de lunes a viernes
- No se puede solicitar después de 4 días de haber generado la guía
- Solo disponible para Paquete Express y Redpack

## Ejemplos

Se incluye un archivo de ejemplo `ejemplo-envios-perros.js` que muestra cómo utilizar todas las funcionalidades del cliente.

## Documentación Oficial

La documentación completa de la API de EnvíosPerros se encuentra en el archivo `ejemplo.txt` incluido en este proyecto.