// Script para agregar productos de ejemplo a las nuevas categorías
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addSampleProducts() {
  try {
    log.error('📦 Agregando productos de ejemplo a las nuevas categorías...');
    
    // Obtener las categorías que acabamos de crear
    const categories = await prisma.category.findMany({
      where: {
        slug: {
          in: ['ninas', 'ninos', 'calzado-infantil']
        }
      }
    });
    
    log.error(`\n🔍 Categorías encontradas: ${categories.length}`);
    categories.forEach(cat => {
      log.error(`- ${cat.name} (ID: ${cat.id})`);
    });
    
    // Productos de ejemplo para cada categoría
    const sampleProducts = [
      // Productos para Niñas
      {
        name: 'Vestido de Niña Rosa',
        description: 'Hermoso vestido rosa para niñas, perfecto para ocasiones especiales',
        price: 299.99,
        originalPrice: 399.99,
        categoryId: categories.find(c => c.slug === 'ninas')?.id,
        stock: 10,
        isActive: true,
        isNew: true,
        isOnSale: true,
        subcategoria: 'Vestidos',
        images: ['https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80']
      },
      {
        name: 'Blusa de Niña con Flores',
        description: 'Blusa cómoda con diseño de flores, ideal para el día a día',
        price: 149.99,
        originalPrice: 199.99,
        categoryId: categories.find(c => c.slug === 'ninas')?.id,
        stock: 15,
        isActive: true,
        isNew: false,
        isOnSale: true,
        subcategoria: 'Blusas',
        images: ['https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80']
      },
      
      // Productos para Niños
      {
        name: 'Camisa de Niño Azul',
        description: 'Camisa azul elegante para niños, perfecta para eventos formales',
        price: 199.99,
        originalPrice: 249.99,
        categoryId: categories.find(c => c.slug === 'ninos')?.id,
        stock: 12,
        isActive: true,
        isNew: true,
        isOnSale: true,
        subcategoria: 'Camisas',
        images: ['https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80']
      },
      {
        name: 'Pantalón de Niño Verde',
        description: 'Pantalón verde resistente para niños, ideal para actividades al aire libre',
        price: 179.99,
        originalPrice: 229.99,
        categoryId: categories.find(c => c.slug === 'ninos')?.id,
        stock: 8,
        isActive: true,
        isNew: false,
        isOnSale: true,
        subcategoria: 'Pantalones',
        images: ['https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80']
      },
      
      // Productos para Zapatos Infantiles
      {
        name: 'Zapatos de Niño Negros',
        description: 'Zapatos negros elegantes para niños, cómodos y duraderos',
        price: 399.99,
        originalPrice: 499.99,
        categoryId: categories.find(c => c.slug === 'calzado-infantil')?.id,
        stock: 6,
        isActive: true,
        isNew: true,
        isOnSale: true,
        subcategoria: 'Zapatos',
        images: ['https://images.unsplash.com/photo-1549298916-b41d501d3772?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80']
      },
      {
        name: 'Zapatillas de Niña Rosas',
        description: 'Zapatillas rosas deportivas para niñas, perfectas para correr y jugar',
        price: 349.99,
        originalPrice: 449.99,
        categoryId: categories.find(c => c.slug === 'calzado-infantil')?.id,
        stock: 10,
        isActive: true,
        isNew: false,
        isOnSale: true,
        subcategoria: 'Zapatillas',
        images: ['https://images.unsplash.com/photo-1549298916-b41d501d3772?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80']
      }
    ];
    
    log.error(`\n📝 Creando ${sampleProducts.length} productos de ejemplo...`);
    
    for (const product of sampleProducts) {
      if (!product.categoryId) {
        log.error(`⚠️  Saltando producto "${product.name}" - categoría no encontrada`);
        continue;
      }
      
      log.error(`- Creando: ${product.name}`);
      
      const createdProduct = await prisma.product.create({
        data: {
          name: product.name,
          slug: product.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
          description: product.description,
          price: product.price,
          originalPrice: product.originalPrice,
          categoryId: product.categoryId,
          stock: product.stock,
          isActive: product.isActive,
          isNew: product.isNew,
          isOnSale: product.isOnSale,
          subcategoria: product.subcategoria,
          images: product.images
        }
      });
      
      log.error(`  ✅ Creado con ID: ${createdProduct.id}`);
    }
    
    log.error('\n✅ Productos de ejemplo creados exitosamente.');
    
    // Verificar productos por categoría
    log.error('\n📦 Productos por categoría:');
    for (const category of categories) {
      const productCount = await prisma.product.count({
        where: {
          categoryId: category.id,
          isActive: true
        }
      });
      log.error(`- ${category.name}: ${productCount} productos activos`);
    }
    
  } catch (error) {
    log.error('❌ Error al crear productos:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addSampleProducts(); 