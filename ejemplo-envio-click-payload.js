/**
 * Ejemplo completo de payload para Envío Click API
 * Basado en la documentación oficial y estructura mostrada
 */

// Ejemplo de payload para crear una orden (formato interno)
const createOrderPayload = {
  // Información del remitente
  addressFrom: {
    name: "Juan Pérez",
    company: "Mi Empresa S.A.",
    street: "Av. Principal",
    number: "123",
    district: "Centro",
    city: "Ciudad de México",
    state: "CDMX",
    country: "México",
    postalCode: "03100",
    phone: "5551234567",
    email: "juan@empresa.com"
  },
  // Información del destinatario
  addressTo: {
    name: "María García",
    company: "Cliente S.A.",
    street: "Calle Secundaria",
    number: "456",
    district: "Colonia Norte",
    city: "Monterrey",
    state: "Nuevo León",
    country: "México",
    postalCode: "64000",
    phone: "8181234567",
    email: "maria@cliente.com"
  },
  // Información del paquete
  parcel: {
    weight: 2.5,
    depth: 25,
    width: 35,
    height: 15,
    content: "Productos electrónicos",
    type: "paquete"
  },
  // Información del servicio
  selectedRate: {
    deliveryType: {
      company: "Envío Click",
      name: "Estándar",
      description: "Entrega a domicilio"
    },
    cost: 150,
    tiempo_entrega: "2-3 días"
  },
  // Metadatos
  orderId: "ORD-2024-001",
  orderData: {
    total: 1500,
    items: [{ name: "Producto 1", quantity: 3 }]
  }
};

// Ejemplo del formato que se enviará a la API de Envío Click (después de transformación)
const envioClickAPIFormat = {
  "deliveryType": "Envío Click",
  "packageSize": {
    "type": "paquete",
    "depth": "25",
    "width": "35",
    "height": "15",
    "weight": "2.5",
    "description": "Productos electrónicos"
  },
  "origin": {
    "company_origin": "Mi Empresa S.A.",
    "street_origin": "Av. Principal",
    "interior_number_origin": "",
    "outdoor_number_origin": "123",
    "zip_code_origin": "03100",
    "neighborhood_origin": "Centro",
    "city_origin": "Ciudad de México",
    "state_origin": "CDMX",
    "references_origin": "",
    "name_origin": "Juan Pérez",
    "email_origin": "juan@empresa.com",
    "phone_origin": "5551234567",
    "save_origin": "false"
  },
  "destination": {
    "company_dest": "Cliente S.A.",
    "street_dest": "Calle Secundaria",
    "interior_number_dest": "",
    "outdoor_number_dest": "456",
    "zip_code_dest": "64000",
    "neighborhood_dest": "Colonia Norte",
    "city_dest": "Monterrey",
    "state_dest": "Nuevo León",
    "references_dest": "",
    "name_dest": "María García",
    "email_dest": "maria@cliente.com",
    "phone_dest": "8181234567",
    "save_dest": "false",
    "ocurre": "false"
  }
};

// Ejemplo de payload para crear una orden de envío (formato original API)
const envioClickOrderPayload = {
  "deliveryType": "ESTAFETA_ECONOMICO",
  "packageSize": "S",
  "type": "shipment",
  "depth": "10",
  "width": "15",
  "height": "20",
  "weight": "1.5",
  "description": "Paquete de prueba",
  
  // Información del origen
  "origin": {
    "company_origin": "EnvioClick",
    "street_origin": "Eje Central Lázaro Cárdenas",
    "interior_number_origin": "1",
    "outdoor_number_origin": "2",
    "zip_code_origin": "06000",
    "neighborhood_origin": "Madero",
    "city_origin": "Cuauhtémoc",
    "state_origin": "Ciudad de México",
    "references_origin": "Frente al metro",
    "name_origin": "Alex Lora",
    "email_origin": "alexlora@gmail.com",
    "phone_origin": "2291234567",
    "save_origin": "false"
  },
  
  // Información del destino
  "destination": {
    "company_dest": "Test Company",
    "street_dest": "Dr José Ma. Coss",
    "interior_number_dest": "3",
    "outdoor_number_dest": "445",
    "zip_code_dest": "64000",
    "neighborhood_dest": "Calle diego montemayor",
    "city_dest": "Nuevo León",
    "state_dest": "Monterrey",
    "references_dest": "Puerta negra",
    "name_dest": "Gabriel García Márquez",
    "email_dest": "ggarcia@gmail.com",
    "phone_dest": "8291234569",
    "save_dest": "false",
    "occurs": "false"
  }
};

