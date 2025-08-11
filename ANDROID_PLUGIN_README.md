# 🖨️ Integración Plugin Android - Impresión Térmica

## 📋 Descripción

Esta integración permite imprimir tickets térmicos usando el plugin de Android de Parzibyte, que se comunica a través del puerto 8000. Es una alternativa más confiable y sencilla que la integración Web Bluetooth.

## 🚀 Características

- ✅ **Comunicación HTTP simple** - Solo requiere POST a localhost:8000
- ✅ **Method Chaining** - API fluida y fácil de usar
- ✅ **21 operaciones disponibles** - Formato, imágenes, códigos, etc.
- ✅ **Sin permisos especiales** - No requiere permisos del navegador
- ✅ **Compatibilidad amplia** - Funciona con cualquier impresora térmica Bluetooth
- ✅ **Sin límites de datos** - No hay restricción de 512 bytes como Web Bluetooth

## 🔧 Instalación y Configuración

### 1. Instalar el Plugin de Android

1. Descarga el plugin de impresoras térmicas Bluetooth para Android
2. Instálalo en tu dispositivo Android
3. Asegúrate de que esté ejecutándose en el puerto 8000

### 2. Configurar la Impresora

1. **Encender la impresora** y ponerla en modo de emparejamiento
2. **Conectar por Bluetooth** desde el dispositivo Android
3. **Obtener la dirección MAC** desde el plugin Android:
   - Abre el plugin
   - Ve a "Ver impresoras disponibles"
   - Copia la dirección MAC de tu impresora

### 3. Verificar la Conexión

Ejecuta el script de prueba:

```bash
node scripts/test-android-plugin.js
```

## 📖 Uso en la Aplicación

### 1. Acceder a la Impresión

1. Ve a la página de **Venta Física**
2. Completa una venta
3. En el modal de éxito, haz clic en **"Imprimir con Plugin Android"**

### 2. Configurar la Impresora

1. **Ingresa la dirección MAC** de tu impresora
2. **Opcional**: Ingresa el serial/licencia si tienes una
3. Haz clic en **"Probar Conexión"** para verificar

### 3. Imprimir Tickets

- **🧪 Imprimir Prueba**: Verifica la conexión básica
- **🖨️ Imprimir Ticket**: Imprime el ticket de la venta actual
- **🖨️ Imprimir con Logo**: Incluye el logo de la empresa
- **🎨 Ticket Personalizado**: Ejemplo con código QR y formato avanzado

## 🔧 API del Conector

### Clase Principal

```typescript
import { ConectorEscposAndroid } from '@/lib/android-thermal-printer';

const conector = new ConectorEscposAndroid(serial, ruta);
```

### Constantes Disponibles

```typescript
// Alineación
ConectorEscposAndroid.ALINEACION_IZQUIERDA = 0
ConectorEscposAndroid.ALINEACION_CENTRO = 1
ConectorEscposAndroid.ALINEACION_DERECHA = 2

// Tamaño de imagen
ConectorEscposAndroid.TAMAÑO_IMAGEN_NORMAL = 0
ConectorEscposAndroid.TAMAÑO_IMAGEN_DOBLE_ANCHO = 1
ConectorEscposAndroid.TAMAÑO_IMAGEN_DOBLE_ALTO = 2
ConectorEscposAndroid.TAMAÑO_IMAGEN_DOBLE_ANCHO_Y_ALTO = 3

// Recuperación QR
ConectorEscposAndroid.RECUPERACION_QR_BAJA = 0
ConectorEscposAndroid.RECUPERACION_QR_MEDIA = 1
ConectorEscposAndroid.RECUPERACION_QR_ALTA = 2
ConectorEscposAndroid.RECUPERACION_QR_MEJOR = 3
```

### Operaciones Básicas

```typescript
conector
  .Iniciar()                    // Inicializar impresora
  .EscribirTexto("Hola mundo")  // Escribir texto
  .Feed(2)                      // Avanzar 2 líneas
  .Corte(1)                     // Cortar papel
  .Pulso(48, 60, 120);          // Activar cajón
```

### Formato de Texto

```typescript
conector
  .EstablecerAlineacion(ConectorEscposAndroid.ALINEACION_CENTRO)
  .EstablecerTamañoFuente(2, 2)  // Doble ancho y alto
  .EstablecerEnfatizado(true)    // Negrita
  .EstablecerSubrayado(true)     // Subrayado
  .EstablecerFuente(1);          // Tipo de fuente
```

### Imágenes

```typescript
conector
  .DescargarImagenDeInternetEImprimir(
    "https://ejemplo.com/logo.png",
    ConectorEscposAndroid.TAMAÑO_IMAGEN_NORMAL,
    216  // Ancho máximo (múltiplo de 8)
  )
  .Iniciar()  // Importante: Iniciar después de imagen
```

### Códigos de Barras

```typescript
conector
  .ImprimirCodigoDeBarras(
    "qr",                                    // Tipo: qr, code128, etc.
    "https://bazar-enviosperros.com",        // Datos
    ConectorEscposAndroid.TAMAÑO_IMAGEN_NORMAL,
    160,                                     // Ancho
    160                                      // Alto
  )
```

### Imprimir

