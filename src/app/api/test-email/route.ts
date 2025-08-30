import { NextResponse } from 'next/server'
import { sendOrderConfirmationEmail, testEmailConfiguration, type OrderData } from '@/lib/email'

export async function GET() {
  try {
    // Verificar configuración de email
    const isConfigValid = await testEmailConfiguration()
    
    if (!isConfigValid) {
      return NextResponse.json({ 
        success: false, 
        error: 'Configuración de email inválida. Verifica las variables de entorno.' 
      }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Configuración de email válida' 
    })
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: 'Error al verificar configuración de email',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const { email } = await req.json()
    
    if (!email) {
      return NextResponse.json({ 
        success: false, 
        error: 'Email requerido' 
      }, { status: 400 })
    }

    // Datos de prueba para el correo
    const testOrderData: OrderData = {
      orderId: 'TEST-' + Date.now(),
      customerName: 'Cliente de Prueba',
      customerEmail: email,
      items: [
        {
          name: 'Producto de Prueba 1',
          quantity: 2,
          price: 299.99,
          size: 'M',
          color: 'Azul'
        },
        {
          name: 'Producto de Prueba 2',
          quantity: 1,
          price: 199.99
        }
      ],
      subtotal: 799.97,
      discount: 50.00,
      shipping: 0,
      tax: 119.99,
      total: 869.96,
      couponCode: 'TEST10',
      shippingAddress: {
        direccion: 'Calle de Prueba 123',
        numeroExterior: '123',
        numeroInterior: 'A',
        colonia: 'Colonia Centro',
        ciudad: 'Ciudad de México',
        estado: 'CDMX',
        codigoPostal: '01000',
        pais: 'México',
        referencias: 'Casa color azul, portón negro'
      }
    }

    const emailSent = await sendOrderConfirmationEmail(testOrderData)
    
    if (emailSent) {
      return NextResponse.json({ 
        success: true, 
        message: `Correo de prueba enviado exitosamente a ${email}` 
      })
    } else {
      return NextResponse.json({ 
        success: false, 
        error: 'No se pudo enviar el correo de prueba' 
      }, { status: 500 })
    }
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: 'Error al enviar correo de prueba',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}




