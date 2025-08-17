/**
 * Script para programar copias de seguridad automáticas de la base de datos
 * Este script configura un trabajo programado para ejecutar backup-database.js
 * en intervalos regulares
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuración
const CONFIG = {
  // Intervalo de copia de seguridad en milisegundos (por defecto: 24 horas)
  backupInterval: 24 * 60 * 60 * 1000,
  // Ruta al script de copia de seguridad
  backupScript: path.join(process.cwd(), 'scripts', 'backup-database.js'),
  // Número máximo de copias de seguridad a mantener
  maxBackups: 7,
  // Archivo de registro
  logFile: path.join(process.cwd(), 'logs', 'backup-schedule.log')
};

// Asegurar que existe el directorio de logs
function ensureLogDirectory() {
  const logDir = path.dirname(CONFIG.logFile);
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
}

// Función para registrar mensajes
function log(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  
  log.error(logMessage.trim());
  
  ensureLogDirectory();
  fs.appendFileSync(CONFIG.logFile, logMessage);
}

// Función para ejecutar la copia de seguridad
function runBackup() {
  log('Iniciando copia de seguridad programada...');
  
  exec(`node ${CONFIG.backupScript}`, (error, stdout, stderr) => {
    if (error) {
      log(`Error al ejecutar la copia de seguridad: ${error.message}`);
      return;
    }
    
    if (stderr) {
      log(`Error en la salida de la copia de seguridad: ${stderr}`);
      return;
    }
    
    log('Copia de seguridad completada exitosamente');
    log(`Detalles: ${stdout.split('\n').filter(line => line.includes('Respaldados') || line.includes('Ubicación:')).join('\n')}`);
    
    // Limpiar copias de seguridad antiguas
    cleanOldBackups();
  });
}

// Función para limpiar copias de seguridad antiguas
function cleanOldBackups() {
  const backupsDir = path.join(process.cwd(), 'backups');
  
  if (!fs.existsSync(backupsDir)) {
    return;
  }
  
  // Obtener todas las carpetas de copia de seguridad
  const backupFolders = fs.readdirSync(backupsDir)
    .filter(folder => {
      const folderPath = path.join(backupsDir, folder);
      return fs.statSync(folderPath).isDirectory();
    })
    .sort((a, b) => {
      // Ordenar por fecha (formato YYYY-MM-DD)
      return new Date(b) - new Date(a);
    });
  
  // Eliminar las copias de seguridad más antiguas si exceden el límite
  if (backupFolders.length > CONFIG.maxBackups) {
    const foldersToDelete = backupFolders.slice(CONFIG.maxBackups);
    
    foldersToDelete.forEach(folder => {
      const folderPath = path.join(backupsDir, folder);
      
      try {
        // Eliminar todos los archivos dentro de la carpeta
        fs.readdirSync(folderPath).forEach(file => {
          fs.unlinkSync(path.join(folderPath, file));
        });
        
        // Eliminar la carpeta
        fs.rmdirSync(folderPath);
        
        log(`Eliminada copia de seguridad antigua: ${folder}`);
      } catch (error) {
        log(`Error al eliminar copia de seguridad antigua ${folder}: ${error.message}`);
      }
    });
  }
}

// Función principal para iniciar el programador
function startScheduler() {
  log('Iniciando programador de copias de seguridad');
  log(`Intervalo configurado: ${CONFIG.backupInterval / (60 * 60 * 1000)} horas`);
  log(`Se mantendrán las últimas ${CONFIG.maxBackups} copias de seguridad`);
  
  // Ejecutar una copia de seguridad inmediatamente al iniciar
  runBackup();
  
  // Programar copias de seguridad periódicas
  setInterval(runBackup, CONFIG.backupInterval);
  
  log('Programador de copias de seguridad iniciado correctamente');
}

// Verificar si el script se ejecuta directamente
if (require.main === module) {
  // Mostrar instrucciones para configurar como servicio
  log.error('=========================================');
  log.error('PROGRAMADOR DE COPIAS DE SEGURIDAD');
  log.error('=========================================');
  log.error('Este script debe ejecutarse como un servicio o proceso en segundo plano.');
  log.error('\nPara ejecutar manualmente:');
  log.error('node scripts/schedule-backups.js');
  log.error('\nPara configurar como servicio en Windows:');
  log.error('1. Instalar pm2: npm install -g pm2');
  log.error('2. Iniciar como servicio: pm2 start scripts/schedule-backups.js --name "backup-scheduler"');
  log.error('3. Configurar inicio automático: pm2 startup && pm2 save');
  log.error('\nPara configurar como servicio en Linux:');
  log.error('1. Crear un archivo de servicio systemd');
  log.error('2. Configurar para que se ejecute al inicio');
  log.error('=========================================');
  
  // Iniciar el programador
  startScheduler();
}

module.exports = {
  startScheduler,
  runBackup,
  CONFIG
};