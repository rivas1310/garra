// Script para crear un cupón válido independientemente de la fecha del sistema
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Fecha actual del sistema:', new Date().toString());
  
  try {
    // Crear un nuevo cupón con fechas muy amplias para asegurar validez
    const newCoupon = await prisma.discountCoupon.create({
      data: {
        code: 'SIEMPRE10',
        description: 'Cupón siempre válido 10% descuento',
        discountType: 'PERCENTAGE',
        discountValue: 10,
        minOrderValue: 0,
        maxUses: 1000,
        usedCount: 0,
        isActive: true,
        // Fechas muy amplias para asegurar validez
        startDate: new Date('2020-01-01'),
        endDate: new Date('2030-12-31')
      }
    });
    
    console.log('Nuevo cupón creado exitosamente:');
    console.log(newCoupon);
    
    // Verificar el cupón creado
    const verifiedCoupon = await prisma.discountCoupon.findUnique({
      where: { code: 'SIEMPRE10' }
    });
    
    console.log('\nVerificación del cupón creado:');
    console.log(verifiedCoupon);
    
    console.log('\nEste cupón debería funcionar correctamente con el código: SIEMPRE10');
  } catch (error) {
    console.error('Error al crear el cupón:', error);
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