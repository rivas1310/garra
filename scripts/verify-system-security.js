/**
 * Script para verificar y actualizar la configuración de seguridad general del sistema
 * Verifica la seguridad de contraseñas, cupones y otras configuraciones importantes
 */

const { PrismaClient } = require('@prisma/client');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const prisma = new PrismaClient();

// Función para ejecutar comandos
function runCommand(command) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(stdout);
    });
  });
}

async function verifySystemSecurity() {
  try {
    console.log('===========================================');
    console.log('VERIFICACIÓN DE SEGURIDAD DEL SISTEMA');
    console.log('===========================================\n');
    
    // 1. Verificar seguridad de contraseñas
    console.log('1. Verificando seguridad de contraseñas...');
    const passwordOutput = await runCommand('node scripts/check-password-security.js');
    console.log(passwordOutput);
    
    // 2. Verificar seguridad de cupones
    console.log('\n2. Verificando seguridad de cupones...');
    const couponOutput = await runCommand('node scripts/verify-coupon-security.js');
    console.log(couponOutput);
    
    // 3. Verificar archivos de configuración sensibles
    console.log('\n3. Verificando archivos de configuración sensibles...');
    const envFile = path.join(process.cwd(), '.env');
    const envExampleFile = path.join(process.cwd(), '.env.example');
    
    if (fs.existsSync(envFile)) {
      console.log('✓ Archivo .env encontrado');
      
      // Verificar si .env está en .gitignore
      const gitignorePath = path.join(process.cwd(), '.gitignore');
      if (fs.existsSync(gitignorePath)) {
        const gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
        if (gitignoreContent.includes('.env')) {
          console.log('✓ .env está correctamente incluido en .gitignore');
        } else {
          console.log('⚠️ ADVERTENCIA: .env no está incluido en .gitignore. Se recomienda añadirlo para evitar exponer información sensible.');
        }
      } else {
        console.log('⚠️ ADVERTENCIA: No se encontró archivo .gitignore. Se recomienda crear uno e incluir .env.');
      }
      
      // Verificar si existe .env.example
      if (fs.existsSync(envExampleFile)) {
        console.log('✓ Archivo .env.example encontrado (buena práctica para documentar variables de entorno)');
      } else {
        console.log('⚠️ ADVERTENCIA: No se encontró archivo .env.example. Se recomienda crear uno para documentar las variables de entorno requeridas.');
      }
    } else {
      console.log('⚠️ ADVERTENCIA: No se encontró archivo .env. Se recomienda utilizar variables de entorno para configuraciones sensibles.');
    }
    
    // 4. Verificar dependencias con vulnerabilidades conocidas
    console.log('\n4. Verificando dependencias con vulnerabilidades conocidas...');
    console.log('Para verificar vulnerabilidades en las dependencias, se recomienda ejecutar:');
    console.log('npm audit');
    
    // 5. Verificar configuración de CORS
    console.log('\n5. Verificando configuración de CORS...');
    const nextConfigPath = path.join(process.cwd(), 'next.config.js');
    if (fs.existsSync(nextConfigPath)) {
      const nextConfigContent = fs.readFileSync(nextConfigPath, 'utf8');
      if (nextConfigContent.includes('headers:') && nextConfigContent.includes('Content-Security-Policy')) {
        console.log('✓ Se encontró configuración de Content-Security-Policy en next.config.js');
      } else {
        console.log('⚠️ ADVERTENCIA: No se encontró configuración de Content-Security-Policy en next.config.js.');
        console.log('   Se recomienda implementar políticas de seguridad de contenido para prevenir ataques XSS.');
      }
    } else {
      console.log('⚠️ ADVERTENCIA: No se encontró archivo next.config.js. Se recomienda configurar encabezados de seguridad.');
    }
    
    // 6. Verificar configuración de rate limiting
    console.log('\n6. Verificando configuración de rate limiting...');
    const apiDirPath = path.join(process.cwd(), 'src', 'app', 'api');
    let rateLimitingFound = false;
    
    if (fs.existsSync(apiDirPath)) {
      const files = fs.readdirSync(apiDirPath, { recursive: true });
      for (const file of files) {
        const filePath = path.join(apiDirPath, file);
        if (fs.statSync(filePath).isFile() && filePath.endsWith('.ts')) {
          const fileContent = fs.readFileSync(filePath, 'utf8');
          if (fileContent.includes('rate-limit') || fileContent.includes('rateLimit')) {
            rateLimitingFound = true;
            console.log(`✓ Se encontró configuración de rate limiting en ${filePath}`);
            break;
          }
        }
      }
    }
    
    if (!rateLimitingFound) {
      console.log('⚠️ ADVERTENCIA: No se encontró configuración de rate limiting en los endpoints de la API.');
      console.log('   Se recomienda implementar rate limiting para prevenir ataques de fuerza bruta y DoS.');
    }
    
    // 7. Recomendaciones finales
    console.log('\n===========================================');
    console.log('RECOMENDACIONES DE SEGURIDAD');
    console.log('===========================================');
    console.log('1. Implemente autenticación de dos factores (2FA) para cuentas de administrador');
    console.log('2. Configure encabezados de seguridad HTTP (Content-Security-Policy, X-XSS-Protection, etc.)');
    console.log('3. Implemente rate limiting en todos los endpoints de autenticación');
    console.log('4. Realice auditorías de seguridad periódicas');
    console.log('5. Mantenga todas las dependencias actualizadas');
    console.log('6. Implemente logging de eventos de seguridad');
    console.log('7. Considere utilizar HTTPS en entornos de desarrollo local');
    console.log('8. Revise el documento SECURITY_README.md para más recomendaciones');
    console.log('===========================================');
    
  } catch (error) {
    console.error('Error al verificar la seguridad del sistema:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifySystemSecurity();