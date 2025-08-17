# Métodos de Autenticación para SkyDropX

Este documento describe los diferentes métodos de autenticación disponibles para la API de SkyDropX y cómo utilizarlos.

## 1. Autenticación con Bearer Token (OAuth2)

Utiliza el token OAuth2 para una autenticación moderna y segura.

### Requisitos
- Variables de entorno: `SKYDROPX_CLIENT_ID` y `SKYDROPX_CLIENT_SECRET`

### Ejemplo de uso

```javascript
// Solicitud a nuestra API interna
const response = await fetch('/api/skydropx', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    orderId: '123456',
    // Especificar método de autenticación OAuth2
    authMethod: 'oauth2',
    // Resto de parámetros...
  })
});
```

## 2. Autenticación HMAC-SHA512 (Recomendada)

Utiliza firma HMAC-SHA512 para una autenticación segura basada en el contenido de la solicitud.

### Requisitos
- Variable de entorno: `SKYDROPX_API_SECRET`

### Cómo funciona
1. Se crea la cadena de firma a partir del cuerpo de la solicitud (raw_request_body)
2. Se calcula HMAC-SHA512 utilizando la clave secreta
3. Se envía la firma en el encabezado Authorization

### Ejemplo de uso

```javascript
// Solicitud a nuestra API interna
const response = await fetch('/api/skydropx', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    orderId: '123456',
    // Especificar método de autenticación HMAC
    authMethod: 'hmac',
    // Resto de parámetros...
  })
});
```

## 3. Autenticación con Token API Key (Método tradicional)

Utiliza el token estático proporcionado para una autenticación sencilla.

### Requisitos
- Variable de entorno: `SKYDROPX_API_KEY`

### Ejemplo de uso

```javascript
// Solicitud a nuestra API interna
const response = await fetch('/api/skydropx', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    orderId: '123456',
    // Especificar método de autenticación Token
    authMethod: 'token',
    // Resto de parámetros...
  })
});
```

## Modo Automático (Predeterminado)

Si no se especifica un método de autenticación, el sistema intentará automáticamente los diferentes métodos en este orden:

1. OAuth2 (si están configuradas las credenciales)
2. Token token=
3. Bearer Token
4. API Key + Secret
5. Basic Auth
6. X-API-Key
7. HMAC-SHA512

### Ejemplo de uso

```javascript
// Solicitud a nuestra API interna sin especificar método
const response = await fetch('/api/skydropx', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    orderId: '123456',
    // No se especifica authMethod, se usará 'auto'
    // Resto de parámetros...
  })
});
```

## Seguridad

Recomendaciones de seguridad:

1. Para autenticación con Bearer Token (OAuth2):
   - Trata el token como credenciales sensibles
   - Los tokens expiran automáticamente según la configuración de SkyDropX
   - Valida todas las solicitudes entrantes antes de procesarlas

2. Para autenticación HMAC:
   - Almacena tu clave secreta de forma segura
   - La firma cambia con cada solicitud, lo que proporciona mayor seguridad

3. Para autenticación con Token API Key:
   - Trata el token como credenciales sensibles
   - Rota los tokens periódicamente
   - Valida todas las solicitudes entrantes antes de procesarlas

## Información adicional

Por razones de privacidad, SkyDropX no comparte toda la información directamente en los webhooks. Sin embargo, los clientes pueden hacer una solicitud adicional a la API usando los enlaces proporcionados en el cuerpo de la respuesta para obtener los detalles completos del evento.