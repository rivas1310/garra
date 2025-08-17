/**
 * Script para generar un reporte detallado del estado de la API de Envío Click
 * Este script utiliza el cliente actualizado para verificar la disponibilidad
 * de endpoints v1 y v2 en ambos entornos (producción y staging)
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { createEnvioClickClient } = require('./dist/lib/envio-click-client');

// Función para generar el reporte
async function generateApiReport() {
  console.log('🔍 Generando reporte de la API de Envío Click...');
  
  // Guardamos el entorno original
  const originalEnv = process.env.NODE_ENV;
  
  // Creamos un cliente para producción
  process.env.NODE_ENV = 'production';
  const productionClient = createEnvioClickClient();
  console.log('🔌 Conectado a producción');
  
  // Creamos un cliente para staging
  process.env.NODE_ENV = 'development';
  const stagingClient = createEnvioClickClient();
  console.log('🔌 Conectado a staging');
  
  // Restauramos el entorno original
  process.env.NODE_ENV = originalEnv;
  
  // Realizamos health checks
  console.log('🔍 Verificando endpoints en producción...');
  const productionHealth = await productionClient.healthCheck();
  
  console.log('🔍 Verificando endpoints en staging...');
  const stagingHealth = await stagingClient.healthCheck();
  
  // Generamos el reporte en formato Markdown
  const report = generateMarkdownReport(productionHealth, stagingHealth);
  
  // Guardamos el reporte en un archivo
  const reportPath = path.join(process.cwd(), 'ENVIOS_PERROS_API_REPORT.md');
  fs.writeFileSync(reportPath, report);
  
  console.log(`✅ Reporte generado en ${reportPath}`);
  return report;
}

// Función para generar el reporte en formato Markdown
function generateMarkdownReport(productionHealth, stagingHealth) {
  const now = new Date();
  const formattedDate = now.toISOString().split('T')[0];
  
  let report = `# Reporte de Estado de la API de Envíos Perros

`;
  report += `*Generado automáticamente el ${formattedDate}*

`;
  
  // Resumen general
  report += `## Resumen General

`;
  report += `| Entorno | Estado Base | API v1 | API v2 | Endpoints v1 | Endpoints v2 |
`;
  report += `|---------|-------------|--------|--------|-------------|-------------|
`;
  
  const prodBaseStatus = productionHealth.data?.baseStatus?.status === 200 ? '✅ OK' : '❌ Error';
  const prodV1Available = productionHealth.data?.apiVersionSummary?.v1?.available ? '✅ Disponible' : '❌ No disponible';
  const prodV2Available = productionHealth.data?.apiVersionSummary?.v2?.available ? '✅ Disponible' : '❌ No disponible';
  const prodV1Count = productionHealth.data?.apiVersionSummary?.v1?.endpointCount || 0;
  const prodV2Count = productionHealth.data?.apiVersionSummary?.v2?.endpointCount || 0;
  
  const stagingBaseStatus = stagingHealth.data?.baseStatus?.status === 200 ? '✅ OK' : '❌ Error';
  const stagingV1Available = stagingHealth.data?.apiVersionSummary?.v1?.available ? '✅ Disponible' : '❌ No disponible';
  const stagingV2Available = stagingHealth.data?.apiVersionSummary?.v2?.available ? '✅ Disponible' : '❌ No disponible';
  const stagingV1Count = stagingHealth.data?.apiVersionSummary?.v1?.endpointCount || 0;
  const stagingV2Count = stagingHealth.data?.apiVersionSummary?.v2?.endpointCount || 0;
  
  report += `| Producción | ${prodBaseStatus} | ${prodV1Available} | ${prodV2Available} | ${prodV1Count} | ${prodV2Count} |
`;
  report += `| Staging | ${stagingBaseStatus} | ${stagingV1Available} | ${stagingV2Available} | ${stagingV1Count} | ${stagingV2Count} |

`;
  
  // Detalles de endpoints v2 en producción
  report += `## Endpoints v2 en Producción

`;
  report += `| Endpoint | Estado | Código | Notas |
`;
  report += `|----------|--------|--------|-------|
`;
  
  const prodV2Details = productionHealth.data?.v2EndpointsDetails || {};
  for (const [endpoint, details] of Object.entries(prodV2Details)) {
    const status = details.available ? '✅ Disponible' : '❌ No disponible';
    const code = details.status || 'N/A';
    const notes = getEndpointNotes(endpoint, details);
    report += `| ${endpoint} | ${status} | ${code} | ${notes} |
`;
  }
  
  // Detalles de endpoints v2 en staging
  report += `
## Endpoints v2 en Staging

`;
  report += `| Endpoint | Estado | Código | Notas |
`;
  report += `|----------|--------|--------|-------|
`;
  
  const stagingV2Details = stagingHealth.data?.v2EndpointsDetails || {};
  for (const [endpoint, details] of Object.entries(stagingV2Details)) {
    const status = details.available ? '✅ Disponible' : '❌ No disponible';
    const code = details.status || 'N/A';
    const notes = getEndpointNotes(endpoint, details);
    report += `| ${endpoint} | ${status} | ${code} | ${notes} |
`;
  }
  
  // Recomendaciones
  report += `
## Recomendaciones

`;
  
  const prodV2Complete = productionHealth.data?.apiVersionSummary?.v2?.isComplete;
  const stagingV2Complete = stagingHealth.data?.apiVersionSummary?.v2?.isComplete;
  
  if (prodV2Complete && stagingV2Complete) {
    report += `- ✅ La API v2 parece estar completamente implementada en ambos entornos. Se recomienda migrar a v2.
`;
  } else if (prodV2Complete) {
    report += `- ⚠️ La API v2 parece estar completamente implementada en producción pero no en staging. Verificar con el equipo de Envíos Perros.
`;
  } else if (stagingV2Complete) {
    report += `- ⚠️ La API v2 parece estar completamente implementada en staging pero no en producción. Es posible que pronto se despliegue en producción.
`;
  } else {
    report += `- ❌ La API v2 no está completamente implementada en ningún entorno. Se recomienda seguir utilizando la API v1.
`;
  }
  
  // Verificamos si hay endpoints que funcionan en staging pero no en producción
  const stagingOnlyEndpoints = stagingHealth.data?.availableV2Endpoints?.filter(
    endpoint => !productionHealth.data?.availableV2Endpoints?.includes(endpoint)
  ) || [];
  
  if (stagingOnlyEndpoints.length > 0) {
    report += `- ℹ️ Los siguientes endpoints v2 funcionan en staging pero no en producción: ${stagingOnlyEndpoints.join(', ')}. Esto sugiere que pronto podrían estar disponibles en producción.
`;
  }
  
  // Verificamos si hay endpoints que funcionan en producción pero no en staging
  const productionOnlyEndpoints = productionHealth.data?.availableV2Endpoints?.filter(
    endpoint => !stagingHealth.data?.availableV2Endpoints?.includes(endpoint)
  ) || [];
  
  if (productionOnlyEndpoints.length > 0) {
    report += `- ⚠️ Los siguientes endpoints v2 funcionan en producción pero no en staging: ${productionOnlyEndpoints.join(', ')}. Esto es inusual y podría indicar inconsistencias en la implementación.
`;
  }
  
  // Conclusión
  report += `
## Conclusión

`;
  
  if (prodV2Available && stagingV2Available) {
    if (prodV2Complete && stagingV2Complete) {
      report += `La API v2 de Envíos Perros parece estar completamente implementada y lista para su uso. Se recomienda migrar gradualmente de v1 a v2, manteniendo temporalmente la compatibilidad con ambas versiones.
`;
    } else {
      report += `La API v2 de Envíos Perros está parcialmente implementada. Se recomienda mantener el sistema de fallback actual que intenta primero endpoints v2 y luego v1, para garantizar la mejor compatibilidad y prepararse para la migración completa a v2 cuando esté disponible.
`;
    }
  } else {
    report += `La API v2 de Envíos Perros no está suficientemente implementada para su uso en producción. Se recomienda seguir utilizando la API v1 y monitorear regularmente el estado de la API v2.
`;
  }
  
  return report;
}

// Función para obtener notas específicas sobre un endpoint
function getEndpointNotes(endpoint, details) {
  if (!details.available) {
    return 'No implementado';
  }
  
  if (endpoint === '/api/v2/shipping/rates') {
    if (details.status === 405) {
      return 'Requiere método POST';
    } else if (details.status === 200) {
      return 'Funcional, pero verificar formato de respuesta';
    }
  }
  
  if (endpoint === '/api/v2/guide/order') {
    if (details.status === 422) {
      return 'Requiere parámetros específicos';
    } else if (details.status === 200) {
      return 'Funcional con parámetros correctos';
    }
  }
  
  if (details.status === 405) {
    return 'Método no permitido (probar POST)';
  }
  
  return '';
}

// Ejecutar el generador de reportes
generateApiReport().catch(error => {
  console.error('❌ Error al generar el reporte:', error);
});