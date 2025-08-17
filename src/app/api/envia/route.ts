import { NextResponse } from "next/server";
import { log } from '@/lib/secureLogger'
import prisma from "@/lib/prisma";

const ENVIA_API_TOKEN = process.env.ENVIA_API_TOKEN;
const ENVIA_API_EMAIL = process.env.ENVIA_API_EMAIL;
const ENVIA_API_USER = process.env.ENVIA_API_USER;
const ENVIA_API_ENVIRONMENT = process.env.ENVIA_API_ENVIRONMENT || "test";

// URL base según el entorno
const BASE_URL = ENVIA_API_ENVIRONMENT === "production"
  ? "https://api.envia.com"
  : "https://api-test.envia.com";

// Tipos para mejor tipado (actualizado según formato oficial de Envia.com)
interface EnviaAddress {
  name: string;
  company?: string;
  email: string;
  phone: string;
  street: string;
  number: string;
  district?: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  reference?: string;
}

interface EnviaPackage {
  content: string;
  amount: number;
  type: string;
  weightUnit: string;
  lengthUnit: string;
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  weight: number;
  declaredValue?: number;
  name?: string;
}

interface EnviaShipment {
  carrier: string;
  service: string;
  type: number;
}

// Códigos oficiales de paqueterías según Envia.com
const AVAILABLE_CARRIERS = [
  "fedex",
  "dhl",
  "estafeta",
  "redpack",
  "ups",
  "ampm",
  "noventa_minutos",
  "sendex",
  "carssa",
  "paquetexpress",
  "quiken",
];

const CARRIERS_REQUIRING_VERIFICATION = ["paquetexpress", "estafeta", "carssa", "ampm", "ups"];

const PACKAGE_TYPES = {
  "box": "Caja",
  "envelope": "Sobre",
  "bag": "Bolsa",
  "tube": "Tubo",
  "pallet": "Pallet",
  "other": "Otro",
} as const;

