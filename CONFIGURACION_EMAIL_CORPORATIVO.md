# Configuración Email Corporativo - info@garrasfelinas.com

## ✅ Configuración Actualizada

El sistema de correos ha sido configurado para usar el email corporativo oficial:
**info@garrasfelinas.com**

## 🔧 Variables de Entorno Requeridas

Agrega estas variables a tu archivo `.env.local`:

```env
# Configuración de Email Corporativo
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=info@garrasfelinas.com
EMAIL_PASSWORD=contraseña-de-aplicacion-gmail
```

## 📧 Configuración del Email Corporativo

### Si el email está en Gmail:
1. Accede a la cuenta **info@garrasfelinas.com** en Gmail
2. Ve a **Configuración de la cuenta Google** → **Seguridad**
3. Habilita la **Verificación en 2 pasos**
4. En **Contraseñas de aplicaciones**, genera una nueva para "Correo"
5. Usa esta contraseña en la variable `EMAIL_PASSWORD`

### Si el email está en otro proveedor:
Consulta con el administrador del dominio garrasfelinas.com para obtener:
- Servidor SMTP
- Puerto (usualmente 587 o 465)
- Credenciales de autenticación

## 🎯 Cambios Realizados

### 1. Remitente del correo
- **Antes**: `"Bazar Envíos Perros" <${process.env.EMAIL_USER}>`
- **Ahora**: `"Bazar Envíos Perros" <info@garrasfelinas.com>`

### 2. Email de contacto en la plantilla
- **Antes**: contacto@bazarenviosperros.com
- **Ahora**: info@garrasfelinas.com

### 3. Documentación actualizada
- Todas las guías ahora muestran info@garrasfelinas.com como ejemplo

## 🧪 Prueba de Configuración

Una vez configuradas las variables de entorno, prueba el sistema:

```bash
# Verificar configuración
curl http://localhost:3000/api/test-email

# Enviar email de prueba
curl -X POST http://localhost:3000/api/test-email \
  -H "Content-Type: application/json" \
  -d '{"email":"tu-email-personal@ejemplo.com"}'

# O usar el script
node scripts/test-email-system.js tu-email-personal@ejemplo.com
```

## 📋 Lista de Verificación

- [ ] Obtener acceso a la cuenta info@garrasfelinas.com
- [ ] Configurar contraseña de aplicación (si es Gmail)
- [ ] Agregar variables de entorno al .env.local
- [ ] Reiniciar el servidor de desarrollo
- [ ] Ejecutar prueba de configuración
- [ ] Realizar una compra de prueba para verificar el envío automático

## 🚨 Importante

- **No uses la contraseña principal** de la cuenta de email
- **Usa siempre contraseñas de aplicación** para mayor seguridad
- **Mantén las credenciales seguras** y no las subas al repositorio
- **Prueba en un entorno de desarrollo** antes de usar en producción

## 📞 Soporte

Si tienes problemas con la configuración del email corporativo:
1. Verifica que tengas acceso a info@garrasfelinas.com
2. Consulta con el administrador del dominio garrasfelinas.com
3. Revisa los logs del servidor para errores específicos
4. Usa el endpoint de prueba para diagnosticar problemas

---

**El sistema está listo para usar el email corporativo oficial** 🎉




