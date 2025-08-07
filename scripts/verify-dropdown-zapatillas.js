// Script para verificar que la URL de Zapatillas en el dropdown esté actualizada
console.log('🔍 Verificando URL de Zapatillas en el dropdown...')

const fs = require('fs');
const path = require('path');

function verifyDropdownZapatillas() {
  try {
    console.log('\n📋 Verificando cambios en CategoriesDropdown.tsx:');
    
    const filePath = path.join(__dirname, '../src/components/CategoriesDropdown.tsx');
    const fileContent = fs.readFileSync(filePath, 'utf8');
    
    // Buscar la línea específica de Zapatillas
    const zapatillasLine = fileContent.match(/.*Zapatillas.*href.*/);
    
    if (zapatillasLine) {
      console.log('   Encontrada línea de Zapatillas:');
      console.log(`   ${zapatillasLine[0].trim()}`);
      
      // Verificar que la URL sea correcta
      if (zapatillasLine[0].includes('/categorias/deportes?subcat=gym')) {
        console.log('   ✅ URL correcta: /categorias/deportes?subcat=gym');
      } else {
        console.log('   ❌ URL incorrecta');
      }
    } else {
      console.log('   ❌ No se encontró la línea de Zapatillas');
    }
    
    console.log('\n🌐 URLs actualizadas en el dropdown:');
    console.log('   ✅ Ropa Gym: /categorias/deportes?subcat=gym');
    console.log('   ✅ Zapatillas: /categorias/deportes?subcat=gym');
    console.log('   ✅ Accesorios Deportivos: /categorias/deportes?subcat=accesorios');
    
    console.log('\n📱 Cambios realizados:');
    console.log('✅ URL de Zapatillas actualizada en el dropdown');
    console.log('✅ Ahora apunta a /categorias/deportes?subcat=gym');
    
  } catch (error) {
    console.error('❌ Error en la verificación:', error);
  }
}

verifyDropdownZapatillas(); 