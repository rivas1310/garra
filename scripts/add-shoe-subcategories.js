// Script para agregar subcategorías específicas a todas las categorías de calzado
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addShoeSubcategories() {
  try {
    log.error('👟 Agregando subcategorías específicas a las categorías de calzado...');
    
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
    
    // Productos adicionales con subcategorías específicas
    const additionalShoeProducts = [
      // Calzado de Hombre - Subcategorías adicionales
      {
        name: 'Zapatos Derby Marrones',
        description: 'Zapatos Derby marrones elegantes para hombres',
        price: 799.99,
        originalPrice: 999.99,
        categoryId: shoeCategories.find(c => c.slug === 'calzado-hombre')?.id,
        stock: 10,
        isActive: true,
        isNew: false,
        isOnSale: true,
        subcategoria: 'Zapatos',
        images: ['https://images.unsplash.com/photo-1549298916-b41d501d3772?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80']
      },
      {
        name: 'Sneakers Negros Casuales',
        description: 'Sneakers negros casuales para hombres',
        price: 449.99,
        originalPrice: 599.99,
        categoryId: shoeCategories.find(c => c.slug === 'calzado-hombre')?.id,
        stock: 20,
        isActive: true,
        isNew: true,
        isOnSale: true,
        subcategoria: 'Sneakers',
        images: ['https://images.unsplash.com/photo-1549298916-b41d501d3772?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80']
      },
      {
        name: 'Botas Chelsea Negras',
        description: 'Botas Chelsea negras elegantes para hombres',
        price: 999.99,
        originalPrice: 1199.99,
        categoryId: shoeCategories.find(c => c.slug === 'calzado-hombre')?.id,
        stock: 8,
        isActive: true,
        isNew: false,
        isOnSale: true,
        subcategoria: 'Botas',
        images: ['https://images.unsplash.com/photo-1549298916-b41d501d3772?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80']
      },
      {
        name: 'Sandalias de Playa Azules',
        description: 'Sandalias de playa azules para hombres',
        price: 199.99,
        originalPrice: 299.99,
        categoryId: shoeCategories.find(c => c.slug === 'calzado-hombre')?.id,
        stock: 25,
        isActive: true,
        isNew: true,
        isOnSale: true,
        subcategoria: 'Sandalias',
        images: ['https://images.unsplash.com/photo-1549298916-b41d501d3772?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80']
      },
      
      // Calzado de Mujer - Subcategorías adicionales
      {
        name: 'Tacones Rojos de Fiesta',
        description: 'Tacones rojos elegantes para fiestas',
        price: 899.99,
        originalPrice: 1099.99,
        categoryId: shoeCategories.find(c => c.slug === 'calzado-mujer')?.id,
        stock: 6,
        isActive: true,
        isNew: true,
        isOnSale: true,
        subcategoria: 'Tacones',
        images: ['https://images.unsplash.com/photo-1549298916-b41d501d3772?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80']
      },
      {
        name: 'Zapatillas Running Blancas',
        description: 'Zapatillas running blancas para mujeres',
        price: 799.99,
        originalPrice: 999.99,
        categoryId: shoeCategories.find(c => c.slug === 'calzado-mujer')?.id,
        stock: 15,
        isActive: true,
        isNew: false,
        isOnSale: true,
        subcategoria: 'Zapatillas',
        images: ['https://images.unsplash.com/photo-1549298916-b41d501d3772?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80']
      },
      {
        name: 'Zapatos Mules Negros',
        description: 'Zapatos mules negros elegantes para mujeres',
        price: 549.99,
        originalPrice: 699.99,
        categoryId: shoeCategories.find(c => c.slug === 'calzado-mujer')?.id,
        stock: 12,
        isActive: true,
        isNew: true,
        isOnSale: true,
        subcategoria: 'Zapatos',
        images: ['https://images.unsplash.com/photo-1549298916-b41d501d3772?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80']
      },
      {
        name: 'Sneakers Converse Blancas',
        description: 'Sneakers Converse blancas clásicas',
        price: 649.99,
        originalPrice: 799.99,
        categoryId: shoeCategories.find(c => c.slug === 'calzado-mujer')?.id,
        stock: 18,
        isActive: true,
        isNew: false,
        isOnSale: true,
        subcategoria: 'Sneakers',
        images: ['https://images.unsplash.com/photo-1549298916-b41d501d3772?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80']
      },
      {
        name: 'Botas Ankle Negras',
        description: 'Botas ankle negras elegantes para mujeres',
        price: 899.99,
        originalPrice: 1099.99,
        categoryId: shoeCategories.find(c => c.slug === 'calzado-mujer')?.id,
        stock: 10,
        isActive: true,
        isNew: true,
        isOnSale: true,
        subcategoria: 'Botas',
        images: ['https://images.unsplash.com/photo-1549298916-b41d501d3772?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80']
      },
      {
        name: 'Huaraches Artesanales Rojos',
        description: 'Huaraches artesanales rojos para mujeres',
        price: 349.99,
        originalPrice: 449.99,
        categoryId: shoeCategories.find(c => c.slug === 'calzado-mujer')?.id,
        stock: 20,
        isActive: true,
        isNew: false,
        isOnSale: true,
        subcategoria: 'Huaraches',
        images: ['https://images.unsplash.com/photo-1549298916-b41d501d3772?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80']
      },
      {
        name: 'Sandalias de Tacón Doradas',
        description: 'Sandalias de tacón doradas elegantes',
        price: 599.99,
        originalPrice: 749.99,
        categoryId: shoeCategories.find(c => c.slug === 'calzado-mujer')?.id,
        stock: 8,
        isActive: true,
        isNew: true,
        isOnSale: true,
        subcategoria: 'Sandalias',
        images: ['https://images.unsplash.com/photo-1549298916-b41d501d3772?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80']
      },
      
      // Calzado de Niño - Subcategorías adicionales
      {
        name: 'Zapatos Deportivos Negros',
        description: 'Zapatos deportivos negros para niños',
        price: 299.99,
        originalPrice: 399.99,
        categoryId: shoeCategories.find(c => c.slug === 'calzado-nino')?.id,
        stock: 15,
        isActive: true,
        isNew: false,
        isOnSale: true,
        subcategoria: 'Zapatos',
        images: ['https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80']
      },
      {
        name: 'Botas de Invierno Negras',
        description: 'Botas de invierno negras para niños',
        price: 399.99,
        originalPrice: 499.99,
        categoryId: shoeCategories.find(c => c.slug === 'calzado-nino')?.id,
        stock: 12,
        isActive: true,
        isNew: true,
        isOnSale: true,
        subcategoria: 'Botas',
        images: ['https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80']
      },
      {
        name: 'Sneakers con Luces Azules',
        description: 'Sneakers con luces azules para niños',
        price: 449.99,
        originalPrice: 549.99,
        categoryId: shoeCategories.find(c => c.slug === 'calzado-nino')?.id,
        stock: 20,
        isActive: true,
        isNew: true,
        isOnSale: true,
        subcategoria: 'Sneakers',
        images: ['https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80']
      },
      {
        name: 'Sandalias de Playa Negras',
        description: 'Sandalias de playa negras para niños',
        price: 179.99,
        originalPrice: 229.99,
        categoryId: shoeCategories.find(c => c.slug === 'calzado-nino')?.id,
        stock: 30,
        isActive: true,
        isNew: false,
        isOnSale: true,
        subcategoria: 'Sandalias',
        images: ['https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80']
      },
      
      // Calzado de Niña - Subcategorías adicionales
      {
        name: 'Zapatos de Ballet Rosas',
        description: 'Zapatos de ballet rosas para niñas',
        price: 299.99,
        originalPrice: 399.99,
        categoryId: shoeCategories.find(c => c.slug === 'calzado-nina')?.id,
        stock: 18,
        isActive: true,
        isNew: true,
        isOnSale: true,
        subcategoria: 'Zapatos',
        images: ['https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80']
      },
      {
        name: 'Botas de Lluvia Rosas',
        description: 'Botas de lluvia rosas para niñas',
        price: 249.99,
        originalPrice: 349.99,
        categoryId: shoeCategories.find(c => c.slug === 'calzado-nina')?.id,
        stock: 15,
        isActive: true,
        isNew: false,
        isOnSale: true,
        subcategoria: 'Botas',
        images: ['https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80']
      },
      {
        name: 'Sneakers Converse Rosas',
        description: 'Sneakers Converse rosas para niñas',
        price: 399.99,
        originalPrice: 499.99,
        categoryId: shoeCategories.find(c => c.slug === 'calzado-nina')?.id,
        stock: 22,
        isActive: true,
        isNew: true,
        isOnSale: true,
        subcategoria: 'Sneakers',
        images: ['https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80']
      },
      {
        name: 'Sandalias de Playa Doradas',
        description: 'Sandalias de playa doradas para niñas',
        price: 159.99,
        originalPrice: 209.99,
        categoryId: shoeCategories.find(c => c.slug === 'calzado-nina')?.id,
        stock: 28,
        isActive: true,
        isNew: false,
        isOnSale: true,
        subcategoria: 'Sandalias',
        images: ['https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80']
      }
    ];
    
    log.error(`\n📝 Creando ${additionalShoeProducts.length} productos adicionales con subcategorías...`);
    
    for (const product of additionalShoeProducts) {
      if (!product.categoryId) {
        log.error(`⚠️  Saltando producto "${product.name}" - categoría no encontrada`);
        continue;
      }
      
      log.error(`- Creando: ${product.name} (${product.subcategoria})`);
      
      const createdProduct = await prisma.product.create({
        data: {
          name: product.name,
          slug: product.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '-' + Date.now(),
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
    
    log.error('\n✅ Productos adicionales creados exitosamente.');
    
    // Verificar subcategorías por categoría
    log.error('\n🔍 Subcategorías por categoría de calzado:');
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
    
    log.error('\n📊 Resumen de subcategorías implementadas:');
    log.error('👞 Calzado de Hombre: Zapatos, Sneakers, Botas, Sandalias');
    log.error('👠 Calzado de Mujer: Tacones, Zapatillas, Zapatos, Sneakers, Botas, Huaraches, Sandalias');
    log.error('👟 Calzado de Niño: Zapatos, Botas, Sneakers, Sandalias');
    log.error('👡 Calzado de Niña: Zapatos, Botas, Sneakers, Sandalias');
    
  } catch (error) {
    log.error('❌ Error al crear productos adicionales:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addShoeSubcategories(); 