// Función para probar conectividad básica con Envia.com
async function testEnviaConnection() {
  if (!ENVIA_API_TOKEN) {
    return {
      success: false,
      error: "ENVIA_API_TOKEN no configurado",
    };
  }

  try {
    const response = await fetch(`${BASE_URL}/ship/carriers`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${ENVIA_API_TOKEN}`,
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
    });

    if (response.ok) {
      const data = await response.json();
      return {
        success: true,
        data,
        apiUrl: BASE_URL,
      };
    } else {
      const errorText = await response.text();
      return {
        success: false,
        error: errorText,
        status: response.status,
        apiUrl: BASE_URL,
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

// Función para generar envío con Envia.com
async function createEnviaShipment(payload: any) {
  log.error("🚀 Iniciando createEnviaShipment con payload:", JSON.stringify(payload, null, 2));
  
  if (!ENVIA_API_TOKEN) {
    log.error("❌ ENVIA_API_TOKEN no configurado");
    throw new Error("ENVIA_API_TOKEN no configurado");
  }

  try {
    log.error("🔍 Verificando conexión con Envia.com...");
    // Primero verificamos la conexión
    const connectionTest = await testEnviaConnection();
    
    if (!connectionTest.success) {
      log.error("❌ Fallo en test de conexión:", connectionTest.error);
      return {
        success: false,
        error: "No se pudo conectar con Envia.com",
        details: connectionTest.error,
      };
    }
    log.error("✅ Conexión exitosa con Envia.com");

    // Asegurarnos de que el payload tenga el objeto settings
    if (!payload.settings) {
      payload.settings = {
        currency: "MXN",
        printFormat: "PDF",
        printSize: "STOCK_4X6",
        comments: `Pedido - Bazar Ecommerce`
      };
    }

    // Crear cotización primero
    log.error("💰 Solicitando cotización a:", `${BASE_URL}/ship/rate`);
    const rateResponse = await fetch(`${BASE_URL}/ship/rate`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${ENVIA_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    log.error("📊 Respuesta de cotización - Status:", rateResponse.status);

    if (!rateResponse.ok) {
      const errorText = await rateResponse.text();
      log.error("❌ Error en cotización:", errorText);
      return {
        success: false,
        error: "Error al obtener cotización",
        details: errorText,
        status: rateResponse.status,
      };
    }

    const rateData = await rateResponse.json();
    log.error("📋 Datos de cotización recibidos:", JSON.stringify(rateData, null, 2));
    
    // Verificar que hay tarifas disponibles
    if (!rateData.data || rateData.data.length === 0) {
      log.error("❌ No hay tarifas disponibles");
      return {
        success: false,
        error: "No hay tarifas disponibles para esta ruta",
        details: "Verifique la dirección y carriers configurados",
      };
    }

    // Seleccionar la mejor tarifa (más económica)
    const bestRate = selectBestRate(rateData.data);
    log.error("🏆 Mejor tarifa seleccionada:", bestRate);
    
    // Crear el envío con la mejor tarifa
    const shipmentPayload = {
      ...payload,
      shipment: {
        ...payload.shipment,
        carrier: bestRate.carrier,
        service: bestRate.service, // Aquí sí especificamos el servicio seleccionado
      },
    };
    log.error("📦 Payload para generar envío:", JSON.stringify(shipmentPayload, null, 2));

    log.error("🚚 Generando envío en:", `${BASE_URL}/ship/generate`);
    const shipmentResponse = await fetch(`${BASE_URL}/ship/generate`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${ENVIA_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(shipmentPayload),
    });
    log.error("📋 Respuesta de generación - Status:", shipmentResponse.status);

    if (!shipmentResponse.ok) {
      const errorText = await shipmentResponse.text();
      log.error("❌ Error al generar envío:", errorText);
      return {
        success: false,
        error: "Error al generar envío",
        details: errorText,
        status: shipmentResponse.status,
      };
    }

    const shipmentData = await shipmentResponse.json();
    log.error("✅ Envío generado exitosamente:", JSON.stringify(shipmentData, null, 2));
    return {
      success: true,
      data: shipmentData,
      rate: bestRate,
      apiUrl: BASE_URL,
    };
  } catch (error) {
    log.error("❌ Error en createEnviaShipment:", error);
    log.error("❌ Stack trace:", error instanceof Error ? error.stack : 'No stack available');
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

function debugCredentials() {
  log.error("=== DEBUG CREDENCIALES ENVIA.COM ===");
  log.error(`🌐 MODO ${ENVIA_API_ENVIRONMENT.toUpperCase()} DETECTADO`);
  log.error("Entorno:", ENVIA_API_ENVIRONMENT);
  log.error("URL Base:", BASE_URL);
  log.error("API Token presente:", !!ENVIA_API_TOKEN);
  log.error("API Token longitud:", ENVIA_API_TOKEN?.length || 0);
  log.error("API Email:", ENVIA_API_EMAIL);
  log.error("API User:", ENVIA_API_USER);
  log.error("API Token (primeros 10 chars):", ENVIA_API_TOKEN?.substring(0, 10) + "...");
  log.error("=====================================");
}

export async function POST(req: Request) {
  try {
    // Debug credenciales
    debugCredentials();

    const {
      orderId,
      selectedCarrier,
      customWeight,
      packageType = "box",
    } = await req.json();

    if (!orderId) {
      return NextResponse.json({ error: "ID de pedido requerido" }, { status: 400 });
    }

    if (!ENVIA_API_TOKEN) {
      log.error("ENVIA_API_TOKEN no está configurado en las variables de entorno");
      return NextResponse.json(
        {
          error: "API Token de Envia.com no configurado",
          details: "Verifique que ENVIA_API_TOKEN esté configurado en el archivo .env",
        },
        { status: 500 },
      );
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
    });

    if (!order) {
      return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 });
    }

    // Validar que el pedido esté en estado válido para envío
    if (!["CONFIRMED", "PROCESSING"].includes(order.status)) {
      return NextResponse.json(
        {
          error: "El pedido debe estar confirmado o en procesamiento para generar etiqueta",
        },
        { status: 400 },
      );
    }

    // Extraer información de dirección del pedido
    const addressInfo = extractAddressFromNotes(order.notes || "");
    log.error("Información de dirección extraída:", addressInfo);

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
      );
    }

    // Validar código postal mexicano
    if (addressInfo.country === "MX" && (!addressInfo.postalCode || addressInfo.postalCode.length !== 5)) {
      return NextResponse.json(
        {
          error: "Código postal inválido",
          details: "El código postal debe tener 5 dígitos para México",
        },
        { status: 400 },
      );
    }

    // Calcular peso del paquete basado en productos
    const packageWeight = calculatePackageWeight(order.items, customWeight);

    // Crear el payload para Envia.com según formato oficial
    const enviaPayload = {
      origin: createOriginAddress(),
      destination: createDestinationAddress(addressInfo, order),
      packages: [createPackage(packageWeight, packageType)],
      shipment: {
        carrier: selectedCarrier || "fedex",
        // No especificar 'service' para evitar el error "Invalid Option"
        type: 1, // Tipo de envío (1 = Nacional)
        import: 0 // 0 = No es importación
      },
      settings: {
        currency: "MXN",
        printFormat: "PDF",
        printSize: "STOCK_4X6",
        comments: `Pedido #${order.id} - Bazar Ecommerce`
      }
    };

    log.error("Payload para Envia.com:", JSON.stringify(enviaPayload, null, 2));

    // Crear envío con Envia.com
    const shipmentResult = await createEnviaShipment(enviaPayload);

    if (!shipmentResult.success) {
      return NextResponse.json(
        {
          error: "Error al crear envío con Envia.com",
          details: shipmentResult.error,
          status: shipmentResult.status || 500,
          environment: ENVIA_API_ENVIRONMENT,
          api_url: shipmentResult.apiUrl || BASE_URL,
          suggestions: [
            "Verifica que tus credenciales sean válidas",
            "Asegúrate de que tu cuenta Envia.com esté activa",
            "Verifica que tengas permisos para crear envíos",
            "Contacta a soporte de Envia.com para más información",
          ],
        },
        { status: shipmentResult.status || 500 },
      );
    }

    const shipmentData = shipmentResult.data;
    const bestRate = shipmentResult.rate;
    
    log.error("✅ Envío creado exitosamente:", shipmentData.data?.shipment_id);
    log.error("🌐 URL de API exitosa:", shipmentResult.apiUrl);

    // Extraer información de la etiqueta
    const labelData = {
      id: shipmentData.data?.shipment_id,
      tracking_number: shipmentData.data?.tracking_number,
      label_url: shipmentData.data?.label_url,
      carrier: bestRate.carrier,
      service: bestRate.service,
      rate: bestRate.total_price,
    };

    // Actualizar el pedido con información del envío
    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: "SHIPPED",
        notes: `${order.notes || ""}\n\n=== INFORMACIÓN DE ENVÍO ===
Enviado con Envia.com (${ENVIA_API_ENVIRONMENT})
URL API: ${BASE_URL}
Tracking: ${labelData.tracking_number || "N/A"}
Carrier: ${labelData.carrier || "N/A"}
Servicio: ${labelData.service || "N/A"}
Precio: $${labelData.rate || "N/A"}
Fecha de envío: ${new Date().toLocaleDateString()}
ID de envío: ${labelData.id}
Tipo de empaque: ${PACKAGE_TYPES[packageType as keyof typeof PACKAGE_TYPES] || "Caja"}
`,
      },
    });

    return NextResponse.json({
      success: true,
      environment: ENVIA_API_ENVIRONMENT,
      api_url: BASE_URL,
      shipment: {
        id: labelData.id,
        carrier: labelData.carrier,
        service: labelData.service,
      },
      label: labelData,
      tracking_number: labelData.tracking_number,
      carrier: labelData.carrier,
      service: labelData.service,
      rate: labelData.rate,
      requires_verification: CARRIERS_REQUIRING_VERIFICATION.includes(labelData.carrier),
    });
  } catch (error: any) {
    log.error("❌ Error en Envia.com API:", error);
    log.error("❌ Stack trace:", error.stack);
    log.error("❌ Error type:", typeof error);
    log.error("❌ Error name:", error.name);

    return NextResponse.json(
      {
        error: "Error interno del servidor",
        details: error instanceof Error ? error.message : String(error),
        stack: error.stack,
        type: typeof error,
        name: error.name
      },
      { status: 500 },
    );
  }
}

