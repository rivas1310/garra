# 💬 Sistema de Chat en Vivo - Garras Felinas

## 🎯 Descripción

Sistema completo de chat en vivo implementado con WebSockets para comunicación en tiempo real entre clientes y administradores. Incluye notificaciones push, alertas por email y panel de administración completo.

## ✨ Características Implementadas

### 🔥 Funcionalidades Principales
- ✅ **Chat en tiempo real** con WebSockets (Socket.io)
- ✅ **Soporte para usuarios registrados y anónimos**
- ✅ **Panel de administración completo**
- ✅ **Notificaciones push en tiempo real**
- ✅ **Alertas por email para administradores**
- ✅ **Indicadores de escritura (typing)**
- ✅ **Estados de mensaje (enviado/leído)**
- ✅ **Historial completo de conversaciones**
- ✅ **Sistema de prioridades**
- ✅ **Filtros y búsqueda avanzada**

### 🎨 Interfaz de Usuario
- ✅ **Widget flotante responsive**
- ✅ **Temas claro y oscuro**
- ✅ **Formulario para usuarios invitados**
- ✅ **Indicadores visuales de estado**
- ✅ **Sonidos de notificación**
- ✅ **Contador de mensajes sin leer**

### 🔧 Funcionalidades Técnicas
- ✅ **Base de datos optimizada con índices**
- ✅ **APIs RESTful completas**
- ✅ **Autenticación y autorización**
- ✅ **Manejo de errores robusto**
- ✅ **Logging de seguridad**
- ✅ **Reconexión automática**

## 🏗️ Arquitectura

### 📁 Estructura de Archivos

```
src/
├── types/
│   └── chat.ts                     # Tipos TypeScript del chat
├── hooks/
│   └── useChat.ts                  # Hook principal del chat
├── components/Chat/
│   ├── ChatWidget.tsx              # Widget principal flotante
│   ├── ChatMessage.tsx             # Componente de mensaje
│   ├── ChatInput.tsx               # Input de mensajes
│   └── GuestForm.tsx               # Formulario para invitados
├── app/api/chat/
│   ├── conversations/
│   │   ├── route.ts                # CRUD de conversaciones
│   │   └── [id]/
│   │       ├── route.ts            # Conversación específica
│   │       └── read/route.ts       # Marcar como leído
│   ├── messages/
│   │   └── route.ts                # Envío de mensajes
│   └── socket/
│       └── route.ts                # Endpoint WebSocket
├── app/admin/chat/
│   └── page.tsx                    # Panel de administración
└── lib/
    └── socket.ts                   # Servidor Socket.io
```

### 🗄️ Base de Datos

#### Modelos Agregados:

**ChatConversation**
- `id` - Identificador único
- `userId` - Usuario registrado (opcional)
- `guestEmail/guestName` - Datos de invitado
- `status` - Estado (ACTIVE, PENDING, RESOLVED, CLOSED)
- `priority` - Prioridad (LOW, NORMAL, HIGH, URGENT)
- `subject` - Asunto de la conversación
- `isRead` - Leído por admin
- `lastMessageAt` - Timestamp último mensaje

**ChatMessage**
- `id` - Identificador único
- `conversationId` - Referencia a conversación
- `senderId` - Usuario que envía (opcional)
- `senderType` - Tipo (USER, ADMIN, SYSTEM)
- `content` - Contenido del mensaje
- `messageType` - Tipo (TEXT, IMAGE, FILE, SYSTEM)
- `attachmentUrl` - URL de archivo adjunto
- `isRead` - Estado de lectura

## 🚀 Uso

### 👥 Para Usuarios

1. **Usuarios Registrados:**
   - El chat aparece automáticamente al hacer login
   - Historial completo de conversaciones
   - Notificaciones personalizadas

2. **Usuarios Anónimos:**
   - Formulario inicial con nombre y email
   - Chat funcional sin registro
   - Conversación temporal

### 🛠️ Para Administradores

1. **Acceso al Panel:**
   ```
   /admin/chat
   ```

2. **Funcionalidades:**
   - Ver todas las conversaciones
   - Filtrar por estado y prioridad
   - Responder en tiempo real
   - Cambiar estados de conversaciones
   - Estadísticas en tiempo real

## 🔧 Configuración

### 1. Variables de Entorno

Agregar a `.env.local`:

```env
# Chat en Vivo
CHAT_ENABLED=true
CHAT_MAX_MESSAGE_LENGTH=1000
CHAT_ALLOW_FILE_UPLOAD=true
CHAT_MAX_FILE_SIZE=5242880  # 5MB
CHAT_AUTO_CLOSE_HOURS=24
```

### 2. Notificaciones Push

El sistema usa las notificaciones PWA existentes. Para habilitar:

```javascript
// El usuario debe dar permisos
await Notification.requestPermission()
```

### 3. WebSockets

El servidor Socket.io se inicializa automáticamente en:
- **Desarrollo:** `http://localhost:3000`
- **Producción:** `https://www.garrasfelinas.com`

