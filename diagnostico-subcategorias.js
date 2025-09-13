// Script de diagnóstico para subcategorías
// Ejecutar en la consola del navegador en http://localhost:3000/categorias/mujer

console.log('🔍 INICIANDO DIAGNÓSTICO DE SUBCATEGORÍAS');
console.log('📍 URL actual:', window.location.href);
console.log('📋 Parámetros URL:', Object.fromEntries(new URLSearchParams(window.location.search)));

// Función para simular clic en subcategoría
function testSubcategoryClick(subcategoryName) {
  console.log(`\n🧪 PROBANDO SUBCATEGORÍA: ${subcategoryName}`);
  
  // Buscar el botón de la subcategoría
  const buttons = document.querySelectorAll('button');
  let subcatButton = null;
  
  buttons.forEach(button => {
    if (button.textContent.includes(subcategoryName)) {
      subcatButton = button;
    }
  });
  
  if (subcatButton) {
    console.log('✅ Botón encontrado:', subcatButton);
    console.log('📍 URL antes del clic:', window.location.href);
    
    // Simular clic
    subcatButton.click();
    
    // Verificar después del clic
    setTimeout(() => {
      console.log('📍 URL después del clic:', window.location.href);
      console.log('📋 Parámetros después del clic:', Object.fromEntries(new URLSearchParams(window.location.search)));
      
      // Verificar si los productos se filtraron
      const productCards = document.querySelectorAll('[data-testid="product-card"], .product-card, [class*="product"]');
      console.log('🛍️ Productos visibles:', productCards.length);
    }, 1000);
  } else {
    console.log('❌ No se encontró el botón para:', subcategoryName);
    console.log('🔍 Botones disponibles:');
    buttons.forEach((btn, index) => {
      if (btn.textContent.trim()) {
        console.log(`  ${index}: "${btn.textContent.trim()}"`);
      }
    });
  }
}

// Función para probar múltiples subcategorías
function runFullDiagnostic() {
  const subcategories = ['Vestidos', 'Blusas', 'Pantalones', 'Abrigos'];
  let currentIndex = 0;
  
  function testNext() {
    if (currentIndex < subcategories.length) {
      testSubcategoryClick(subcategories[currentIndex]);
      currentIndex++;
      setTimeout(testNext, 3000); // Esperar 3 segundos entre pruebas
    } else {
      console.log('\n🏁 DIAGNÓSTICO COMPLETADO');
    }
  }
  
  testNext();
}

// Función para verificar el estado actual
function checkCurrentState() {
  console.log('\n📊 ESTADO ACTUAL:');
  console.log('📍 URL:', window.location.href);
  console.log('📋 Parámetros:', Object.fromEntries(new URLSearchParams(window.location.search)));
  
  // Verificar sessionStorage
  const savedState = sessionStorage.getItem('categoryNavigationState');
  if (savedState) {
    console.log('💾 Estado guardado:', JSON.parse(savedState));
  } else {
    console.log('💾 No hay estado guardado');
  }
  
  // Verificar botones de subcategoría
  const buttons = document.querySelectorAll('button');
  const subcatButtons = [];
  buttons.forEach(button => {
    if (button.textContent && button.textContent.trim() && 
        !button.textContent.includes('Carrito') && 
        !button.textContent.includes('Buscar')) {
      subcatButtons.push(button.textContent.trim());
    }
  });
  console.log('🔘 Subcategorías disponibles:', subcatButtons);
}

// Ejecutar diagnóstico inicial
checkCurrentState();

console.log('\n🚀 COMANDOS DISPONIBLES:');
console.log('- checkCurrentState() - Verificar estado actual');
console.log('- testSubcategoryClick("NombreSubcategoria") - Probar una subcategoría específica');
console.log('- runFullDiagnostic() - Ejecutar diagnóstico completo');
console.log('\n💡 Ejemplo: testSubcategoryClick("Vestidos")');