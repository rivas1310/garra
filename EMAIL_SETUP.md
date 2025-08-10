# Configuración de Email para Bazar Envíos Perros

## Variables de Entorno Requeridas

Agrega las siguientes variables a tu archivo `.env.local`:

```env
# Configuración de Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=info@garrasfelinas.com
EMAIL_PASSWORD=tu-contraseña-de-aplicacion
```

## Configuración con Gmail

1. **Habilitar verificación en 2 pasos** en tu cuenta de Gmail
2. **Generar contraseña de aplicación**:
   - Ve a [Configuración de Google](https://myaccount.google.com/security)
   - En "Verificación en 2 pasos", selecciona "Contraseñas de aplicaciones"
   - Genera una nueva contraseña para "Correo"
   - Usa esta contraseña en `EMAIL_PASSWORD`

## Otras opciones de proveedores

### Outlook/Hotmail
```env
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
EMAIL_USER=info@garrasfelinas.com
EMAIL_PASSWORD=tu-contraseña
```

### Yahoo
```env
EMAIL_HOST=smtp.mail.yahoo.com
EMAIL_PORT=587
EMAIL_USER=info@garrasfelinas.com
EMAIL_PASSWORD=tu-contraseña-de-aplicacion
```

### SendGrid
```env
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASSWORD=tu-api-key-sendgrid
```

## Prueba de Configuración

Una vez configuradas las variables de entorno, puedes probar el envío de correos usando el endpoint:

```
POST /api/test-email
```

## Características del Sistema de Email

- ✅ Plantilla HTML responsive y profesional
- ✅ Información completa del pedido
- ✅ Detalles de productos con variantes
- ✅ Resumen de costos y descuentos
- ✅ Dirección de envío completa
- ✅ Información de seguimiento
- ✅ Branding consistente con el sitio
- ✅ Compatible con dispositivos móviles

## Solución de Problemas

1. **Error de autenticación**: Verifica que uses una contraseña de aplicación, no tu contraseña normal
2. **Puerto bloqueado**: Algunos ISPs bloquean el puerto 587, prueba con 465 y `secure: true`
3. **Email no llega**: Revisa la carpeta de spam del destinatario
4. **Error de SSL**: Para desarrollo local, puedes usar `rejectUnauthorized: false` (NO para producción)
