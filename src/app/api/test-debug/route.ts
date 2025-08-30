import { NextRequest, NextResponse } from 'next/server';
import { log } from '@/lib/secureLogger'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    log.error('\n=== DATOS RECIBIDOS EN TEST DEBUG ===');
    log.error('Body completo:', JSON.stringify(body, null, 2));
    
    const { selectedRate, orderData, parcel, origin, destination } = body;
    
    log.error('\n--- DATOS INDIVIDUALES ---');
    log.error('selectedRate:', selectedRate);
    log.error('orderData:', orderData);
    log.error('parcel:', parcel);
    log.error('origin:', origin);
    log.error('destination:', destination);
    
    log.error('\n--- VERIFICACIÓN DE DATOS ---');
    log.error('¿parcel.weight existe?', !!parcel?.weight);
    log.error('Valor de parcel.weight:', parcel?.weight);
    log.error('¿origin.name existe?', !!origin?.name);
    log.error('Valor de origin.name:', origin?.name);
    log.error('¿destination.name existe?', !!destination?.name);
    log.error('Valor de destination.name:', destination?.name);
    log.error('¿orderData.customerName existe?', !!orderData?.customerName);
    log.error('Valor de orderData.customerName:', orderData?.customerName);
    log.error('=== FIN DEBUG ===\n');
    
    return NextResponse.json({
      success: true,
      message: 'Datos recibidos correctamente',
      receivedData: {
        hasSelectedRate: !!selectedRate,
        hasOrderData: !!orderData,
        hasParcel: !!parcel,
        hasOrigin: !!origin,
        hasDestination: !!destination,
        parcelWeight: parcel?.weight,
        originName: origin?.name,
        destinationName: destination?.name,
        customerName: orderData?.customerName
      }
    });
    
  } catch (error) {
    log.error('Error en test debug:', error);
    return NextResponse.json(
      { error: 'Error procesando datos' },
      { status: 500 }
    );
  }
}