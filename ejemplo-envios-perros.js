// Ejemplo de uso de la API de EnvíosPerros
// Este archivo muestra cómo utilizar el cliente de EnvíosPerros para realizar operaciones comunes

// Importar el cliente de EnvíosPerros
const { EnviosPerrosClient, SHIPPING_SERVICES } = require('./src/lib/envios-perros-client');

// API Key proporcionada
const API_KEY = '4ExUSFztbANYkmlOkAFNH3JbUSHSYo5VS8Mcg6r1';

// URL base para ambiente de pruebas (staging)
const BASE_URL = 'https://staging-app.enviosperros.com/api/v2';

// Crear una instancia del cliente
const enviosPerros = new EnviosPerrosClient({
  baseUrl: BASE_URL,
  apiKey: API_KEY,
  userAgent: 'BazarFashion/1.0'
});

// Ejemplo 1: Cotización de envío
async function ejemploCotizacion() {
  console.log('\n=== EJEMPLO 1: COTIZACIÓN DE ENVÍO ===');
  
  const cotizacion = {
    depth: 20,         // Profundidad en cm
    width: 30,         // Ancho en cm
    height: 10,        // Alto en cm
    weight: 1,         // Peso en kg
    'origin-codePostal': '45100',      // CP origen (Zapopan, Jalisco)
    'destination-codePostal': '06500'  // CP destino (CDMX)
  };
  
  try {
    const resultado = await enviosPerros.getShippingRates(cotizacion);
    
    if (resultado.success) {
      console.log('✅ Cotización exitosa:');
      console.log(JSON.stringify(resultado.data, null, 2));
    } else {
      console.error('❌ Error en cotización:', resultado.error);
      console.error('Detalles:', resultado.details);
    }
  } catch (error) {
    console.error('❌ Error inesperado:', error);
  }
}

// Ejemplo 2: Crear una orden de envío
async function ejemploCrearOrden() {
  console.log('\n=== EJEMPLO 2: CREAR ORDEN DE ENVÍO ===');
  
  const orden = {
    // Datos del remitente
    sender: {
      company: 'Bazar Fashion',
      street: 'Andador 20 de noviembre',
      number: '224',
      postal_code: '45100',
      district: 'Zapopan Centro',
      city: 'Zapopan',
      state: 'Jalisco',
      references: 'Entre 28 de enero y 5 de mayo',
      name: 'Bazar Fashion',
      email: 'envios@bazarfashion.com',
      phone: '3336125478'
    },
    // Datos del destinatario
    recipient: {
      name: 'Juan Pérez',
      street: 'Av. Insurgentes Sur',
      number: '1602',
      postal_code: '06500',
      district: 'Crédito Constructor',
      city: 'Ciudad de México',
      state: 'Ciudad de México',
      references: 'Edificio de oficinas',
      email: 'juan.perez@ejemplo.com',
      phone: '5512345678'
    },
    // Datos del paquete
    parcel: {
      depth: 20,
      width: 30,
      height: 10,
      weight: 1,
      content: 'Ropa y accesorios',
      value: 1500
    },
    // Servicio de envío
    service: {
      service_type: 'ESTAFETA_ECONOMICO'
    },
    // Opciones adicionales
    save_origin: 'false',
    ocurre: 'false'
  };
  
  try {
    const resultado = await enviosPerros.createOrder(orden);
    
    if (resultado.success) {
      console.log('✅ Orden creada exitosamente:');
      console.log(JSON.stringify(resultado.data, null, 2));
      
      // Guardar el número de guía para ejemplos posteriores
      if (resultado.data && resultado.data.reference) {
        global.referenceNumber = resultado.data.reference;
        console.log(`📝 Número de guía guardado: ${global.referenceNumber}`);
      }
    } else {
      console.error('❌ Error al crear orden:', resultado.error);
      console.error('Detalles:', resultado.details);
    }
  } catch (error) {
    console.error('❌ Error inesperado:', error);
  }
}

