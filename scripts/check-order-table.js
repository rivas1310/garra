/**
 * Script para verificar las columnas existentes en la tabla Order
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkOrderTable() {
  try {
    console.log('🔍 Verificando estructura de la tabla Order...\n');
    
    // Obtener todas las columnas de la tabla Order
    const columns = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'Order' 
      ORDER BY ordinal_position
    `;
    
    console.log('📋 Columnas existentes en la tabla Order:');
    columns.forEach(col => {
      console.log(`  - ${col.column_name} (${col.data_type}, nullable: ${col.is_nullable})`);
    });
    
    // Verificar si existen las columnas que queremos agregar
    console.log('\n🔍 Verificando columnas de customer:');
    const customerColumns = [
      'customerName', 'customerEmail', 'customerPhone', 'customerStreet',
      'customerNumberExterior', 'customerNumberInterior', 'customerColonia',
      'customerCity', 'customerState', 'customerPostalCode', 'customerCountry',
      'customerReferences', 'stripeSessionId', 'stripeMetadata'
    ];
    
    customerColumns.forEach(colName => {
      const exists = columns.some(col => col.column_name === colName);
      console.log(`  - ${colName}: ${exists ? '✅ Existe' : '❌ No existe'}`);
    });
    
  } catch (error) {
    console.error('❌ Error al verificar tabla:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkOrderTable(); 