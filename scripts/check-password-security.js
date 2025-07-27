/**
 * Script para verificar la seguridad de las contraseñas de los usuarios
 * Este script no puede ver las contraseñas actuales (están hasheadas),
 * pero puede identificar usuarios que necesitan actualizar sus contraseñas
 * basándose en la fecha de creación o actualización.
 */

const { PrismaClient } = require('@prisma/client');
const { hash } = require('bcryptjs');
const crypto = require('crypto');
const prisma = new PrismaClient();

// Función para generar una contraseña segura (igual que en create-admin.js)
function generateSecurePassword(length = 16) {
  const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
  const numberChars = '0123456789';
  const specialChars = '!@#$%^&*()_+[]{}|;:,.<>?';
  
  const allChars = uppercaseChars + lowercaseChars + numberChars + specialChars;
  
  // Asegurar al menos un carácter de cada tipo
  let password = [
    uppercaseChars[Math.floor(crypto.randomInt(uppercaseChars.length))],
    lowercaseChars[Math.floor(crypto.randomInt(lowercaseChars.length))],
    numberChars[Math.floor(crypto.randomInt(numberChars.length))],
    specialChars[Math.floor(crypto.randomInt(specialChars.length))]
  ].join('');
  
  // Completar el resto de la contraseña
  while (password.length < length) {
    password += allChars[Math.floor(crypto.randomInt(allChars.length))];
  }
  
  // Mezclar los caracteres para mayor aleatoriedad
  return password.split('').sort(() => 0.5 - Math.random()).join('');
}

async function checkPasswordSecurity() {
  try {
    console.log('Verificando seguridad de contraseñas...');
    
    // Obtener todos los usuarios
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        hashedPassword: true
      }
    });
    
    console.log(`Se encontraron ${users.length} usuarios en la base de datos.`);
    
    // Filtrar usuarios sin contraseña hasheada (posiblemente usando OAuth)
    const usersWithPassword = users.filter(user => user.hashedPassword);
    const usersWithoutPassword = users.filter(user => !user.hashedPassword);
    
    console.log(`- ${usersWithPassword.length} usuarios tienen contraseña configurada.`);
    console.log(`- ${usersWithoutPassword.length} usuarios no tienen contraseña (posiblemente usando OAuth).`);
    
    // Preguntar si se desea resetear las contraseñas de los administradores
    const adminUsers = usersWithPassword.filter(user => user.role === 'ADMIN');
    
    if (adminUsers.length > 0) {
      console.log('\nUsuarios administradores:');
      adminUsers.forEach((admin, index) => {
        console.log(`${index + 1}. ${admin.name} (${admin.email})`);
      });
      
      // En un entorno real, aquí se podría implementar una pregunta interactiva
      // para confirmar el reseteo de contraseñas. En este script, simplemente
      // mostraremos la información.
      
      console.log('\nPara resetear la contraseña de un administrador, ejecute:');
      console.log('node scripts/reset-admin-password.js <email>');
    }
    
    console.log('\nRecomendaciones de seguridad:');
    console.log('1. Implemente una política de caducidad de contraseñas (ej. cada 90 días)');
    console.log('2. Requiera contraseñas seguras para todos los usuarios');
    console.log('3. Implemente autenticación de dos factores para cuentas de administrador');
    console.log('4. Monitoree intentos fallidos de inicio de sesión');
    
  } catch (error) {
    console.error('Error al verificar la seguridad de las contraseñas:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Script para resetear la contraseña de un usuario específico
async function resetUserPassword(email) {
  try {
    // Verificar si el usuario existe
    const user = await prisma.user.findUnique({
      where: { email }
    });
    
    if (!user) {
      console.error(`No se encontró ningún usuario con el email: ${email}`);
      return;
    }
    
    // Generar una nueva contraseña segura
    const newPassword = generateSecurePassword();
    const hashedPassword = await hash(newPassword, 12);
    
    // Actualizar la contraseña del usuario
    await prisma.user.update({
      where: { email },
      data: { hashedPassword }
    });
    
    console.log('=========================================');
    console.log('NUEVA INFORMACIÓN DE ACCESO');
    console.log('=========================================');
    console.log(`Email: ${email}`);
    console.log(`Nueva contraseña: ${newPassword}`);
    console.log('=========================================');
    console.log('GUARDE ESTA INFORMACIÓN EN UN LUGAR SEGURO');
    console.log('=========================================');
    
  } catch (error) {
    console.error('Error al resetear la contraseña:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Determinar qué función ejecutar basado en los argumentos
const args = process.argv.slice(2);

if (args.length > 0) {
  // Si se proporciona un email, resetear la contraseña de ese usuario
  resetUserPassword(args[0]);
} else {
  // Si no hay argumentos, verificar la seguridad de las contraseñas
  checkPasswordSecurity();
}