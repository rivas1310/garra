// Script para verificar la fecha del sistema y corregir las fechas de los cupones existentes
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('=== Herramienta de corrección de fechas de cupones ===');
  console.log('Fecha actual del sistema:', new Date().toString());
  
  try {
    // Obtener todos los cupones
    const coupons = await prisma.discountCoupon.findMany();
    
    console.log(`\nSe encontraron ${coupons.length} cupones en la base de datos.`);
    
    if (coupons.length === 0) {
      console.log('No hay cupones para corregir.');
      return;
    }
    
    console.log('\nEstado actual de los cupones:');
    coupons.forEach(coupon => {
      console.log(`- ${coupon.code} (${coupon.discountType}): ${coupon.discountValue}`);
      console.log(`  Activo: ${coupon.isActive}, Fecha inicio: ${coupon.startDate}, Fecha fin: ${coupon.endDate || 'Sin fecha fin'}`);
    });
    
    console.log('\nActualizando fechas de todos los cupones para asegurar su validez...');
    
    // Actualizar todos los cupones con fechas amplias
    const updatePromises = coupons.map(coupon => {
      return prisma.discountCoupon.update({
        where: { id: coupon.id },
        data: {
          startDate: new Date('2020-01-01'),
          endDate: new Date('2030-12-31'),
          isActive: true
        }
      });
    });
    
    await Promise.all(updatePromises);
    
    console.log('\nCupones actualizados exitosamente con fechas amplias (2020-2030).');
    
    // Verificar los cupones actualizados
    const updatedCoupons = await prisma.discountCoupon.findMany();
    
    console.log('\nEstado actualizado de los cupones:');
    updatedCoupons.forEach(coupon => {
      console.log(`- ${coupon.code} (${coupon.discountType}): ${coupon.discountValue}`);
      console.log(`  Activo: ${coupon.isActive}, Fecha inicio: ${coupon.startDate}, Fecha fin: ${coupon.endDate || 'Sin fecha fin'}`);
    });
    
    console.log('\n¡Todos los cupones han sido actualizados con fechas amplias!');
    console.log('Ahora deberían funcionar correctamente independientemente de la fecha del sistema.');
  } catch (error) {
    console.error('Error al actualizar los cupones:', error);
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