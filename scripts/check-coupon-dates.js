// Script para verificar las fechas de los cupones existentes
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Verificando fechas de cupones existentes...');
  console.log('Fecha actual del sistema:', new Date().toString());
  
  const coupons = await prisma.discountCoupon.findMany();
  
  console.log(`Se encontraron ${coupons.length} cupones en la base de datos:`);
  
  for (const coupon of coupons) {
    console.log(`\nCupón: ${coupon.code}`);
    console.log(`- Tipo de descuento: ${coupon.discountType}`);
    console.log(`- Valor de descuento: ${coupon.discountValue}`);
    console.log(`- Activo: ${coupon.isActive}`);
    console.log(`- Fecha de inicio: ${coupon.startDate ? coupon.startDate.toISOString() : 'No definida'}`);
    console.log(`- Fecha de fin: ${coupon.endDate ? coupon.endDate.toISOString() : 'No definida'}`);
    
    // Verificar si el cupón está dentro del rango de fechas válido
    const now = new Date();
    const isStartDateValid = !coupon.startDate || now >= coupon.startDate;
    const isEndDateValid = !coupon.endDate || now <= coupon.endDate;
    
    console.log(`- ¿Fecha de inicio válida? ${isStartDateValid ? 'Sí' : 'No'}`);
    console.log(`- ¿Fecha de fin válida? ${isEndDateValid ? 'Sí' : 'No'}`);
    console.log(`- ¿Cupón válido por fechas? ${isStartDateValid && isEndDateValid ? 'Sí' : 'No'}`);
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