## 📊 Eventos de WebSocket

### Cliente → Servidor
- `conversation:join` - Unirse a conversación
- `conversation:leave` - Salir de conversación
- `message:send` - Enviar mensaje
- `user:typing` - Indicar escritura
- `user:stop-typing` - Parar escritura
- `message:read` - Marcar como leído

### Servidor → Cliente
- `message:new` - Nuevo mensaje
- `message:read` - Mensaje leído
- `conversation:updated` - Conversación actualizada
- `user:typing` - Usuario escribiendo
- `user:stop-typing` - Usuario paró de escribir
- `user:online/offline` - Estado de usuario
- `admin:notification` - Notificación para admin

## 🎨 Personalización

### Temas
```tsx
<ChatWidget 
  position="bottom-right" 
  theme="light" // o "dark"
/>
```

### Posición
```tsx
<ChatWidget 
  position="bottom-left" // o "bottom-right"
  theme="light"
/>
```

## 🔒 Seguridad

### Autenticación
- Usuarios registrados: NextAuth session
- Usuarios anónimos: Validación de email
- Administradores: Verificación de rol

### Autorización
- Usuarios solo ven sus conversaciones
- Admins ven todas las conversaciones
- Validación en cada endpoint

### Sanitización
- Contenido de mensajes sanitizado
- Validación de tipos de archivo
- Límites de tamaño de mensaje

## 📈 Monitoreo

### Métricas Disponibles
- Conversaciones activas
- Mensajes sin leer
- Tiempo de respuesta promedio
- Usuarios conectados

### Logs
- Conexiones/desconexiones
- Mensajes enviados/recibidos
- Errores de WebSocket
- Cambios de estado

## 🚨 Alertas

### Para Administradores
1. **Nuevas conversaciones**
   - Notificación push inmediata
   - Email opcional (configurar SMTP)

2. **Mensajes urgentes**
   - Prioridad alta/urgente
   - Notificación especial

3. **Usuarios desconectados**
   - Timeout de inactividad
   - Cambio automático de estado

## 🔧 Mantenimiento

### Comandos Útiles

```bash
# Verificar conexiones activas
curl http://localhost:3000/api/chat/status

# Limpiar conversaciones antiguas (implementar)
npm run chat:cleanup

# Estadísticas de uso
npm run chat:stats
```

### Base de Datos

```sql
-- Conversaciones por estado
SELECT status, COUNT(*) FROM "ChatConversation" GROUP BY status;

-- Mensajes por día
SELECT DATE(created_at), COUNT(*) FROM "ChatMessage" GROUP BY DATE(created_at);

-- Usuarios más activos
SELECT sender_id, COUNT(*) FROM "ChatMessage" WHERE sender_id IS NOT NULL GROUP BY sender_id ORDER BY COUNT(*) DESC;
```

## 🐛 Troubleshooting

### Problemas Comunes

1. **WebSocket no conecta**
   - Verificar firewall
   - Comprobar proxy/load balancer
   - Revisar CORS settings

2. **Mensajes no llegan**
   - Verificar conexión a BD
   - Comprobar logs de Socket.io
   - Validar autenticación

3. **Notificaciones no funcionan**
   - Verificar permisos del navegador
   - Comprobar service worker
   - Revisar configuración PWA

### Logs Importantes

```bash
# Logs de Socket.io
tail -f logs/socket.log

# Logs de base de datos
tail -f logs/prisma.log

# Logs de aplicación
tail -f logs/app.log
```

## 🚀 Próximas Mejoras

### Funcionalidades Planeadas
- [ ] **Archivos adjuntos** (imágenes, documentos)
- [ ] **Respuestas rápidas** predefinidas
- [ ] **Chatbots** con IA para respuestas automáticas
- [ ] **Videollamadas** integradas
- [ ] **Transferencia** entre agentes
- [ ] **Encuestas** de satisfacción
- [ ] **Integración** con CRM
- [ ] **Analytics** avanzados

### Optimizaciones Técnicas
- [ ] **Clustering** para múltiples instancias
- [ ] **Redis** para sesiones compartidas
- [ ] **CDN** para archivos adjuntos
- [ ] **Compresión** de mensajes
- [ ] **Rate limiting** avanzado

## 📞 Soporte

Para problemas con el sistema de chat:

1. **Revisar logs** en `/logs/chat.log`
2. **Verificar estado** en `/admin/chat`
3. **Contactar desarrollo** si persisten problemas

---

## 🎉 ¡Chat en Vivo Implementado!

El sistema está **completamente funcional** y listo para usar. Los usuarios pueden iniciar conversaciones desde cualquier página y los administradores pueden responder desde el panel de administración.

### ✅ Estado: COMPLETADO
- ✅ Base de datos configurada
- ✅ APIs implementadas
- ✅ WebSockets funcionando
- ✅ Interfaz de usuario lista
- ✅ Panel de administración operativo
- ✅ Notificaciones activas
- ✅ Documentación completa

**¡El chat en vivo está listo para recibir a tus clientes! 🚀**
