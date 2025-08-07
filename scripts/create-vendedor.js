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

async function createVendedorUser() {
  try {
    // Obtener datos del usuario vendedor desde argumentos de línea de comandos o usar valores predeterminados
    const args = process.argv.slice(2);
    const vendedorEmail = args[0] || 'vendedor@bazar.com';
    const vendedorName = args[1] || 'Vendedor';
    const vendedorPassword = generateSecurePassword();
    
    console.log('=========================================');
    console.log('INFORMACIÓN DE ACCESO DEL VENDEDOR');
    console.log('=========================================');
    console.log(`Email: ${vendedorEmail}`);
    console.log(`Nombre: ${vendedorName}`);
    console.log(`Contraseña: ${vendedorPassword}`);
    console.log('=========================================');
    console.log('GUARDE ESTA INFORMACIÓN EN UN LUGAR SEGURO');
    console.log('=========================================');
    
    // Verificar si el usuario ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email: vendedorEmail }
    });
    
    if (existingUser) {
      // Si el usuario existe, actualizar su rol a VENDEDOR
      const updatedUser = await prisma.user.update({
        where: { email: vendedorEmail },
        data: { 
          role: 'VENDEDOR',
          name: vendedorName
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true
        }
      });
      
      console.log('Usuario actualizado a vendedor:', updatedUser);
      return updatedUser;
    } else {
      // Si el usuario no existe, crear uno nuevo con rol VENDEDOR
      const hashedPassword = await hash(vendedorPassword, 12);
      
      const newUser = await prisma.user.create({
        data: {
          name: vendedorName,
          email: vendedorEmail,
          hashedPassword,
          role: 'VENDEDOR'
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true
        }
      });
      
      console.log('Nuevo usuario vendedor creado:', newUser);
      return newUser;
    }
  } catch (error) {
    console.error('Error al crear/actualizar usuario vendedor:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Mostrar instrucciones de uso
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log('Uso: node create-vendedor.js [email] [nombre]');
  console.log('Ejemplo: node create-vendedor.js vendedor@bazar.com "Juan Pérez"');
  process.exit(0);
}

// Ejecutar la función
createVendedorUser()
  .catch(e => {
    console.error(e);
    process.exit(1);
  });