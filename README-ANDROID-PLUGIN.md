# Plugin de Impresión Térmica para Android

Este proyecto incluye integración con el plugin de impresión térmica para Android desarrollado por Parzibyte.

## Configuración del Plugin en Android

### 1. Instalación en el Teléfono
1. Descarga e instala la aplicación del plugin desde: https://parzibyte.me/blog/2024/01/17/plugin-impresion-termica-bluetooth-android/
2. Abre la aplicación en tu teléfono Android
3. Asegúrate de que el teléfono esté conectado a la misma red WiFi que tu PC

### 2. Configuración de Red
1. En la aplicación del plugin, verifica que esté ejecutándose en el puerto 8000
2. Anota la dirección IP de tu teléfono Android (puedes verla en Configuración > WiFi > Detalles de la red)
3. Ejemplo de IP: `192.168.1.100`

### 3. Configuración de Impresoras Bluetooth
1. Empareja tu impresora térmica Bluetooth con el teléfono Android
2. En la aplicación del plugin, verifica que la impresora aparezca en la lista
3. Anota la dirección MAC de la impresora (formato: `XX:XX:XX:XX:XX:XX`)

## Uso en la Aplicación Web

### Página de Prueba
Abre `http://localhost:3000/ejemplo-android-plugin.html` para probar la funcionalidad.

### Pasos para Imprimir:
1. **Ingresa la IP del teléfono**: En el campo "IP del Teléfono Android", ingresa la IP de tu dispositivo Android (ej: `192.168.1.100`)
2. **Prueba la conexión**: Haz clic en "Probar Conexión" para verificar que la aplicación web puede comunicarse con el plugin
3. **Obtén las impresoras**: Haz clic en "Obtener Impresoras" para listar las impresoras Bluetooth disponibles
4. **Configura la impresora**: La MAC de la primera impresora se llenará automáticamente, o puedes ingresarla manualmente
5. **Imprime**: Usa cualquiera de los botones de impresión para enviar un ticket de prueba

### Integración en Código

```javascript
// Crear instancia del conector
const conector = new ConectorEscposAndroid();

// Configurar la IP del teléfono Android
conector.setPhoneIp('192.168.1.100'); // Reemplaza con la IP de tu teléfono

// Probar conexión
const conectado = await ConectorEscposAndroid.testConnection(undefined, '192.168.1.100');

// Obtener impresoras disponibles
const impresoras = await ConectorEscposAndroid.obtenerImpresoras(undefined, '192.168.1.100');

// Imprimir ticket
const resultado = await conector
    .Iniciar()
    .EscribirTexto('Hola mundo')
    .Feed(1)
    .Cortar()
    .imprimirEn('XX:XX:XX:XX:XX:XX'); // MAC de la impresora
```

## Solución de Problemas

### Error de Conexión
- Verifica que el teléfono y la PC estén en la misma red WiFi
- Confirma que la aplicación del plugin esté ejecutándose en el teléfono
- Verifica que la IP ingresada sea correcta
- Asegúrate de que no haya firewall bloqueando la conexión

### Impresora No Detectada
- Verifica que la impresora esté emparejada por Bluetooth con el teléfono
- Confirma que la impresora esté encendida y en rango
- Reinicia la aplicación del plugin si es necesario

### Error al Imprimir
- Verifica que la MAC de la impresora sea correcta
- Confirma que la impresora tenga papel y esté lista
- Asegúrate de que la impresora no esté siendo usada por otra aplicación

## Archivos del Proyecto

- `src/lib/android-thermal-printer.ts` - Cliente TypeScript para el plugin
- `public/ConectorEscposAndroid.js` - Cliente JavaScript para uso directo
- `public/ejemplo-android-plugin.html` - Página de prueba y demostración
- `src/app/api/android-printer/route.ts` - API proxy para comunicación con el plugin

## Enlaces Útiles

- [Plugin original por Parzibyte](https://parzibyte.me/blog/2024/01/17/plugin-impresion-termica-bluetooth-android/)
- [Documentación del plugin](https://parzibyte.me/blog)
- [Repositorio del plugin](https://github.com/parzibyte/plugin-impresion-termica-bluetooth-android)