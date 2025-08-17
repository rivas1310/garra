# 📊 Sistema de Importación Masiva de Productos

## 🎯 **Descripción**
Sistema completo para importar cientos de productos de una vez usando archivos CSV e imágenes, integrado con Cloudflare R2 para almacenamiento de imágenes.

## 🚀 **Características**

### **✅ Funcionalidades principales:**
- **Upload masivo de CSV** con drag & drop
- **Subida masiva de imágenes** a Cloudflare R2
- **Mapeo automático** CSV ↔ Imágenes
- **Validación de datos** antes de importar
- **Creación masiva** en base de datos
- **Progress tracking** en tiempo real
- **Manejo de errores** detallado

### **🔄 Flujo de trabajo:**
1. **Paso 1**: Subir archivo CSV con datos de productos
2. **Paso 2**: Subir carpeta con imágenes de productos
3. **Paso 3**: Revisar y validar mapeo automático
4. **Paso 4**: Confirmar e importar productos

## 📁 **Estructura del proyecto**

```
src/app/admin/importacion-masiva/
├── page.tsx                    # Página principal
└── api/                       # Endpoints
    ├── upload-bulk/           # Subida masiva de imágenes
    └── productos-bulk/        # Creación masiva de productos
```

## 📋 **Formato del CSV**

### **Columnas requeridas:**
```csv
Nombre,Precio,Categoría,Subcategoría,Stock,Imagen
Camisa Azul,25.99,Ropa,Camisas,100,camisa-azul.jpg
```

### **Columnas opcionales:**
- `Descripción`: Descripción del producto
- `Código de Barras`: Código personalizado
- `Segunda Mano`: true/false

### **Ejemplo completo:**
```csv
Nombre,Precio,Categoría,Subcategoría,Stock,Imagen,Descripción,Código de Barras,Segunda Mano
Camisa Azul,25.99,Ropa,Camisas,100,camisa-azul.jpg,Camisa de algodón azul,CAM001,false
Pantalón Negro,45.50,Ropa,Pantalones,50,pantalon-negro.jpg,Pantalón formal negro,PAN002,false
```

## 🏷️ **Requisitos de categorías**

### **Categorías existentes:**
- El sistema **NO crea nuevas categorías** automáticamente
- Debes usar **categorías que ya existan** en tu base de datos
- Las subcategorías se crean automáticamente si no existen

### **Formato recomendado:**
```csv
# Usar categorías existentes como:
Ropa, Calzado, Accesorios, Electrónicos, Hogar, etc.

# Las subcategorías se crean automáticamente:
Ropa → Camisas, Pantalones, Vestidos, Blazers
Calzado → Deportivos, Urbanos, Formales
Accesorios → Bolsos, Relojes, Cinturones, Mochilas
```

## 🖼️ **Requisitos de imágenes**

### **Formatos soportados:**
- JPG/JPEG
- PNG
- GIF
- WebP

### **Nomenclatura:**
- **IMPORTANTE**: El nombre del archivo en el CSV debe coincidir exactamente con el nombre del archivo de imagen
- Ejemplo: Si el CSV tiene `camisa-azul.jpg`, debe existir una imagen llamada `camisa-azul.jpg`

### **Organización recomendada:**
```
📁 imagenes-productos/
  ├── camisa-azul.jpg
  ├── pantalon-negro.jpg
  ├── zapatos-deportivos.jpg
  └── ...
```

## 🔧 **Configuración**

### **Variables de entorno requeridas:**
```env
# Cloudflare R2
CLOUDFLARE_ACCOUNT_ID=tu_account_id
R2_ACCESS_KEY_ID=tu_access_key
R2_SECRET_ACCESS_KEY=tu_secret_key
R2_BUCKET_NAME=garrasfelinas
R2_ENDPOINT=https://tu_endpoint.r2.cloudflarestorage.com
```

### **Configuración de R2:**
1. **Bucket público** habilitado
2. **CORS policy** configurada
3. **URL pública de desarrollo** activada

## 📱 **Uso del sistema**

### **1. Acceder al sistema:**
- Ir a `/admin/importacion-masiva`
- Solo disponible para usuarios ADMIN

### **2. Subir CSV:**
- Arrastrar archivo CSV o hacer clic para seleccionar
- El sistema valida el formato y muestra vista previa

### **3. Subir imágenes:**
- Arrastrar carpeta con imágenes o seleccionar múltiples archivos
- Las imágenes se suben automáticamente a Cloudflare R2
- Progress bar muestra el avance

### **4. Revisar mapeo:**
- Sistema mapea automáticamente CSV ↔ Imágenes
- Muestra productos válidos y con problemas
- Permite corregir antes de continuar

### **5. Importar productos:**
- Confirmar importación
- Sistema crea productos en la base de datos
- Progress bar del proceso completo

## 🚨 **Manejo de errores**

### **Errores comunes:**
- **CSV mal formateado**: Verificar separadores y columnas
- **Imágenes faltantes**: Verificar nombres de archivo
- **Categorías inexistentes**: Se crean automáticamente
- **Errores de R2**: Verificar configuración y permisos

### **Logs de sistema:**
- Todos los errores se registran en el sistema de logging
- Revisar logs para debugging detallado

## 📊 **Reportes y monitoreo**

### **Métricas disponibles:**
- Total de productos procesados
- Productos creados exitosamente
- Productos con errores
- Tiempo de procesamiento
- Uso de almacenamiento R2

### **Logs de auditoría:**
- Usuario que realizó la importación
- Fecha y hora de la operación
- Detalles de cada producto procesado

## 🔒 **Seguridad**

### **Validaciones implementadas:**
- **Autenticación**: Solo usuarios ADMIN
- **Validación de archivos**: Tipos y tamaños permitidos
- **Sanitización de datos**: Prevención de inyección
- **Rate limiting**: Protección contra spam
- **Logging seguro**: Sin información sensible

### **Permisos requeridos:**
- **Rol**: ADMIN
- **Permisos R2**: Read/Write en bucket específico

## 🧪 **Testing**

### **Archivo de prueba:**
- `ejemplo-importacion-masiva.csv` incluido
- Crear imágenes de prueba con nombres correspondientes
- Probar flujo completo antes de producción

### **Casos de prueba:**
1. **CSV válido** + imágenes correspondientes
2. **CSV con errores** para validar manejo
3. **Imágenes faltantes** para verificar mapeo
4. **Categorías nuevas** para verificar creación automática

## 🚀 **Optimizaciones futuras**

### **Mejoras planificadas:**
- **Template CSV** descargable
- **Validación en tiempo real** de datos
- **Preview de imágenes** antes de subir
- **Importación programada** para horarios de bajo tráfico
- **Rollback** de importaciones fallidas
- **Sincronización** con proveedores externos

## 📞 **Soporte**

### **En caso de problemas:**
1. Verificar logs del sistema
2. Confirmar configuración de R2
3. Validar formato del CSV
4. Verificar nombres de archivos de imagen
5. Contactar al equipo de desarrollo

---

**🎉 ¡El sistema está listo para usar! Importa cientos de productos en minutos, no en horas.**
