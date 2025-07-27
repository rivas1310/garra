/**
 * Script para realizar una copia de seguridad de la base de datos
 * Exporta los datos de la base de datos a archivos JSON
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const prisma = new PrismaClient();

// Obtener la fecha actual en formato YYYY-MM-DD
function getCurrentDate() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

// Crear directorio si no existe
function ensureDirectoryExists(directory) {
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }
}

// Guardar datos en un archivo JSON
function saveToJson(data, filename) {
  fs.writeFileSync(filename, JSON.stringify(data, null, 2));
  console.log(`✓ Datos guardados en ${filename}`);
}

async function backupDatabase() {
  try {
    console.log('Iniciando copia de seguridad de la base de datos...');
    
    // Crear directorio de backup
    const currentDate = getCurrentDate();
    const backupDir = path.join(process.cwd(), 'backups', currentDate);
    ensureDirectoryExists(backupDir);
    
    console.log(`Directorio de backup: ${backupDir}`);
    
    // Backup de usuarios (sin contraseñas por seguridad)
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatar: true,
        role: true,
        createdAt: true,
        updatedAt: true
      }
    });
    saveToJson(users, path.join(backupDir, 'users.json'));
    console.log(`Respaldados ${users.length} usuarios (sin contraseñas por seguridad)`);
    
    // Backup de productos
    const products = await prisma.product.findMany({
      include: {
        category: true,
        variants: true,
        reviews: true
      }
    });
    saveToJson(products, path.join(backupDir, 'products.json'));
    console.log(`Respaldados ${products.length} productos`);
    
    // Backup de categorías
    const categories = await prisma.category.findMany();
    saveToJson(categories, path.join(backupDir, 'categories.json'));
    console.log(`Respaldadas ${categories.length} categorías`);
    
    // Backup de cupones
    const coupons = await prisma.discountCoupon.findMany();
    saveToJson(coupons, path.join(backupDir, 'coupons.json'));
    console.log(`Respaldados ${coupons.length} cupones`);
    
    // Backup de órdenes
    const orders = await prisma.order.findMany({
      include: {
        items: {
          include: {
            product: true,
            variant: true
          }
        },
        shippingAddress: true,
        billingAddress: true,
        user: true,
        discountCoupon: true
      }
    });
    saveToJson(orders, path.join(backupDir, 'orders.json'));
    console.log(`Respaldadas ${orders.length} órdenes`);
    
    // Crear archivo de metadatos
    const metadata = {
      backupDate: new Date().toISOString(),
      totalUsers: users.length,
      totalProducts: products.length,
      totalCategories: categories.length,
      totalCoupons: coupons.length,
      totalOrders: orders.length
    };
    saveToJson(metadata, path.join(backupDir, 'metadata.json'));
    
    console.log('\n=========================================');
    console.log('COPIA DE SEGURIDAD COMPLETADA');
    console.log('=========================================');
    console.log(`Fecha: ${new Date().toLocaleString()}`);
    console.log(`Ubicación: ${backupDir}`);
    console.log('Archivos generados:');
    console.log('- users.json (sin contraseñas)');
    console.log('- products.json');
    console.log('- categories.json');
    console.log('- coupons.json');
    console.log('- orders.json');
    console.log('- metadata.json');
    console.log('=========================================');
    console.log('IMPORTANTE: Guarde estas copias de seguridad en un lugar seguro.');
    console.log('=========================================');
    
  } catch (error) {
    console.error('Error al realizar la copia de seguridad:', error);
  } finally {
    await prisma.$disconnect();
  }
}

backupDatabase();