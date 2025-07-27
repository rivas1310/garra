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

async function createAdminUser() {
  try {
    // Datos del usuario administrador
    const adminEmail = 'admin@bazar.com';
    const adminPassword = generateSecurePassword();
    const adminName = 'Administrador';
    
    console.log('=========================================');
    console.log('INFORMACIÓN DE ACCESO DEL ADMINISTRADOR');
    console.log('=========================================');
    console.log(`Email: ${adminEmail}`);
    console.log(`Contraseña: ${adminPassword}`);
    console.log('=========================================');
    console.log('GUARDE ESTA INFORMACIÓN EN UN LUGAR SEGURO');
    console.log('=========================================');
    
    // Verificar si el usuario ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email: adminEmail }
    });
    
    if (existingUser) {
      // Si el usuario existe, actualizar su rol a ADMIN
      const updatedUser = await prisma.user.update({
        where: { email: adminEmail },
        data: { role: 'ADMIN' },
        select: {
          id: true,
          name: true,
          email: true,
          role: true
        }
      });
      
      console.log('Usuario actualizado a administrador:', updatedUser);
      return updatedUser;
    } else {
      // Si el usuario no existe, crear uno nuevo con rol ADMIN
      const hashedPassword = await hash(adminPassword, 12);
      
      const newUser = await prisma.user.create({
        data: {
          name: adminName,
          email: adminEmail,
          hashedPassword,
          role: 'ADMIN'
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true
        }
      });
      
      console.log('Nuevo usuario administrador creado:', newUser);
      return newUser;
    }
  } catch (error) {
    console.error('Error al crear/actualizar usuario administrador:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar la función
createAdminUser()
  .catch(e => {
    console.error(e);
    process.exit(1);
  });