# Configuración de Cloudflare R2

## ✅ Ventajas de R2 sobre Cloudflare Images

- **Más simple** - solo almacenamiento, sin procesamiento complejo
- **Más económico** - solo pagas por almacenamiento usado
- **Funciona igual** que Cloudinary
- **Sin limitaciones** de plan gratuito
- **CDN global** de Cloudflare incluido

## 🔧 Variables de Entorno Requeridas

Añade estas variables a tu archivo `.env`:

```env
# Cloudflare R2 Configuration
CLOUDFLARE_ACCOUNT_ID=c72a675eb86ca9425b3d71721ac0954f
R2_ACCESS_KEY_ID=tu_access_key_id_aqui
R2_SECRET_ACCESS_KEY=tu_secret_access_key_aqui
R2_BUCKET_NAME=tu_bucket_name_aqui
R2_ENDPOINT=https://c72a675eb86ca9425b3d71721ac0954f.r2.cloudflarestorage.com
```

## 🚀 Cómo Configurar R2

### 1. Ve a [Cloudflare Dashboard](https://dash.cloudflare.com/)

### 2. Navega a "R2 Object Storage" en el menú lateral

### 3. Haz clic en "Create bucket"
- **Nombre del bucket**: `tu-bucket-name` (ej: `mi-ecommerce-images`)
- **Location**: Elige la más cercana a ti

### 4. Ve a "Manage R2 API tokens"
- Haz clic en "Create API token"
- Selecciona "Custom token"
- **Permissions**: 
  - **Object Read**: Allow
  - **Object Write**: Allow
  - **Object Delete**: Allow
- **Zone Resources**: All zones
- **Account Resources**: Include - All accounts

### 5. Crea el token y copia:
- **Access Key ID**
- **Secret Access Key**

### 6. Añade las credenciales a tu `.env`

## 📊 URLs de Imágenes

Con tu configuración, las imágenes se servirán desde:
```
https://c72a675eb86ca9425b3d71721ac0954f.r2.cloudflarestorage.com/tu-bucket-name/productos/nombre-archivo.jpg
```

## 🔍 Verificar Configuración

Una vez configurado, prueba subir una imagen en tu aplicación.

## 💰 Costos

- **Almacenamiento**: $0.015/GB/mes
- **Sin costos de salida** (egress)
- **Sin costos por requests**
- **Mucho más económico** que S3

## ✅ Migración Completada

- ✅ Reemplazado Cloudflare Images por R2
- ✅ API de upload actualizada
- ✅ Funciones de eliminación incluidas
- ✅ URLs públicas automáticas
- ✅ Sin dependencias externas

**¡Tu aplicación seguirá funcionando exactamente igual!**
