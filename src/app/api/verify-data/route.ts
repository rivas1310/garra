import { NextRequest, NextResponse } from 'next/server';
import { log } from '@/lib/secureLogger'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    const { selectedRate, orderData, parcel, origin, destination } = body;
    
    // Datos esperados del frontend (test)
    const expectedData = {
      parcel: {
        weight: 2.5,
        depth: 25,
        width: 18,
        height: 12
      },
      origin: {
        name: "Garras Felinas",
        postalCode: "45100",
        city: "Zapopan"
      },
      destination: {
        name: "Juan Pérez",
        postalCode: "44100",
        city: "Guadalajara"
      },
      orderData: {
        customerName: "Juan Pérez",
        customerEmail: "juan.perez@email.com"
      }
    };
    
    // Verificar si los datos coinciden
    const verification = {
      parcelWeightMatch: parcel?.weight === expectedData.parcel.weight,
      parcelDimensionsMatch: (
        parcel?.depth === expectedData.parcel.depth &&
        parcel?.width === expectedData.parcel.width &&
        parcel?.height === expectedData.parcel.height
      ),
      originMatch: (
        origin?.name === expectedData.origin.name &&
        origin?.postalCode === expectedData.origin.postalCode &&
        origin?.city === expectedData.origin.city
      ),
      destinationMatch: (
        destination?.name === expectedData.destination.name &&
        destination?.postalCode === expectedData.destination.postalCode &&
        destination?.city === expectedData.destination.city
      ),
      customerMatch: (
        orderData?.customerName === expectedData.orderData.customerName &&
        orderData?.customerEmail === expectedData.orderData.customerEmail
      )
    };
    
    // Datos recibidos vs esperados
    const comparison = {
      received: {
        parcelWeight: parcel?.weight,
        parcelDimensions: `${parcel?.depth}x${parcel?.width}x${parcel?.height}`,
        originName: origin?.name,
        originPostalCode: origin?.postalCode,
        originCity: origin?.city,
        destinationName: destination?.name,
        destinationPostalCode: destination?.postalCode,
        destinationCity: destination?.city,
        customerName: orderData?.customerName,
        customerEmail: orderData?.customerEmail
      },
      expected: {
        parcelWeight: expectedData.parcel.weight,
        parcelDimensions: `${expectedData.parcel.depth}x${expectedData.parcel.width}x${expectedData.parcel.height}`,
        originName: expectedData.origin.name,
        originPostalCode: expectedData.origin.postalCode,
        originCity: expectedData.origin.city,
        destinationName: expectedData.destination.name,
        destinationPostalCode: expectedData.destination.postalCode,
        destinationCity: expectedData.destination.city,
        customerName: expectedData.orderData.customerName,
        customerEmail: expectedData.orderData.customerEmail
      }
    };
    
    const allDataMatches = Object.values(verification).every(match => match === true);
    
    return NextResponse.json({
      success: true,
      dataVerification: {
        allDataMatches,
        individualChecks: verification,
        comparison,
        summary: allDataMatches 
          ? "✅ Todos los datos del frontend llegaron correctamente"
          : "❌ Algunos datos no coinciden - posiblemente usando valores por defecto"
      }
    });
    
  } catch (error) {
    log.error('Error en verificación de datos:', error);
    return NextResponse.json(
      { error: 'Error verificando datos' },
      { status: 500 }
    );
  }
}