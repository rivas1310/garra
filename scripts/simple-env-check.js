require('dotenv').config({ path: '.env' })

console.log('EMAIL_HOST:', process.env.EMAIL_HOST || 'NO CONFIGURADA')
console.log('EMAIL_PORT:', process.env.EMAIL_PORT || 'NO CONFIGURADA')  
console.log('EMAIL_USER:', process.env.EMAIL_USER || 'NO CONFIGURADA')
console.log('EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? '*'.repeat(process.env.EMAIL_PASSWORD.length) : 'NO CONFIGURADA')

// Verificar si las variables existen
const allConfigured = process.env.EMAIL_HOST && process.env.EMAIL_PORT && process.env.EMAIL_USER && process.env.EMAIL_PASSWORD

if (allConfigured) {
  console.log('\n✅ Todas las variables están configuradas')
} else {
  console.log('\n❌ Faltan variables por configurar')
}



