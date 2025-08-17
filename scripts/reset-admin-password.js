/**
 * Script para resetear la contraseña de un usuario administrador
 * Uso: node scripts/reset-admin-password.js <email>
 */

const { PrismaClient } = require('@prisma/client');
const { hash } = require('bcryptjs');
const crypto = require('crypto');
const prisma = new PrismaClient();

// Función para generar una contraseña segura
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

async function resetAdminPassword(email) {
  try {
    if (!email) {
      log.error('Error: Debe proporcionar un email.');
      log.error('Uso: node scripts/reset-admin-password.js <email>');
      return;
    }
    
    // Verificar si el usuario existe y es administrador
    const user = await prisma.user.findUnique({
      where: { email }
    });
    
    if (!user) {
      log.error(`Error: No se encontró ningún usuario con el email: ${email}`);
      return;
    }
    
    if (user.role !== 'ADMIN') {
      log.error(`Error: El usuario ${email} no es un administrador.`);
      log.error('Este script solo debe usarse para resetear contraseñas de administradores.');
      return;
    }
    
    // Generar una nueva contraseña segura
    const newPassword = generateSecurePassword();
    const hashedPassword = await hash(newPassword, 12);
    
    // Actualizar la contraseña del administrador
    await prisma.user.update({
      where: { email },
      data: { hashedPassword }
    });
    
    log.error('=========================================');
    log.error('NUEVA INFORMACIÓN DE ACCESO DEL ADMINISTRADOR');
    log.error('=========================================');
    log.error(`Email: ${email}`);
    log.error(`Nueva contraseña: ${newPassword}`);
    log.error('=========================================');
    log.error('GUARDE ESTA INFORMACIÓN EN UN LUGAR SEGURO');
    log.error('=========================================');
    
  } catch (error) {
    log.error('Error al resetear la contraseña del administrador:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Obtener el email del argumento de línea de comandos
const email = process.argv[2];
resetAdminPassword(email);