#!/usr/bin/env node

/**
 * Script para debuggear las variables de entorno
 */

require('dotenv').config({ path: '.env' })

console.log('🔍 VARIABLES DE ENTORNO CARGADAS:')
console.log('═'.repeat(50))

// Mostrar todas las variables que empiecen con EMAIL
const emailVars = Object.keys(process.env).filter(key => key.includes('EMAIL'))
if (emailVars.length > 0) {
  console.log('📧 Variables relacionadas con EMAIL encontradas:')
  emailVars.forEach(key => {
    const value = process.env[key]
    if (key.includes('PASSWORD')) {
      console.log(`  ${key}: ${'*'.repeat(value.length)}`)
    } else {
      console.log(`  ${key}: ${value}`)
    }
  })
} else {
  console.log('❌ No se encontraron variables relacionadas con EMAIL')
}

console.log()
console.log('📋 Buscando variables específicas requeridas:')
const required = ['EMAIL_HOST', 'EMAIL_PORT', 'EMAIL_USER', 'EMAIL_PASSWORD']
required.forEach(key => {
  const value = process.env[key]
  if (value) {
    if (key === 'EMAIL_PASSWORD') {
      console.log(`✅ ${key}: ${'*'.repeat(value.length)}`)
    } else {
      console.log(`✅ ${key}: ${value}`)
    }
  } else {
    console.log(`❌ ${key}: NO ENCONTRADA`)
  }
})

console.log()
console.log('🔍 Total de variables de entorno cargadas:', Object.keys(process.env).length)


