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
      console.error('Error: Debe proporcionar un email.');
      console.log('Uso: node scripts/reset-admin-password.js <email>');
      return;
    }
    
    // Verificar si el usuario existe y es administrador
    const user = await prisma.user.findUnique({
      where: { email }
    });
    
    if (!user) {
      console.error(`Error: No se encontró ningún usuario con el email: ${email}`);
      return;
    }
    
    if (user.role !== 'ADMIN') {
      console.error(`Error: El usuario ${email} no es un administrador.`);
      console.log('Este script solo debe usarse para resetear contraseñas de administradores.');
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
    
    console.log('=========================================');
    console.log('NUEVA INFORMACIÓN DE ACCESO DEL ADMINISTRADOR');
    console.log('=========================================');
    console.log(`Email: ${email}`);
    console.log(`Nueva contraseña: ${newPassword}`);
    console.log('=========================================');
    console.log('GUARDE ESTA INFORMACIÓN EN UN LUGAR SEGURO');
    console.log('=========================================');
    
  } catch (error) {
    console.error('Error al resetear la contraseña del administrador:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Obtener el email del argumento de línea de comandos
const email = process.argv[2];
resetAdminPassword(email);