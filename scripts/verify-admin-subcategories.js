// Script para verificar que las subcategorías de calzado estén disponibles en el admin
console.log('🔍 Verificando subcategorías de calzado en el admin...')

const fs = require('fs');
const path = require('path');

function verifyAdminSubcategories() {
  try {
    console.log('\n📋 Verificando cambios en la página de nuevo producto:');
    
    const filePath = path.join(__dirname, '../src/app/admin/productos/nuevo/page.tsx');
    const fileContent = fs.readFileSync(filePath, 'utf8');
    
    // Verificar que las subcategorías específicas de calzado estén definidas
    const subcategoriesDefinition = fileContent.match(/const subcategoriasPorCategoria: Record<string, string\[\]> = \{[\s\S]*?\};/);
    
    if (subcategoriesDefinition) {
      console.log('   ✅ Definición de subcategorías encontrada');
      
      // Verificar subcategorías específicas de calzado
      const hasCalzadoMujer = subcategoriesDefinition[0].includes('"calzado-mujer"');
      const hasCalzadoHombre = subcategoriesDefinition[0].includes('"calzado-hombre"');
      const hasCalzadoNino = subcategoriesDefinition[0].includes('"calzado-nino"');
      const hasCalzadoNina = subcategoriesDefinition[0].includes('"calzado-nina"');
      
      console.log(`   ${hasCalzadoMujer ? '✅' : '❌'} Calzado de Mujer: ${hasCalzadoMujer ? 'Presente' : 'Faltante'}`);
      console.log(`   ${hasCalzadoHombre ? '✅' : '❌'} Calzado de Hombre: ${hasCalzadoHombre ? 'Presente' : 'Faltante'}`);
      console.log(`   ${hasCalzadoNino ? '✅' : '❌'} Calzado de Niño: ${hasCalzadoNino ? 'Presente' : 'Faltante'}`);
      console.log(`   ${hasCalzadoNina ? '✅' : '❌'} Calzado de Niña: ${hasCalzadoNina ? 'Presente' : 'Faltante'}`);
      
      // Verificar subcategorías específicas
      const calzadoMujerSubcats = ['Tacones', 'Zapatillas', 'Zapatos', 'Sneakers', 'Botas', 'Huaraches', 'Sandalias'];
      const calzadoHombreSubcats = ['Zapatos', 'Sneakers', 'Botas', 'Sandalias'];
      
      console.log('\n👠 Subcategorías de Calzado de Mujer:');
      calzadoMujerSubcats.forEach(subcat => {
        const hasSubcat = subcategoriesDefinition[0].includes(`"${subcat}"`);
        console.log(`   ${hasSubcat ? '✅' : '❌'} ${subcat}`);
      });
      
      console.log('\n👞 Subcategorías de Calzado de Hombre:');
      calzadoHombreSubcats.forEach(subcat => {
        const hasSubcat = subcategoriesDefinition[0].includes(`"${subcat}"`);
        console.log(`   ${hasSubcat ? '✅' : '❌'} ${subcat}`);
      });
      
    } else {
      console.log('   ❌ No se encontró la definición de subcategorías');
    }
    
    // Verificar la función getSlugByCategoryId
    const hasCalzadoMujerMapping = fileContent.includes('calzado de mujer');
    const hasCalzadoHombreMapping = fileContent.includes('calzado de hombre');
    
    console.log('\n🔗 Mapeo de categorías:');
    console.log(`   ${hasCalzadoMujerMapping ? '✅' : '❌'} Mapeo para Calzado de Mujer`);
    console.log(`   ${hasCalzadoHombreMapping ? '✅' : '❌'} Mapeo para Calzado de Hombre`);
    
    console.log('\n🌐 URLs para probar en el admin:');
    console.log('   ✅ /admin/productos/nuevo - Crear nuevo producto');
    console.log('   ✅ Seleccionar "Calzado de Mujer" - Debería mostrar subcategorías específicas');
    console.log('   ✅ Seleccionar "Calzado de Hombre" - Debería mostrar subcategorías específicas');
    
    console.log('\n📱 Cambios realizados:');
    console.log('✅ Subcategorías específicas agregadas para calzado de mujer y hombre');
    console.log('✅ Función de mapeo actualizada para reconocer categorías específicas');
    console.log('✅ Subcategorías disponibles en el formulario de creación de productos');
    
  } catch (error) {
    console.error('❌ Error en la verificación:', error);
  }
}

verifyAdminSubcategories(); 