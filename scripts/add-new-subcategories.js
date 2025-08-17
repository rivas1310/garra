// Script para agregar nuevas subcategorías a las categorías existentes
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addNewSubcategories() {
  try {
    log.error('📋 Agregando nuevas subcategorías...\n');

    // Definir las nuevas subcategorías por categoría
    const newSubcategories = {
      mujer: ['Pants', 'Conjunto', 'Suéter', 'Chaleco'],
      hombre: ['Chaleco', 'Pants', 'Suéter'],
      ninos: ['Pants', 'Chaleco', 'Suéter'],
      ninas: ['Pants', 'Chaleco', 'Suéter']
    };

    log.error('🎯 SUBcategorías a agregar:');
    log.error('👩 Mujer: Pants, Conjunto, Suéter, Chaleco');
    log.error('👨 Hombre: Chaleco, Pants, Suéter');
    log.error('👦 Niños: Pants, Chaleco, Suéter');
    log.error('👧 Niñas: Pants, Chaleco, Suéter');

    // Obtener todas las categorías existentes
    const categories = await prisma.category.findMany();
    log.error(`\n📊 Categorías encontradas: ${categories.length}`);

    // Procesar cada categoría
    for (const [categorySlug, subcategories] of Object.entries(newSubcategories)) {
      log.error(`\n🔍 Procesando categoría: ${categorySlug}`);
      
      // Buscar la categoría por slug
      const category = categories.find(cat => cat.slug === categorySlug);
      
      if (!category) {
        log.error(`❌ Categoría '${categorySlug}' no encontrada`);
        continue;
      }

      log.error(`✅ Categoría encontrada: ${category.name} (ID: ${category.id})`);

      // Obtener productos existentes en esta categoría para ver subcategorías actuales
      const existingProducts = await prisma.product.findMany({
        where: { categoryId: category.id },
        select: { subcategoria: true }
      });

      const existingSubcategories = [...new Set(existingProducts.map(p => p.subcategoria).filter(Boolean))];
      log.error(`📋 Subcategorías existentes: ${existingSubcategories.join(', ') || 'Ninguna'}`);

      // Verificar qué subcategorías ya existen
      const subcategoriesToAdd = subcategories.filter(sub => !existingSubcategories.includes(sub));
      
      if (subcategoriesToAdd.length === 0) {
        log.error(`✅ Todas las subcategorías ya existen para ${category.name}`);
        continue;
      }

      log.error(`➕ Subcategorías a agregar: ${subcategoriesToAdd.join(', ')}`);

      // Crear productos de ejemplo para las nuevas subcategorías
      for (const subcategory of subcategoriesToAdd) {
        log.error(`\n📦 Creando producto de ejemplo para: ${subcategory}`);
        
        const productName = `${subcategory} de ${category.name}`;
        const productSlug = `${subcategory.toLowerCase()}-${categorySlug}`;
        
        try {
          const newProduct = await prisma.product.create({
            data: {
              name: productName,
              slug: productSlug,
              description: `${subcategory} de alta calidad para ${category.name}`,
              price: 299.99,
              originalPrice: 399.99,
              images: ['/img/placeholder.png'],
              categoryId: category.id,
              stock: 10,
              isActive: true,
              isNew: true,
              subcategoria: subcategory
            }
          });
          
          log.error(`✅ Producto creado: ${newProduct.name} (ID: ${newProduct.id})`);
          
          // Crear una variante por defecto
          await prisma.productVariant.create({
            data: {
              productId: newProduct.id,
              size: 'M',
              color: 'Negro',
              stock: 5,
              price: 299.99
            }
          });
          
          log.error(`✅ Variante creada para ${newProduct.name}`);
          
        } catch (error) {
          if (error.code === 'P2002') {
            log.error(`⚠️ Producto ${productSlug} ya existe, saltando...`);
          } else {
            log.error(`❌ Error creando producto ${subcategory}:`, error.message);
          }
        }
      }
    }

    log.error('\n🎉 Proceso completado exitosamente!');
    
    // Mostrar resumen final
    log.error('\n📊 RESUMEN FINAL:');
    for (const [categorySlug, subcategories] of Object.entries(newSubcategories)) {
      const category = categories.find(cat => cat.slug === categorySlug);
      if (category) {
        const products = await prisma.product.findMany({
          where: { categoryId: category.id },
          select: { subcategoria: true }
        });
        const allSubcategories = [...new Set(products.map(p => p.subcategoria).filter(Boolean))];
        log.error(`\n${category.name}:`);
        allSubcategories.forEach(sub => {
          const count = products.filter(p => p.subcategoria === sub).length;
          log.error(`  - ${sub}: ${count} productos`);
        });
      }
    }

  } catch (error) {
    log.error('❌ Error en el proceso:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addNewSubcategories();
