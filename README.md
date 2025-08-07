# Bazar Fashion - Ecommerce de Ropa

Un ecommerce moderno y vistoso para venta de ropa construido con Next.js, TypeScript, Tailwind CSS y Prisma.

## 🚀 Características

- **Diseño Moderno**: Interfaz atractiva y responsive con Tailwind CSS
- **Carrito de Compras**: Gestión completa del carrito con Zustand
- **Base de Datos**: PostgreSQL con Prisma ORM
- **Autenticación**: Sistema de usuarios con NextAuth.js
- **Pagos**: Integración con Stripe
- **Productos**: Gestión completa de productos, categorías y variantes
- **Cupones**: Sistema de descuentos con validación de fechas y límites de uso
- **Reseñas**: Sistema de calificaciones y comentarios
- **Favoritos**: Lista de productos favoritos
- **Newsletter**: Suscripción a newsletter
- **Responsive**: Diseño adaptativo para móviles y desktop
- **Seguridad**: Generación de contraseñas seguras y normalización de datos
- **Ventas Físicas**: Sistema para registrar ventas presenciales con acceso para vendedores
- **Control de Acceso**: Roles de usuario (USER, ADMIN, VENDEDOR) con permisos específicos
- **Envíos**: Integración con múltiples servicios de paquetería (EnvíoClick, EnvíosPerros)

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

5. **Crear usuarios del sistema**
   
   **Crear administrador:**
   ```bash
   node scripts/create-admin.js
   ```
   
   **Crear vendedor:**
   ```bash
   node scripts/create-vendedor.js [email] [nombre]
   ```
   Ejemplo: `node scripts/create-vendedor.js vendedor@bazar.com "Juan Pérez"`
   
   > **Importante**: Estos scripts generarán contraseñas seguras aleatorias. Guarde esta información en un lugar seguro, ya que no podrá recuperarla después. Consulte `SECURITY_README.md` para más información.

6. **Ejecutar el servidor de desarrollo**
   ```bash
   npm run dev
   ```

7. **Abrir en el navegador**
   ```
   http://localhost:3000
   ```

## 🗄️ Estructura de la Base de Datos

### Modelos Principales

- **User**: Usuarios del sistema con roles (USER, ADMIN, VENDEDOR)
- **Product**: Productos con variantes
- **Category**: Categorías de productos
- **Order**: Pedidos con items
- **DiscountCoupon**: Cupones de descuento
- **Review**: Reseñas de productos
- **Address**: Direcciones de envío/facturación

## 🔒 Seguridad

El proyecto implementa varias medidas de seguridad:

- **Contraseñas**: Generación automática de contraseñas seguras para administradores
- **Hashing**: Almacenamiento seguro de contraseñas con bcryptjs
- **Validación**: Verificación de datos en todos los formularios
- **Normalización**: Estandarización de datos para prevenir duplicados y errores
- **Fechas**: Manejo seguro de fechas para cupones y otras entidades
- **Scripts de verificación de seguridad**: Conjunto de herramientas para verificar y mantener la seguridad del sistema:
  - `check-password-security.js`: Verifica la seguridad de las contraseñas de usuarios.
  - `reset-admin-password.js`: Permite resetear la contraseña de un administrador de forma segura.
  - `verify-coupon-security.js`: Verifica y normaliza la seguridad de los cupones.
  - `verify-system-security.js`: Realiza una verificación completa de la seguridad del sistema.
  - `backup-database.js`: Realiza una copia de seguridad completa de la base de datos.
  - `schedule-backups.js`: Programa copias de seguridad automáticas a intervalos regulares.

Consulte `SECURITY_README.md` para obtener información detallada sobre las prácticas de seguridad implementadas.

## 📚 Documentación Adicional

- **SECURITY_README.md**: Guía de seguridad y recomendaciones
- **CUPONES_README.md**: Documentación sobre el sistema de cupones
- **CODE_QUALITY_RECOMMENDATIONS.md**: Recomendaciones para mantener la calidad del código
- **ROLES_README.md**: Documentación sobre el sistema de roles y permisos

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
- **Admin**: Panel de administración completo
- **Venta Física**: Registro de ventas presenciales (accesible para ADMIN y VENDEDOR)

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