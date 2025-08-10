const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkOrderData() {
  try {
    console.log('🔍 Verificando datos de pedidos...\n');

    // Obtener el pedido más reciente
    const latestOrder = await prisma.order.findFirst({
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        },
        shippingAddress: true,
        billingAddress: true
      }
    });

    if (!latestOrder) {
      console.log('❌ No hay pedidos en la base de datos');
      return;
    }

    console.log('📋 Pedido más reciente:');
    console.log(`   - ID: ${latestOrder.id}`);
    console.log(`   - Fecha: ${latestOrder.createdAt}`);
    console.log(`   - Total: $${latestOrder.total}`);
    console.log('');

    console.log('👤 Datos del usuario:');
    console.log(`   - Nombre: ${latestOrder.user?.name || 'No disponible'}`);
    console.log(`   - Email: ${latestOrder.user?.email || 'No disponible'}`);
    console.log('');

    console.log('📍 Datos de cliente directos (campos customer*):');
    console.log(`   - customerName: ${latestOrder.customerName || 'NULL'}`);
    console.log(`   - customerEmail: ${latestOrder.customerEmail || 'NULL'}`);
    console.log(`   - customerPhone: ${latestOrder.customerPhone || 'NULL'}`);
    console.log(`   - customerStreet: ${latestOrder.customerStreet || 'NULL'}`);
    console.log(`   - customerNumberExterior: ${latestOrder.customerNumberExterior || 'NULL'}`);
    console.log(`   - customerNumberInterior: ${latestOrder.customerNumberInterior || 'NULL'}`);
    console.log(`   - customerColonia: ${latestOrder.customerColonia || 'NULL'}`);
    console.log(`   - customerCity: ${latestOrder.customerCity || 'NULL'}`);
    console.log(`   - customerState: ${latestOrder.customerState || 'NULL'}`);
    console.log(`   - customerPostalCode: ${latestOrder.customerPostalCode || 'NULL'}`);
    console.log(`   - customerCountry: ${latestOrder.customerCountry || 'NULL'}`);
    console.log(`   - customerReferences: ${latestOrder.customerReferences || 'NULL'}`);
    console.log('');

    console.log('📍 Direcciones relacionadas:');
    console.log(`   - shippingAddress: ${latestOrder.shippingAddress ? 'SÍ' : 'NO'}`);
    if (latestOrder.shippingAddress) {
      console.log(`     * Nombre: ${latestOrder.shippingAddress.name || 'NULL'}`);
      console.log(`     * Calle: ${latestOrder.shippingAddress.street || 'NULL'}`);
      console.log(`     * Ciudad: ${latestOrder.shippingAddress.city || 'NULL'}`);
    }
    
    console.log(`   - billingAddress: ${latestOrder.billingAddress ? 'SÍ' : 'NO'}`);
    if (latestOrder.billingAddress) {
      console.log(`     * Nombre: ${latestOrder.billingAddress.name || 'NULL'}`);
      console.log(`     * Calle: ${latestOrder.billingAddress.street || 'NULL'}`);
      console.log(`     * Ciudad: ${latestOrder.billingAddress.city || 'NULL'}`);
    }

    console.log('');
    console.log('📝 Notas:', latestOrder.notes || 'NULL');

  } catch (error) {
    console.error('❌ Error al verificar datos del pedido:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkOrderData();