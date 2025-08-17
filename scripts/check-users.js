// Script para verificar usuarios en la base de datos
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkUsers() {
  try {
    console.log('🔍 Verificando usuarios en la base de datos...\n');

    // Obtener todos los usuarios
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        createdAt: true
      }
    });

    console.log(`📊 Total de usuarios encontrados: ${users.length}\n`);

    if (users.length > 0) {
      console.log('👥 Lista de usuarios:');
      users.forEach((user, index) => {
        console.log(`${index + 1}. Email: ${user.email}`);
        console.log(`   Nombre: ${user.name || 'Sin nombre'}`);
        console.log(`   Rol: ${user.role}`);
        console.log(`   Avatar: ${user.avatar ? '✅ Sí' : '❌ No'}`);
        console.log(`   Creado: ${user.createdAt.toLocaleString()}`);
        console.log(`   ID: ${user.id}\n`);
      });
    } else {
      console.log('❌ No se encontraron usuarios en la base de datos.');
    }

    // Buscar específicamente admin@bazar.com
    console.log('🔍 Buscando admin@bazar.com específicamente...');
    const adminUser = await prisma.user.findUnique({
      where: { email: 'admin@bazar.com' }
    });

    if (adminUser) {
      console.log('✅ Usuario admin@bazar.com encontrado:');
      console.log(JSON.stringify(adminUser, null, 2));
    } else {
      console.log('❌ Usuario admin@bazar.com NO encontrado en la base de datos.');
      
      // Buscar usuarios similares
      const similarUsers = await prisma.user.findMany({
        where: {
          email: {
            contains: 'admin'
          }
        }
      });
      
      if (similarUsers.length > 0) {
        console.log('\n📋 Usuarios similares encontrados:');
        similarUsers.forEach(user => {
          console.log(`- ${user.email} (${user.role})`);
        });
      }
    }

  } catch (error) {
    console.error('❌ Error verificando usuarios:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar el script
if (require.main === module) {
  checkUsers();
}

module.exports = { checkUsers };
