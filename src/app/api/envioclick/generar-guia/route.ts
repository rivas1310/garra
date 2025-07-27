import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const apiKey = process.env.ENVIOCLICK_API_KEY;
    const userAgent = process.env.ENVIOCLICK_USER_AGENT || "EcUserAgent-2/75082";
    const orderId = body.orderId || body.myShipmentReference || null;
    
    console.log("📦 Datos recibidos para generar guía:", { orderId, idRate: body.idRate });

    console.log("🏷️ Generando guía para el pedido:", orderId);

    const response = await fetch("https://api.envioclickpro.com/api/v2/sandbox/shipment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": apiKey || "",
        "User-Agent": userAgent
      },
      body: JSON.stringify(body)
    });
    
    const data = await response.json();
    console.log("📦 Respuesta de EnvioClick:", data);
    
    // Extraer la URL de la etiqueta de la respuesta con búsqueda más exhaustiva
    let labelUrl = data.labelUrl || data.pdfUrl || data.data?.labelUrl || data.data?.pdfUrl || data.data?.data?.labelUrl || data.data?.data?.pdfUrl;
    
    // Si no se encuentra la URL, buscar recursivamente en el objeto de respuesta
    if (!labelUrl) {
      console.log("Buscando URL de etiqueta en la respuesta completa...");
      
      const findPdfUrlInObject = (obj: any): string | null => {
        if (!obj || typeof obj !== 'object') return null;
        
        for (const key in obj) {
          const value = obj[key];
          
          // Si es una cadena y parece una URL de PDF o etiqueta
          if (typeof value === 'string' && 
              (value.includes('.pdf') || 
               value.toLowerCase().includes('label') || 
               value.toLowerCase().includes('etiqueta'))) {
            console.log(`Posible URL de PDF encontrada en ${key}:`, value);
            return value;
          }
          
          // Recursivamente buscar en objetos anidados
          if (typeof value === 'object' && value !== null) {
            const result = findPdfUrlInObject(value);
            if (result) return result;
          }
        }
        
        return null;
      };
      
      labelUrl = findPdfUrlInObject(data);
      if (labelUrl) {
        console.log("Se encontró URL de etiqueta mediante búsqueda profunda:", labelUrl);
      }
    }
    
    // Si tenemos un ID de pedido y una URL de etiqueta, actualizar el pedido en la base de datos
    if (orderId && labelUrl) {
      try {
        await prisma.order.update({
          where: { id: orderId },
          data: {
            shippingLabelUrl: labelUrl,
            trackingNumber: data.trackingNumber || data.data?.trackingNumber,
            shippingProvider: body.shippingProvider || body.deliveryType?.company || "EnvioClick",
            shippingCost: body.shippingCost || null,
            shippingData: body, // Guardar todos los datos del envío para referencia futura
            status: "SHIPPED", // Actualizar el estado del pedido a enviado
            updatedAt: new Date()
          }
        });
        console.log("✅ Pedido actualizado con URL de etiqueta:", labelUrl);
      } catch (dbError) {
        console.error("❌ Error al actualizar el pedido en la base de datos:", dbError);
      }
    }
    
    // Preparar respuesta con información detallada
    const responseData = {
      ...data,
      labelUrl,
      success: response.ok,
      orderId,
      debug: {
        foundLabelUrl: !!labelUrl,
        labelUrlSource: labelUrl ? 'Encontrada' : 'No encontrada',
        responseKeys: Object.keys(data),
        hasDataProperty: !!data.data,
        dataPropertyKeys: data.data ? Object.keys(data.data) : [],
      }
    };
    
    console.log("📤 Enviando respuesta al frontend:", {
      success: responseData.success,
      labelUrl: responseData.labelUrl,
      debug: responseData.debug
    });
    
    return NextResponse.json(responseData, { status: response.status });
  } catch (error) {
    console.error("❌ Error al generar guía:", error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : "Error desconocido",
      success: false 
    }, { status: 500 });
  }
}