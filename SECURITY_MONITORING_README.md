# 🛡️ Sistema de Monitoreo de Seguridad

## Descripción
Sistema automatizado para monitorear continuamente la seguridad del código, detectar vulnerabilidades y ejecutar auditorías periódicas.

## Características
- 🔍 **Monitoreo Continuo**: Detecta cambios en archivos en tiempo real
- ⏰ **Auditorías Automáticas**: Ejecuta auditorías cada 5 minutos
- 🚨 **Alertas Inteligentes**: Notifica cuando se detectan problemas críticos
- 📊 **Reportes Detallados**: Historial completo de auditorías
- 🔄 **Monitoreo de Archivos**: Rastrea cambios en src/, scripts/, prisma/

## Uso

### Inicio Rápido
```bash
# Windows
start-security-monitor.bat

# Linux/Mac
./start-security-monitor.sh

# Manual
node scripts/security-monitor.js
```

### Comandos Disponibles
- `start` - Iniciar monitoreo continuo
- `stop` - Detener monitoreo
- `status` - Mostrar estado del monitoreo
- `history` - Mostrar historial de auditorías
- `audit` - Ejecutar auditoría manual
- `help` - Mostrar ayuda
- `exit` - Salir del monitor

## Configuración
El sistema se configura automáticamente en `security-monitor-config.json`

## Estado
El estado del monitoreo se guarda en `security-monitor-state.json`

## Archivos del Sistema
- `scripts/security-monitor.js` - Monitor principal
- `scripts/security-audit.js` - Auditoría de seguridad
- `scripts/migrate-to-secure-logging.js` - Migración a logging seguro
- `src/lib/secureLogger.ts` - Sistema de logging seguro

## Monitoreo Automático
El sistema detecta automáticamente:
- Nuevos archivos creados
- Archivos modificados
- Cambios en patrones de seguridad
- Problemas críticos en tiempo real

## Alertas
- 🔴 **Crítico**: >10 problemas críticos
- 🟠 **Alto**: >50 problemas altos  
- 🔴 **General**: >100 problemas totales

## Mantenimiento
- Ejecutar `node scripts/setup-security-monitoring.js` para reconfigurar
- Revisar logs en `security-monitor-state.json`
- Actualizar umbrales en `security-monitor-config.json`
