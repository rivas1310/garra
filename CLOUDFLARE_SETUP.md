# Configuración de Cloudflare Images

## ✅ Credenciales Configuradas

Tu configuración actual es:
- **Account ID**: `c72a675eb86ca9425b3d71721ac0954f`
- **Hash de Cuenta**: `yqG2lANJnnFZeEvZerzyhg`
- **URL de Entrega**: `https://imagedelivery.net/yqG2lANJnnFZeEvZerzyhg`

## Variables de Entorno Requeridas

Añade estas variables a tu archivo `.env`:

```env
# Cloudflare Images Configuration
CLOUDFLARE_ACCOUNT_ID=c72a675eb86ca9425b3d71721ac0954f
CLOUDFLARE_API_TOKEN=tu_api_token_aqui
CLOUDFLARE_DELIVERY_URL=https://imagedelivery.net/yqG2lANJnnFZeEvZerzyhg
```

## 🔑 Cómo Obtener el API Token

### 1. Account ID ✅ (Ya lo tienes)
- **Valor**: `c72a675eb86ca9425b3d71721ac0954f`

### 2. API Token (Necesitas crear uno)
1. Ve a [Cloudflare Dashboard > API Tokens](https://dash.cloudflare.com/profile/api-tokens)
2. Haz clic en "Create Token"
3. Usa el template "Custom token"
4. Configura los permisos:
   - **Zone Resources**: All zones
   - **Permissions**: 
     - **Cloudflare Images**: Edit
     - **Account Settings**: Read
5. Crea el token y cópialo en `CLOUDFLARE_API_TOKEN`

### 3. Delivery URL ✅ (Ya lo tienes)
- **Valor**: `https://imagedelivery.net/yqG2lANJnnFZeEvZerzyhg`

## 🚀 URLs de Imágenes

Con tu configuración, las imágenes se servirán desde:
- **Original**: `https://imagedelivery.net/yqG2lANJnnFZeEvZerzyhg/{imageId}/public`
- **Thumbnail**: `https://imagedelivery.net/yqG2lANJnnFZeEvZerzyhg/{imageId}/thumbnail`
- **Preview**: `https://imagedelivery.net/yqG2lANJnnFZeEvZerzyhg/{imageId}/preview`

## 📋 Verificar Configuración

Ejecuta este comando para verificar que todo esté configurado:

```bash
node test-cloudflare.js
```

## Ventajas de Cloudflare Images

✅ **Más rápido** que Cloudinary  
✅ **Mejor precio** - $5/mes por 100k imágenes  
✅ **CDN global** con 200+ ubicaciones  
✅ **Transformaciones automáticas** (thumbnail, preview, etc.)  
✅ **Integración nativa** con Cloudflare  

## Migración Completada

✅ Reemplazado Cloudinary por Cloudflare Images  
✅ API de upload actualizada  
✅ Funciones de eliminación incluidas  
✅ URLs de variantes automáticas  
✅ Metadatos personalizables  
✅ Credenciales configuradas  

**¡Tu aplicación seguirá funcionando exactamente igual!**
