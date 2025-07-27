// Script para verificar y crear cupones de prueba
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Verificando cupones existentes...');
  
  // Buscar todos los cupones
  const coupons = await prisma.discountCoupon.findMany();
  
  console.log(`Se encontraron ${coupons.length} cupones en la base de datos:`);
  
  if (coupons.length > 0) {
    // Mostrar información de los cupones existentes
    coupons.forEach(coupon => {
      console.log(`- ${coupon.code} (${coupon.discountType}): ${coupon.discountValue} - Activo: ${coupon.isActive}`);
    });
  } else {
    console.log('No se encontraron cupones. Creando cupón de prueba...');
    
    // Crear un cupón de prueba
    const testCoupon = await prisma.discountCoupon.create({
      data: {
        code: 'PRUEBA10',
        description: 'Cupón de prueba 10% descuento',
        discountType: 'PERCENTAGE',
        discountValue: 10,
        minOrderValue: 0,
        maxUses: 100,
        isActive: true,
        startDate: new Date(),
        endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)) // Válido por 1 mes
      }
    });
    
    console.log('Cupón de prueba creado exitosamente:');
    console.log(testCoupon);
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('Error:', e);
    await prisma.$disconnect();
    process.exit(1);
  });