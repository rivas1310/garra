// Script para agregar productos de ejemplo a las categorías de calzado
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addShoeProducts() {
  try {
    log.error('👟 Agregando productos de ejemplo a las categorías de calzado...');
    
    // Obtener las categorías de calzado
    const shoeCategories = await prisma.category.findMany({
      where: {
        slug: {
          in: ['calzado-hombre', 'calzado-mujer', 'calzado-nino', 'calzado-nina']
        }
      }
    });
    
    log.error(`\n🔍 Categorías de calzado encontradas: ${shoeCategories.length}`);
    shoeCategories.forEach(cat => {
      log.error(`- ${cat.name} (ID: ${cat.id})`);
    });
    
    // Productos de ejemplo para cada categoría con subcategorías específicas
    const shoeProducts = [
      // Calzado de Hombre
      {
        name: 'Zapatos Oxford Negros',
        description: 'Zapatos formales Oxford negros para hombres, elegantes y cómodos',
        price: 899.99,
        originalPrice: 1099.99,
        categoryId: shoeCategories.find(c => c.slug === 'calzado-hombre')?.id,
        stock: 8,
        isActive: true,
        isNew: true,
        isOnSale: true,
        subcategoria: 'Zapatos',
        images: ['https://images.unsplash.com/photo-1549298916-b41d501d3772?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80']
      },
      {
        name: 'Sneakers Blancos Deportivos',
        description: 'Sneakers blancos deportivos para hombres, perfectos para el día a día',
        price: 599.99,
        originalPrice: 799.99,
        categoryId: shoeCategories.find(c => c.slug === 'calzado-hombre')?.id,
        stock: 15,
        isActive: true,
        isNew: false,
        isOnSale: true,
        subcategoria: 'Sneakers',
        images: ['https://images.unsplash.com/photo-1549298916-b41d501d3772?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80']
      },
      {
        name: 'Botas de Trabajo Marrones',
        description: 'Botas de trabajo marrones resistentes para hombres',
        price: 1299.99,
        originalPrice: 1499.99,
        categoryId: shoeCategories.find(c => c.slug === 'calzado-hombre')?.id,
        stock: 6,
        isActive: true,
        isNew: false,
        isOnSale: true,
        subcategoria: 'Botas',
        images: ['https://images.unsplash.com/photo-1549298916-b41d501d3772?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80']
      },
      {
        name: 'Sandalias de Cuero Negras',
        description: 'Sandalias de cuero negras casuales para hombres',
        price: 399.99,
        originalPrice: 499.99,
        categoryId: shoeCategories.find(c => c.slug === 'calzado-hombre')?.id,
        stock: 12,
        isActive: true,
        isNew: true,
        isOnSale: true,
        subcategoria: 'Sandalias',
        images: ['https://images.unsplash.com/photo-1549298916-b41d501d3772?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80']
      },
      
      // Calzado de Mujer
      {
        name: 'Tacones Negros Elegantes',
        description: 'Tacones negros elegantes para mujeres, perfectos para eventos formales',
        price: 799.99,
        originalPrice: 999.99,
        categoryId: shoeCategories.find(c => c.slug === 'calzado-mujer')?.id,
        stock: 10,
        isActive: true,
        isNew: true,
        isOnSale: true,
        subcategoria: 'Tacones',
        images: ['https://images.unsplash.com/photo-1549298916-b41d501d3772?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80']
      },
      {
        name: 'Zapatillas Deportivas Rosas',
        description: 'Zapatillas deportivas rosas para mujeres, cómodas y elegantes',
        price: 699.99,
        originalPrice: 899.99,
        categoryId: shoeCategories.find(c => c.slug === 'calzado-mujer')?.id,
        stock: 18,
        isActive: true,
        isNew: false,
        isOnSale: true,
        subcategoria: 'Zapatillas',
        images: ['https://images.unsplash.com/photo-1549298916-b41d501d3772?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80']
      },
      {
        name: 'Zapatos de Oficina Negros',
        description: 'Zapatos de oficina negros profesionales para mujeres',
        price: 649.99,
        originalPrice: 799.99,
        categoryId: shoeCategories.find(c => c.slug === 'calzado-mujer')?.id,
        stock: 14,
        isActive: true,
        isNew: false,
        isOnSale: true,
        subcategoria: 'Zapatos',
        images: ['https://images.unsplash.com/photo-1549298916-b41d501d3772?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80']
      },
      {
        name: 'Sneakers Blancos Casuales',
        description: 'Sneakers blancos casuales para mujeres, versátiles y cómodos',
        price: 549.99,
        originalPrice: 699.99,
        categoryId: shoeCategories.find(c => c.slug === 'calzado-mujer')?.id,
        stock: 20,
        isActive: true,
        isNew: true,
        isOnSale: true,
        subcategoria: 'Sneakers',
        images: ['https://images.unsplash.com/photo-1549298916-b41d501d3772?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80']
      },
      {
        name: 'Botas de Cuero Marrones',
        description: 'Botas de cuero marrones elegantes para mujeres',
        price: 1199.99,
        originalPrice: 1399.99,
        categoryId: shoeCategories.find(c => c.slug === 'calzado-mujer')?.id,
        stock: 8,
        isActive: true,
        isNew: false,
        isOnSale: true,
        subcategoria: 'Botas',
        images: ['https://images.unsplash.com/photo-1549298916-b41d501d3772?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80']
      },
      {
        name: 'Huaraches Artesanales',
        description: 'Huaraches artesanales coloridos para mujeres',
        price: 299.99,
        originalPrice: 399.99,
        categoryId: shoeCategories.find(c => c.slug === 'calzado-mujer')?.id,
        stock: 25,
        isActive: true,
        isNew: true,
        isOnSale: true,
        subcategoria: 'Huaraches',
        images: ['https://images.unsplash.com/photo-1549298916-b41d501d3772?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80']
      },
      {
        name: 'Sandalias de Playa Blancas',
        description: 'Sandalias de playa blancas cómodas para mujeres',
        price: 199.99,
        originalPrice: 299.99,
        categoryId: shoeCategories.find(c => c.slug === 'calzado-mujer')?.id,
        stock: 30,
        isActive: true,
        isNew: false,
        isOnSale: true,
        subcategoria: 'Sandalias',
        images: ['https://images.unsplash.com/photo-1549298916-b41d501d3772?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80']
      },
      
      // Calzado de Niño
      {
        name: 'Zapatos Escolares Negros',
        description: 'Zapatos escolares negros resistentes para niños',
        price: 399.99,
        originalPrice: 499.99,
        categoryId: shoeCategories.find(c => c.slug === 'calzado-nino')?.id,
        stock: 12,
        isActive: true,
        isNew: true,
        isOnSale: true,
        subcategoria: 'Zapatos',
        images: ['https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80']
      },
      {
        name: 'Botas de Lluvia Azules',
        description: 'Botas de lluvia azules impermeables para niños',
        price: 299.99,
        originalPrice: 399.99,
        categoryId: shoeCategories.find(c => c.slug === 'calzado-nino')?.id,
        stock: 15,
        isActive: true,
        isNew: false,
        isOnSale: true,
        subcategoria: 'Botas',
        images: ['https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80']
      },
      {
        name: 'Sneakers Deportivos Rojos',
        description: 'Sneakers deportivos rojos para niños, perfectos para correr',
        price: 349.99,
        originalPrice: 449.99,
        categoryId: shoeCategories.find(c => c.slug === 'calzado-nino')?.id,
        stock: 18,
        isActive: true,
        isNew: true,
        isOnSale: true,
        subcategoria: 'Sneakers',
        images: ['https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80']
      },
      {
        name: 'Sandalias de Playa Azules',
        description: 'Sandalias de playa azules cómodas para niños',
        price: 149.99,
        originalPrice: 199.99,
        categoryId: shoeCategories.find(c => c.slug === 'calzado-nino')?.id,
        stock: 22,
        isActive: true,
        isNew: false,
        isOnSale: true,
        subcategoria: 'Sandalias',
        images: ['https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80']
      },
      
      // Calzado de Niña
      {
        name: 'Zapatos de Fiesta Rosas',
        description: 'Zapatos de fiesta rosas elegantes para niñas',
        price: 449.99,
        originalPrice: 549.99,
        categoryId: shoeCategories.find(c => c.slug === 'calzado-nina')?.id,
        stock: 10,
        isActive: true,
        isNew: true,
        isOnSale: true,
        subcategoria: 'Zapatos',
        images: ['https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80']
      },
      {
        name: 'Botas de Invierno Rosas',
        description: 'Botas de invierno rosas abrigadas para niñas',
        price: 599.99,
        originalPrice: 699.99,
        categoryId: shoeCategories.find(c => c.slug === 'calzado-nina')?.id,
        stock: 8,
        isActive: true,
        isNew: false,
        isOnSale: true,
        subcategoria: 'Botas',
        images: ['https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80']
      },
      {
        name: 'Sneakers Brillantes Morados',
        description: 'Sneakers brillantes morados con luces para niñas',
        price: 399.99,
        originalPrice: 499.99,
        categoryId: shoeCategories.find(c => c.slug === 'calzado-nina')?.id,
        stock: 16,
        isActive: true,
        isNew: true,
        isOnSale: true,
        subcategoria: 'Sneakers',
        images: ['https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80']
      },
      {
        name: 'Sandalias de Playa Rosas',
        description: 'Sandalias de playa rosas con flores para niñas',
        price: 199.99,
        originalPrice: 249.99,
        categoryId: shoeCategories.find(c => c.slug === 'calzado-nina')?.id,
        stock: 25,
        isActive: true,
        isNew: false,
        isOnSale: true,
        subcategoria: 'Sandalias',
        images: ['https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80']
      }
    ];
    
    log.error(`\n📝 Creando ${shoeProducts.length} productos de calzado...`);
    
    for (const product of shoeProducts) {
      if (!product.categoryId) {
        log.error(`⚠️  Saltando producto "${product.name}" - categoría no encontrada`);
        continue;
      }
      
      log.error(`- Creando: ${product.name} (${product.subcategoria})`);
      
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
    
    log.error('\n✅ Productos de calzado creados exitosamente.');
    
    // Verificar productos por categoría
    log.error('\n📦 Productos por categoría de calzado:');
    for (const category of shoeCategories) {
      const productCount = await prisma.product.count({
        where: {
          categoryId: category.id,
          isActive: true
        }
      });
      log.error(`- ${category.name}: ${productCount} productos activos`);
    }
    
    // Mostrar subcategorías por categoría
    log.error('\n🔍 Subcategorías por categoría:');
    for (const category of shoeCategories) {
      const products = await prisma.product.findMany({
        where: {
          categoryId: category.id,
          isActive: true
        },
        select: { subcategoria: true }
      });
      
      const subcategories = [...new Set(products.map(p => p.subcategoria))];
      log.error(`- ${category.name}: ${subcategories.join(', ')}`);
    }
    
  } catch (error) {
    log.error('❌ Error al crear productos de calzado:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addShoeProducts(); 