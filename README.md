# Bazar Fashion - Ecommerce de Ropa

Un ecommerce moderno y vistoso para venta de ropa construido con Next.js, TypeScript, Tailwind CSS y Prisma.

## 🚀 Características

- **Diseño Moderno**: Interfaz atractiva y responsive con Tailwind CSS
- **Carrito de Compras**: Gestión completa del carrito con Zustand
- **Base de Datos**: PostgreSQL con Prisma ORM
- **Autenticación**: Sistema de usuarios con NextAuth.js
- **Pagos**: Integración con Stripe
- **Productos**: Gestión completa de productos, categorías y variantes
- **Reseñas**: Sistema de calificaciones y comentarios
- **Favoritos**: Lista de productos favoritos
- **Newsletter**: Suscripción a newsletter
- **Responsive**: Diseño adaptativo para móviles y desktop

## 🛠️ Tecnologías Utilizadas

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Base de Datos**: PostgreSQL
- **ORM**: Prisma
- **Estado**: Zustand
- **Autenticación**: NextAuth.js
- **Pagos**: Stripe
- **Iconos**: Lucide React
- **Notificaciones**: React Hot Toast

## 📦 Instalación

### Prerrequisitos

- Node.js 18+ 
- PostgreSQL
- npm o yarn

### Pasos de Instalación

1. **Clonar el repositorio**
   ```bash
   git clone <tu-repositorio>
   cd bazar-ecommerce
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   ```bash
   cp env.example .env.local
   ```
   
   Edita el archivo `.env.local` con tus credenciales:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/bazar_ecommerce"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="tu-secret-key"
   STRIPE_PUBLISHABLE_KEY="pk_test_..."
   STRIPE_SECRET_KEY="sk_test_..."
   ```

4. **Configurar la base de datos**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Ejecutar el servidor de desarrollo**
   ```bash
   npm run dev
   ```

6. **Abrir en el navegador**
   ```
   http://localhost:3000
   ```

## 🗄️ Estructura de la Base de Datos

### Modelos Principales

- **User**: Usuarios del sistema
- **Product**: Productos con variantes
- **Category**: Categorías de productos
- **Order**: Pedidos con items
- **Review**: Reseñas de productos
- **Address**: Direcciones de envío/facturación

## 🎨 Características del Diseño

- **Paleta de Colores**: Naranja como color principal
- **Tipografía**: Inter font family
- **Componentes**: Reutilizables y modulares
- **Animaciones**: Transiciones suaves y hover effects
- **Responsive**: Mobile-first approach

## 📱 Páginas Principales

- **Home**: Hero section, categorías, productos destacados
- **Productos**: Grid de productos con filtros
- **Detalle de Producto**: Información completa, variantes, reseñas
- **Carrito**: Gestión de items y checkout
- **Perfil**: Información del usuario y pedidos
- **Categorías**: Navegación por categorías

## 🔧 Scripts Disponibles

```bash
npm run dev          # Servidor de desarrollo
npm run build        # Build de producción
npm run start        # Servidor de producción
npm run lint         # Linting
```

## 🚀 Despliegue

### Vercel (Recomendado)

1. Conecta tu repositorio a Vercel
2. Configura las variables de entorno en Vercel
3. Deploy automático en cada push

### Otros Proveedores

- **Netlify**: Compatible con Next.js
- **Railway**: Incluye PostgreSQL
- **Heroku**: Con addon de PostgreSQL

## 📝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 🤝 Soporte

Si tienes alguna pregunta o necesitas ayuda, no dudes en abrir un issue en el repositorio.

---

¡Disfruta construyendo tu ecommerce de moda! 🛍️ 