# 🖨️ Integración con Bluetooth Print App

Esta integración permite imprimir tickets térmicos desde tu aplicación web usando la app **Bluetooth Print** de Android.

## 📱 App Bluetooth Print

- **Nombre:** Bluetooth Print
- **Desarrollador:** MateTech
- **Google Play:** https://play.google.com/store/apps/details?id=mate.bluetoothprint
- **URL Scheme:** `my.bluetoothprint.scheme://`

## 🚀 Configuración

### 1. Instalar la App
1. Descarga **Bluetooth Print** desde Google Play Store
2. Abre la app y concede permisos de Bluetooth
3. Ve a **Settings** → **Browser Print** → **Enable**

### 2. Conectar Impresora
1. En la app, ve a **Connect Printer**
2. Selecciona tu impresora térmica Bluetooth
3. Verifica que la conexión sea exitosa

### 3. Configurar Red
- **Para desarrollo local:** Asegúrate de que tu PC y móvil estén en la misma red WiFi
- **Para producción:** Usa tu dominio público

## 🔧 Implementación

### Endpoint JSON
El sistema genera automáticamente el JSON requerido por la app:

```
GET /api/bluetooth-print?id={SALE_ID}
```

### Formato de Respuesta
```json
[
  {
    "type": 0,
    "content": "🐱 Garras Felinas 🐱",
    "bold": 1,
    "align": 1,
    "format": 3
  },
  {
    "type": 0,
    "content": "Venta Física",
    "bold": 1,
    "align": 1,
    "format": 0
  }
  // ... más elementos
]
```

### Tipos de Contenido
- `0` = Texto
- `1` = Imagen
- `2` = Código de barras
- `3` = Código QR
- `4` = HTML
- `5` = Cortar papel

### Alineación
- `0` = Izquierda
- `1` = Centro
- `2` = Derecha

### Formato
- `0` = Normal
- `1` = Doble altura
- `2` = Doble altura + ancho
- `3` = Doble ancho
- `4` = Pequeño

## 🧪 Pruebas

### 1. Página de Prueba
Abre en tu navegador:
```
http://localhost:3000/test-bluetooth-print.html
```

### 2. Script de Prueba
Ejecuta el script de prueba:
```bash
node scripts/test-bluetooth-print.js
```

### 3. Verificar Endpoint
Accede directamente al endpoint:
```
http://localhost:3000/api/bluetooth-print?id=TEST123
```

## 📱 Uso en la Aplicación

### Botón Flotante
Después de confirmar una venta, aparecerá un botón flotante púrpura en la esquina inferior derecha:

```
🖨️ Bluetooth Print
```

### Función JavaScript
```javascript
const printWithBluetoothPrint = () => {
  const baseUrl = window.location.origin
  const responseUrl = `${baseUrl}/api/bluetooth-print?id=${saleId}`
  const bluetoothPrintUrl = `my.bluetoothprint.scheme://${responseUrl}`
  
  window.location.href = bluetoothPrintUrl
}
```

## 🔄 Flujo de Impresión

1. **Usuario confirma venta** → Se guarda en la base de datos
2. **Aparece botón "Bluetooth Print"** → En la esquina inferior derecha
3. **Usuario hace clic** → Se genera URL con scheme personalizado
4. **Navegador abre app** → Bluetooth Print se activa automáticamente
5. **App obtiene JSON** → Desde el endpoint `/api/bluetooth-print`
6. **App imprime ticket** → En la impresora térmica conectada

## 🎨 Personalización del Ticket

El ticket incluye:

### Header
- Logo con emoji 🐱
- Nombre del negocio "Garras Felinas"
- Tipo de venta "Venta Física"

### Información del Negocio
- Dirección
- Teléfono
- Email
- RFC

### Detalles de la Transacción
- Fecha y hora
- Número de ticket
- Cajero

### Productos
- Nombre del producto
- Cantidad
- SKU
- Precio unitario
- Subtotal por producto

### Totales
- Subtotal
- IVA (16%)
- Total (en negrita y doble ancho)

### Footer
- Método de pago
- Mensaje de agradecimiento
- Sitio web
- Nota de conservación

## 🛠️ Solución de Problemas

### La app no se abre
- Verifica que la app esté instalada
- Asegúrate de que "Browser Print" esté habilitado
- Revisa que el URL scheme sea correcto

### No imprime
- Verifica conexión Bluetooth
- Confirma que la impresora esté emparejada
- Revisa que la impresora esté encendida

### Error en el endpoint
- Verifica que el servidor esté corriendo
- Revisa los logs del servidor
- Confirma que el ID de venta sea válido

### JSON inválido
- Verifica que no haya caracteres especiales
- Confirma que el formato sea correcto
- Revisa que no haya errores en la base de datos

## 🔒 Seguridad

- El endpoint solo devuelve datos de ventas existentes
- Se incluyen validaciones para evitar inyección SQL
- Los datos sensibles no se exponen en el JSON

## 📊 Monitoreo

### Logs del Servidor
```javascript
console.log('🖨️ Imprimiendo con Bluetooth Print App...')
console.log('📋 Datos de la venta:', saleData)
console.log('🔗 URL de Bluetooth Print:', bluetoothPrintUrl)
```

### Verificación de Conexión
- Revisa que la app esté conectada a la impresora
- Verifica que el endpoint responda correctamente
- Confirma que el JSON sea válido

## 🎯 Ventajas

✅ **Fácil de usar** - Solo un clic para imprimir
✅ **Compatible** - Funciona con cualquier impresora térmica Bluetooth
✅ **Confiable** - Usa JSON estándar
✅ **Flexible** - Permite personalización completa
✅ **Eficiente** - No requiere configuración compleja

## 📞 Soporte

Si tienes problemas:

1. Verifica la configuración de la app
2. Revisa la conexión Bluetooth
3. Prueba con la página de test
4. Consulta los logs del servidor
5. Verifica que el endpoint funcione

---

**¡Listo para imprimir! 🎉**
