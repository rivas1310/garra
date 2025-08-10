# 🚨 SOLUCIÓN RÁPIDA - No encuentra la impresora

## 🔍 Diagnóstico Inmediato

### Paso 1: Verificar en la Consola del Navegador

1. **Abre la página de venta física**
2. **Presiona F12** para abrir DevTools
3. **Ve a la pestaña Console**
4. **Ejecuta estos comandos uno por uno:**

```javascript
// 1. Verificar si Web Bluetooth está disponible
console.log("Bluetooth disponible:", !!navigator.bluetooth);

// 2. Verificar si requestDevice está disponible
console.log("requestDevice disponible:", !!navigator.bluetooth?.requestDevice);

// 3. Verificar disponibilidad del adaptador
navigator.bluetooth.getAvailability().then(available => {
  console.log("Adaptador disponible:", available);
});

// 4. Probar solicitud de dispositivo (sin filtros)
navigator.bluetooth.requestDevice({
  acceptAllDevices: true,
  optionalServices: []
}).then(device => {
  console.log("Dispositivo encontrado:", device.name);
}).catch(error => {
  console.error("Error:", error.message);
});
```

### Paso 2: Interpretar los Resultados

**Si el comando 1 devuelve `false`:**
- Tu navegador no soporta Web Bluetooth
- Usa Chrome, Edge u Opera

**Si el comando 2 devuelve `false`:**
- Web Bluetooth no está completamente implementado
- Actualiza tu navegador

**Si el comando 3 devuelve `false`:**
- Bluetooth no está habilitado en tu sistema
- Habilita Bluetooth en Windows/Mac/Linux

**Si el comando 4 falla con "User cancelled":**
- Cancelaste la selección de dispositivo
- Vuelve a intentar y selecciona tu impresora

**Si el comando 4 falla con "No devices found":**
- No hay dispositivos Bluetooth cercanos
- Verifica que la impresora esté encendida y en modo emparejamiento

**Si el comando 4 falla con "Permission denied":**
- No tienes permisos de Bluetooth
- Ve a `chrome://settings/content/bluetoothDevices` y otorga permisos

## 🛠️ Soluciones Específicas

### Para Windows:
1. **Habilitar Bluetooth:**
   - Configuración → Dispositivos → Bluetooth y otros dispositivos
   - Activar Bluetooth

2. **Verificar impresora:**
   - Configuración → Dispositivos → Agregar dispositivo
   - Buscar tu impresora y emparejarla

### Para Mac:
1. **Habilitar Bluetooth:**
   - Preferencias del Sistema → Bluetooth
   - Activar Bluetooth

2. **Verificar impresora:**
   - Preferencias del Sistema → Bluetooth
   - Buscar tu impresora y emparejarla

### Para Linux:
1. **Habilitar Bluetooth:**
   ```bash
   sudo systemctl start bluetooth
   sudo systemctl enable bluetooth
   ```

2. **Verificar impresora:**
   - Configuración → Bluetooth
   - Buscar tu impresora y emparejarla

## 🔧 Configuración de la Impresora

### Pasos Básicos:
1. **Encender la impresora**
2. **Poner en modo de emparejamiento:**
   - Busca el botón de emparejamiento
   - Mantén presionado hasta que parpadee
   - O sigue las instrucciones del manual

3. **Verificar distancia:**
   - Acerca la impresora al dispositivo (menos de 1 metro)
   - Evita obstáculos entre dispositivos

### Para Impresoras Específicas:

**Epson TM-T88VI:**
- Mantener botón de configuración hasta parpadear
- LED debe parpadear azul

**Star TSP100:**
- Botón de configuración en la parte trasera
- LED debe parpadear

**Bixolon SRP-350III:**
- Configuración por software
- Verificar manual del usuario

## 🌐 Verificaciones del Navegador

### 1. Verificar Permisos:
```
chrome://settings/content/bluetoothDevices
```
- Busca tu sitio web
- Asegúrate de que esté permitido

### 2. Verificar Información de Bluetooth:
```
chrome://bluetooth-internals/
```
- Ve a la pestaña "Devices"
- Verifica que aparezcan dispositivos

### 3. Verificar Configuración de Seguridad:
- Asegúrate de estar en HTTPS
- No uses modo incógnito
- Desactiva extensiones que puedan interferir

## 🚨 Errores Comunes y Soluciones

| Error | Causa | Solución |
|-------|-------|----------|
| `Bluetooth adapter not available` | Bluetooth deshabilitado | Habilitar Bluetooth en el sistema |
| `User cancelled` | Cancelaste selección | Volver a intentar y seleccionar |
| `No devices found` | No hay dispositivos | Verificar impresora encendida y en modo emparejamiento |
| `Permission denied` | Sin permisos | Otorgar permisos en configuración del navegador |
| `GATT operation failed` | Impresora no compatible | Verificar compatibilidad con Web Bluetooth |

## 📞 Si Nada Funciona

### Alternativas:
1. **Impresión por USB:**
   - Conectar impresora por USB
   - Usar driver del sistema

2. **Servidor de impresión:**
   - Configurar servidor de impresión local
   - Usar API de impresión del sistema

3. **Aplicación móvil:**
   - Usar aplicación nativa del fabricante
   - Conectar por Bluetooth desde la app

### Información para Soporte:
- Modelo de impresora
- Navegador y versión
- Sistema operativo
- Resultados de los comandos de consola
- Logs de error específicos

---

**💡 Consejo:** Si tu impresora es Bluetooth Classic (no BLE), puede que no sea compatible con Web Bluetooth. En ese caso, considera usar una impresora térmica USB como alternativa más confiable.

