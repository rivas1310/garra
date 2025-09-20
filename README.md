# Garras Felinas - Panel de Administración Desktop

Aplicación de escritorio para administrar la tienda **Garras Felinas**.

## 🚀 Características

- ✅ **Aplicación de escritorio** nativa para Windows
- ✅ **Conexión automática** a tu admin de desarrollo o producción
- ✅ **Instalador único** - no requiere Node.js en el PC de destino
- ✅ **Detección automática** de servidor local o remoto
- ✅ **Interfaz optimizada** para uso en desktop

## 📦 Instalación Rápida

### Opción 1: Ejecutar desde código fuente
```bash
# 1. Instalar dependencias
ejecutar install.bat

# 2. Ejecutar aplicación
ejecutar ejecutar.bat
```

### Opción 2: Crear instalador
```bash
# Crear instalador .exe
ejecutar build.bat
```

## 🛠️ Configuración

La aplicación intentará conectarse automáticamente a:

1. **Desarrollo**: `http://localhost:3000/admin`
2. **Producción**: `https://www.garrasfelinas.com/admin`

### Cambiar URL manualmente:
- Ve a **Archivo > Configurar URL** en el menú de la aplicación

## 📋 Requisitos

### Para desarrollo:
- Node.js 18+ 
- npm

### Para usuarios finales:
- Windows 10/11
- **No requiere** Node.js ni dependencias adicionales

## 🔧 Comandos disponibles

```bash
# Desarrollo
npm start                # Ejecutar aplicación
npm run dev             # Ejecutar con DevTools

# Construcción
npm run build:win       # Crear instalador para Windows
npm run pack           # Crear aplicación portable
```

## 📁 Estructura del proyecto

```
garras-admin-desktop/
├── main.js           # Proceso principal de Electron
├── preload.js        # Script de seguridad
├── package.json      # Configuración y dependencias
├── assets/           # Iconos y recursos
├── dist/            # Instaladores generados
└── *.bat            # Scripts de Windows
```

## 🌐 URLs soportadas

- `http://localhost:3000/admin` - Desarrollo local
- `https://www.garrasfelinas.com/admin` - Producción
- Cualquier URL personalizada via menú

## 🔒 Seguridad

- ✅ Context isolation habilitado
- ✅ Node integration deshabilitado  
- ✅ Remote module deshabilitado
- ✅ Enlaces externos se abren en navegador

## 🚨 Solución de problemas

### La aplicación no se conecta:
1. Verifica que tu servidor Next.js esté ejecutándose en `localhost:3000`
2. Usa **Archivo > Configurar URL** para cambiar la dirección
3. Presiona **F5** para recargar

### Error al crear instalador:
1. Ejecuta `npm install` primero
2. Verifica que tengas permisos de escritura
3. Revisa que no haya procesos de Electron ejecutándose

## 📞 Soporte

Para problemas técnicos, revisa los logs en:
- **Ver > Herramientas de Desarrollador** (F12)
- Consola de la aplicación

---

**Garras Felinas** - Panel de Administración Desktop v1.0.0