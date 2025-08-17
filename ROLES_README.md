# Sistema de Roles y Permisos

Este documento describe el sistema de roles y permisos implementado en Bazar Fashion, detallando las capacidades y restricciones de cada rol de usuario.

## Roles Disponibles

El sistema cuenta con tres roles principales:

### 1. USER

Rol predeterminado asignado a todos los usuarios registrados en la plataforma.

**Permisos**:
- Navegar por el catálogo de productos
- Añadir productos al carrito
- Realizar compras online
- Gestionar su perfil personal
- Ver su historial de pedidos
- Añadir productos a favoritos
- Escribir reseñas de productos

### 2. ADMIN

Rol con acceso completo al sistema, destinado a los administradores de la plataforma.

**Permisos**:
- Todos los permisos de USER
- Acceso completo al panel de administración
- Gestión de productos (crear, editar, eliminar)
- Gestión de categorías
- Gestión de usuarios
- Gestión de pedidos
- Gestión de cupones
- Acceso a reportes y estadísticas
- Registro de ventas físicas
- Consulta del historial de ventas físicas

### 3. VENDEDOR

Rol específico para personal de tienda física, con acceso limitado al panel de administración.

**Permisos**:
- Acceso exclusivo a la página de ventas físicas
- Registro de ventas presenciales
- Búsqueda de productos por nombre o código de barras
- Gestión del carrito de venta física
- Consulta de disponibilidad de stock en tiempo real

## Creación de Usuarios

### Crear un Administrador

```bash
node scripts/create-admin.js
```

Este comando creará un usuario administrador con email `admin@bazar.com` y una contraseña segura generada automáticamente.

### Crear un Vendedor

```bash
node scripts/create-vendedor.js [email] [nombre]
```

Ejemplo:
```bash
node scripts/create-vendedor.js vendedor@bazar.com "Juan Pérez"
```

Este comando creará un usuario con rol VENDEDOR utilizando el email y nombre proporcionados, y generará una contraseña segura automáticamente.

## Implementación Técnica

### Protección de Rutas

El sistema utiliza varios mecanismos para proteger las rutas según el rol del usuario:

1. **Protección a nivel de componente**: El componente `AdminProtectedRoute` verifica el rol del usuario y redirige según corresponda:
   - Usuarios no autenticados son redirigidos a la página de login
   - Usuarios con rol USER son redirigidos a la página principal
   - Usuarios con rol VENDEDOR solo pueden acceder a la página de venta física
   - Usuarios con rol ADMIN tienen acceso completo al panel

2. **Protección a nivel de API**: Todas las rutas API verifican la autenticación y el rol del usuario antes de procesar las solicitudes.

### Navegación Adaptativa

El componente `AdminNav` muestra diferentes opciones de navegación según el rol del usuario:

- ADMIN: Acceso completo a todas las opciones del panel
- VENDEDOR: Acceso limitado solo a la opción de Venta Física

## Consideraciones de Seguridad

- Las contraseñas se generan de forma segura y se almacenan utilizando hashing con bcryptjs
- Los tokens de sesión tienen un tiempo de expiración limitado
- Las verificaciones de rol se realizan tanto en el cliente como en el servidor
- Se implementan mensajes de error genéricos para evitar la enumeración de usuarios

## Mejores Prácticas

1. Asignar el rol mínimo necesario para cada usuario
2. Revisar periódicamente los usuarios con roles privilegiados
3. Cambiar las contraseñas generadas automáticamente después del primer inicio de sesión
4. Implementar autenticación de dos factores para roles privilegiados (futura mejora)

---

Para más información sobre seguridad, consulte el archivo `SECURITY_README.md`.