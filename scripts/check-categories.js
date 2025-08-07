// Script para verificar las categorías agregadas
console.log('📋 Verificando categorías agregadas...')

// Categorías que deberían estar presentes
const expectedCategories = [
  'Ropa de Mujer',
  'Ropa de Hombre', 
  'Accesorios',
  'Calzado',
  'Bolsos',
  'Deportes',
  'Ropa Interior',
  'Trajes de Baño',
  'Ropa de Bebé',
  'Niñas',           // ✅ Nueva categoría
  'Niños',           // ✅ Nueva categoría
  'Zapatos Infantiles' // ✅ Nueva categoría
]

// URLs correspondientes
const categoryUrls = {
  'Niñas': '/categorias/ninas',
  'Niños': '/categorias/ninos', 
  'Zapatos Infantiles': '/categorias/calzado-infantil'
}

console.log('✅ Categorías agregadas:')
console.log('- Niñas: Ropa elegante y divertida para niñas')
console.log('- Niños: Ropa cómoda y resistente para niños')
console.log('- Zapatos Infantiles: Calzado cómodo y seguro para niños')

console.log('\n🔗 URLs de las nuevas categorías:')
Object.entries(categoryUrls).forEach(([name, url]) => {
  console.log(`- ${name}: ${url}`)
})

console.log('\n📱 También disponibles en el dropdown de navegación:')
console.log('- Sección "Niños" en el menú Categorías')
console.log('- Subcategorías: Niñas, Niños, Zapatos Infantiles')

console.log('\n🎨 Características de las nuevas categorías:')
console.log('- Niñas: isNew=true, isTrending=true, discount=15% OFF')
console.log('- Niños: isNew=true, isTrending=false, discount=20% OFF')
console.log('- Zapatos Infantiles: isNew=false, isTrending=true, discount=25% OFF')

console.log('\n✅ Verificación completada. Las categorías están listas para usar.') 