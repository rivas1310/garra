import { NextRequest, NextResponse } from 'next/server';
import { log } from '@/lib/secureLogger'
import { createEnviosPerrosClient } from '@/lib/create-envios-perros-client';

// Función helper para limitar la longitud de campos de texto
function limitText(text: string, maxLength: number): string {
  return (text || "").substring(0, maxLength);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    log.error("\n\n🚀🚀🚀 INICIO GENERACION GUIA ENVIOSPERROS 🚀🚀🚀");
    log.error("📦 PAYLOAD COMPLETO:", JSON.stringify(body, null, 2));

    const {
      selectedRate,
      orderData,
      origin,
      destination,
      parcel,
      packageType: userPackageType,
      packageDescription: userPackageDescription
    } = body;

    log.error("\n⚡ DATOS EXTRAIDOS:");
    log.error("📏 PESO DEL PAQUETE:", parcel?.weight);
    log.error("🏠 ORIGEN:", origin?.name);
    log.error("🎯 DESTINO:", destination?.name);
    log.error("👤 CLIENTE:", orderData?.customerName);
    log.error("💰 TARIFA SELECCIONADA:", selectedRate?.service);
    
    log.error("🎯 DATOS DE DESTINO RECIBIDOS:", JSON.stringify(destination, null, 2));
    log.error("👤 DATOS DE CLIENTE RECIBIDOS:", JSON.stringify(orderData.customer, null, 2));
    log.error("💰 TARIFA SELECCIONADA:", JSON.stringify(selectedRate, null, 2));
    
    // Verificar específicamente los campos de destino
    log.error("🔍 VERIFICACIÓN ESPECÍFICA DE DESTINO:");
    log.error("  - destination.street:", destination.street);
    log.error("  - destination.number:", destination.number);
    log.error("  - destination.postalCode:", destination.postalCode);
    log.error("  - destination.neighborhood:", destination.neighborhood);
    log.error("  - destination.city:", destination.city);
    log.error("  - destination.name:", destination.name);
    log.error("  - destination.email:", destination.email);
    log.error("  - destination.phone:", destination.phone);
    log.error("🚀🚀🚀 FIN DATOS INICIALES 🚀🚀🚀\n\n");

    // Validar datos requeridos
    if (!selectedRate || !orderData || !origin || !destination) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Datos incompletos para generar la guía',
          required: ['selectedRate', 'orderData', 'origin', 'destination']
        },
        { status: 400 }
      );
    }

    // Crear cliente de EnviosPerros
    const client = createEnviosPerrosClient();

    // Primero hacer una cotización para obtener las tarifas disponibles
    const quotationPayload = {
      depth: String(parcel.depth || 30.01),
      width: String(parcel.width || 20.01),
      height: String(parcel.height || 15.01),
      weight: String(parcel.weight || 1),
      origin: {
        codePostal: origin.postalCode || "45100"
      },
      destination: {
        codePostal: destination.postalCode || "44200"
      }
    };

    log.error("📋 Haciendo cotización primero...");
    let quotationResult = await client.getShippingRates(quotationPayload);
    log.error("📋 Resultado de cotización:", quotationResult);

    if (!quotationResult.success) {
      // Intentar con un peso menor si falla la primera cotización
      log.error("⚠️ Primera cotización falló, intentando con peso menor...");
      const retryPayload = {
        ...quotationPayload,
        weight: "1" // Reducir peso a 1kg
      };
      
      log.error("📋 Reintentando con payload:", retryPayload);
      const retryResult = await client.getShippingRates(retryPayload);
      
      if (!retryResult.success) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Error al obtener cotización',
            details: {
              originalError: quotationResult.error || quotationResult.details,
              retryError: retryResult.error || retryResult.details,
              suggestions: [
                'Verificar que los códigos postales sean correctos',
                'El peso del paquete puede ser muy alto para esta ruta',
                'Verificar que la ciudad y estado coincidan con el código postal'
              ]
            }
          },
          { status: 500 }
        );
      }
      
      // Usar el resultado del reintento
      quotationResult = retryResult;
      log.error("✅ Cotización exitosa con peso reducido");
    }

    // Buscar la tarifa seleccionada en los resultados de la cotización
    const availableRates = (quotationResult.data as Record<string, unknown>)?.message as any[] || quotationResult.data as any[] || [];
    log.error("📋 Tarifas disponibles:", JSON.stringify(availableRates, null, 2));
    
    // Mostrar todas las tarifas disponibles para debugging
    if (availableRates.length > 0) {
      log.error("📋 Análisis de tarifas disponibles:");
      availableRates.forEach((rate, index) => {
        log.error(`  ${index + 1}. ${rate.title || rate.deliveryType?.name || 'Sin título'}`);
        log.error(`     Disponible: ${rate.available}`);
        log.error(`     Compañía: ${rate.deliveryType?.company || 'N/A'}`);
        log.error(`     Servicio: ${rate.deliveryType?.name || 'N/A'}`);
        log.error(`     Costo: ${rate.cost || rate.total || 'N/A'}`);
      });
    }
    
    // Buscar cualquier tarifa disponible (available: true)
    let selectedRateFromQuotation = availableRates.find(rate => rate.available === true);
    
    if (selectedRateFromQuotation) {
      log.error("✅ Tarifa disponible encontrada:", selectedRateFromQuotation.title);
    } else {
      // Si no hay tarifas disponibles, buscar cualquier tarifa de 99Minutos
      selectedRateFromQuotation = availableRates.find(rate => 
        rate.deliveryType?.company === "99Minutos" ||
        rate.title?.includes("99Minutos") ||
        rate.deliveryType?.name === "99MINUTOS_ECONOMICO"
      );
      
      if (selectedRateFromQuotation) {
        log.error("⚠️ Usando tarifa de 99Minutos (no disponible):", selectedRateFromQuotation.title);
      } else {
        // Si no hay tarifas de 99Minutos, usar la primera disponible
        if (availableRates.length > 0) {
          selectedRateFromQuotation = availableRates[0];
          log.error("⚠️ Usando la primera tarifa disponible:", selectedRateFromQuotation.title);
        }
      }
    }

    if (!selectedRateFromQuotation) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'No se encontraron tarifas disponibles para esta ruta',
          details: {
            message: 'El proveedor no cuenta con servicios disponibles para la ruta especificada',
            originPostalCode: origin.postalCode,
            destinationPostalCode: destination.postalCode,
            availableRates: availableRates,
            suggestions: [
              'Verificar que los códigos postales sean correctos',
              'Probar con un peso menor (1kg en lugar de 2kg)',
              'Verificar que la ciudad y estado coincidan con el código postal',
              'Contactar al proveedor para confirmar cobertura en esta ruta'
            ]
          }
        },
        { status: 422 }
      );
    }
    
    log.error("✅ Tarifa seleccionada:", selectedRateFromQuotation.title);
    log.error("✅ Disponible:", selectedRateFromQuotation.available);
    log.error("✅ Servicio:", selectedRateFromQuotation.deliveryType?.name);

    // Función para determinar el tipo de paquete basado en las dimensiones
    const determinePackageType = (depth: number, width: number, height: number, weight: number) => {
      // Si es muy delgado (menos de 5cm de altura) y ligero (menos de 1kg), es un sobre
      if (height < 5 && weight < 1) {
        return "Sobre";
      }
      // Si es muy pequeño en todas las dimensiones, es un sobre
      if (depth < 10 && width < 10 && height < 5) {
        return "Sobre";
      }
      // Por defecto es una caja
      return "Caja";
    };

    // Función para determinar la descripción basada en los productos del pedido
    const determinePackageDescription = (items: any[]) => {
      if (!items || items.length === 0) {
        return "ropa"; // Por defecto
      }

      // Contar productos por categoría
      let ropaCount = 0;
      let calzadoCount = 0;
      let otrosCount = 0;

      items.forEach(item => {
        const productName = (item.product?.name || "").toLowerCase();
        const categoryName = (item.product?.category?.name || "").toLowerCase();
        const subcategoryName = (item.product?.subcategory || "").toLowerCase();

        // Detectar calzado
        if (productName.includes('zapato') || productName.includes('tenis') || 
            productName.includes('sneaker') || productName.includes('bota') ||
            categoryName.includes('calzado') || categoryName.includes('zapatos') ||
            subcategoryName.includes('calzado') || subcategoryName.includes('zapatos')) {
          calzadoCount++;
        }
        // Detectar ropa
        else if (productName.includes('camisa') || productName.includes('pantalon') ||
                 productName.includes('vestido') || productName.includes('blusa') ||
                 productName.includes('playera') || productName.includes('short') ||
                 categoryName.includes('ropa') || categoryName.includes('vestimenta') ||
                 subcategoryName.includes('ropa') || subcategoryName.includes('vestimenta')) {
          ropaCount++;
        }
        else {
          otrosCount++;
        }
      });

      // Determinar descripción basada en la mayoría
      if (calzadoCount > ropaCount && calzadoCount > otrosCount) {
        return "calzado";
      } else if (ropaCount > calzadoCount && ropaCount > otrosCount) {
        return "ropa";
      } else {
        return "ropa"; // Por defecto
      }
    };

    // Usar el tipo de paquete del usuario si está disponible, sino determinar automáticamente
    const finalPackageType = userPackageType || determinePackageType(
      Number(parcel.depth || 30.01),
      Number(parcel.width || 20.01), 
      Number(parcel.height || 15.01),
      Number(parcel.weight || 1)
    );

    // Usar la descripción del usuario si está disponible, sino determinar automáticamente
    const finalPackageDescription = userPackageDescription || determinePackageDescription(orderData.items || []);

    log.error("📦 TIPO DE PAQUETE DETERMINADO:", finalPackageType);
    log.error("📦 DESCRIPCIÓN DETERMINADA:", finalPackageDescription);
    log.error("📦 PRODUCTOS EN EL PEDIDO:", orderData.items?.map((item: any) => ({
      name: item.product?.name,
      category: item.product?.category?.name,
      subcategory: item.product?.subcategory
    })));

    // Preparar payload para crear orden usando la información de la cotización
    const orderPayload = {
      deliveryType: selectedRateFromQuotation.deliveryType?.name || "NextDay", // Usar el servicio disponible
      packageSize: {
        type: finalPackageType, // Determinar automáticamente si es Caja o Sobre
        depth: String(parcel.depth || 30.01),
        width: String(parcel.width || 20.01),
        height: String(parcel.height || 15.01),
        weight: String(parcel.weight || 1),
        description: finalPackageDescription // Determinar automáticamente si es "ropa" o "calzado"
      },
      origin: {
        company_origin: limitText(origin.company || "Garras Felinas", 50),
        street_origin: limitText(origin.street || "Prolongación 20 de Noviembre", 100),
        interior_number_origin: limitText(origin.intNumber || "", 20),
        outdoor_number_origin: limitText(origin.number || "224", 20),
        zip_code_origin: limitText(origin.postalCode || "45100", 10),
        neighborhood_origin: limitText(origin.neighborhood || "Zapopan Centro", 50),
        city_origin: limitText(origin.city || "Zapopan", 50),
        state_origin: limitText(origin.state || "Jalisco", 50),
        references_origin: "Tienda Garras Felinas",
        name_origin: limitText(origin.name || "Garras Felinas", 50),
        email_origin: limitText(origin.email || "envios@garrasfelinas.com", 100),
        phone_origin: limitText(origin.phone || "3327432497", 20),
        save_origin: "false"
      },
      destination: {
        company_dest: limitText(destination.company || "Cliente", 50),
        street_dest: limitText((destination.street || "euforia").split(' ')[0], 100), // Solo el nombre de la calle
        interior_number_dest: limitText(destination.intNumber || "", 20),
        outdoor_number_dest: limitText(destination.number || "1588", 20),
        zip_code_dest: limitText(destination.postalCode || "45200", 10),
        neighborhood_dest: limitText((destination.neighborhood || "Centro").charAt(0).toUpperCase() + (destination.neighborhood || "Centro").slice(1), 50),
        city_dest: limitText((destination.city || "Zapopan").charAt(0).toUpperCase() + (destination.city || "Zapopan").slice(1), 50),
        state_dest: limitText(destination.state || "Jalisco", 50),
        references_dest: limitText(destination.reference || "Sin referencias", 25),
        name_dest: limitText((destination.name || orderData.customer?.name || "Cliente").trim(), 50),
        email_dest: limitText(destination.email || orderData.customer?.email || "cliente@email.com", 100),
        phone_dest: limitText(destination.phone || orderData.customer?.phone || "3331234567", 20),
        save_dest: "false",
        ocurre: "false"
      }
    };

    log.error("📋 Payload para crear orden:", JSON.stringify(orderPayload, null, 2));
    log.error("📋 URL del cliente:", "Configurado");
    log.error("📋 API Key del cliente:", "Presente");

    // Crear la orden
    log.error("📋 Intentando crear orden con payload:", JSON.stringify(orderPayload, null, 2));
    const orderResult = await client.createOrder(orderPayload);
    log.error("📋 Resultado de crear orden:", JSON.stringify(orderResult, null, 2));

    if (!orderResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Error al crear la orden',
          details: orderResult.error || orderResult.details
        },
        { status: 500 }
      );
    }

    // Obtener el número de guía de la respuesta
    const data = orderResult.data as Record<string, unknown>;
    const message = data?.message as Record<string, unknown>;
    const reason = message?.reason as Record<string, unknown>;
    const reference = reason?.reference as string || data?.reference as string || data?.guide_number as string;
    
    if (!reference) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'No se pudo obtener el número de guía',
          orderResult
        },
        { status: 500 }
      );
    }

    log.error("📋 Guía creada exitosamente. Referencia:", reference);

    // Generar el PDF de la etiqueta
    log.error("📋 Intentando generar PDF para referencia:", reference);
    const pdfResult = await client.generateLabel(reference, true); // Usar base64
    log.error("📋 Resultado de generar PDF:", JSON.stringify(pdfResult, null, 2));

    if (!pdfResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Error al generar el PDF de la etiqueta',
          details: pdfResult.error || pdfResult.details,
          reference: reference
        },
        { status: 500 }
      );
    }

    // Retornar la respuesta exitosa
    const pdfData = pdfResult.data as Record<string, unknown>;
    return NextResponse.json({
      success: true,
      reference: reference,
      pdfUrl: pdfData?.url as string,
      pdfBase64: pdfData?.base64 as string,
      pdfContentType: pdfData?.contentType as string,
      pdfSize: pdfData?.size as number,
      orderData: orderResult.data,
      message: "Guía generada exitosamente"
    });

  } catch (error) {
    log.error("❌ Error al generar guía:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}