// Ejemplo de uso del servicio unificado de envíos
// Este archivo muestra cómo utilizar la interfaz común para ambos proveedores

// En un entorno real, se importaría desde el proyecto
// const { shippingService } = require('./src/lib/shipping-service');

// Simulación del servicio para el ejemplo
const { ShippingService } = require('./src/lib/shipping-service');
const shippingService = new ShippingService();

// Ejemplo 1: Obtener cotizaciones de envío
async function ejemploCotizaciones() {
  console.log('\n=== EJEMPLO 1: COTIZACIONES DE ENVÍO ===');
  
  const cotizacion = {
    origin_postal_code: '45100',      // Zapopan, Jalisco
    destination_postal_code: '06500', // CDMX
    parcel: {
      depth: 20,   // cm
      width: 30,    // cm
      height: 10,   // cm
      weight: 1     // kg
    }
  };
  
  try {
    console.log('📦 Solicitando cotización para paquete pequeño (1kg)...');
    const resultadoPequeno = await shippingService.getShippingQuotes(cotizacion);
    
    if (resultadoPequeno.success) {
      console.log(`✅ Cotización exitosa con proveedor: ${resultadoPequeno.provider}`);
      console.log('Opciones disponibles:');
      resultadoPequeno.quotes?.forEach((quote, index) => {
        console.log(`  ${index + 1}. ${quote.carrier} - ${quote.service}: $${quote.price} ${quote.currency}`);
        console.log(`     Entrega estimada: ${quote.estimated_delivery}`);
        console.log(`     Disponible: ${quote.available ? 'Sí' : 'No'}`);
      });
    } else {
      console.error('❌ Error en cotización:', resultadoPequeno.error);
    }
    
    // Probar con un paquete más pesado para ver si cambia el proveedor
    console.log('\n📦 Solicitando cotización para paquete grande (35kg)...');
    const cotizacionGrande = { ...cotizacion, parcel: { ...cotizacion.parcel, weight: 35 } };
    const resultadoGrande = await shippingService.getShippingQuotes(cotizacionGrande);
    
    if (resultadoGrande.success) {
      console.log(`✅ Cotización exitosa con proveedor: ${resultadoGrande.provider}`);
      console.log('Opciones disponibles:');
      resultadoGrande.quotes?.forEach((quote, index) => {
        console.log(`  ${index + 1}. ${quote.carrier} - ${quote.service}: $${quote.price} ${quote.currency}`);
        console.log(`     Entrega estimada: ${quote.estimated_delivery}`);
        console.log(`     Disponible: ${quote.available ? 'Sí' : 'No'}`);
      });
    } else {
      console.error('❌ Error en cotización:', resultadoGrande.error);
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
    // Servicio de envío (se determinará automáticamente si no se especifica)
    service_type: 'ESTAFETA_ECONOMICO'
  };
  
  try {
    console.log('📦 Creando orden para paquete pequeño (1kg)...');
    const resultadoPequeno = await shippingService.createShippingOrder(orden);
    
    if (resultadoPequeno.success) {
      console.log(`✅ Orden creada exitosamente con proveedor: ${resultadoPequeno.provider}`);
      console.log(`   Número de guía: ${resultadoPequeno.tracking_number}`);
      console.log(`   URL de etiqueta: ${resultadoPequeno.label_url}`);
      console.log(`   Paquetería: ${resultadoPequeno.carrier} - ${resultadoPequeno.service}`);
      console.log(`   Precio: $${resultadoPequeno.price}`);
      console.log(`   Entrega estimada: ${resultadoPequeno.estimated_delivery}`);
      
      // Guardar el número de guía para ejemplos posteriores
      global.trackingNumber = resultadoPequeno.tracking_number;
      global.provider = resultadoPequeno.provider;
      console.log(`📝 Número de guía guardado: ${global.trackingNumber} (${global.provider})`);
    } else {
      console.error('❌ Error al crear orden:', resultadoPequeno.error);
    }
    
    // Probar con un paquete más pesado para ver si cambia el proveedor
    console.log('\n📦 Creando orden para paquete grande (35kg)...');
    const ordenGrande = { ...orden, parcel: { ...orden.parcel, weight: 35 } };
    const resultadoGrande = await shippingService.createShippingOrder(ordenGrande);
    
    if (resultadoGrande.success) {
      console.log(`✅ Orden creada exitosamente con proveedor: ${resultadoGrande.provider}`);
      console.log(`   Número de guía: ${resultadoGrande.tracking_number}`);
      console.log(`   URL de etiqueta: ${resultadoGrande.label_url}`);
      console.log(`   Paquetería: ${resultadoGrande.carrier} - ${resultadoGrande.service}`);
      console.log(`   Precio: $${resultadoGrande.price}`);
      console.log(`   Entrega estimada: ${resultadoGrande.estimated_delivery}`);
      
      // Si no tenemos una guía guardada, guardar esta
      if (!global.trackingNumber) {
        global.trackingNumber = resultadoGrande.tracking_number;
        global.provider = resultadoGrande.provider;
        console.log(`📝 Número de guía guardado: ${global.trackingNumber} (${global.provider})`);
      }
    } else {
      console.error('❌ Error al crear orden:', resultadoGrande.error);
    }
  } catch (error) {
    console.error('❌ Error inesperado:', error);
  }
}

// Ejemplo 3: Generar etiqueta PDF
async function ejemploGenerarEtiqueta() {
  console.log('\n=== EJEMPLO 3: GENERAR ETIQUETA PDF ===');
  
  // Verificar si tenemos un número de guía de ejemplos anteriores
  const trackingNumber = global.trackingNumber || '123456789'; // Usar un número de ejemplo si no hay uno real
  const provider = global.provider; // Puede ser undefined
  
  try {
    console.log(`📄 Generando etiqueta para guía: ${trackingNumber}${provider ? ` (${provider})` : ''}`);
    const resultado = await shippingService.generateShippingLabel(trackingNumber, provider);
    
    if (resultado.success) {
      console.log('✅ Etiqueta generada exitosamente:');
      console.log(`   URL de etiqueta: ${resultado.label_url}`);
    } else {
      console.error('❌ Error al generar etiqueta:', resultado.error);
    }
  } catch (error) {
    console.error('❌ Error inesperado:', error);
  }
}

// Ejemplo 4: Cancelar guía
async function ejemploCancelarGuia() {
  console.log('\n=== EJEMPLO 4: CANCELAR GUÍA ===');
  
  // Verificar si tenemos un número de guía de ejemplos anteriores
  const trackingNumber = global.trackingNumber || '123456789'; // Usar un número de ejemplo si no hay uno real
  const provider = global.provider; // Puede ser undefined
  
  try {
    console.log(`🚫 Cancelando guía: ${trackingNumber}${provider ? ` (${provider})` : ''}`);
    const resultado = await shippingService.cancelShipment(trackingNumber, provider);
    
    if (resultado.success) {
      console.log('✅ Guía cancelada exitosamente');
    } else {
      console.error('❌ Error al cancelar guía:', resultado.error);
    }
  } catch (error) {
    console.error('❌ Error inesperado:', error);
  }
}

// Ejemplo 5: Obtener URL de tracking
function ejemploUrlTracking() {
  console.log('\n=== EJEMPLO 5: OBTENER URL DE TRACKING ===');
  
  // Verificar si tenemos un número de guía de ejemplos anteriores
  const trackingNumber = global.trackingNumber || '123456789'; // Usar un número de ejemplo si no hay uno real
  const provider = global.provider; // Puede ser undefined
  
  // Probar con diferentes paqueterías
  const carriers = ['ESTAFETA', 'REDPACK', 'JTEXPRESS', 'PAQUETEEXPRESS'];
  
  carriers.forEach(carrier => {
    const trackingUrl = shippingService.getTrackingUrl(trackingNumber, carrier, provider);
    console.log(`🔍 URL de tracking para ${carrier}: ${trackingUrl || 'No disponible'}`);
  });
}

// Ejecutar todos los ejemplos en secuencia
async function ejecutarEjemplos() {
  try {
    // Inicializar variables globales
    global.trackingNumber = null;
    global.provider = null;
    
    // Ejecutar ejemplos en orden
    await ejemploCotizaciones();
    await ejemploCrearOrden();
    await ejemploGenerarEtiqueta();
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
  ejemploCotizaciones,
  ejemploCrearOrden,
  ejemploGenerarEtiqueta,
  ejemploCancelarGuia,
  ejemploUrlTracking
};