import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

const SKYDROPX_API_KEY = process.env.SKYDROPX_API_KEY
const SKYDROPX_API_SECRET = process.env.SKYDROPX_API_SECRET
const SKYDROPX_ENVIRONMENT = process.env.SKYDROPX_ENVIRONMENT || "sandbox"

// URLs oficiales según la documentación de SkyDropX 2025
// NOTA: A partir de enero 2025, la API actual dejará de recibir soporte
// Se debe migrar a la versión PRO para continuar usando la API
const SKYDROPX_PRODUCTION_URL = "https://api.skydropx.com/v1/"
const SKYDROPX_DEMO_URL = "https://api-demo.skydropx.com/"

// Lista de posibles URLs de sandbox para probar
const POSSIBLE_SANDBOX_URLS = [
  SKYDROPX_DEMO_URL,
  "https://api-demo.skydropx.com/v1/",
  "https://api.skydropx.com/v1/"
]

// Variables para la URL de la API
// Según la documentación oficial 2025:
// - Producción: https://api.skydropx.com/v1/
// - Demo: https://api-demo.skydropx.com/
const SKYDROPX_API_URL = process.env.SKYDROPX_API_URL || 
  (process.env.SKYDROPX_ENVIRONMENT === "production" ? 
    SKYDROPX_PRODUCTION_URL : 
    SKYDROPX_DEMO_URL)
const SKYDROPX_API_VERSION = process.env.SKYDROPX_API_VERSION || "v1"

// Función para generar firma HMAC-SHA512 para autenticación segura
import crypto from 'crypto';

// Función para generar firma HMAC-SHA512
function generateHmacSignature(requestBody: string, secretKey: string): string {
  // Crear la cadena de firma usando el cuerpo de la solicitud
  const rawRequestBody = requestBody;
  
  // Calcular HMAC-SHA512 utilizando la clave secreta
  const hmac = crypto.createHmac('sha512', secretKey);
  hmac.update(rawRequestBody);
  
  // Devolver la firma en formato hexadecimal
  return hmac.digest('hex');
}

// NOTA: SkyDropX no usa Bearer Tokens tradicionales
// Según la documentación oficial, usa autenticación con API Key directamente:
// Authorization: Token token=YOUR_API_KEY
// Esta función se mantiene para compatibilidad pero retorna la API Key
async function generateBearerToken(): Promise<string | null> {
  const API_KEY = process.env.SKYDROPX_API_KEY;
  
  if (!API_KEY) {
    console.log("❌ Falta la API Key de SkyDropX");
    return null;
  }
  
  console.log(`🔑 Usando API Key como token de autenticación...`);
  console.log('✅ API Key configurada correctamente!');
  
  // SkyDropX usa la API Key directamente, no genera Bearer tokens
  return API_KEY;
}

