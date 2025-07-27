/**
 * Ejemplo de implementación de autenticación con Token API Key para SkyDropX
 * Este ejemplo muestra cómo hacer una solicitud a la API de SkyDropX
 * utilizando el método de autenticación con Token API Key.
 */

const fetch = require('node-fetch'); // Asegúrate de tener instalado: npm install node-fetch

// Configuración
const API_URL = 'https://api-demo.skydropx.com/v1'; // URL de sandbox
const API_KEY = 'TU_API_KEY'; // Reemplaza con tu API Key

/**
 * Realiza una solicitud a la API de SkyDropX utilizando autenticación con Token API Key
 * @param {string} endpoint - El endpoint de la API (sin la URL base)
 * @param {string} method - El método HTTP (GET, POST, etc.)
 * @param {object} payload - El cuerpo de la solicitud (para POST, PUT, etc.)
 * @returns {Promise<object>} - La respuesta de la API
 */
async function makeApiRequest(endpoint, method = 'GET', payload = null) {
  // Preparar los headers con el token de autenticación
  const headers = {
    'Authorization': `Token token=${API_KEY}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'User-Agent': 'Token-Example/1.0'
  };
  
  // Preparar el cuerpo de la solicitud
  const requestBody = payload ? JSON.stringify(payload) : undefined;
  
  // Realizar la solicitud
  const response = await fetch(`${API_URL}${endpoint}`, {
    method,
    headers,
    body: method !== 'GET' ? requestBody : undefined
  });
  
  // Verificar si la respuesta es exitosa
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error en solicitud: ${response.status} ${response.statusText}\n${errorText}`);
  }
  
  // Devolver la respuesta como JSON
  return await response.json();
}

// Ejemplo de uso: Crear un envío
async function createShipment() {
  try {
    // Payload de ejemplo para crear un envío
    const shipmentPayload = {
      address_from: {
        name: "Remitente de Prueba",
        email: "remitente@ejemplo.com",
        phone: "5555555555",
        street: "Av. Principal",
        number: "123",
        city: "Ciudad de México",
        state: "Ciudad de México",
        country: "MX",
        postal_code: "06500"
      },
      address_to: {
        name: "Destinatario de Prueba",
        email: "destinatario@ejemplo.com",
        phone: "5555555555",
        street: "Calle Secundaria",
        number: "456",
        city: "Guadalajara",
        state: "Jalisco",
        country: "MX",
        postal_code: "44100"
      },
      parcels: [{
        weight: 1,
        distance_unit: "CM",
        mass_unit: "KG",
        height: 10,
        width: 10,
        length: 10
      }],
      shipment: {
        carrier_accounts: ["FEDEX"],
        type: "ON_DEMAND",
        object_purpose: "PURCHASE"
      }
    };
    
    // Realizar la solicitud para crear el envío
    const result = await makeApiRequest('/shipments', 'POST', shipmentPayload);
    
    console.log('Envío creado exitosamente:');
    console.log(JSON.stringify(result, null, 2));
    
    return result;
  } catch (error) {
    console.error('Error al crear el envío:', error.message);
    throw error;
  }
}

// Ejecutar el ejemplo
createShipment()
  .then(shipment => {
    console.log(`ID del envío: ${shipment.id}`);
  })
  .catch(error => {
    console.error('Error en el ejemplo:', error);
  });