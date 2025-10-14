import nodemailer from 'nodemailer'
import { log } from '@/lib/secureLogger'

// Configuración del transporter de email
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true', // true para puerto 465, false para otros puertos
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  })
}

export interface OrderItem {
  name: string
  quantity: number
  price: number
  size?: string
  color?: string
}

export interface OrderData {
  orderId: string
  customerName: string
  customerEmail: string
  items: OrderItem[]
  subtotal: number
  discount: number
  shipping: number
  tax: number
  total: number
  couponCode?: string
  shippingAddress: {
    direccion: string
    numeroExterior: string
    numeroInterior?: string
    colonia: string
    ciudad: string
    estado: string
    codigoPostal: string
    pais: string
    referencias?: string
  }
}

// Plantilla HTML para el correo de confirmación
const createOrderConfirmationTemplate = (orderData: OrderData): string => {
  const {
    orderId,
    customerName,
    items,
    subtotal,
    discount,
    shipping,
    tax,
    total,
    couponCode,
    shippingAddress
  } = orderData

  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Confirmación de Pedido - Garras Felinas</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          background-color: #f8f5f1;
        }
        
        .container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #ffffff;
          box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
        }
        
        .header {
          background: linear-gradient(135deg, #d4a574 0%, #8b5a3c 100%);
          color: white;
          padding: 30px;
          text-align: center;
        }
        
        .header h1 {
          font-size: 28px;
          margin-bottom: 10px;
        }
        
        .header p {
          font-size: 16px;
          opacity: 0.9;
        }
        
        .content {
          padding: 30px;
        }
        
        .order-info {
          background-color: #fdf6f0;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 30px;
          border-left: 4px solid #d4a574;
        }
        
        .order-info h2 {
          color: #8b5a3c;
          margin-bottom: 10px;
          font-size: 20px;
        }
        
        .order-number {
          font-family: 'Courier New', monospace;
          font-weight: bold;
          color: #333;
          font-size: 18px;
        }
        
        .section {
          margin-bottom: 30px;
        }
        
        .section h3 {
          color: #333;
          margin-bottom: 15px;
          font-size: 18px;
          border-bottom: 2px solid #eee;
          padding-bottom: 5px;
        }
        
        .items-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
        }
        
        .items-table th,
        .items-table td {
          padding: 12px;
          text-align: left;
          border-bottom: 1px solid #ddd;
        }
        
        .items-table th {
          background-color: #f8f9fa;
          font-weight: bold;
          color: #555;
        }
        
        .items-table tr:hover {
          background-color: #f8f9fa;
        }
        
        .price {
          font-weight: bold;
          color: #d4a574;
        }
        
        .totals-table {
          width: 100%;
          margin-top: 20px;
        }
        
        .totals-table td {
          padding: 8px 12px;
          border: none;
        }
        
        .totals-table .label {
          text-align: right;
          font-weight: 500;
        }
        
        .totals-table .value {
          text-align: right;
          font-weight: bold;
          width: 120px;
        }
        
        .total-row {
          border-top: 2px solid #d4a574;
          font-size: 18px;
          color: #8b5a3c;
        }
        
        .discount-row {
          color: #28a745;
        }
        
        .shipping-info {
          background-color: #f8f9fa;
          border-radius: 8px;
          padding: 20px;
          border: 1px solid #dee2e6;
        }
        
        .shipping-info h4 {
          color: #333;
          margin-bottom: 10px;
        }
        
        .address {
          line-height: 1.8;
          color: #555;
        }
        
        .footer {
          background-color: #333;
          color: white;
          padding: 30px;
          text-align: center;
        }
        
        .footer p {
          margin-bottom: 10px;
        }
        
        .footer a {
          color: #d4a574;
          text-decoration: none;
        }
        
        .footer a:hover {
          text-decoration: underline;
        }
        
        .divider {
          height: 2px;
          background: linear-gradient(135deg, #d4a574 0%, #8b5a3c 100%);
          margin: 30px 0;
          border: none;
        }
        
        @media (max-width: 600px) {
          .container {
            margin: 0;
            box-shadow: none;
          }
          
          .header,
          .content,
          .footer {
            padding: 20px;
          }
          
          .items-table {
            font-size: 14px;
          }
          
          .items-table th,
          .items-table td {
            padding: 8px;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <!-- Header -->
        <div class="header">
          <h1>🐱 ¡Gracias por tu compra! 🐾</h1>
          <p>Tu pedido ha sido confirmado y está siendo procesado con amor felino</p>
        </div>
        
        <!-- Content -->
        <div class="content">
          <!-- Información del pedido -->
          <div class="order-info">
            <h2>Información del Pedido</h2>
            <p><strong>Número de pedido:</strong> <span class="order-number">${orderId}</span></p>
            <p><strong>Cliente:</strong> ${customerName}</p>
            <p><strong>Fecha:</strong> ${new Date().toLocaleDateString('es-ES', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}</p>
          </div>
          
          <!-- Productos -->
          <div class="section">
            <h3>🛍️ Productos Pedidos</h3>
            <table class="items-table">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Cantidad</th>
                  <th>Precio Unit.</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                ${items.map(item => `
                  <tr>
                    <td>
                      <strong>${item.name}</strong>
                      ${item.size || item.color ? `<br><small style="color: #666;">
                        ${item.size ? `Talla: ${item.size}` : ''}
                        ${item.size && item.color ? ' | ' : ''}
                        ${item.color ? `Color: ${item.color}` : ''}
                      </small>` : ''}
                    </td>
                    <td>${item.quantity}</td>
                    <td class="price">$${item.price.toFixed(2)}</td>
                    <td class="price">$${(item.price * item.quantity).toFixed(2)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          
          <hr class="divider">
          
          <!-- Totales -->
          <div class="section">
            <h3>💰 Resumen de tu Compra</h3>
            <table class="totals-table">
              <tr>
                <td class="label">Subtotal:</td>
                <td class="value">$${subtotal.toFixed(2)}</td>
              </tr>
              ${discount > 0 ? `
                <tr class="discount-row">
                  <td class="label">Descuento${couponCode ? ` (${couponCode})` : ''}:</td>
                  <td class="value">-$${discount.toFixed(2)}</td>
                </tr>
              ` : ''}
              <tr>
                <td class="label">Envío:</td>
                <td class="value">${shipping === 0 ? 'GRATIS' : `$${shipping.toFixed(2)}`}</td>
              </tr>
              <tr>
                <td class="label">IVA (16%):</td>
                <td class="value">$${tax.toFixed(2)}</td>
              </tr>
              <tr class="total-row">
                <td class="label"><strong>TOTAL:</strong></td>
                <td class="value"><strong>$${total.toFixed(2)} MXN</strong></td>
              </tr>
            </table>
          </div>
          
          <hr class="divider">
          
          <!-- Información de envío -->
          <div class="section">
            <h3>🚚 Dirección de Envío</h3>
            <div class="shipping-info">
              <h4>${customerName}</h4>
              <div class="address">
                ${shippingAddress.direccion} ${shippingAddress.numeroExterior}${shippingAddress.numeroInterior ? ` Int. ${shippingAddress.numeroInterior}` : ''}<br>
                Col. ${shippingAddress.colonia}<br>
                ${shippingAddress.ciudad}, ${shippingAddress.estado}<br>
                C.P. ${shippingAddress.codigoPostal}<br>
                ${shippingAddress.pais}
                ${shippingAddress.referencias ? `<br><strong>Referencias:</strong> ${shippingAddress.referencias}` : ''}
              </div>
            </div>
          </div>
          
          <!-- Información adicional -->
          <div class="section">
            <h3>📋 Información Importante</h3>
            <ul style="color: #555; line-height: 1.8;">
              <li>🐾 Tu pedido será procesado en las próximas 24-48 horas hábiles</li>
              <li>📧 Recibirás un correo con la información de seguimiento una vez que tu pedido sea enviado</li>
              <li>⏰ El tiempo de entrega estimado es de 3-5 días hábiles</li>
              <li>💬 Si tienes alguna pregunta sobre productos para gatos, no dudes en contactarnos</li>
              <li>🐱 Vístete con causa. Vístete con conciencia. 🌿 </li>
            </ul>
          </div>
        </div>
        
        <!-- Footer -->
        <div class="footer">
          <p><strong>🐾 Garras Felinas 🐾</strong></p>
          <p>Gracias por confiar en nosotros 🐱</p>
          <p>
            <a href="mailto:info@garrasfelinas.com">info@garrasfelinas.com</a> | 
            <a href="tel:+523351935392">+52 55 3351 9353 92</a>
          </p>
          <p style="font-size: 12px; opacity: 0.8; margin-top: 20px;">
            Este es un correo automático, por favor no responder directamente a este mensaje.
          </p>
        </div>
      </div>
    </body>
    </html>
  `
}

// Función para enviar correo de confirmación de pedido
export const sendOrderConfirmationEmail = async (orderData: OrderData): Promise<boolean> => {
  try {
    const transporter = createTransporter()
    
    const htmlContent = createOrderConfirmationTemplate(orderData)
    
    const mailOptions = {
      from: process.env.SMTP_FROM || `"Garras Felinas" <info@garrasfelinas.com>`,
      to: orderData.customerEmail,
      subject: `Confirmación de Pedido #${orderData.orderId} - Garras Felinas 🐾`,
      html: htmlContent,
    }

    await transporter.sendMail(mailOptions)
    log.error(`✅ Correo de confirmación enviado a: ${orderData.customerEmail}`)
    return true
  } catch (error) {
    log.error('❌ Error al enviar correo de confirmación:', error)
    return false
  }
}

// Función genérica para enviar emails
export const sendEmail = async (options: {
  to: string;
  subject: string;
  html: string;
  from?: string;
}): Promise<boolean> => {
  try {
    const transporter = createTransporter()
    
    const mailOptions = {
      from: options.from || process.env.SMTP_FROM || `"Garras Felinas" <info@garrasfelinas.com>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
    }

    await transporter.sendMail(mailOptions)
    log.error(`✅ Email enviado a: ${options.to}`)
    return true
  } catch (error) {
    log.error('❌ Error al enviar email:', error)
    return false
  }
}

// Función para verificar la configuración de email
export const testEmailConfiguration = async (): Promise<boolean> => {
  try {
    const transporter = createTransporter()
    await transporter.verify()
    log.error('✅ Configuración de email verificada correctamente')
    return true
  } catch (error) {
    log.error('❌ Error en la configuración de email:', error)
    return false
  }
}

// Plantilla HTML para código 2FA
const generate2FAEmailTemplate = (code: string, userName?: string): string => {
  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Código de Verificación - Garras Felinas</title>
      <style>
        body { 
          margin: 0; 
          padding: 0; 
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
          background-color: #f8fafc;
        }
        .container { 
          max-width: 600px; 
          margin: 0 auto; 
          background-color: white; 
          border-radius: 12px; 
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header { 
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
          color: white; 
          padding: 30px; 
          text-align: center; 
        }
        .header h1 { 
          margin: 0; 
          font-size: 28px; 
          font-weight: bold; 
        }
        .content { 
          padding: 40px 30px; 
        }
        .code-container { 
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); 
          color: white; 
          padding: 30px; 
          border-radius: 12px; 
          text-align: center; 
          margin: 30px 0; 
        }
        .code { 
          font-size: 36px; 
          font-weight: bold; 
          letter-spacing: 8px; 
          margin: 10px 0; 
          font-family: 'Courier New', monospace;
        }
        .warning { 
          background-color: #fef3c7; 
          border: 1px solid #f59e0b; 
          border-radius: 8px; 
          padding: 15px; 
          margin: 20px 0; 
          color: #92400e; 
        }
        .footer { 
          background-color: #f8fafc; 
          padding: 20px; 
          text-align: center; 
          color: #6b7280; 
          font-size: 14px; 
        }
        .btn {
          display: inline-block;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 12px 24px;
          text-decoration: none;
          border-radius: 8px;
          font-weight: 600;
          margin: 10px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🦁 Garras Felinas</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px;">Código de Verificación</p>
        </div>
        
        <div class="content">
          <h2 style="color: #374151; margin-top: 0;">¡Hola${userName ? ` ${userName}` : ''}!</h2>
          
          <p style="color: #6b7280; font-size: 16px; line-height: 1.6;">
            Has solicitado iniciar sesión en tu cuenta. Para completar el proceso, 
            utiliza el siguiente código de verificación:
          </p>
          
          <div class="code-container">
            <p style="margin: 0 0 10px 0; font-size: 16px;">Tu código de verificación es:</p>
            <div class="code">${code}</div>
            <p style="margin: 10px 0 0 0; font-size: 14px; opacity: 0.9;">Válido por 3 minutos</p>
          </div>
          
          <div class="warning">
            <strong>⚠️ Información importante:</strong>
            <ul style="margin: 10px 0; padding-left: 20px;">
              <li>Este código expira en 3 minutos</li>
              <li>No compartas este código con nadie</li>
              <li>Si no solicitaste este código, ignora este correo</li>
              <li>Garras Felinas nunca te pedirá tu código por teléfono o email</li>
            </ul>
          </div>
          
          <p style="color: #6b7280; font-size: 14px;">
            Si tienes problemas para acceder, puedes 
            <a href="mailto:info@garrasfelinas.com" style="color: #667eea;">contactar nuestro soporte</a>.
          </p>
        </div>
        
        <div class="footer">
          <p style="margin: 0;">
            © 2024 Garras Felinas - Todos los derechos reservados<br>
            <a href="mailto:info@garrasfelinas.com" style="color: #667eea;">info@garrasfelinas.com</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `
}

// Función para enviar código 2FA por email
export const send2FACode = async (email: string, code: string, userName?: string): Promise<boolean> => {
  try {
    const html = generate2FAEmailTemplate(code, userName)
    
    const success = await sendEmail({
      to: email,
      subject: '🔐 Código de Verificación - Garras Felinas',
      html: html,
    })
    
    if (success) {
      log.info(`✅ Código 2FA enviado a: ${email}`)
    } else {
      log.error(`❌ Error al enviar código 2FA a: ${email}`)
    }
    
    return success
  } catch (error) {
    log.error('❌ Error al generar/enviar código 2FA:', error)
    return false
  }
}