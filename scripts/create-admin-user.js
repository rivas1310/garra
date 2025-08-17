// Script para crear usuario admin faltante
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    console.log('👤 Creando usuario admin faltante...\n');

    // Verificar si ya existe
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'admin@bazar.com' }
    });

    if (existingAdmin) {
      console.log('✅ El usuario admin@bazar.com ya existe.');
      console.log('Datos actuales:', JSON.stringify(existingAdmin, null, 2));
      return;
    }

    // Crear contraseña hasheada
    const password = 'admin123'; // Cambiar por una contraseña segura
    const hashedPassword = await bcrypt.hash(password, 12);

    // Crear el usuario admin
    const adminUser = await prisma.user.create({
      data: {
        email: 'admin@bazar.com',
        name: 'Administrador',
        hashedPassword: hashedPassword,
        role: 'ADMIN',
        phone: null,
        avatar: null
      }
    });

    console.log('✅ Usuario admin creado exitosamente:');
    console.log(`📧 Email: ${adminUser.email}`);
    console.log(`👤 Nombre: ${adminUser.name}`);
    console.log(`🔑 Rol: ${adminUser.role}`);
    console.log(`🆔 ID: ${adminUser.id}`);
    console.log(`📅 Creado: ${adminUser.createdAt}`);
    console.log(`\n🔐 Contraseña temporal: ${password}`);
    console.log('⚠️  IMPORTANTE: Cambia esta contraseña después del primer login.');

  } catch (error) {
    console.error('❌ Error creando usuario admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar el script
if (require.main === module) {
  createAdminUser();
}

module.exports = { createAdminUser };
