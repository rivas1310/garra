// Script para mostrar una vista previa del ticket
console.log('🎫 Generando vista previa del ticket...')

// Simular datos de una venta real
const saleData = {
  id: 'clx123456789',
  total: 275.50,
  items: [
    {
      product: { name: 'Overol de Trabajo' },
      quantity: 2,
      price: 125.00
    },
    {
      product: { name: 'Camisa Casual' },
      quantity: 1,
      price: 25.50
    }
  ],
  paymentMethod: 'EFECTIVO',
  createdAt: new Date().toISOString()
}

// Generar el contenido del ticket
const generateTicketContent = (data) => {
  const ticketContent = `
╔══════════════════════════════════════════════════════════════╗
║                    GARRAS FELINAS                           ║
║                    Venta Física                             ║
║                    ${new Date().toLocaleString('es-MX', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })}                    ║
║                    Ticket #${data.id}                    ║
╠══════════════════════════════════════════════════════════════╣
║ PRODUCTO                                    CANT.    PRECIO ║
╠══════════════════════════════════════════════════════════════╣
${data.items.map(item => {
  const itemName = item.product?.name || 'Producto'
  const quantity = item.quantity
  const price = (item.price * item.quantity).toFixed(2)
  const paddedName = itemName.padEnd(35)
  const paddedQty = quantity.toString().padStart(5)
  const paddedPrice = price.padStart(8)
  return `║ ${paddedName} ${paddedQty}  $${paddedPrice} ║`
}).join('\n')}
╠══════════════════════════════════════════════════════════════╣
║ TOTAL:                                    $${data.total.toFixed(2).padStart(8)} ║
║ Método de pago: ${data.paymentMethod === 'EFECTIVO' ? 'Efectivo' : 'Tarjeta'.padEnd(35)} ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║              ¡Gracias por su compra!                        ║
║              www.garrasfelinas.com                          ║
║                                                              ║
║              Este ticket es un comprobante                  ║
║              de venta                                       ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
`
  return ticketContent
}

// Generar el HTML del ticket
const generateTicketHTML = (data) => {
  return `
<!DOCTYPE html>
<html>
<head>
  <title>Ticket de Venta - Garras Felinas</title>
  <meta charset="UTF-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: 'Courier New', 'Monaco', 'Menlo', monospace; 
      font-size: 12px; 
      line-height: 1.4;
      margin: 0; 
      padding: 10px; 
      background: white;
      color: black;
    }
    .header { 
      text-align: center; 
      margin-bottom: 20px; 
      border-bottom: 2px solid #000;
      padding-bottom: 10px;
    }
    .title { 
      font-size: 18px; 
      font-weight: bold; 
      margin-bottom: 5px; 
      text-transform: uppercase;
    }
    .subtitle { 
      font-size: 10px; 
      color: #333; 
      margin-bottom: 2px;
    }
    .divider { 
      border-top: 1px dashed #000; 
      margin: 10px 0; 
    }
    .item { 
      display: flex; 
      justify-content: space-between; 
      margin: 5px 0; 
      font-size: 11px;
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
      padding-top: 10px; 
      margin-top: 10px; 
    }
    .footer { 
      text-align: center; 
      margin-top: 20px; 
      font-size: 10px; 
      border-top: 1px dashed #000;
      padding-top: 10px;
    }
    .payment-method {
      font-size: 10px;
      color: #333;
      margin-top: 5px;
    }
    @media print { 
      body { margin: 0; padding: 5px; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="title">Garras Felinas</div>
    <div class="subtitle">Venta Física</div>
    <div class="subtitle">${new Date().toLocaleString('es-MX', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })}</div>
    <div class="subtitle">Ticket #${data.id}</div>
  </div>
  
  <div class="divider"></div>
  
  ${data.items.map(item => `
    <div class="item">
      <span class="item-name">${item.product?.name || 'Producto'} x${item.quantity}</span>
      <span class="item-price">$${(item.price * item.quantity).toFixed(2)}</span>
    </div>
  `).join('')}
  
  <div class="divider"></div>
  
  <div class="total">
    <div class="item">
      <span class="item-name">TOTAL</span>
      <span class="item-price">$${data.total.toFixed(2)}</span>
    </div>
    <div class="payment-method">Método de pago: ${data.paymentMethod === 'EFECTIVO' ? 'Efectivo' : 'Tarjeta'}</div>
  </div>
  
  <div class="footer">
    <div>¡Gracias por su compra!</div>
    <div>www.garrasfelinas.com</div>
    <div style="margin-top: 10px; font-size: 8px;">
      Este ticket es un comprobante de venta
    </div>
  </div>
</body>
</html>
`
}

console.log('📋 Datos de la venta:')
console.log('- ID:', saleData.id)
console.log('- Total:', saleData.total)
console.log('- Método de pago:', saleData.paymentMethod)
console.log('- Items:', saleData.items.length)
console.log('- Fecha:', new Date().toLocaleString())

console.log('\n🎫 Vista previa del ticket (formato texto):')
console.log(generateTicketContent(saleData))

console.log('\n🌐 HTML del ticket (para impresión):')
console.log(generateTicketHTML(saleData))

console.log('\n📝 Para ver el ticket en el navegador:')
console.log('1. Copia el HTML generado arriba')
console.log('2. Crea un archivo .html')
console.log('3. Pega el contenido')
console.log('4. Abre en el navegador')
console.log('5. Usa Ctrl+P para imprimir')

console.log('\n🔍 En la aplicación real:')
console.log('- El ticket se genera automáticamente')
console.log('- Se abre en una nueva ventana')
console.log('- Se imprime automáticamente')
console.log('- Se cierra la ventana después')

console.log('\n✅ Vista previa completada.') 