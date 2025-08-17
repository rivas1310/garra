# Métodos de Autenticación para SkyDropX

Este documento describe los diferentes métodos de autenticación disponibles para la API de SkyDropX, cómo implementarlos y recomendaciones de seguridad.

## Métodos de Autenticación Soportados

### 1. Autenticación con Bearer Token (OAuth2)

Utiliza el flujo OAuth2 con `client_credentials` para obtener un token de acceso temporal.

**Ventajas:**
- Mayor seguridad al utilizar tokens temporales
- Gestión de permisos granular mediante scopes
- Estándar moderno de autenticación

**Requisitos:**
- `CLIENT_ID` y `CLIENT_SECRET` proporcionados por SkyDropX

**Implementación:**
1. Solicitar un token a `/api/v1/oauth/token` con las credenciales
2. Utilizar el token recibido en el header `Authorization: Bearer {token}`

**Ejemplo:**
Ver archivo `ejemplo-oauth2-autenticacion.js`

### 2. Autenticación HMAC-SHA512 (Recomendada)

Utiliza firma criptográfica HMAC-SHA512 para autenticar cada solicitud individualmente.

**Ventajas:**
- Alta seguridad al firmar cada solicitud individualmente
- La firma cambia con cada solicitud, lo que dificulta ataques de repetición
- No requiere almacenar tokens temporales

**Requisitos:**
- `API_SECRET` proporcionado por SkyDropX

**Implementación:**
1. Crear la cadena de firma a partir del cuerpo de la solicitud (raw_request_body)
2. Calcular HMAC-SHA512 utilizando la clave secreta
3. Enviar la firma en el encabezado `Authorization: HMAC-SHA512 {signature}`

**Ejemplo:**
Ver archivo `ejemplo-hmac-autenticacion.js`

### 3. Autenticación con Token API Key

Utiliza el token estático proporcionado para una autenticación sencilla.

**Ventajas:**
- Fácil implementación
- Compatible con sistemas más antiguos

**Requisitos:**
- `API_KEY` proporcionado por SkyDropX

**Implementación:**
1. Incluir el token en el header `Authorization: Token token={api_key}`

**Ejemplo:**
Ver archivo `ejemplo-token-autenticacion.js`

## Modo Automático

Nuestra implementación interna soporta un modo automático que intenta diferentes métodos de autenticación en orden de preferencia:

1. OAuth2 (si están configuradas las credenciales)
2. Token token=
3. Bearer Token
4. API Key + Secret
5. Basic Auth
6. X-API-Key
7. HMAC-SHA512

Para utilizar este modo, simplemente no especifique un método de autenticación o establezca `authMethod: 'auto'` en la solicitud.

## Recomendaciones de Seguridad

### Para todos los métodos

- Utiliza siempre HTTPS para todas las comunicaciones
- Valida todas las solicitudes entrantes antes de procesarlas
- Implementa límites de tasa (rate limiting) para prevenir ataques de fuerza bruta
- Monitorea y registra todas las solicitudes de autenticación para detectar actividades sospechosas

### Para OAuth2

- Trata los tokens como credenciales sensibles
- Implementa un mecanismo para renovar tokens expirados
- Utiliza el scope más restrictivo posible para cada operación

### Para HMAC-SHA512

- Almacena tu clave secreta de forma segura, preferiblemente en un gestor de secretos
- Utiliza un timestamp en la firma para prevenir ataques de repetición
- Verifica que la firma recibida coincida con la calculada localmente

### Para Token API Key

- Rota los tokens periódicamente
- Utiliza tokens diferentes para entornos de desarrollo y producción
- Considera migrar a OAuth2 o HMAC para mayor seguridad

## Información Adicional

Por razones de privacidad, SkyDropX no comparte toda la información directamente en los webhooks. Sin embargo, los clientes pueden hacer una solicitud adicional a la API usando los enlaces proporcionados en el cuerpo de la respuesta para obtener los detalles completos del evento.

Para la documentación completa de la API:
- Envíos: [Documentación de envíos](https://docs.skydropx.com/reference/shipments)
- Órdenes: [Documentación de órdenes](https://docs.skydropx.com/reference/orders)

## Ejemplos de Implementación

Este repositorio incluye ejemplos de implementación para cada método de autenticación:

- `ejemplo-oauth2-autenticacion.js` - Ejemplo de autenticación OAuth2
- `ejemplo-hmac-autenticacion.js` - Ejemplo de autenticación HMAC-SHA512
- `ejemplo-token-autenticacion.js` - Ejemplo de autenticación con Token API Key

Para ejecutar los ejemplos, asegúrate de tener Node.js instalado y ejecuta:

```bash
npm install node-fetch
node ejemplo-oauth2-autenticacion.js
```

## Soporte

Si tienes problemas con la autenticación, verifica:

1. Que estás utilizando las credenciales correctas para el entorno (sandbox o producción)
2. Que las variables de entorno están configuradas correctamente
3. Que estás utilizando la URL correcta para el entorno

Para más información, consulta la [documentación oficial de SkyDropX](https://docs.skydropx.com).