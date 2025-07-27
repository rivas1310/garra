/**
 * Script para verificar y actualizar la seguridad de los cupones
 * Verifica que todos los cupones estén en mayúsculas y que no haya duplicados
 * con diferentes casos (mayúsculas/minúsculas)
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verifyCouponSecurity() {
  try {
    console.log('Verificando seguridad de cupones...');
    
    // Obtener todos los cupones
    const coupons = await prisma.discountCoupon.findMany();
    console.log(`Se encontraron ${coupons.length} cupones en la base de datos.`);
    
    // Verificar cupones en minúsculas
    const lowercaseCoupons = coupons.filter(coupon => 
      coupon.code !== coupon.code.toUpperCase());
    
    if (lowercaseCoupons.length > 0) {
      console.log('\nSe encontraron cupones que no están en mayúsculas:');
      lowercaseCoupons.forEach(coupon => {
        console.log(`- ${coupon.code} (ID: ${coupon.id})`);
      });
      
      // Preguntar si se desean normalizar
      const normalize = process.argv.includes('--normalize');
      
      if (normalize) {
        console.log('\nNormalizando cupones a mayúsculas...');
        
        for (const coupon of lowercaseCoupons) {
          const upperCode = coupon.code.toUpperCase();
          await prisma.discountCoupon.update({
            where: { id: coupon.id },
            data: { code: upperCode }
          });
          console.log(`- Actualizado: ${coupon.code} → ${upperCode}`);
        }
        
        console.log('\nTodos los cupones han sido normalizados a mayúsculas.');
      } else {
        console.log('\nPara normalizar los cupones a mayúsculas, ejecute:');
        console.log('node scripts/verify-coupon-security.js --normalize');
      }
    } else {
      console.log('Todos los cupones están en mayúsculas. ✓');
    }
    
    // Verificar posibles duplicados (insensible a mayúsculas/minúsculas)
    const codeMap = new Map();
    const duplicates = [];
    
    coupons.forEach(coupon => {
      const upperCode = coupon.code.toUpperCase();
      if (codeMap.has(upperCode)) {
        duplicates.push({
          original: codeMap.get(upperCode),
          duplicate: coupon
        });
      } else {
        codeMap.set(upperCode, coupon);
      }
    });
    
    if (duplicates.length > 0) {
      console.log('\n¡ALERTA DE SEGURIDAD! Se encontraron cupones duplicados (insensible a mayúsculas/minúsculas):');
      duplicates.forEach(({ original, duplicate }) => {
        console.log(`- Original: ${original.code} (ID: ${original.id})`);
        console.log(`  Duplicado: ${duplicate.code} (ID: ${duplicate.id})`);
      });
      
      console.log('\nSe recomienda eliminar los cupones duplicados manualmente desde el panel de administración.');
    } else {
      console.log('No se encontraron cupones duplicados. ✓');
    }
    
    // Verificar cupones con fechas inválidas
    const now = new Date();
    const invalidDateCoupons = coupons.filter(coupon => {
      return (
        (coupon.startDate && new Date(coupon.startDate) > now) ||
        (coupon.endDate && new Date(coupon.endDate) < now)
      );
    });
    
    if (invalidDateCoupons.length > 0) {
      console.log('\nSe encontraron cupones con fechas inválidas (no activos actualmente):');
      invalidDateCoupons.forEach(coupon => {
        const startDate = coupon.startDate ? new Date(coupon.startDate).toLocaleDateString() : 'No definida';
        const endDate = coupon.endDate ? new Date(coupon.endDate).toLocaleDateString() : 'No definida';
        console.log(`- ${coupon.code} (ID: ${coupon.id})`);
        console.log(`  Fecha inicio: ${startDate}, Fecha fin: ${endDate}`);
      });
    } else {
      console.log('Todos los cupones tienen fechas válidas. ✓');
    }
    
    // Verificar cupones sin límites de uso
    const unlimitedCoupons = coupons.filter(coupon => 
      coupon.maxUses === null || coupon.maxUses === 0);
    
    if (unlimitedCoupons.length > 0) {
      console.log('\nSe encontraron cupones sin límite de usos:');
      unlimitedCoupons.forEach(coupon => {
        console.log(`- ${coupon.code} (ID: ${coupon.id})`);
      });
      console.log('\nConsidere establecer un límite de usos para estos cupones para prevenir abusos.');
    } else {
      console.log('Todos los cupones tienen límites de uso establecidos. ✓');
    }
    
    console.log('\nVerificación de seguridad de cupones completada.');
    
  } catch (error) {
    console.error('Error al verificar la seguridad de los cupones:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyCouponSecurity();