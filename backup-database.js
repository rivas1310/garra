// Script para hacer backup de la base de datos usando Prisma
const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')

const prisma = new PrismaClient()

async function createBackup() {
  try {
    console.log('🔄 Iniciando backup de la base de datos...')
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const backupDir = path.join(__dirname, 'backups')
    
    // Crear directorio de backups si no existe
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true })
    }
    
    const backupFile = path.join(backupDir, `garras_backup_${timestamp}.json`)
    
    console.log('📊 Obteniendo datos de todas las tablas...')
    
    // Obtener datos de todas las tablas principales
    const backupData = {
      timestamp: new Date().toISOString(),
      version: '1.0',
      tables: {}
    }
    
    // Backup de usuarios
    console.log('👥 Respaldando usuarios...')
    const users = await prisma.user.findMany()
    backupData.tables.users = users
    
    // Backup de productos
    console.log('📦 Respaldando productos...')
    const products = await prisma.product.findMany({
      include: {
        variants: true,
        images: true,
        category: true
      }
    })
    backupData.tables.products = products
    
    // Backup de órdenes
    console.log('🛒 Respaldando órdenes...')
    const orders = await prisma.order.findMany({
      include: {
        items: {
          include: {
            product: true,
            variant: true
          }
        },
        user: true
      }
    })
    backupData.tables.orders = orders
    
    // Backup de categorías
    console.log('📂 Respaldando categorías...')
    const categories = await prisma.category.findMany({
      include: {
        subcategories: true
      }
    })
    backupData.tables.categories = categories
    
    // Backup de favoritos
    console.log('❤️ Respaldando favoritos...')
    const favorites = await prisma.favorite.findMany({
      include: {
        product: true,
        user: true
      }
    })
    backupData.tables.favorites = favorites
    
    // Backup de chats (si existen)
    console.log('💬 Respaldando conversaciones de chat...')
    try {
      const conversations = await prisma.conversation.findMany({
        include: {
          messages: true
        }
      })
      backupData.tables.conversations = conversations
    } catch (error) {
      console.log('⚠️ Tabla de conversaciones no encontrada, omitiendo...')
      backupData.tables.conversations = []
    }
    
    // Guardar archivo de backup
    console.log('💾 Guardando archivo de backup...')
    fs.writeFileSync(backupFile, JSON.stringify(backupData, null, 2))
    
    // Mostrar estadísticas
    console.log('\n✅ Backup completado exitosamente!')
    console.log('📁 Archivo guardado en:', backupFile)
    console.log('📊 Estadísticas del backup:')
    console.log(`   - Usuarios: ${users.length}`)
    console.log(`   - Productos: ${products.length}`)
    console.log(`   - Órdenes: ${orders.length}`)
    console.log(`   - Categorías: ${categories.length}`)
    console.log(`   - Favoritos: ${favorites.length}`)
    console.log(`   - Conversaciones: ${backupData.tables.conversations.length}`)
    
    // Calcular tamaño del archivo
    const stats = fs.statSync(backupFile)
    const fileSizeInMB = (stats.size / (1024 * 1024)).toFixed(2)
    console.log(`   - Tamaño del archivo: ${fileSizeInMB} MB`)
    
  } catch (error) {
    console.error('❌ Error durante el backup:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Ejecutar backup
createBackup()




