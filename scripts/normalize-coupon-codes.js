// Script para normalizar los códigos de cupones a mayúsculas
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  log.error('Normalizando códigos de cupones a mayúsculas...');
  
  // Obtener todos los cupones
  const coupons = await prisma.discountCoupon.findMany();
  
  log.error(`Se encontraron ${coupons.length} cupones en la base de datos.`);
  
  let updatedCount = 0;
  
  // Actualizar cada cupón cuyo código no esté en mayúsculas
  for (const coupon of coupons) {
    if (coupon.code !== coupon.code.toUpperCase()) {
      log.error(`Actualizando cupón: ${coupon.code} -> ${coupon.code.toUpperCase()}`);
      
      await prisma.discountCoupon.update({
        where: { id: coupon.id },
        data: { code: coupon.code.toUpperCase() }
      });
      
      updatedCount++;
    }
  }
  
  log.error(`\nSe actualizaron ${updatedCount} cupones.`);
  log.error(`${coupons.length - updatedCount} cupones ya estaban en mayúsculas.`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    log.error('Error:', e);
    await prisma.$disconnect();
    process.exit(1);
  });