/**
 * Script para listar todos los usuarios administradores
 * Uso: node scripts/list-admin-users.js
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function listAdminUsers() {
  try {
    log.error('Buscando usuarios administradores...\n');
    
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
      log.error('No se encontraron usuarios administradores en la base de datos.');
      log.error('Para crear un nuevo administrador, ejecuta: node scripts/create-admin.js');
      return;
    }
    
    log.error('Usuarios administradores encontrados:');
    log.error('=====================================');
    
    adminUsers.forEach((user, index) => {
      log.error(`${index + 1}. ID: ${user.id}`);
      log.error(`   Email: ${user.email}`);
      log.error(`   Nombre: ${user.name || 'No especificado'}`);
      log.error(`   Fecha de creación: ${user.createdAt.toLocaleDateString()}`);
      log.error('');
    });
    
    log.error('Para resetear la contraseña de un administrador, ejecuta:');
    log.error('node scripts/reset-admin-password.js <email>');
    log.error('');
    log.error('Ejemplo:');
    adminUsers.forEach(user => {
      log.error(`node scripts/reset-admin-password.js ${user.email}`);
    });
    
  } catch (error) {
    log.error('Error al buscar usuarios administradores:', error);
  } finally {
    await prisma.$disconnect();
  }
}

listAdminUsers(); 