// Funciones auxiliares
function createOriginAddress(): any {
  return {
    name: "Bazar Ecommerce",
    company: "Bazar Ecommerce S.A. de C.V.",
    email: "envios@bazar.com",
    phone: "5512345678",
    street: "Av. Insurgentes Sur",
    number: "1234",
    district: "Del Valle",
    city: "Ciudad de México",
    state: "CMX",
    country: "MX",
    postalCode: "03100",
    reference: "Bodega Principal - Edificio A"
  };
}

function createDestinationAddress(addressInfo: any, order: any): any {
  let phone = addressInfo.phone || "";
  if (phone && phone.length === 10) {
    // Envia.com no requiere el prefijo +52
    phone = phone;
  }

  // Extraer número de la dirección si está disponible
  let street = addressInfo.street;
  let number = "S/N";
  
  // Intentar extraer el número de la calle
  const streetMatch = addressInfo.street.match(/^(.+?)\s+(\d+\w*)\s*$/i);
  if (streetMatch) {
    street = streetMatch[1];
    number = streetMatch[2];
  }

  // Normalizar el estado a código de 2-3 caracteres
  let state = addressInfo.state || "";
  const stateCode = normalizeState(state);

  // Normalizar el país a código ISO de 2 caracteres
  let country = addressInfo.country || "MX";
  const countryCode = normalizeCountry(country);

  return {
    name: addressInfo.name || order.user?.name || "Cliente",
    company: addressInfo.company || "",
    email: order.user?.email || "",
    phone: phone,
    street: street,
    number: number,
    district: addressInfo.district || "",
    city: addressInfo.city,
    state: stateCode, // Usar el código normalizado
    country: countryCode, // Usar el código normalizado
    postalCode: addressInfo.postalCode,
    reference: `Pedido #${order.id} - Entrega domicilio`
  };
}

