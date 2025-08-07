const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Intentando conectar a la base de datos...');
    
    // Verificar productos
    const products = await prisma.product.findMany();
    console.log('Número de productos:', products.length);
    
    // Verificar pedidos
    const orders = await prisma.order.findMany();
    console.log('Número de pedidos:', orders.length);
    
    // Verificar categorías
    const categories = await prisma.category.findMany();
    console.log('Número de categorías:', categories.length);
    
    console.log('Conexión exitosa a la base de datos.');
  } catch (error) {
    console.error('Error al conectar con la base de datos:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();