```typescript
const resultado = await conector.imprimirEn("FF:FF:FF:FF:FF:FF");
if (resultado === true) {
  console.log("Impresión exitosa");
} else {
  console.log("Error:", resultado);
}
```

## 🎯 Ejemplos de Uso

### Ticket Básico

```typescript
const conector = ConectorEscposAndroid.generarTicketBasico(
  "BAZAR - ENVÍOS PERROS",
  [
    { nombre: "Producto 1", precio: 10.50, cantidad: 2 },
    { nombre: "Producto 2", precio: 5.00, cantidad: 1 }
  ],
  26.00,  // Subtotal
  26.00,  // Total
  new Date().toLocaleString(),
  ""      // Serial
);

await conector.imprimirEn("FF:FF:FF:FF:FF:FF");
```

### Ticket con Logo

```typescript
const conector = ConectorEscposAndroid.generarTicketConLogo(
  "BAZAR - ENVÍOS PERROS",
  items,
  subtotal,
  total,
  "https://ejemplo.com/logo.png",
  new Date().toLocaleString(),
  ""
);

await conector.imprimirEn("FF:FF:FF:FF:FF:FF");
```

### Ticket Personalizado

```typescript
const conector = new ConectorEscposAndroid();

conector
  .Iniciar()
  .EstablecerAlineacion(ConectorEscposAndroid.ALINEACION_CENTRO)
  .DescargarImagenDeInternetEImprimir(
    "https://ejemplo.com/logo.png",
    ConectorEscposAndroid.TAMAÑO_IMAGEN_NORMAL,
    216
  )
  .Iniciar()
  .Feed(1)
  .EscribirTexto("BAZAR - ENVÍOS PERROS\n")
  .EscribirTexto("Venta física\n")
  .EscribirTexto(`Fecha: ${new Date().toLocaleString()}\n`)
  .Feed(1)
  .EstablecerAlineacion(ConectorEscposAndroid.ALINEACION_IZQUIERDA)
  .EscribirTexto("____________________\n")
  .EscribirTexto("Producto          CANT  PRECIO\n")
  .EscribirTexto("____________________\n")
  .EscribirTexto("Producto 1          2    $21.00\n")
  .EscribirTexto("Producto 2          1     $5.00\n")
  .EscribirTexto("____________________\n")
  .EstablecerAlineacion(ConectorEscposAndroid.ALINEACION_DERECHA)
  .EscribirTexto("TOTAL: $26.00\n")
  .Feed(2)
  .EstablecerAlineacion(ConectorEscposAndroid.ALINEACION_CENTRO)
  .EstablecerEnfatizado(true)
  .EscribirTexto("¡Gracias por su compra!\n")
  .Feed(1)
  .ImprimirCodigoDeBarras(
    "qr",
    "https://bazar-enviosperros.com",
    ConectorEscposAndroid.TAMAÑO_IMAGEN_NORMAL,
    160,
    160
  )
  .Iniciar()
  .Feed(2)
  .Corte(1)
  .Pulso(48, 60, 120);

await conector.imprimirEn("FF:FF:FF:FF:FF:FF");
```

## 🔍 Solución de Problemas

### Error: "No se puede conectar al plugin"

1. **Verifica que el plugin esté ejecutándose** en el puerto 8000
2. **Revisa la dirección IP** si no estás en localhost
3. **Verifica la conexión de red** entre el dispositivo y Android

### Error: "Error de conexión"

1. **Verifica la dirección MAC** de la impresora
2. **Asegúrate de que la impresora esté encendida**
3. **Verifica la conexión Bluetooth** en el dispositivo Android

### Error: "GATT operation failed"

1. **Verifica la compatibilidad** de la impresora
2. **Revisa los logs** del plugin Android
3. **Intenta reiniciar** la impresora y el plugin

### La impresora no aparece

1. **Verifica que esté en modo de emparejamiento**
2. **Asegúrate de que esté a menos de 1 metro**
3. **Revisa que no haya obstáculos** entre dispositivos

## 📱 Ventajas sobre Web Bluetooth

| Aspecto | Web Bluetooth | Plugin Android |
|---------|---------------|----------------|
| **Configuración** | Compleja, requiere permisos | Simple, solo HTTP |
| **Compatibilidad** | Limitada a navegadores modernos | Universal |
| **Límites** | 512 bytes por operación | Sin límites |
| **Funciones** | Básicas | 21 operaciones disponibles |
| **Confiabilidad** | Variable según navegador | Alta |
| **Debugging** | Difícil | Fácil con logs del plugin |

## 🛠️ Archivos Principales

- `src/lib/android-thermal-printer.ts` - Cliente principal del plugin
- `src/components/AndroidThermalPrinter.tsx` - Componente React
- `scripts/test-android-plugin.js` - Script de prueba
- `impresion.txt` - Documentación original del plugin

## 📞 Soporte

Si tienes problemas:

1. **Ejecuta el script de prueba** para diagnosticar
2. **Revisa los logs** del plugin Android
3. **Verifica la documentación** original en `impresion.txt`
4. **Consulta la tabla de errores** en esta documentación

---

**💡 Consejo**: Esta integración es mucho más confiable que Web Bluetooth. Si tienes problemas con la detección de impresoras, esta es la solución recomendada.
