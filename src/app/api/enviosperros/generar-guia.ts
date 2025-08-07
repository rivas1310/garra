import { NextRequest, NextResponse } from "next/server";
import { createEnviosPerrosClient } from "@/lib/create-envios-perros-client";
import prisma from "@/lib/prisma";

// Cliente de EnviosPerros
const enviosPerrosClient = createEnviosPerrosClient();

export async function POST(req: Request) {
  try {
    console.log("🏷️ Generando etiqueta de envío con EnviosPerros...");
    
    const body = await req.json();
    console.log('Payload recibido para generar etiqueta:', body);
    
    // Validar campos requeridos
    const requiredFields = ['orderId', 'rateId', 'reference', 'parcel', 'origin', 'destination'];
    const missingFields = requiredFields.filter(f => !body[f]);
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Faltan campos obligatorios', 
          missingFields 
        },
        { status: 400 }
      );
    }
    
    // Crear el envío en EnviosPerros
    const createOrderResult = await enviosPerrosClient.createOrder({
      reference: body.reference,
      rateId: body.rateId,
      parcel: body.parcel,
      origin: body.origin,
      destination: body.destination
    });
    
    if (!createOrderResult.success) {
      console.error("❌ Error al crear orden en EnviosPerros:", createOrderResult.error);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Error al crear orden de envío',
          details: createOrderResult.error
        },
        { status: createOrderResult.statusCode || 500 }
      );
    }
    
    console.log("✅ Orden creada en EnviosPerros:", createOrderResult.data);
    
    // Generar la etiqueta
    const reference = (createOrderResult.data as Record<string, unknown>)?.reference as string || body.reference;
    const generateLabelResult = await enviosPerrosClient.generateLabel(reference, true);
    
    if (!generateLabelResult.success) {
      console.error("❌ Error al generar etiqueta en EnviosPerros:", generateLabelResult.error);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Error al generar etiqueta',
          details: generateLabelResult.error
        },
        { status: generateLabelResult.statusCode || 500 }
      );
    }
    
    console.log("✅ Etiqueta generada en EnviosPerros:", generateLabelResult.data);
    
    // Obtener la URL de la etiqueta
    const labelUrl = (generateLabelResult.data as Record<string, unknown>)?.labelUrl as string || (generateLabelResult.data as Record<string, unknown>)?.pdfUrl as string;
    
    if (!labelUrl) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'No se pudo obtener la URL de la etiqueta'
        },
        { status: 500 }
      );
    }
    
    // Actualizar el pedido en la base de datos
    try {
      const updatedOrder = await prisma.order.update({
        where: { id: body.orderId },
        data: {
          shippingLabelUrl: labelUrl,
          trackingNumber: (createOrderResult.data as Record<string, unknown>)?.trackingNumber as string || reference,
          shippingProvider: body.shippingProvider || "EnviosPerros",
          shippingCost: body.shippingCost || 0
        }
      });
      
      console.log("✅ Pedido actualizado en la base de datos:", updatedOrder.id);
    } catch (dbError) {
      console.error("❌ Error al actualizar el pedido en la base de datos:", dbError);
      // No fallamos la petición si la etiqueta se generó correctamente
    }
    
    return NextResponse.json({
      success: true,
      data: {
        labelUrl,
        trackingNumber: (createOrderResult.data as Record<string, unknown>)?.trackingNumber as string || reference,
        shippingProvider: body.shippingProvider || "EnviosPerros",
        orderId: body.orderId
      }
    });
  } catch (error) {
    console.error('❌ Error inesperado al generar etiqueta con EnviosPerros:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error inesperado al generar etiqueta',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}