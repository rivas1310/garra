/**
 * Ejemplo de implementación de autenticación OAuth2 para SkyDropX
 * Este ejemplo muestra cómo obtener un token OAuth2 y hacer una solicitud
 * a la API de SkyDropX utilizando este método de autenticación.
 */

const fetch = require('node-fetch'); // Asegúrate de tener instalado: npm install node-fetch

// Configuración
const API_URL = 'https://api-demo.skydropx.com'; // URL de sandbox
const CLIENT_ID = 'TU_CLIENT_ID'; // Reemplaza con tu Client ID
const CLIENT_SECRET = 'TU_CLIENT_SECRET'; // Reemplaza con tu Client Secret

/**
 * Obtiene un token OAuth2 utilizando el flujo client_credentials
 * @returns {Promise<string>} - El token de acceso
 */
async function getOAuth2Token() {
  const tokenUrl = `${API_URL}/api/v1/oauth/token`;
  
  try {
    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        "client_id": CLIENT_ID,
        "client_secret": CLIENT_SECRET,
        "grant_type": "client_credentials",
        "redirect_uri": "urn:ietf:wg:oauth:2.0:oob",
        "scope": "default orders.create"
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error obteniendo token OAuth2: ${response.status} ${response.statusText}\n${errorText}`);
    }
    
    const data = await response.json();
    console.log('✅ Token OAuth2 obtenido exitosamente!');
    return data.access_token;
  } catch (error) {
    console.error(`💥 Error de conexión OAuth2: ${error.message}`);
    throw error;
  }
}

/**
 * Realiza una solicitud a la API de SkyDropX utilizando autenticación OAuth2
 * @param {string} endpoint - El endpoint de la API (sin la URL base)
 * @param {string} method - El método HTTP (GET, POST, etc.)
 * @param {object} payload - El cuerpo de la solicitud (para POST, PUT, etc.)
 * @returns {Promise<object>} - La respuesta de la API
 */
async function makeApiRequest(endpoint, method = 'GET', payload = null) {
  // Obtener el token OAuth2
  const token = await getOAuth2Token();
  
  // Preparar los headers
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'User-Agent': 'OAuth2-Example/1.0'
  };
  
  // Preparar el cuerpo de la solicitud
  const requestBody = payload ? JSON.stringify(payload) : undefined;
  
  // Realizar la solicitud
  const response = await fetch(`${API_URL}/v1${endpoint}`, {
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