function createPackage(weight: number, packageType = "box"): any {
  const packageDimensions = {
    "box": { height: 20, width: 30, length: 40 }, // Caja estándar
    "envelope": { height: 2, width: 23, length: 32 }, // Sobre
    "bag": { height: 15, width: 25, length: 35 }, // Bolsa
    "tube": { height: 80, width: 10, length: 10 }, // Tubo
    "pallet": { height: 120, width: 100, length: 120 }, // Pallet
    "other": { height: 25, width: 25, length: 25 }, // Otro
  };

  const dimensions = packageDimensions[packageType as keyof typeof packageDimensions] || packageDimensions["box"];

  return {
    content: "Ropa y accesorios de moda",
    amount: 1,
    type: packageType,
    weightUnit: "KG",
    lengthUnit: "CM",
    dimensions: {
      height: dimensions.height,
      width: dimensions.width,
      length: dimensions.length,
    },
    weight: Math.max(0.1, weight),
    declaredValue: 100,
    name: "Pedido de ropa y accesorios",
    additionalServices: [
      {
        service: "insurance",
        data: {
          amount: 100
        }
      }
    ]
  };
}

function calculatePackageWeight(items: any[], customWeight?: number): number {
  if (customWeight && customWeight > 0) {
    return customWeight;
  }

  const baseWeightPerItem = 0.3;
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  return Math.max(0.5, totalItems * baseWeightPerItem);
}

function selectBestRate(rates: any[]): any {
  // Ordenar por precio total
  const sortedRates = rates.sort((a, b) => Number.parseFloat(a.total_price) - Number.parseFloat(b.total_price));
  const preferredCarriers = ["fedex", "ups", "dhl", "estafeta"];

  for (const carrier of preferredCarriers) {
    const preferredRate = sortedRates.find((rate) => rate.carrier === carrier);
    if (preferredRate) {
      return preferredRate;
    }
  }

  return sortedRates[0];
}

// Mapeo de nombres de estados a códigos de estado
const stateCodesMap: Record<string, string> = {
  "Aguascalientes": "AG",
  "Baja California": "BC",
  "Baja California Sur": "BS",
  "Campeche": "CM",
  "Chiapas": "CS",
  "Chihuahua": "CH",
  "Ciudad de México": "CMX",
  "CDMX": "CMX",
  "DF": "CMX",
  "Distrito Federal": "CMX",
  "Coahuila": "CO",
  "Colima": "CL",
  "Durango": "DG",
  "Estado de México": "EM",
  "Guanajuato": "GT",
  "Guerrero": "GR",
  "Hidalgo": "HG",
  "Jalisco": "JC",
  "Michoacán": "MI",
  "Morelos": "MO",
  "Nayarit": "NA",
  "Nuevo León": "NL",
  "Oaxaca": "OA",
  "Puebla": "PU",
  "Querétaro": "QT",
  "Quintana Roo": "QR",
  "San Luis Potosí": "SL",
  "Sinaloa": "SI",
  "Sonora": "SO",
  "Tabasco": "TB",
  "Tamaulipas": "TM",
  "Tlaxcala": "TL",
  "Veracruz": "VE",
  "Yucatán": "YU",
  "Zacatecas": "ZA"
};

// Función para normalizar el estado
function normalizeState(state: string): string {
  if (!state) return "";
  
  // Si ya es un código de 2-3 caracteres, devolverlo
  if (/^[A-Z]{2,3}$/.test(state)) {
    return state;
  }
  
  // Convertir a minúsculas y eliminar acentos
  const normalized = state.toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
  
  // Buscar coincidencia en el mapa
  for (const [stateName, stateCode] of Object.entries(stateCodesMap)) {
    const normalizedStateName = stateName.toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();
    
    if (normalized === normalizedStateName || normalized.includes(normalizedStateName)) {
      return stateCode;
    }
  }
  
  // Si no se encuentra, devolver un código genérico para evitar errores
  log.error(`⚠️ Estado no reconocido: ${state}, usando código genérico`);
  return "OT"; // Otro
}

