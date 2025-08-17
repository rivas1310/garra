# 🔧 Guía de Solución de Problemas - Impresión Bluetooth

## 🚨 Problema: "No encuentra la impresora"

### 📋 Diagnóstico Rápido

1. **Verificar compatibilidad del navegador**
   - ✅ Chrome 56+ (recomendado)
   - ✅ Edge 79+
   - ✅ Opera 43+
   - ❌ Firefox (no soporta Web Bluetooth)
   - ❌ Safari (soporte limitado)

2. **Verificar requisitos del sistema**
   - ✅ Conexión HTTPS
   - ✅ Bluetooth habilitado
   - ✅ Permisos otorgados
   - ✅ Impresora en modo de emparejamiento

### 🔍 Pasos de Solución

#### Paso 1: Verificar Configuración del Navegador

1. **Abrir Chrome DevTools**
   ```
   F12 → Console
   ```

2. **Verificar permisos de Bluetooth**
   ```
   chrome://settings/content/bluetoothDevices
   ```

3. **Verificar información de Bluetooth**
   ```
   chrome://bluetooth-internals/
   ```

#### Paso 2: Configurar la Impresora

1. **Reiniciar la impresora**
   - Apaga la impresora
   - Espera 10 segundos
   - Enciende la impresora

2. **Poner en modo de emparejamiento**
   - Busca el botón de emparejamiento
   - Mantén presionado hasta que parpadee
   - O sigue las instrucciones del manual

3. **Verificar distancia**
   - Acerca la impresora al dispositivo (menos de 1 metro)
   - Evita obstáculos entre dispositivos

#### Paso 3: Usar el Modo de Diagnóstico

1. **Abrir la página de venta física**
   ```
   /admin/venta-fisica
   ```

2. **Hacer clic en "Avanzado"**
   - Se mostrarán opciones adicionales

3. **Hacer clic en "Escanear Dispositivos"**
   - Esto escaneará todos los dispositivos Bluetooth
   - Revisa la consola para información detallada

4. **Hacer clic en "Debug"**
   - Muestra información de depuración en tiempo real

#### Paso 4: Interpretar los Logs

**Logs exitosos:**
```
✅ Dispositivo encontrado con Filtros específicos: TM-T88VI
✅ Servidor GATT conectado
✅ Servicio prioritario seleccionado: 0000ffe0-0000-1000-8000-00805f9b34fb
✅ Característica de escritura seleccionada: 0000ffe1-0000-1000-8000-00805f9b34fb
```

**Logs de error comunes:**
```
❌ Estrategia 1 falló: User cancelled the requestDevice() chooser.
→ Usuario canceló la selección de dispositivo

❌ Estrategia 2 falló: Bluetooth adapter not available.
→ Bluetooth no está habilitado

❌ Error de conexión: GATT operation failed for unknown reason.
→ Impresora no compatible con Web Bluetooth
```

### 🛠️ Soluciones Específicas

#### Para Impresoras Térmicas Comunes

**Epson TM-T88VI:**
- Servicio: `0000ffe0-0000-1000-8000-00805f9b34fb`
- Característica: `0000ffe1-0000-1000-8000-00805f9b34fb`
- Modo de emparejamiento: Mantener botón hasta parpadear

**Star TSP100:**
- Servicio: `0000ffe0-0000-1000-8000-00805f9b34fb`
- Característica: `0000ffe1-0000-1000-8000-00805f9b34fb`
- Modo de emparejamiento: Botón de configuración

**Bixolon SRP-350III:**
- Servicio: `000018f0-0000-1000-8000-00805f9b34fb`
- Característica: `00002af1-0000-1000-8000-00805f9b34fb`
- Modo de emparejamiento: Configuración por software

#### Para Impresoras Bluetooth Classic

Si tu impresora es Bluetooth Classic (no BLE):

1. **Verificar compatibilidad**
   - Algunas impresoras Bluetooth Classic no son compatibles
   - Busca especificaciones de Web Bluetooth

2. **Alternativas**
   - Usar aplicación nativa
   - Conectar por USB
   - Usar servidor de impresión

### 🔧 Comandos de Diagnóstico

```bash
# Ejecutar diagnóstico de conectividad
node scripts/test-bluetooth-connection.js

# Ejecutar diagnóstico de detección
node scripts/test-printer-detection.js

# Verificar chunking de datos
node scripts/test-chunking.js
```

### 📱 Prueba en el Navegador

1. **Abrir archivo de prueba**
   ```
   scripts/test-bluetooth-browser.html
   ```

2. **Seguir instrucciones en pantalla**
   - Conectar dispositivo
   - Probar impresión
   - Revisar logs

### 🚨 Errores Comunes y Soluciones

| Error | Causa | Solución |
|-------|-------|----------|
| `User cancelled` | Usuario canceló | Volver a intentar |
| `Bluetooth adapter not available` | Bluetooth deshabilitado | Habilitar Bluetooth |
| `GATT operation failed` | Impresora no compatible | Verificar compatibilidad |
| `NetworkError` | Conexión perdida | Reconectar |
| `InvalidStateError` | Estado incorrecto | Reiniciar conexión |

### 📞 Soporte Adicional

Si el problema persiste:

1. **Recopilar información**
   - Modelo de impresora
   - Navegador y versión
   - Logs de la consola
   - Sistema operativo

2. **Verificar compatibilidad**
   - Buscar especificaciones de Web Bluetooth
   - Consultar documentación del fabricante

3. **Alternativas**
   - Impresión por USB
   - Servidor de impresión local
   - Aplicación móvil nativa

### ✅ Checklist de Verificación

- [ ] Navegador compatible (Chrome/Edge/Opera)
- [ ] Conexión HTTPS
- [ ] Bluetooth habilitado
- [ ] Permisos otorgados
- [ ] Impresora en modo de emparejamiento
- [ ] Distancia menor a 1 metro
- [ ] Sin obstáculos entre dispositivos
- [ ] Impresora compatible con Web Bluetooth
- [ ] Logs de debug revisados
- [ ] Pruebas de diagnóstico ejecutadas

---

**💡 Consejo:** Si nada funciona, considera usar una impresora térmica USB como alternativa más confiable.

