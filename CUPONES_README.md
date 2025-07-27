# Guía de Gestión de Cupones

## Problema Identificado

Se ha detectado un problema con la validación de cupones debido a la configuración de fecha del sistema. El sistema está configurado con una fecha en el año 2025, lo que causa que los cupones con fechas de validez normales (actuales) no funcionen correctamente.

## Solución Implementada

Para solucionar este problema, se han realizado las siguientes mejoras:

1. **Fechas de validez amplias por defecto**: La página de creación de cupones ahora establece fechas de validez muy amplias por defecto (desde 2020 hasta 2030) para asegurar que los cupones funcionen correctamente independientemente de la fecha del sistema.

2. **Script de corrección**: Se ha creado un script (`scripts/fix-coupons-dates.js`) que puede ejecutarse para corregir las fechas de todos los cupones existentes en la base de datos.

## Instrucciones de Uso

### Creación de Nuevos Cupones

1. Accede a la sección de administración de cupones en `/admin/cupones`
2. Haz clic en "Nuevo Cupón"
3. Completa el formulario con la información del cupón
4. Las fechas de inicio y fin ya vienen preestablecidas con valores amplios (2020-2030)
5. Si necesitas fechas específicas, puedes modificarlas, pero asegúrate de que sean lo suficientemente amplias para cubrir la fecha actual del sistema

### Corrección de Cupones Existentes

Si tienes cupones existentes que no funcionan correctamente debido a problemas con las fechas, puedes ejecutar el script de corrección:

```bash
node scripts/fix-coupons-dates.js
```

Este script actualizará todos los cupones existentes con fechas de validez amplias (2020-2030) y los activará.

### Verificación de Cupones

Para verificar el estado de los cupones existentes, puedes ejecutar:

```bash
node scripts/check-coupons.js
```

### Prueba de Validación de Cupones

Para probar la validación de un cupón específico directamente contra la API:

```bash
node scripts/test-api-coupon.js
```

## Recomendaciones Adicionales

1. **Configuración de fecha del sistema**: Si es posible, considera corregir la fecha del sistema para evitar problemas futuros.

2. **Monitoreo**: Mantén un monitoreo regular de la funcionalidad de los cupones, especialmente después de cambios en el sistema o actualizaciones.

3. **Pruebas**: Realiza pruebas periódicas de la funcionalidad de los cupones utilizando los scripts proporcionados.

## Solución de Problemas

Si los cupones siguen sin funcionar correctamente después de aplicar estas soluciones, verifica:

1. **Logs del servidor**: Revisa los logs del servidor para identificar posibles errores.

2. **Base de datos**: Verifica directamente en la base de datos que los cupones tengan las fechas correctas y estén activos.

3. **API de validación**: Prueba la API de validación de cupones directamente utilizando herramientas como Postman o el script `test-api-coupon.js`.

4. **Fecha del sistema**: Confirma la fecha actual del sistema ejecutando `new Date()` en la consola de Node.js.

## Contacto

Si encuentras problemas adicionales o necesitas asistencia, contacta al equipo de desarrollo.