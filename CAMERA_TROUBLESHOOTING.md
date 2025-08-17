# 🔍 Guía de Solución de Problemas - Escáner de Códigos de Barras

## Problemas Comunes y Soluciones

### ❌ Error: "NotReadableError: Could not start video source"

**Causas posibles:**
1. La cámara está siendo utilizada por otra aplicación
2. Permisos de cámara denegados
3. Configuración de cámara incompatible
4. Problemas de drivers o hardware

**Soluciones:**

#### 1. Cerrar otras aplicaciones que usen la cámara
- Cierra aplicaciones como Zoom, Teams, Skype, etc.
- Cierra pestañas del navegador que usen la cámara
- Reinicia el navegador

#### 2. Verificar permisos del navegador
- Haz clic en el ícono de candado en la barra de direcciones
- Asegúrate de que la cámara esté permitida
- Si está bloqueada, cambia a "Permitir"

#### 3. Probar en modo incógnito
- Abre una ventana de incógnito
- Accede a la aplicación
- Intenta usar el escáner

#### 4. Verificar configuración de cámara
- Ve a Configuración > Privacidad y seguridad > Cámara
- Asegúrate de que el navegador tenga permisos
- Desactiva y reactiva los permisos

### ❌ Error: "NotAllowedError"

**Solución:**
- El navegador bloqueó el acceso a la cámara
- Haz clic en "Permitir" cuando aparezca el diálogo
- Si no aparece, reinicia el navegador

### ❌ Error: "NotFoundError"

**Solución:**
- Verifica que tu dispositivo tenga cámara
- Conecta una cámara externa si es necesario
- Reinicia el dispositivo

### ❌ La cámara no se activa

**Soluciones:**
1. **Usar entrada manual**: El modal incluye un campo para ingresar códigos manualmente
2. **Cambiar cámara**: Si tienes múltiples cámaras, selecciona otra
3. **Reiniciar escáner**: Usa el botón "Reintentar"

## 🛠️ Funcionalidades Alternativas

### Entrada Manual de Códigos
Si la cámara no funciona, puedes:
1. Hacer clic en el campo de texto
2. Ingresar el código de barras manualmente
3. Presionar Enter o hacer clic en el botón de teclado

### Búsqueda por Nombre
Como alternativa al escáner:
1. Usa el campo "Buscar Productos"
2. Escribe el nombre del producto
3. Selecciona el producto de la lista

## 🔧 Configuración Recomendada

### Navegadores Compatibles
- ✅ Chrome (recomendado)
- ✅ Firefox
- ✅ Safari
- ✅ Edge

### Configuración de Cámara
- Resolución: 720p o superior
- FPS: 10-30
- Formato: MJPEG o H.264

### Requisitos del Sistema
- Cámara web funcional
- Conexión a internet estable
- Navegador actualizado

## 📱 Uso en Dispositivos Móviles

### Android
- Usa Chrome o Firefox
- Asegúrate de que la app tenga permisos de cámara
- Mantén el dispositivo estable al escanear

### iOS
- Usa Safari
- Verifica permisos en Configuración > Safari > Cámara
- Mantén el dispositivo estable al escanear

## 🆘 Si Nada Funciona

1. **Contacta al administrador** del sistema
2. **Usa la entrada manual** como alternativa temporal
3. **Verifica la conectividad** de internet
4. **Revisa los logs** del navegador (F12 > Console)

## 📞 Soporte Técnico

Si continúas teniendo problemas:
- Revisa esta guía completa
- Prueba en otro navegador
- Verifica que tu cámara funcione en otras aplicaciones
- Contacta al equipo de soporte con detalles específicos del error 