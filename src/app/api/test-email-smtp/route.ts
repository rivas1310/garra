import { NextResponse } from 'next/server'
import { log } from '@/lib/secureLogger'
import { sendOrderConfirmationEmail, testEmailConfiguration, type OrderData } from '@/lib/email'

export async function GET() {
  try {
    // Verificar configuración de email usando las variables SMTP
    const isConfigValid = await testEmailConfiguration()
    
    if (!isConfigValid) {
      return NextResponse.json({ 
        success: false, 
        error: 'Configuración de email inválida. Verifica las variables SMTP en .env' 
      }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Configuración de email SMTP válida',
      config: {
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        user: process.env.SMTP_USER,
        from: process.env.SMTP_FROM
      }
    })
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: 'Error al verificar configuración de email SMTP',
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

    // Datos de prueba para el correo usando la configuración SMTP
    const testOrderData: OrderData = {
      orderId: 'SMTP-TEST-' + Date.now(),
      customerName: 'Cliente de Prueba SMTP',
      customerEmail: email,
      items: [
        {
          name: 'Producto de Prueba SMTP 1',
          quantity: 2,
          price: 299.99,
          size: 'M',
          color: 'Azul'
        },
        {
          name: 'Producto de Prueba SMTP 2',
          quantity: 1,
          price: 199.99
        }
      ],
      subtotal: 799.97,
      discount: 50.00,
      shipping: 0,
      tax: 119.99,
      total: 869.96,
      couponCode: 'SMTP10',
      shippingAddress: {
        direccion: 'Calle SMTP de Prueba 123',
        numeroExterior: '123',
        numeroInterior: 'A',
        colonia: 'Colonia Centro SMTP',
        ciudad: 'Ciudad de México',
        estado: 'CDMX',
        codigoPostal: '01000',
        pais: 'México',
        referencias: 'Casa color azul, portón negro - Prueba SMTP'
      }
    }

    log.error('🧪 Enviando correo de prueba SMTP...')
    const emailSent = await sendOrderConfirmationEmail(testOrderData)
    
    if (emailSent) {
      return NextResponse.json({ 
        success: true, 
        message: `Correo de prueba SMTP enviado exitosamente a ${email}`,
        config: {
          from: process.env.SMTP_FROM,
          host: process.env.SMTP_HOST,
          port: process.env.SMTP_PORT
        }
      })
    } else {
      return NextResponse.json({ 
        success: false, 
        error: 'No se pudo enviar el correo de prueba SMTP' 
      }, { status: 500 })
    }
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: 'Error al enviar correo de prueba SMTP',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}




