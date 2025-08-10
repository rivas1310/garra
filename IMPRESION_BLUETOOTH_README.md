# 🖨️ Impresión Bluetooth Directa - Garras Felinas

## 📋 **Descripción**

Sistema de impresión Bluetooth directa para impresoras térmicas, que permite imprimir tickets desde el navegador web sin necesidad de aplicaciones externas.

## 🎯 **Características**

- ✅ **Conexión directa** via Web Bluetooth API
- ✅ **Sin aplicaciones externas** requeridas
- ✅ **Compatibilidad** con múltiples marcas de impresoras
- ✅ **Interfaz intuitiva** para configuración
- ✅ **Editor de tickets** integrado
- ✅ **Modo de prueba** incluido

## 📱 **Requisitos del Sistema**

### **Navegador Compatible:**
- ✅ Chrome 56+ (Android/Desktop)
- ✅ Edge 79+ (Android/Desktop)
- ✅ Opera 43+ (Android/Desktop)
- ❌ Firefox (No soporta Web Bluetooth)
- ❌ Safari (Soporte limitado)

### **Dispositivo:**
- 📱 **Android:** 6.0+ con Bluetooth 4.0+
- 💻 **Desktop:** Windows 10+, macOS 10.12+, Linux
- 🔗 **Conexión:** HTTPS requerido (no funciona en HTTP)

### **Impresora:**
- 🖨️ **Tipo:** Térmica Bluetooth
- 🔗 **Protocolo:** Bluetooth 4.0+ (BLE)
- 📋 **Marcas compatibles:** ZJ, GP, SP, POS, Thermal, etc.

## 🚀 **Instalación y Configuración**

### **1. Acceder a la Página de Impresora**
```
http://localhost:3000/admin/impresora
```

### **2. Conectar Impresora**
1. **Hacer clic** en "Conectar Impresora"
2. **Seleccionar** tu impresora de la lista
3. **Confirmar** la conexión
4. **Verificar** el estado de conexión

### **3. Configurar Ticket**
1. **Usar** el editor de tickets
2. **Generar** ticket de prueba
3. **Personalizar** el contenido
4. **Imprimir** el ticket

## 🔧 **Uso del Sistema**

### **Componente BluetoothPrinter**
```tsx
import BluetoothPrinter from '@/components/BluetoothPrinter'

<BluetoothPrinter 
  ticketData="Contenido del ticket"
  onPrint={(data) => console.log('Impreso:', data)}
/>
```

### **Hook useBluetoothPrinter**
```tsx
import { useBluetoothPrinter } from '@/hooks/useBluetoothPrinter'

const {
  isConnected,
  isPrinting,
  error,
  deviceName,
  connect,
  disconnect,
  print,
  clearError
} = useBluetoothPrinter()
```

## 📄 **Formato de Tickets**

### **Estructura Recomendada:**
```
================================
        GARRAS FELINAS
================================

Fecha: DD/MM/YYYY
Hora: HH:MM:SS
Ticket: #XXXXXXXXX

================================
PRODUCTO                    PRECIO
================================
[Productos...]

================================
SUBTOTAL:                   $X,XXX.XX
IVA (16%):                  $XXX.XX
TOTAL:                      $X,XXX.XX

================================
Método de Pago: [Método]
Últimos 4 dígitos: ****XXXX

================================
¡Gracias por tu compra!
🐾 Garras Felinas 🐾
================================
```

## 🔍 **Solución de Problemas**

### **Error: "Web Bluetooth no está soportado"**
- ✅ Verificar que usas Chrome/Edge/Opera
- ✅ Asegurar conexión HTTPS
- ✅ Verificar que Bluetooth esté habilitado

### **Error: "No se pudo conectar al servidor GATT"**
- ✅ Verificar que la impresora esté encendida
- ✅ Asegurar que esté en modo descubrible
- ✅ Verificar que no esté conectada a otro dispositivo

### **Error: "No se encontró un servicio compatible"**
- ✅ Verificar que la impresora sea compatible
- ✅ Intentar con diferentes filtros de nombre
- ✅ Consultar documentación de la impresora

### **Error: "No se encontró característica de escritura"**
- ✅ Verificar permisos de Bluetooth
- ✅ Reiniciar la impresora
- ✅ Intentar reconectar

## 📱 **Integración en Venta Física**

### **En la página de venta física:**
```tsx
// Agregar botón de impresión
const handlePrintTicket = async (saleData) => {
  const ticketContent = generateTicketContent(saleData)
  await print(ticketContent)
}

// Generar contenido del ticket
const generateTicketContent = (sale) => {
  return `
================================
        GARRAS FELINAS
================================

Fecha: ${new Date().toLocaleDateString()}
Ticket: #${sale.id}

================================
PRODUCTO                    PRECIO
================================
${sale.items.map(item => 
  `${item.name.padEnd(25)} $${item.price.toFixed(2)}`
).join('\n')}

================================
TOTAL:                      $${sale.total.toFixed(2)}

================================
¡Gracias por tu compra!
🐾 Garras Felinas 🐾
================================
  `
}
```

## 🔒 **Seguridad**

### **Consideraciones:**
- 🔐 **HTTPS requerido** para Web Bluetooth
- 🛡️ **Permisos explícitos** del usuario
- 🔒 **Conexión temporal** (se desconecta al cerrar)
- 🚫 **No almacena** credenciales de impresora

### **Buenas Prácticas:**
- ✅ **Verificar conexión** antes de imprimir
- ✅ **Manejar errores** apropiadamente
- ✅ **Limpiar conexiones** al terminar
- ✅ **Informar al usuario** sobre el estado

## 📊 **Monitoreo y Logs**

### **Eventos Registrados:**
- 🔗 **Conexión exitosa**
- ❌ **Error de conexión**
- 🖨️ **Impresión completada**
- ⚠️ **Errores de impresión**
- 🔌 **Desconexión**

### **Debugging:**
```javascript
// Habilitar logs detallados
console.log('Estado de conexión:', isConnected)
console.log('Dispositivo:', deviceName)
console.log('Error:', error)
```

## 🆘 **Soporte**

### **Marcas de Impresoras Testeadas:**
- ✅ **ZJ-5802** (Zjiang)
- ✅ **GP-58MM** (Gainscha)
- ✅ **SP-POS88V** (Star)
- ✅ **POS-58** (Pos58)
- ✅ **Thermal-80** (Genérica)

### **Contacto:**
- 📧 **Email:** soporte@garrasfelinas.com
- 📱 **WhatsApp:** +52 33 5193 5392
- 🌐 **Web:** https://www.garrasfelinas.com

---

**🐾 Garras Felinas - Impresión Bluetooth Directa 🐾**

