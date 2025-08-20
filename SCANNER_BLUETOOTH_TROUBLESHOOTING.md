# 🔧 Guía de Solución de Problemas - Escáner Bluetooth

## 🚨 Problema: "El escáner no se detecta por Bluetooth"

### 📋 Diagnóstico Rápido

**Síntomas:**
- El escáner no aparece en la lista de dispositivos
- Error "No se encontraron escáneres"
- Bluetooth habilitado pero sin detección

### 🔍 Soluciones Paso a Paso

#### **Método 1: Búsqueda Manual BLE (Recomendado)**

1. **Abrir el componente de escáner externo**
   - Ve a la sección donde necesitas escanear códigos
   - Haz clic en el botón de "Escáner Externo"

2. **Usar búsqueda manual**
   - Haz clic en el botón **"Buscar BLE"** (azul)
   - Se abrirá el selector de dispositivos del navegador
   - Busca tu escáner en la lista

3. **Seleccionar el escáner**
   - Selecciona tu dispositivo de la lista
   - Haz clic en "Emparejar" o "Conectar"

#### **Método 2: Búsqueda Manual HID**

1. **Para escáneres USB o que actúan como teclado**
   - Haz clic en el botón **"Buscar HID"** (verde)
   - Selecciona tu escáner de la lista

#### **Método 3: Verificación del Sistema**

**En Windows:**
```
1. Configuración → Dispositivos → Bluetooth y otros dispositivos
2. Activar Bluetooth
3. Hacer clic en "Agregar Bluetooth u otro dispositivo"
4. Seleccionar "Bluetooth"
5. Buscar y emparejar tu escáner
```

**En Chrome:**
```
1. Ir a chrome://settings/content/bluetoothDevices
2. Verificar que el sitio tenga permisos
3. Ir a chrome://bluetooth-internals/
4. Verificar que aparezcan dispositivos
```

### 🛠️ Configuración del Escáner

#### **Poner el Escáner en Modo de Emparejamiento:**

**Escáneres Comunes:**
- **Honeywell:** Mantener botón de encendido + botón de escaneo
- **Zebra:** Escanear código QR de configuración Bluetooth
- **Datalogic:** Botón de configuración hasta que parpadee
- **Symbol/Motorola:** Combinación de botones según manual

**Indicadores de Modo de Emparejamiento:**
- LED azul parpadeando
- Sonido de confirmación
- Pantalla mostrando "Pairing" o "BT"

### 🔧 Solución de Errores Específicos

#### **Error: "User cancelled the requestDevice() chooser"**
**Causa:** Usuario canceló la selección
**Solución:** Volver a intentar y seleccionar el dispositivo

#### **Error: "Bluetooth adapter not available"**
**Causa:** Bluetooth deshabilitado
**Solución:** 
1. Habilitar Bluetooth en Windows
2. Reiniciar el navegador
3. Verificar permisos del sitio

#### **Error: "No devices found"**
**Causa:** Escáner no en modo de emparejamiento
**Solución:**
1. Poner escáner en modo de emparejamiento
2. Acercar el escáner (menos de 1 metro)
3. Verificar que esté encendido

#### **Error: "GATT operation failed"**
**Causa:** Escáner no compatible con Web Bluetooth
**Solución:**
1. Verificar si es Bluetooth Classic (no compatible)
2. Usar modo HID si está disponible
3. Considerar escáner USB como alternativa

### 📱 Tipos de Escáneres y Compatibilidad

#### **Bluetooth Low Energy (BLE) - ✅ Compatible**
- Escáneres modernos (2015+)
- Menor consumo de batería
- Compatible con Web Bluetooth
- **Usar botón "Buscar BLE"**

#### **Bluetooth Classic - ❌ No Compatible**
- Escáneres antiguos (pre-2015)
- No compatible con Web Bluetooth
- **Alternativa:** Usar como HID si soporta

#### **USB/HID - ✅ Compatible**
- Escáneres USB
- Escáneres que actúan como teclado
- **Usar botón "Buscar HID"**

### 🚀 Pasos de Verificación Rápida

**Checklist de 5 minutos:**

- [ ] ✅ Bluetooth habilitado en Windows
- [ ] ✅ Navegador Chrome/Edge (no Firefox/Safari)
- [ ] ✅ Sitio web en HTTPS
- [ ] ✅ Permisos de Bluetooth otorgados
- [ ] ✅ Escáner encendido
- [ ] ✅ Escáner en modo de emparejamiento
- [ ] ✅ Distancia menor a 1 metro
- [ ] ✅ Probado botón "Buscar BLE"
- [ ] ✅ Probado botón "Buscar HID"

### 🔄 Proceso de Emparejamiento Completo

```
1. 🔌 Encender el escáner
2. 📱 Poner en modo de emparejamiento
3. 💻 Abrir la aplicación web
4. 🔍 Hacer clic en "Escáner Externo"
5. 🔵 Hacer clic en "Buscar BLE"
6. 📋 Seleccionar escáner de la lista
7. ✅ Confirmar emparejamiento
8. 🎯 Probar escaneando un código
```

### 📞 Si Nada Funciona

**Información a recopilar:**
- Modelo exacto del escáner
- Versión del navegador
- Sistema operativo
- Mensajes de error específicos
- Resultado de chrome://bluetooth-internals/

**Alternativas:**
1. **Escáner USB:** Más confiable, plug-and-play
2. **App móvil:** Usar smartphone como escáner
3. **Entrada manual:** Escribir códigos manualmente

### 💡 Consejos Adicionales

**Para mejorar la detección:**
- Mantener el escáner cerca del PC
- Evitar interferencias (otros dispositivos Bluetooth)
- Reiniciar el escáner si no responde
- Limpiar la lista de dispositivos emparejados

**Para mejor rendimiento:**
- Usar Chrome en lugar de otros navegadores
- Cerrar otras aplicaciones que usen Bluetooth
- Mantener el escáner cargado

---

**🎯 Resultado esperado:** Después de seguir esta guía, tu escáner debería aparecer en la lista y conectarse correctamente, permitiendo escanear códigos de barras que se enviarán automáticamente al sistema.