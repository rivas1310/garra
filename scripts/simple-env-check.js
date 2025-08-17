require('dotenv').config({ path: '.env' })

log.error('EMAIL_HOST:', process.env.EMAIL_HOST || 'NO CONFIGURADA')
log.error('EMAIL_PORT:', process.env.EMAIL_PORT || 'NO CONFIGURADA')  
log.error('EMAIL_USER:', process.env.EMAIL_USER || 'NO CONFIGURADA')
log.error('EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? '*'.repeat(process.env.EMAIL_PASSWORD.length) : 'NO CONFIGURADA')

// Verificar si las variables existen
const allConfigured = process.env.EMAIL_HOST && process.env.EMAIL_PORT && process.env.EMAIL_USER && process.env.EMAIL_PASSWORD

if (allConfigured) {
  log.error('\n✅ Todas las variables están configuradas')
} else {
  log.error('\n❌ Faltan variables por configurar')
}




