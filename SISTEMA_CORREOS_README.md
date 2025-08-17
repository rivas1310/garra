# Sistema de Correos de Confirmación de Pedidos 📧

## Descripción

Se ha implementado un sistema completo de correos electrónicos para enviar confirmaciones de compra con plantillas HTML profesionales y estructuradas. El sistema se integra automáticamente con el proceso de checkout existente.

## ✨ Características Implementadas

### 🎨 Plantilla de Email Profesional
- **Diseño responsive** que se adapta a dispositivos móviles
- **Branding consistente** con gradientes y colores del sitio
- **Estructura clara** con secciones bien definidas
- **Información completa** del pedido y cliente

### 📋 Información Incluida en el Correo
- ✅ Número de pedido único
- ✅ Datos del cliente
- ✅ Fecha y hora de la compra
- ✅ Lista detallada de productos con variantes (talla, color)
- ✅ Precios individuales y totales
- ✅ Resumen de costos (subtotal, descuentos, envío, impuestos)
- ✅ Información de cupones aplicados
- ✅ Dirección de envío completa
- ✅ Instrucciones y tiempo de entrega estimado

### 🔧 Integración Automática
- Se envía automáticamente al confirmar un pedido
- No interfiere con el proceso de compra (no falla si el email falla)
- Logs detallados para monitoreo
- Compatible con múltiples proveedores de email

## 🚀 Archivos Creados/Modificados

### Nuevos Archivos
1. **`src/lib/email.ts`** - Lógica principal del sistema de correos
2. **`src/app/api/test-email/route.ts`** - Endpoint para pruebas
3. **`scripts/test-email-system.js`** - Script de prueba
4. **`EMAIL_SETUP.md`** - Guía de configuración
5. **`SISTEMA_CORREOS_README.md`** - Esta documentación

### Archivos Modificados
1. **`src/app/api/pedidos/route.ts`** - Integración del envío de correos

## ⚙️ Configuración

### 1. Variables de Entorno
Agrega estas variables a tu archivo `.env.local`:

```env
# Configuración de Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=info@garrasfelinas.com
EMAIL_PASSWORD=tu-contraseña-de-aplicacion
```

### 2. Configuración con Gmail (Recomendado)
1. Habilita la verificación en 2 pasos en tu cuenta Gmail
2. Ve a [Configuración de Google](https://myaccount.google.com/security)
3. En "Verificación en 2 pasos" → "Contraseñas de aplicaciones"
4. Genera una contraseña para "Correo"
5. Usa esta contraseña en `EMAIL_PASSWORD`

### 3. Otros Proveedores Soportados
- **Outlook**: `smtp-mail.outlook.com:587`
- **Yahoo**: `smtp.mail.yahoo.com:587`
- **SendGrid**: `smtp.sendgrid.net:587`

## 🧪 Pruebas

### Verificar Configuración
```bash
# GET request para verificar configuración
curl http://localhost:3000/api/test-email
```

### Enviar Email de Prueba
```bash
# POST request para enviar email de prueba
curl -X POST http://localhost:3000/api/test-email \
  -H "Content-Type: application/json" \
  -d '{"email":"tu-email@ejemplo.com"}'
```

### Script de Prueba Completo
```bash
node scripts/test-email-system.js tu-email@ejemplo.com
```

## 🔄 Flujo de Funcionamiento

1. **Usuario completa la compra** → Stripe procesa el pago
2. **Página de éxito** → Llama a `/api/pedidos` para crear el pedido
3. **API de pedidos** → Crea el pedido en la base de datos
4. **Sistema de email** → Envía automáticamente la confirmación
5. **Cliente recibe** → Correo profesional con todos los detalles

## 📊 Monitoreo y Logs

El sistema incluye logs detallados:
- ✅ `Correo de confirmación enviado exitosamente`
- ⚠️ `No se pudo enviar el correo de confirmación`
- ❌ `Error al enviar correo de confirmación: [detalles]`

## 🛠️ Personalización

### Modificar la Plantilla
Edita la función `createOrderConfirmationTemplate` en `src/lib/email.ts`:
- Cambiar colores y estilos CSS
- Agregar/quitar secciones
- Modificar textos y mensajes

### Agregar Nuevos Tipos de Email
```typescript
// Ejemplo: Email de envío
export const sendShippingNotificationEmail = async (orderData: ShippingData) => {
  // Implementación similar
}
```

## 🔒 Seguridad

- Las credenciales de email se almacenan en variables de entorno
- Uso de contraseñas de aplicación (no contraseñas principales)
- Validación de datos antes del envío
- Manejo de errores sin exponer información sensible

## 🚨 Solución de Problemas

### Email no se envía
1. Verifica las variables de entorno
2. Confirma que uses contraseña de aplicación (Gmail)
3. Revisa los logs del servidor
4. Usa el endpoint de prueba: `GET /api/test-email`

### Email llega a spam
1. Configura SPF/DKIM en tu dominio
2. Usa un servicio profesional como SendGrid
3. Evita palabras spam en el asunto

### Errores de autenticación
1. Verifica credenciales
2. Habilita "aplicaciones menos seguras" si es necesario
3. Usa OAuth2 para mayor seguridad (avanzado)

## 🎯 Próximas Mejoras Sugeridas

1. **Emails adicionales**:
   - Notificación de envío con tracking
   - Recordatorio de carrito abandonado
   - Confirmación de entrega

2. **Personalización avanzada**:
   - Templates por categoría de producto
   - Emails en múltiples idiomas
   - Personalización por cliente

3. **Analytics**:
   - Tracking de apertura de emails
   - Estadísticas de entrega
   - A/B testing de templates

## 📞 Soporte

Si tienes problemas con la implementación:
1. Revisa los logs del servidor
2. Consulta `EMAIL_SETUP.md` para configuración
3. Usa `scripts/test-email-system.js` para diagnóstico
4. Verifica las variables de entorno

---

**¡El sistema está listo para usar!** 🎉

Una vez configuradas las variables de entorno, los correos se enviarán automáticamente con cada compra confirmada.