// Ejemplo 3: Generar etiqueta PDF
async function ejemploGenerarEtiqueta() {
  console.log('\n=== EJEMPLO 3: GENERAR ETIQUETA PDF ===');
  
  // Verificar si tenemos un número de guía de ejemplos anteriores
  const referenceNumber = global.referenceNumber || '123456789'; // Usar un número de ejemplo si no hay uno real
  
  try {
    const resultado = await enviosPerros.generateLabel(referenceNumber, true); // true para obtener en base64
    
    if (resultado.success) {
      console.log('✅ Etiqueta generada exitosamente:');
      console.log('Datos de la etiqueta disponibles en:', resultado.data);
      
      // No imprimir el base64 completo para no saturar la consola
      if (resultado.data && resultado.data.pdf) {
        console.log(`📄 PDF Base64 (primeros 50 caracteres): ${resultado.data.pdf.substring(0, 50)}...`);
      }
    } else {
      console.error('❌ Error al generar etiqueta:', resultado.error);
      console.error('Detalles:', resultado.details);
    }
  } catch (error) {
    console.error('❌ Error inesperado:', error);
  }
}

// Ejemplo 4: Solicitar recolección
async function ejemploSolicitarRecoleccion() {
  console.log('\n=== EJEMPLO 4: SOLICITAR RECOLECCIÓN ===');
  
  // Verificar si tenemos un número de guía de ejemplos anteriores
  const referenceNumber = global.referenceNumber || '123456789'; // Usar un número de ejemplo si no hay uno real
  
  // Obtener fecha para mañana (la recolección debe ser al menos un día después)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const formattedDate = tomorrow.toISOString().split('T')[0]; // Formato YYYY-MM-DD
  
  try {
    const resultado = await enviosPerros.requestPickup(referenceNumber, formattedDate, 0); // Periodo 0: 11:00-16:00
    
    if (resultado.success) {
      console.log('✅ Recolección solicitada exitosamente:');
      console.log(JSON.stringify(resultado.data, null, 2));
    } else {
      console.error('❌ Error al solicitar recolección:', resultado.error);
      console.error('Detalles:', resultado.details);
    }
  } catch (error) {
    console.error('❌ Error inesperado:', error);
  }
}

// Ejemplo 5: Cancelar guía
async function ejemploCancelarGuia() {
  console.log('\n=== EJEMPLO 5: CANCELAR GUÍA ===');
  
  // Verificar si tenemos un número de guía de ejemplos anteriores
  const referenceNumber = global.referenceNumber || '123456789'; // Usar un número de ejemplo si no hay uno real
  
  try {
    const resultado = await enviosPerros.cancelShipment(referenceNumber);
    
    if (resultado.success) {
      console.log('✅ Guía cancelada exitosamente:');
      console.log(JSON.stringify(resultado.data, null, 2));
    } else {
      console.error('❌ Error al cancelar guía:', resultado.error);
      console.error('Detalles:', resultado.details);
    }
  } catch (error) {
    console.error('❌ Error inesperado:', error);
  }
}

// Ejemplo 6: Obtener URL de tracking
function ejemploUrlTracking() {
  console.log('\n=== EJEMPLO 6: OBTENER URL DE TRACKING ===');
  
  // Verificar si tenemos un número de guía de ejemplos anteriores
  const referenceNumber = global.referenceNumber || '123456789'; // Usar un número de ejemplo si no hay uno real
  
  // Probar con diferentes paqueterías
  const carriers = ['ESTAFETA', 'REDPACK', 'JTEXPRESS', 'PAQUETEEXPRESS'];
  
  carriers.forEach(carrier => {
    const trackingUrl = enviosPerros.getTrackingUrl(referenceNumber, carrier);
    console.log(`🔍 URL de tracking para ${carrier}: ${trackingUrl}`);
  });
}

// Ejecutar todos los ejemplos en secuencia
async function ejecutarEjemplos() {
  try {
    // Inicializar variable global para almacenar el número de guía entre ejemplos
    global.referenceNumber = null;
    
    // Ejecutar ejemplos en orden
    await ejemploCotizacion();
    await ejemploCrearOrden();
    await ejemploGenerarEtiqueta();
    await ejemploSolicitarRecoleccion();
    await ejemploCancelarGuia();
    ejemploUrlTracking();
    
    console.log('\n✅ Todos los ejemplos han sido ejecutados.');
  } catch (error) {
    console.error('❌ Error al ejecutar ejemplos:', error);
  }
}

// Descomentar para ejecutar los ejemplos
// ejecutarEjemplos();

module.exports = {
  ejecutarEjemplos,
  ejemploCotizacion,
  ejemploCrearOrden,
  ejemploGenerarEtiqueta,
  ejemploSolicitarRecoleccion,
  ejemploCancelarGuia,
  ejemploUrlTracking
};