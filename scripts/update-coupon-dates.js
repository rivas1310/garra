// Script para actualizar las fechas de validez de un cupón existente
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const couponCode = 'verano';
  
  log.error(`Actualizando fechas del cupón: ${couponCode}`);
  log.error('Fecha actual del sistema:', new Date().toString());
  
  try {
    // Crear fechas explícitamente para evitar problemas con la configuración del sistema
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();
    const currentDay = new Date().getDate();
    
    // Establecer fecha de inicio como hoy con el año actual
    const startDate = new Date(currentYear, currentMonth, currentDay);
    
    // Establecer fecha de fin como 30 días después con el año actual
    const endDate = new Date(currentYear, currentMonth, currentDay + 30);
    
    log.error('Nueva fecha de inicio:', startDate.toString());
    log.error('Nueva fecha de fin:', endDate.toString());
    
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
    
    log.error('Cupón actualizado exitosamente:');
    log.error(updatedCoupon);
    
    // Verificar el cupón actualizado
    const verifiedCoupon = await prisma.discountCoupon.findUnique({
      where: { code: couponCode }
    });
    
    log.error('\nVerificación del cupón actualizado:');
    log.error(verifiedCoupon);
  } catch (error) {
    log.error('Error al actualizar el cupón:', error);
  }
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