// Ejemplo de payload para cotizaciones
const envioClickQuotePayload = {
  "origin": {
    "zip_code": "06000",
    "country": "MX"
  },
  "destination": {
    "zip_code": "64000",
    "country": "MX"
  },
  "packages": [{
    "weight": 1.5,
    "weightUnit": "KG",
    "dimensions": {
      "length": 20,
      "width": 15,
      "height": 10
    },
    "lengthUnit": "CM"
  }]
};

// Función para usar con el cliente robusto
async function createEnvioClickOrder() {
  const { createEnvioClickClient } = require('./src/lib/envio-click-client');
  
  const client = createEnvioClickClient();
  
  try {
    console.log('🚀 Creando orden con Envío Click...');
    
    const result = await client.createOrder(envioClickOrderPayload);
    
    if (result.success) {
      console.log('✅ Orden creada exitosamente!');
      console.log('📍 Endpoint usado:', result.endpoint);
      console.log('📦 Datos de respuesta:', JSON.stringify(result.data, null, 2));
      
      // Si la respuesta incluye un tracking number
      if (result.data.trackingNumber) {
        console.log('🔍 Número de tracking:', result.data.trackingNumber);
      }
      
      return result.data;
    } else {
      console.error('❌ Error al crear orden:', result.error);
      console.error('🔧 Endpoint probado:', result.endpoint);
      return null;
    }
  } catch (error) {
    console.error('💥 Error inesperado:', error.message);
    return null;
  }
}

async function getEnvioClickQuote() {
  const { createEnvioClickClient } = require('./src/lib/envio-click-client');
  
  const client = createEnvioClickClient();
  
  try {
    console.log('💰 Obteniendo cotización...');
    
    const result = await client.getShippingRates(envioClickQuotePayload);
    
    if (result.success) {
      console.log('✅ Cotización obtenida!');
      console.log('📍 Endpoint usado:', result.endpoint);
      console.log('💵 Tarifas:', JSON.stringify(result.data, null, 2));
      return result.data;
    } else {
      console.error('❌ Error al obtener cotización:', result.error);
      return null;
    }
  } catch (error) {
    console.error('💥 Error inesperado:', error.message);
    return null;
  }
}

async function trackEnvioClickShipment(trackingNumber) {
  const { createEnvioClickClient } = require('./src/lib/envio-click-client');
  
  const client = createEnvioClickClient();
  
  try {
    console.log('🔍 Rastreando envío:', trackingNumber);
    
    const result = await client.trackShipment(trackingNumber);
    
    if (result.success) {
      console.log('✅ Información de tracking obtenida!');
      console.log('📍 Endpoint usado:', result.endpoint);
      console.log('📋 Estado del envío:', JSON.stringify(result.data, null, 2));
      return result.data;
    } else {
      console.error('❌ Error al rastrear envío:', result.error);
      return null;
    }
  } catch (error) {
    console.error('💥 Error inesperado:', error.message);
    return null;
  }
}

async function ejemploCompletoEnvioClick() {
  console.log('🎯 === EJEMPLO COMPLETO ENVÍO CLICK ===\n');
  
  // 1. Obtener cotización
  console.log('1️⃣ Paso 1: Obtener cotización');
  const quote = await getEnvioClickQuote();
  
  if (quote) {
    console.log('\n2️⃣ Paso 2: Crear orden de envío');
    const order = await createEnvioClickOrder();
    
    if (order && order.trackingNumber) {
      console.log('\n3️⃣ Paso 3: Rastrear envío');
      await trackEnvioClickShipment(order.trackingNumber);
    }
  }
  
  console.log('\n🏁 Ejemplo completado.');
}

// Ejecutar el ejemplo completo
if (require.main === module) {
  ejemploCompletoEnvioClick().catch(console.error);
}

module.exports = {
  createOrderPayload,
  envioClickAPIFormat,
  envioClickOrderPayload,
  envioClickQuotePayload,
  createEnvioClickOrder,
  getEnvioClickQuote,
  trackEnvioClickShipment,
  ejemploCompletoEnvioClick
};