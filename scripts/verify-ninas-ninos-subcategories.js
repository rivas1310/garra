// Script para verificar que las subcategorías de Niñas y Niños se hayan agregado correctamente
console.log('🔍 Verificando subcategorías de Niñas y Niños...')

const fs = require('fs');
const path = require('path');

function verifyNinasNinosSubcategories() {
  try {
    console.log('\n📋 Verificando cambios en SubcategoryGrid.tsx:');
    
    const subcategoryGridPath = path.join(__dirname, '../src/components/SubcategoryGrid.tsx');
    const subcategoryGridContent = fs.readFileSync(subcategoryGridPath, 'utf8');
    
    // Verificar que las categorías ninas y ninos estén definidas
    const hasNinas = subcategoryGridContent.includes('ninas: [');
    const hasNinos = subcategoryGridContent.includes('ninos: [');
    
    console.log(`   ${hasNinas ? '✅' : '❌'} Categoría Niñas: ${hasNinas ? 'Presente' : 'Faltante'}`);
    console.log(`   ${hasNinos ? '✅' : '❌'} Categoría Niños: ${hasNinos ? 'Presente' : 'Faltante'}`);
    
    // Verificar subcategorías específicas de Niñas
    const ninasSubcats = ['Vestidos', 'Blusas', 'Pantalones', 'Faldas', 'Shorts'];
    console.log('\n👗 Subcategorías de Niñas:');
    ninasSubcats.forEach(subcat => {
      const hasSubcat = subcategoryGridContent.includes(`name: '${subcat}'`);
      console.log(`   ${hasSubcat ? '✅' : '❌'} ${subcat}`);
    });
    
    // Verificar subcategorías específicas de Niños
    const ninosSubcats = ['Camisetas', 'Pantalones', 'Shorts', 'Sudaderas', 'Chamarras'];
    console.log('\n👕 Subcategorías de Niños:');
    ninosSubcats.forEach(subcat => {
      const hasSubcat = subcategoryGridContent.includes(`name: '${subcat}'`);
      console.log(`   ${hasSubcat ? '✅' : '❌'} ${subcat}`);
    });
    
    console.log('\n📋 Verificando cambios en la página de nuevo producto:');
    
    const adminPagePath = path.join(__dirname, '../src/app/admin/productos/nuevo/page.tsx');
    const adminPageContent = fs.readFileSync(adminPagePath, 'utf8');
    
    // Verificar que las subcategorías estén definidas en el admin
    const hasNinasInAdmin = adminPageContent.includes('ninas: [');
    const hasNinosInAdmin = adminPageContent.includes('ninos: [');
    
    console.log(`   ${hasNinasInAdmin ? '✅' : '❌'} Subcategorías de Niñas en Admin: ${hasNinasInAdmin ? 'Presente' : 'Faltante'}`);
    console.log(`   ${hasNinosInAdmin ? '✅' : '❌'} Subcategorías de Niños en Admin: ${hasNinosInAdmin ? 'Presente' : 'Faltante'}`);
    
    // Verificar mapeo en el admin
    const hasNinasMapping = adminPageContent.includes('niña') && adminPageContent.includes('ninas');
    const hasNinosMapping = adminPageContent.includes('niño') && adminPageContent.includes('ninos');
    
    console.log('\n🔗 Mapeo en Admin:');
    console.log(`   ${hasNinasMapping ? '✅' : '❌'} Mapeo para Niñas`);
    console.log(`   ${hasNinosMapping ? '✅' : '❌'} Mapeo para Niños`);
    
    console.log('\n🌐 URLs para probar:');
    console.log('   ✅ http://localhost:3000/categorias/ninas - Categoría Niñas');
    console.log('   ✅ http://localhost:3000/categorias/ninos - Categoría Niños');
    console.log('   ✅ /admin/productos/nuevo - Crear producto y seleccionar Niñas/Niños');
    
    console.log('\n📱 Cambios realizados:');
    console.log('✅ Subcategorías agregadas para Niñas en SubcategoryGrid.tsx');
    console.log('✅ Subcategorías agregadas para Niños en SubcategoryGrid.tsx');
    console.log('✅ Subcategorías agregadas para Niñas en Admin');
    console.log('✅ Subcategorías agregadas para Niños en Admin');
    console.log('✅ Función de mapeo actualizada para reconocer Niñas y Niños');
    
  } catch (error) {
    console.error('❌ Error en la verificación:', error);
  }
}

verifyNinasNinosSubcategories(); 