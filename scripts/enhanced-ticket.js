// Script para generar un ticket mejorado con más información
console.log('🎫 Generando ticket mejorado...')

// Datos de la empresa
const companyInfo = {
  name: 'Garras Felinas',
  logo: 'https://via.placeholder.com/200x80/FF6B35/FFFFFF?text=GARRAS+FELINAS',
  address: 'Av. Principal 123, Ciudad',
  phone: '+52 (555) 123-4567',
  email: 'info@garrasfelinas.com',
  website: 'www.garrasfelinas.com',
  rfc: 'GAR-123456-ABC',
  taxId: '1234567890123'
}

// Datos de la venta
const saleData = {
  id: 'clx123456789',
  total: 275.50,
  subtotal: 250.00,
  tax: 25.50,
  items: [
    {
      product: { name: 'Overol de Trabajo', sku: 'OVL-001' },
      quantity: 2,
      price: 125.00,
      discount: 0
    },
    {
      product: { name: 'Camisa Casual', sku: 'CAM-002' },
      quantity: 1,
      price: 25.50,
      discount: 5.00
    }
  ],
  paymentMethod: 'EFECTIVO',
  cashier: 'Admin',
  createdAt: new Date().toISOString()
}

// Generar HTML del ticket mejorado
const generateEnhancedTicket = (data, company) => {
  return `
<!DOCTYPE html>
<html>
<head>
  <title>Ticket de Venta - ${company.name}</title>
  <meta charset="UTF-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: 'Courier New', 'Monaco', 'Menlo', monospace; 
      font-size: 11px; 
      line-height: 1.3;
      margin: 0; 
      padding: 8px; 
      background: white;
      color: black;
      max-width: 400px;
    }
    .header { 
      text-align: center; 
      margin-bottom: 15px; 
      border-bottom: 2px solid #000;
      padding-bottom: 8px;
    }
    .logo {
      max-width: 200px;
      height: auto;
      margin-bottom: 5px;
    }
    .title { 
      font-size: 16px; 
      font-weight: bold; 
      margin-bottom: 3px; 
      text-transform: uppercase;
    }
    .subtitle { 
      font-size: 9px; 
      color: #333; 
      margin-bottom: 1px;
    }
    .company-info {
      font-size: 8px;
      margin: 5px 0;
    }
    .divider { 
      border-top: 1px dashed #000; 
      margin: 8px 0; 
    }
    .item { 
      display: flex; 
      justify-content: space-between; 
      margin: 3px 0; 
      font-size: 10px;
    }
    .item-details {
      font-size: 8px;
      color: #666;
      margin-left: 10px;
    }
    .item-name { 
      flex: 1; 
      text-align: left; 
    }
    .item-price { 
      text-align: right; 
      font-weight: bold;
    }
    .total { 
      font-weight: bold; 
      border-top: 2px solid #000; 
      padding-top: 8px; 
      margin-top: 8px; 
    }
    .footer { 
      text-align: center; 
      margin-top: 15px; 
      font-size: 8px; 
      border-top: 1px dashed #000;
      padding-top: 8px;
    }
    .payment-method {
      font-size: 9px;
      color: #333;
      margin-top: 3px;
    }
    .tax-info {
      font-size: 8px;
      color: #666;
      margin-top: 3px;
    }
    @media print { 
      body { margin: 0; padding: 5px; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="header">
    <img src="${company.logo}" alt="${company.name}" class="logo">
    <div class="title">${company.name}</div>
    <div class="subtitle">Venta Física</div>
    <div class="company-info">
      ${company.address}<br>
      Tel: ${company.phone}<br>
      ${company.email}<br>
      RFC: ${company.rfc}
    </div>
  </div>
  
  <div class="divider"></div>
  
  <div class="item">
    <span class="item-name">Fecha:</span>
    <span class="item-price">${new Date().toLocaleString('es-MX', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })}</span>
  </div>
  <div class="item">
    <span class="item-name">Ticket #:</span>
    <span class="item-price">${data.id}</span>
  </div>
  <div class="item">
    <span class="item-name">Cajero:</span>
    <span class="item-price">${data.cashier}</span>
  </div>
  
  <div class="divider"></div>
  
  ${data.items.map(item => `
    <div class="item">
      <span class="item-name">${item.product?.name || 'Producto'} x${item.quantity}</span>
      <span class="item-price">$${(item.price * item.quantity).toFixed(2)}</span>
    </div>
    <div class="item-details">
      SKU: ${item.product?.sku || 'N/A'} | Precio unitario: $${item.price.toFixed(2)}
      ${item.discount > 0 ? ` | Descuento: $${item.discount.toFixed(2)}` : ''}
    </div>
  `).join('')}
  
  <div class="divider"></div>
  
  <div class="total">
    <div class="item">
      <span class="item-name">Subtotal:</span>
      <span class="item-price">$${data.subtotal.toFixed(2)}</span>
    </div>
    <div class="item">
      <span class="item-name">IVA (16%):</span>
      <span class="item-price">$${data.tax.toFixed(2)}</span>
    </div>
    <div class="item">
      <span class="item-name">TOTAL:</span>
      <span class="item-price">$${data.total.toFixed(2)}</span>
    </div>
    <div class="payment-method">Método de pago: ${data.paymentMethod === 'EFECTIVO' ? 'Efectivo' : 'Tarjeta'}</div>
    <div class="tax-info">Este documento es un comprobante fiscal</div>
  </div>
  
  <div class="footer">
    <div>¡Gracias por su compra!</div>
    <div>${company.website}</div>
    <div style="margin-top: 5px; font-size: 7px;">
      Conserve este ticket para garantías y devoluciones
    </div>
  </div>
</body>
</html>
`
}

console.log('📋 Información de la empresa:')
console.log('- Nombre:', companyInfo.name)
console.log('- Logo:', companyInfo.logo)
console.log('- Dirección:', companyInfo.address)
console.log('- Teléfono:', companyInfo.phone)
console.log('- RFC:', companyInfo.rfc)

console.log('\n📋 Datos de la venta:')
console.log('- ID:', saleData.id)
console.log('- Total:', saleData.total)
console.log('- Subtotal:', saleData.subtotal)
console.log('- IVA:', saleData.tax)
console.log('- Método de pago:', saleData.paymentMethod)
console.log('- Cajero:', saleData.cashier)

console.log('\n🎫 HTML del ticket mejorado:')
console.log(generateEnhancedTicket(saleData, companyInfo))

console.log('\n📝 Para personalizar el ticket:')
console.log('1. Cambia la URL del logo en companyInfo.logo')
console.log('2. Actualiza la información de la empresa')
console.log('3. Ajusta los estilos según tus necesidades')
console.log('4. Agrega más campos según requieras')

console.log('\n✅ Ticket mejorado generado.') 