// Función OAuth2 (método alternativo)
async function getOAuth2Token(): Promise<string | null> {
  const CLIENT_ID = process.env.SKYDROPX_CLIENT_ID;
  const CLIENT_SECRET = process.env.SKYDROPX_CLIENT_SECRET;
  
  if (!CLIENT_ID || !CLIENT_SECRET) {
    console.log("❌ Faltan credenciales OAuth2 (CLIENT_ID o CLIENT_SECRET)");
    return null;
  }
  
  const baseUrl = SKYDROPX_API_URL;
  const tokenUrl = '/api/v1/oauth/token';
  
  try {
    const response = await fetch(`${baseUrl}${tokenUrl}`, {
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
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Token OAuth2 obtenido exitosamente!');
      return data.access_token;
    } else {
      const errorText = await response.text();
      console.log(`❌ Error obteniendo token OAuth2: ${errorText}`);
      return null;
    }
  } catch (error) {
    console.log(`💥 Error de conexión OAuth2: ${error instanceof Error ? error.message : String(error)}`);
    return null;
  }
}

// Función para encontrar la URL correcta de la API
async function findCorrectApiUrl(): Promise<{ url: string; strategy: string; headers: Record<string, string>; migrationRequired?: boolean } | null> {
  console.log("🔍 Verificando conectividad con SkyDropX...")

  // URLs oficiales según la documentación de SkyDropX 2025
  const urlsToTest = [
    { url: "https://api.skydropx.com/v1", env: "production" },
    { url: "https://api-demo.skydropx.com/v1", env: "demo" },
    { url: "https://api-demo.skydropx.com", env: "demo-alt" },
    { url: SKYDROPX_API_URL.endsWith('/') ? SKYDROPX_API_URL.slice(0, -1) : SKYDROPX_API_URL, env: "custom" }
  ];
  
  console.log(`🌐 URLs a probar: ${JSON.stringify(urlsToTest.map(u => u.url), null, 2)}`);

  let authErrors = [];

  // Probar cada URL con el método oficial de SkyDropX: Token token=YOUR_API_KEY
  for (const { url: testUrl, env } of urlsToTest) {
    console.log(`\n🔗 Probando ${env}: ${testUrl}`);
    
    if (SKYDROPX_API_KEY) {
      const tokenHeaders = {
        Authorization: `Token token=${SKYDROPX_API_KEY}`,
        "Content-Type": "application/json",
        Accept: "application/json",
        "User-Agent": "Bazar-Ecommerce/1.0",
      };
      
      try {
        const response = await fetch(`${testUrl}/carriers`, {
          method: "GET",
          headers: tokenHeaders,
        });
        
        console.log(`    Status: ${response.status} ${response.statusText}`);
        
        if (response.ok) {
          const data = await response.json();
          console.log(`✅ Conectado exitosamente a ${env}: ${testUrl}`);
          console.log(`    Carriers encontrados: ${Array.isArray(data.data) ? data.data.length : "N/A"}`);
          return {
            url: testUrl,
            strategy: "Token token=",
            headers: tokenHeaders,
          };
        } else {
          const errorText = await response.text();
          console.log(`    ❌ Error: ${response.status} - ${errorText.substring(0, 100)}`);
          
          if (response.status === 401) {
            authErrors.push({ url: testUrl, status: response.status, error: errorText });
          }
        }
      } catch (error) {
        console.log(`    💥 Error de conexión: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  }

  // Si todos los errores son 401, significa que las URLs funcionan pero las credenciales no
  if (authErrors.length > 0) {
    console.log("⚠️  URLs de SkyDropX responden pero credenciales inválidas");
    console.log("📧 Migración a SkyDropX PRO requerida desde enero 2025");
    return {
      url: authErrors[0].url,
      strategy: "Migration Required",
      headers: {},
      migrationRequired: true
    };
  }

  console.log("❌ No se pudo conectar con ninguna URL usando el método oficial de SkyDropX");
  console.log("💡 Verifica que tengas credenciales válidas de SkyDropx");
  console.log("📧 Contacta a hola@skydropx.com para obtener credenciales válidas");
  
  return null;
}

// Función para probar conectividad básica con Skydropx
async function testSkydropxConnection() {
  const result = await findCorrectApiUrl()

  if (result) {
    try {
      // Intentar obtener la lista de carriers para verificar que la conexión funciona
      const response = await fetch(`${result.url}/carriers`, {
        method: "GET",
        headers: result.headers,
      })

      if (response.ok) {
        const carriers = await response.json()
        return {
          success: true,
          strategy: result.strategy,
          headers: result.headers,
          data: carriers, // Datos reales de carriers
          apiUrl: result.url,
        }
      } else {
        return {
          success: false,
          error: `Error al obtener carriers: ${response.status} ${response.statusText}`,
          apiUrl: result.url,
          strategy: result.strategy,
        }
      }
    } catch (error) {
      return {
        success: false,
        error: `Error de conexión: ${error instanceof Error ? error.message : String(error)}`,
        apiUrl: result.url,
        strategy: result.strategy,
      }
    }
  }

  return {
    success: false,
    error: "No se pudo autenticar con la API de Skydropx",
  }
}

// Función para autenticar con un método específico
async function authenticateWithSpecificMethod(payload: any, authMethod: string) {
  console.log(`🔐 Usando método de autenticación específico: ${authMethod}`)
  
  // Construir la URL completa
  const baseUrl = SKYDROPX_API_URL
  const apiPath = SKYDROPX_API_VERSION.startsWith("/") ? SKYDROPX_API_VERSION : `/api/${SKYDROPX_API_VERSION}`
  const fullUrl = `${baseUrl}${apiPath}`
  
  let headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    "User-Agent": "Bazar-Ecommerce/1.0",
  }
  
  // Configurar los headers según el método de autenticación
  switch (authMethod) {
    case 'oauth2':
    case 'bearer':
      const token = await getOAuth2Token()
      if (!token) {
        return {
          success: false,
          error: "No se pudo obtener token OAuth2",
          details: "Verifica las credenciales CLIENT_ID y CLIENT_SECRET",
        }
      }
      headers.Authorization = `Bearer ${token}`
      break
      
    case 'hmac':
    case 'hmac-sha512':
      if (!SKYDROPX_API_SECRET) {
        return {
          success: false,
          error: "No se puede usar HMAC-SHA512 sin API_SECRET",
          details: "Configura SKYDROPX_API_SECRET en las variables de entorno",
        }
      }
      const payloadStr = JSON.stringify(payload)
      const signature = generateHmacSignature(payloadStr, SKYDROPX_API_SECRET)
      headers.Authorization = `HMAC-SHA512 ${signature}`
      break
      
    case 'token':
    case 'api-key':
      if (!SKYDROPX_API_KEY) {
        return {
          success: false,
          error: "No se puede usar Token sin API_KEY",
          details: "Configura SKYDROPX_API_KEY en las variables de entorno",
        }
      }
      headers.Authorization = `Token token=${SKYDROPX_API_KEY}`
      break
      
    default:
      return {
        success: false,
        error: `Método de autenticación desconocido: ${authMethod}`,
        details: "Métodos válidos: oauth2, hmac, token",
      }
  }
  
  try {
    // Realizar la petición con los headers configurados
    const response = await fetch(`${fullUrl}/shipments`, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    })
    
    console.log(`Creación de shipment con ${authMethod}: Status ${response.status}`)
    
    if (response.ok) {
      const data = await response.json()
      return {
        success: true,
        data,
        strategy: authMethod,
        headers,
        apiUrl: fullUrl,
      }
    } else {
      const errorText = await response.text()
      console.error(`Error creando shipment con ${authMethod}:`, errorText)
      
      return {
        success: false,
        error: errorText,
        status: response.status,
        strategy: authMethod,
        apiUrl: fullUrl,
      }
    }
  } catch (error) {
    console.error(`Error en creación de shipment con ${authMethod}:`, error)
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
      strategy: authMethod,
    }
  }
}

// Función mejorada para autenticar con Skydropx
async function authenticateWithSkydropx(payload: any, authMethod: string = 'oauth2') {
  if (!SKYDROPX_API_KEY && !process.env.SKYDROPX_CLIENT_ID) {
    throw new Error("No hay credenciales configuradas (ni API_KEY ni CLIENT_ID)")
  }

  // Si se especifica un método de autenticación específico
  if (authMethod !== 'auto') {
    return await authenticateWithSpecificMethod(payload, authMethod);
  }

  // Primero encontrar la URL correcta y estrategia de autenticación
  const apiResult = await findCorrectApiUrl()

  if (!apiResult) {
    return {
      success: false,
      error: "No se pudo autenticar con la API de Skydropx",
      details: "Probamos múltiples estrategias de autenticación sin éxito",
    }
  }

  console.log(`🎯 Usando URL: ${apiResult.url} con estrategia: ${apiResult.strategy}`)

  try {
    // Preparar los headers según la estrategia
    let headers = apiResult.headers;
    
    // Si la estrategia es HMAC-SHA512, necesitamos generar la firma con el payload actual
    if (apiResult.strategy === "HMAC-SHA512") {
      const payloadStr = JSON.stringify(payload);
      const signature = generateHmacSignature(payloadStr, SKYDROPX_API_SECRET || "");
      headers = {
        ...headers,
        Authorization: `HMAC-SHA512 ${signature}`
      };
    }
    
    // Usar la URL y estrategia que funcionó para crear el shipment
    const response = await fetch(`${apiResult.url}/shipments`, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(payload),
    })

    console.log(`Creación de shipment: Status ${response.status}`)

    if (response.ok) {
      const data = await response.json()
      return {
        success: true,
        data,
        strategy: apiResult.strategy,
        headers: apiResult.headers,
        apiUrl: apiResult.url,
      }
    } else {
      const errorText = await response.text()
      console.error("Error creando shipment:", errorText)

      return {
        success: false,
        error: errorText,
        status: response.status,
        strategy: apiResult.strategy,
        apiUrl: apiResult.url,
      }
    }
  } catch (error) {
    console.error("Error en creación de shipment:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

function debugCredentials() {
  console.log("=== DEBUG CREDENCIALES SKYDROPX ===")
  console.log("🏖️  MODO SANDBOX DETECTADO")
  console.log("Entorno:", SKYDROPX_ENVIRONMENT)
  console.log(
    "URLs a probar:",
    SKYDROPX_ENVIRONMENT === "production" ? [SKYDROPX_PRODUCTION_URL] : POSSIBLE_SANDBOX_URLS,
  )
  console.log("API Key presente:", !!SKYDROPX_API_KEY)
  console.log("API Key longitud:", SKYDROPX_API_KEY?.length || 0)
  console.log("API Secret presente:", !!SKYDROPX_API_SECRET)
  console.log("API Secret longitud:", SKYDROPX_API_SECRET?.length || 0)
  console.log("API Key (primeros 10 chars):", SKYDROPX_API_KEY?.substring(0, 10) + "...")
  console.log("=====================================")
}

// Tipos para mejor tipado
interface SkydropxAddress {
  name: string
  company?: string
  email: string
  phone: string
  street: string
  city: string
  state: string
  country: string
  postal_code: string
  reference?: string
  contents?: string
}

interface SkydropxParcel {
  weight: number
  distance_unit: string
  mass_unit: string
  height: number
  width: number
  length: number
  external_id?: string
}

interface SkydropxShipment {
  carrier_accounts: string[]
  type: string
  object_purpose: string
  reference?: string
  contents?: string
  customs_info?: {
    contents_type: string
    contents_explanation: string
    restriction_type: string
    restriction_comments: string
    customs_certify: boolean
    customs_signer: string
    non_delivery_option: string
    eel_pfc: string
    customs_items: Array<{
      description: string
      quantity: number
      price: number
      weight: number
      hs_tariff_number: string
      origin_country: string
    }>
  }
}

// Códigos oficiales de paqueterías según Skydropx
const AVAILABLE_CARRIERS = [
  "99 minutos",
  "paquetexpress",
  "quiken",
  "sendex",
  "dhl",
  "estafeta",
  "fedex",
  "ups",
  "ampm",
  "jtexpress",
  "carssa",
]

const CARRIERS_REQUIRING_VERIFICATION = ["paquetexpress", "estafeta", "jtexpress", "carssa", "ampm", "ups"]

const PACKAGE_TYPES = {
  "1": "Caja",
  "2": "Sobre",
  "3": "Bolsa",
  "4": "Tubo",
  "5": "Pallet",
  "6": "Otro",
} as const

export async function POST(req: Request) {
  try {
    // Debug credenciales
    debugCredentials()

    const {
      orderId,
      selectedCarrier,
      customWeight,
      requireCartaPorte = false,
      packageType = "1",
      customsInfo = null,
      authMethod = 'auto',
    } = await req.json()

    if (!orderId) {
      return NextResponse.json({ error: "ID de pedido requerido" }, { status: 400 })
    }

    if (!SKYDROPX_API_KEY) {
      console.error("SKYDROPX_API_KEY no está configurada en las variables de entorno")
      return NextResponse.json(
        {
          error: "API Key de Skydropx no configurada",
          details: "Verifique que SKYDROPX_API_KEY esté configurada en el archivo .env",
        },
        { status: 500 },
      )
    }

    // Obtener el pedido con información del usuario
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    })

    if (!order) {
      return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 })
    }

    // Validar que el pedido esté en estado válido para envío
    if (!["CONFIRMED", "PROCESSING"].includes(order.status)) {
      return NextResponse.json(
        {
          error: "El pedido debe estar confirmado o en procesamiento para generar etiqueta",
        },
        { status: 400 },
      )
    }

    // Extraer información de dirección del pedido
    const addressInfo = extractAddressFromNotes(order.notes || "")
    console.log("Información de dirección extraída:", addressInfo)

    // Validar información de dirección
    if (!addressInfo.street || !addressInfo.city || !addressInfo.postalCode) {
      return NextResponse.json(
        {
          error: "Información de dirección incompleta",
          details: `Faltan datos: ${!addressInfo.street ? "dirección, " : ""}${!addressInfo.city ? "ciudad, " : ""}${!addressInfo.postalCode ? "código postal" : ""}`,
          addressFound: addressInfo,
          orderNotes: order.notes,
        },
        { status: 400 },
      )
    }

    // Validar código postal mexicano
    if (addressInfo.country === "MX" && (!addressInfo.postalCode || addressInfo.postalCode.length !== 5)) {
      return NextResponse.json(
        {
          error: "Código postal inválido",
          details: "El código postal debe tener 5 dígitos para México",
        },
        { status: 400 },
      )
    }

    // Calcular peso del paquete basado en productos
    const packageWeight = calculatePackageWeight(order.items, customWeight)

    // Crear el payload para Skydropx
    const skydropxPayload = {
      address_from: createOriginAddress(),
      address_to: createDestinationAddress(addressInfo, order),
      parcels: [createParcel(packageWeight, packageType)],
      shipment: createShipment(selectedCarrier, orderId, requireCartaPorte, customsInfo),
    }

    console.log("Payload para Skydropx:", JSON.stringify(skydropxPayload, null, 2))

    // Intentar autenticación con el método especificado o automático
    console.log(`🔑 Método de autenticación solicitado: ${authMethod}`);
    const authResult = await authenticateWithSkydropx(skydropxPayload, authMethod)

    if (!authResult.success) {
      return NextResponse.json(
        {
          error: "Error de autenticación con Skydropx",
          details: authResult.error,
          status: authResult.status || 401,
          environment: SKYDROPX_ENVIRONMENT,
          api_url: authResult.apiUrl || "No encontrada",
          suggestions: [
            "Verifica que tus credenciales sean válidas para el entorno sandbox",
            "Asegúrate de que tu cuenta Skydropx esté activa",
            "Verifica que tengas permisos para crear envíos en sandbox",
            "Contacta a soporte de Skydropx para verificar la URL correcta de sandbox",
          ],
        },
        { status: authResult.status || 401 },
      )
    }

    const shipmentData = authResult.data
    console.log("✅ Envío creado exitosamente:", shipmentData.id)
    console.log("🔐 Estrategia de auth exitosa:", authResult.strategy)
    console.log("🌐 URL de API exitosa:", authResult.apiUrl)

    // Validar que hay tarifas disponibles
    if (!shipmentData.rates || shipmentData.rates.length === 0) {
      return NextResponse.json(
        {
          error: "No hay tarifas disponibles para esta ruta. Verifique la dirección y carriers configurados.",
        },
        { status: 400 },
      )
    }

    // Seleccionar la mejor tarifa (más económica)
    const bestRate = selectBestRate(shipmentData.rates)

    // Generar etiqueta usando los headers exitosos
    const labelResponse = await fetch(`${authResult.apiUrl}/shipments/${shipmentData.id}/labels`, {
      method: "POST",
      headers: authResult.headers,
      body: JSON.stringify({
        rate_id: bestRate.id,
        label_file_type: "PDF",
        label_size: "4X6",
      }),
    })

    if (!labelResponse.ok) {
      const errorData = await labelResponse.text()
      console.error("Error al generar etiqueta:", errorData)
      let errorDetails = errorData
      try {
        const errorJson = JSON.parse(errorData)
        errorDetails = errorJson.error_description || errorJson.error || errorData
      } catch (e) {
        // Si no es JSON, usar el texto tal como está
      }
      return NextResponse.json(
        {
          error: "Error al generar etiqueta",
          details: errorDetails,
          status: labelResponse.status,
          skydropx_error: errorData,
        },
        { status: labelResponse.status },
      )
    }

    const labelData = await labelResponse.json()
    console.log("✅ Etiqueta generada:", labelData.id)

    // Actualizar el pedido con información del envío
    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: "SHIPPED",
        notes: `${order.notes || ""}\n\n=== INFORMACIÓN DE ENVÍO ===
Enviado con Skydropx (${SKYDROPX_ENVIRONMENT})
URL API: ${authResult.apiUrl}
Tracking: ${labelData.tracking_number || "N/A"}
Carrier: ${bestRate.carrier || "N/A"}
Servicio: ${bestRate.service || "N/A"}
Precio: $${bestRate.rate || "N/A"}
Fecha de envío: ${new Date().toLocaleDateString()}
ID de envío: ${shipmentData.id}
Tipo de empaque: ${PACKAGE_TYPES[packageType as keyof typeof PACKAGE_TYPES] || "Caja"}
Carta Porte: ${requireCartaPorte ? "Sí" : "No"}
Método de auth: ${authResult.strategy}`,
      },
    })

    return NextResponse.json({
      success: true,
      environment: SKYDROPX_ENVIRONMENT,
      api_url: authResult.apiUrl,
      shipment: {
        id: shipmentData.id,
        rates: shipmentData.rates,
        selected_rate: bestRate,
      },
      label: {
        id: labelData.id,
        tracking_number: labelData.tracking_number,
        label_url: labelData.label_url,
        carrier: bestRate.carrier,
        service: bestRate.service,
        rate: bestRate.rate,
      },
      tracking_number: labelData.tracking_number,
      carrier: bestRate.carrier,
      service: bestRate.service,
      rate: bestRate.rate,
      requires_verification: CARRIERS_REQUIRING_VERIFICATION.includes(bestRate.carrier),
      auth_method: authResult.strategy,
    })
  } catch (error: any) {
    console.error("Error en Skydropx API:", error)

    return NextResponse.json(
      {
        error: "Error interno del servidor",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

// Funciones auxiliares (mantienen la misma implementación)
function createOriginAddress(): SkydropxAddress {
  return {
    name: "Bazar Ecommerce",
    company: "Bazar Ecommerce S.A. de C.V.",
    email: "envios@bazar.com",
    phone: "+525512345678",
    street: "Av. Insurgentes Sur 1234",
    city: "Ciudad de México",
    state: "CDMX",
    country: "MX",
    postal_code: "03100",
    reference: "Bodega Principal - Edificio A",
    contents: "Ropa y accesorios de moda",
  }
}

function createDestinationAddress(addressInfo: any, order: any): SkydropxAddress {
  let phone = addressInfo.phone || ""
  if (phone && !phone.startsWith("+") && phone.length === 10) {
    phone = `+52${phone}`
  }

  const stateCode = normalizeStateCode(addressInfo.state || "")

  return {
    name: addressInfo.name || order.user?.name || "Cliente",
    company: addressInfo.company || "",
    email: order.user?.email || "",
    phone: phone,
    street: addressInfo.street,
    city: addressInfo.city,
    state: stateCode,
    country: addressInfo.country || "MX",
    postal_code: addressInfo.postalCode,
    reference: `Pedido #${order.id} - Entrega domicilio`,
    contents: `Pedido de ${order.items?.length || 0} artículos`,
  }
}

function normalizeStateCode(state: string): string {
  const stateCodes: Record<string, string> = {
    "ciudad de mexico": "CDMX",
    cdmx: "CDMX",
    df: "CDMX",
    jalisco: "JAL",
    "nuevo leon": "NL",
    "nuevo león": "NL",
    "estado de mexico": "MEX",
    "estado de méxico": "MEX",
    veracruz: "VER",
    puebla: "PUE",
    guanajuato: "GTO",
    chihuahua: "CHH",
    sonora: "SON",
    coahuila: "COA",
    oaxaca: "OAX",
    tamaulipas: "TAM",
    guerrero: "GRO",
    "baja california": "BC",
    sinaloa: "SIN",
    michoacan: "MICH",
    michoacán: "MICH",
  }

  const normalized = state.toLowerCase().trim()
  return stateCodes[normalized] || state.toUpperCase()
}

function createParcel(weight: number, packageType = "1"): SkydropxParcel {
  const packageDimensions = {
    "1": { height: 20, width: 30, length: 40 }, // Caja estándar
    "2": { height: 2, width: 23, length: 32 }, // Sobre
    "3": { height: 15, width: 25, length: 35 }, // Bolsa
    "4": { height: 80, width: 10, length: 10 }, // Tubo
    "5": { height: 120, width: 100, length: 120 }, // Pallet
    "6": { height: 25, width: 25, length: 25 }, // Otro
  }

  const dimensions = packageDimensions[packageType as keyof typeof packageDimensions] || packageDimensions["1"]

  return {
    weight: Math.max(0.1, weight),
    distance_unit: "CM",
    mass_unit: "KG",
    height: dimensions.height,
    width: dimensions.width,
    length: dimensions.length,
    external_id: `PKG_${Date.now()}_${packageType}`,
  }
}

function createShipment(
  selectedCarrier?: string,
  orderId?: string,
  requireCartaPorte = false,
  customsInfo: any = null,
): SkydropxShipment {
  const carriers = selectedCarrier ? [selectedCarrier] : AVAILABLE_CARRIERS

  const shipment: SkydropxShipment = {
    carrier_accounts: carriers,
    type: "outbound",
    object_purpose: "PURCHASE",
    reference: `BAZAR-${orderId}`,
    contents: "Ropa, accesorios y artículos de moda",
  }

  if (requireCartaPorte && customsInfo) {
    shipment.customs_info = {
      contents_type: "merchandise",
      contents_explanation: "Productos textiles y accesorios de moda para uso personal",
      restriction_type: "none",
      restriction_comments: "Sin restricciones especiales",
      customs_certify: true,
      customs_signer: "Bazar Ecommerce S.A. de C.V.",
      non_delivery_option: "return",
      eel_pfc: "NOEEI 30.37(a)",
      customs_items: customsInfo.items || [],
    }
  }

  return shipment
}

function calculatePackageWeight(items: any[], customWeight?: number): number {
  if (customWeight && customWeight > 0) {
    return customWeight
  }

  const baseWeightPerItem = 0.3
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
  return Math.max(0.5, totalItems * baseWeightPerItem)
}

function selectBestRate(rates: any[]): any {
  const sortedRates = rates.sort((a, b) => Number.parseFloat(a.rate) - Number.parseFloat(b.rate))
  const preferredCarriers = ["fedex", "ups", "dhl", "estafeta"]

  for (const carrier of preferredCarriers) {
    const preferredRate = sortedRates.find((rate) => rate.carrier === carrier)
    if (preferredRate) {
      return preferredRate
    }
  }

  return sortedRates[0]
}

function extractAddressFromNotes(notes: string) {
  const addressInfo = {
    name: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    country: "MX",
    postalCode: "",
  }

  const nameMatch = notes.match(/Compra realizada por ([^.]+)/)
  if (nameMatch) {
    addressInfo.name = nameMatch[1].trim()
  }

  const addressMatch = notes.match(/Dirección: ([^,]+), ([^,]+), ([^,]+), ([^,]+), ([^.]+)/)
  if (addressMatch) {
    addressInfo.street = addressMatch[1].trim()
    addressInfo.city = addressMatch[2].trim()
    addressInfo.state = addressMatch[3].trim()
    addressInfo.postalCode = addressMatch[4].trim()
    addressInfo.country = addressMatch[5].trim()
  }

  const phoneMatch = notes.match(/Teléfono: ([^.]+)/)
  if (phoneMatch) {
    addressInfo.phone = phoneMatch[1].trim()
  }

  return addressInfo
}

// Endpoint para obtener carriers disponibles
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action');

    // Endpoint específico para generar Bearer Token (ya no aplicable para SkyDropX)
    if (action === 'generate-token') {
      return NextResponse.json({ 
        success: false, 
        error: 'SkyDropX no utiliza Bearer Tokens. Usa autenticación directa con API Key.',
        migration_info: {
          message: 'A partir de enero 2025, SkyDropX requiere migración a la versión PRO',
          contact: 'hola@skydropx.com',
          documentation: 'https://docs.skydropx.com/'
        }
      }, { status: 400 });
    }

    // Endpoint por defecto - test de conexión
    console.log('\n=== VERIFICACIÓN DE CONECTIVIDAD SKYDROPX 2025 ===');
    debugCredentials();

    if (!SKYDROPX_API_KEY) {
      return NextResponse.json(
        {
          error: "API Key de Skydropx no configurada",
          migration_info: {
            message: 'Configura SKYDROPX_API_KEY con credenciales válidas de SkyDropX PRO',
            contact: 'hola@skydropx.com',
            documentation: 'https://docs.skydropx.com/'
          },
          available_carriers: AVAILABLE_CARRIERS,
          carriers_requiring_verification: CARRIERS_REQUIRING_VERIFICATION,
          package_types: PACKAGE_TYPES
        },
        { status: 500 },
      )
    }

    // Buscar URL correcta y verificar conectividad
    const apiConfig = await findCorrectApiUrl();
    
    if (!apiConfig) {
      return NextResponse.json({
        success: false,
        error: 'No se pudo conectar a la API de SkyDropX',
        migration_required: true,
        migration_info: {
          message: 'A partir de enero 2025, la versión actual de la API de SkyDropX dejó de recibir soporte',
          action_required: 'Migrar a SkyDropX PRO',
          steps: [
            '1. Crear cuenta en SkyDropX PRO',
            '2. Ir a Conexiones > API',
            '3. Obtener nuevas credenciales',
            '4. Actualizar configuración'
          ],
          contact: 'hola@skydropx.com',
          documentation: 'https://docs.skydropx.com/'
        },
        debug: {
          environment: SKYDROPX_ENVIRONMENT,
          api_key_present: !!SKYDROPX_API_KEY,
          api_secret_present: !!SKYDROPX_API_SECRET,
          tested_urls: ['https://api.skydropx.com/v1', 'https://api-demo.skydropx.com/v1']
        }
      }, { status: 503 });
    }

    // Si se requiere migración
    if (apiConfig.migrationRequired) {
      return NextResponse.json({
        success: false,
        error: 'Credenciales de SkyDropX inválidas - Migración requerida',
        migration_required: true,
        migration_info: {
          message: 'Las URLs de SkyDropX responden pero las credenciales son inválidas',
          reason: 'A partir de enero 2025, SkyDropX requiere migración a la versión PRO',
          action_required: 'Obtener nuevas credenciales de SkyDropX PRO',
          steps: [
            '1. Crear cuenta en SkyDropX PRO',
            '2. Ir a Conexiones > API en el panel de SkyDropX PRO',
            '3. Generar nuevas credenciales API',
            '4. Actualizar SKYDROPX_API_KEY en tu archivo .env',
            '5. Reiniciar la aplicación'
          ],
          contact: 'hola@skydropx.com',
          documentation: 'https://docs.skydropx.com/',
          current_status: 'URLs funcionan pero credenciales obsoletas'
        },
        debug: {
          environment: SKYDROPX_ENVIRONMENT,
          api_key_present: !!SKYDROPX_API_KEY,
          api_key_length: SKYDROPX_API_KEY ? SKYDROPX_API_KEY.length : 0,
          working_url: apiConfig.url,
          auth_status: '401 Unauthorized'
        }
      }, { status: 401 });
    }

    // Obtener carriers para verificar conectividad
    const carriersResponse = await fetch(`${apiConfig.url}/carriers`, {
      method: 'GET',
      headers: apiConfig.headers
    });

    if (!carriersResponse.ok) {
      throw new Error(`Error al obtener carriers: ${carriersResponse.status}`);
    }

    const carriersData = await carriersResponse.json();
    console.log("Carriers obtenidos de Skydropx:", Array.isArray(carriersData.data) ? carriersData.data.length : 0)

    const configuredCarriers = Array.isArray(carriersData.data)
      ? carriersData.data.map((carrier: any) => carrier.carrier || carrier.name).filter(Boolean)
      : []

    return NextResponse.json({
      success: true,
      message: 'Conexión exitosa con SkyDropX',
      environment: SKYDROPX_ENVIRONMENT,
      api_url: apiConfig.url,
      auth_method: apiConfig.strategy,
      carriers: carriersData.data,
      configured_carriers: configuredCarriers,
      available_carriers: AVAILABLE_CARRIERS,
      carriers_requiring_verification: CARRIERS_REQUIRING_VERIFICATION,
      package_types: PACKAGE_TYPES,
      status: 'Conectado correctamente a SkyDropX',
      metadata: {
        total_configured: configuredCarriers.length,
        api_status: "active",
        last_updated: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error("Error al obtener carriers:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Error interno del servidor",
        details: error instanceof Error ? error.message : String(error),
        migration_info: {
          message: 'Si el error persiste, puede ser necesario migrar a SkyDropX PRO',
          contact: 'hola@skydropx.com',
          documentation: 'https://docs.skydropx.com/'
        },
        debug: {
          api_key_present: !!SKYDROPX_API_KEY,
          api_secret_present: !!SKYDROPX_API_SECRET,
          environment: SKYDROPX_ENVIRONMENT
        },
        available_carriers: AVAILABLE_CARRIERS,
        carriers_requiring_verification: CARRIERS_REQUIRING_VERIFICATION,
        package_types: PACKAGE_TYPES
      },
      { status: 500 },
    )
  }
}

// === FUNCIÓN DE PRUEBA DE CONEXIÓN CON BEARER TOKEN MANUAL ===
export async function testBearerConnection(token: string) {
  const apiUrl = SKYDROPX_API_URL.endsWith('/') ? SKYDROPX_API_URL.slice(0, -1) : SKYDROPX_API_URL;
  try {
    const response = await fetch(`${apiUrl}/carriers`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'Bazar-Ecommerce/1.0',
      },
    });
    const data = await response.json();
    return {
      status: response.status,
      ok: response.ok,
      data,
    };
  } catch (error) {
    return {
      status: 500,
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
