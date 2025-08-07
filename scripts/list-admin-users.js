/**
 * Script para listar todos los usuarios administradores
 * Uso: node scripts/list-admin-users.js
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function listAdminUsers() {
  try {
    console.log('Buscando usuarios administradores...\n');
    
    // Buscar todos los usuarios administradores
    const adminUsers = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true
      }
    });
    
    if (adminUsers.length === 0) {
      console.log('No se encontraron usuarios administradores en la base de datos.');
      console.log('Para crear un nuevo administrador, ejecuta: node scripts/create-admin.js');
      return;
    }
    
    console.log('Usuarios administradores encontrados:');
    console.log('=====================================');
    
    adminUsers.forEach((user, index) => {
      console.log(`${index + 1}. ID: ${user.id}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Nombre: ${user.name || 'No especificado'}`);
      console.log(`   Fecha de creación: ${user.createdAt.toLocaleDateString()}`);
      console.log('');
    });
    
    console.log('Para resetear la contraseña de un administrador, ejecuta:');
    console.log('node scripts/reset-admin-password.js <email>');
    console.log('');
    console.log('Ejemplo:');
    adminUsers.forEach(user => {
      console.log(`node scripts/reset-admin-password.js ${user.email}`);
    });
    
  } catch (error) {
    console.error('Error al buscar usuarios administradores:', error);
  } finally {
    await prisma.$disconnect();
  }
}

listAdminUsers(); 