// Mapeo de nombres de países a códigos ISO 3166-1 alpha-2
const countryCodesMap: Record<string, string> = {
  "México": "MX",
  "Mexico": "MX",
  "Estados Unidos": "US",
  "United States": "US",
  "USA": "US",
  "Canadá": "CA",
  "Canada": "CA",
  "España": "ES",
  "Spain": "ES",
  "Colombia": "CO",
  "Argentina": "AR",
  "Chile": "CL",
  "Perú": "PE",
  "Peru": "PE",
  "Brasil": "BR",
  "Brazil": "BR"
};

// Función para normalizar el país a código ISO de 2 caracteres
function normalizeCountry(country: string): string {
  if (!country) return "MX"; // Default a México
  
  // Si ya es un código ISO de 2 caracteres, devolverlo
  if (/^[A-Z]{2}$/.test(country)) {
    return country;
  }
  
  // Convertir a minúsculas y eliminar acentos
  const normalized = country.toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
  
  // Buscar coincidencia en el mapa
  for (const [countryName, countryCode] of Object.entries(countryCodesMap)) {
    const normalizedCountryName = countryName.toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();
    
    if (normalized === normalizedCountryName || normalized.includes(normalizedCountryName)) {
      return countryCode;
    }
  }
  
  // Si no se encuentra, devolver MX por defecto
  log.error(`⚠️ País no reconocido: ${country}, usando código por defecto (MX)`);
  return "MX";
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
  };

  const nameMatch = notes.match(/Compra realizada por ([^.]+)/);
  if (nameMatch) {
    addressInfo.name = nameMatch[1].trim();
  }

  const addressMatch = notes.match(/Dirección: ([^,]+), ([^,]+), ([^,]+), ([^,]+), ([^.]+)/);
  if (addressMatch) {
    addressInfo.street = addressMatch[1].trim();
    addressInfo.city = addressMatch[2].trim();
    addressInfo.state = addressMatch[3].trim();
    addressInfo.postalCode = addressMatch[4].trim();
    // Normalizar el país a código ISO
    const countryRaw = addressMatch[5].trim();
    addressInfo.country = normalizeCountry(countryRaw);
  }

  const phoneMatch = notes.match(/Teléfono: ([^.]+)/);
  if (phoneMatch) {
    addressInfo.phone = phoneMatch[1].trim();
  }

  return addressInfo;
}

// Endpoint para obtener carriers disponibles
export async function GET() {
  try {
    debugCredentials();

    if (!ENVIA_API_TOKEN) {
      return NextResponse.json(
        {
          error: "API Token de Envia.com no configurado",
          available_carriers: AVAILABLE_CARRIERS,
          carriers_requiring_verification: CARRIERS_REQUIRING_VERIFICATION,
          package_types: PACKAGE_TYPES,
        },
        { status: 500 },
      );
    }

    // Probar conectividad primero
    const connectionTest = await testEnviaConnection();

    if (!connectionTest.success) {
      return NextResponse.json({
        success: false,
        error: "No se pudo conectar con Envia.com",
        details: connectionTest.error,
        environment: ENVIA_API_ENVIRONMENT,
        api_url: BASE_URL,
        available_carriers: AVAILABLE_CARRIERS,
        carriers_requiring_verification: CARRIERS_REQUIRING_VERIFICATION,
        package_types: PACKAGE_TYPES,
      });
    }

    const carriersData = connectionTest.data;
    log.error("Carriers obtenidos de Envia.com:", carriersData?.data?.length || 0);

    // Extraer carriers disponibles
    const configuredCarriers = carriersData?.data?.map((carrier: any) => carrier.carrier) || [];

    return NextResponse.json({
      success: true,
      environment: ENVIA_API_ENVIRONMENT,
      api_url: BASE_URL,
      carriers: carriersData?.data || [],
      configured_carriers: configuredCarriers,
      available_carriers: AVAILABLE_CARRIERS,
      carriers_requiring_verification: CARRIERS_REQUIRING_VERIFICATION,
      package_types: PACKAGE_TYPES,
      metadata: {
        total_configured: configuredCarriers.length,
        api_status: "active",
        last_updated: new Date().toISOString(),
      },
    });
  } catch (error) {
    log.error("Error al obtener carriers:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error interno del servidor",
        details: error instanceof Error ? error.message : String(error),
        environment: ENVIA_API_ENVIRONMENT,
        available_carriers: AVAILABLE_CARRIERS,
        carriers_requiring_verification: CARRIERS_REQUIRING_VERIFICATION,
        package_types: PACKAGE_TYPES,
      },
      { status: 500 },
    );
  }
}