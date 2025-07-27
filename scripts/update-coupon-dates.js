// Script para actualizar las fechas de validez de un cupón existente
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const couponCode = 'verano';
  
  console.log(`Actualizando fechas del cupón: ${couponCode}`);
  console.log('Fecha actual del sistema:', new Date().toString());
  
  try {
    // Crear fechas explícitamente para evitar problemas con la configuración del sistema
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();
    const currentDay = new Date().getDate();
    
    // Establecer fecha de inicio como hoy con el año actual
    const startDate = new Date(currentYear, currentMonth, currentDay);
    
    // Establecer fecha de fin como 30 días después con el año actual
    const endDate = new Date(currentYear, currentMonth, currentDay + 30);
    
    console.log('Nueva fecha de inicio:', startDate.toString());
    console.log('Nueva fecha de fin:', endDate.toString());
    
    // Actualizar el cupón
    const updatedCoupon = await prisma.discountCoupon.update({
      where: { code: couponCode },
      data: {
        startDate,
        endDate,
        isActive: true,
        // También podemos actualizar otros campos si es necesario
        minOrderValue: 0, // Reducir el valor mínimo de pedido para facilitar las pruebas
      }
    });
    
    console.log('Cupón actualizado exitosamente:');
    console.log(updatedCoupon);
    
    // Verificar el cupón actualizado
    const verifiedCoupon = await prisma.discountCoupon.findUnique({
      where: { code: couponCode }
    });
    
    console.log('\nVerificación del cupón actualizado:');
    console.log(verifiedCoupon);
  } catch (error) {
    console.error('Error al actualizar el cupón:', error);
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