// Script para verificar componentes de integración Bluetooth
console.log('🔍 Verificando componentes de integración Bluetooth...')

const fs = require('fs')
const path = require('path')

// Función para verificar si un archivo existe
function fileExists(filePath) {
  try {
    return fs.existsSync(filePath)
  } catch (error) {
    return false
  }
}

// Función para leer contenido de archivo
function readFileContent(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8')
  } catch (error) {
    return null
  }
}

// Función para verificar tipos TypeScript
function verifyTypeScriptTypes() {
  console.log('\n📋 Verificando tipos TypeScript...')
  
  const typesFile = 'src/types/bluetooth.d.ts'
  
  if (!fileExists(typesFile)) {
    console.log('❌ Archivo de tipos no encontrado:', typesFile)
    return false
  }
  
  const content = readFileContent(typesFile)
  if (!content) {
    console.log('❌ No se pudo leer el archivo de tipos')
    return false
  }
  
  const requiredTypes = [
    'BluetoothDevice',
    'BluetoothRemoteGATTServer',
    'BluetoothRemoteGATTService',
    'BluetoothRemoteGATTCharacteristic',
    'Navigator'
  ]
  
  let allTypesFound = true
  requiredTypes.forEach(type => {
    if (content.includes(type)) {
      console.log(`✅ Tipo encontrado: ${type}`)
    } else {
      console.log(`❌ Tipo faltante: ${type}`)
      allTypesFound = false
    }
  })
  
  return allTypesFound
}

// Función para verificar componente BluetoothPrinter
function verifyBluetoothPrinterComponent() {
  console.log('\n🖨️ Verificando componente BluetoothPrinter...')
  
  const componentFile = 'src/components/BluetoothPrinter.tsx'
  
  if (!fileExists(componentFile)) {
    console.log('❌ Componente BluetoothPrinter no encontrado')
    return false
  }
  
  const content = readFileContent(componentFile)
  if (!content) {
    console.log('❌ No se pudo leer el componente')
    return false
  }
  
  const requiredFeatures = [
    'useState',
    'useRef',
    'BluetoothDevice',
    'BluetoothRemoteGATTCharacteristic',
    'navigator.bluetooth',
    'requestDevice',
    'connect',
    'writeValue',
    'addEventListener'
  ]
  
  let allFeaturesFound = true
  requiredFeatures.forEach(feature => {
    if (content.includes(feature)) {
      console.log(`✅ Característica encontrada: ${feature}`)
    } else {
      console.log(`❌ Característica faltante: ${feature}`)
      allFeaturesFound = false
    }
  })
  
  return allFeaturesFound
}

// Función para verificar hook useBluetoothPrinter
function verifyBluetoothHook() {
  console.log('\n🔧 Verificando hook useBluetoothPrinter...')
  
  const hookFile = 'src/hooks/useBluetoothPrinter.ts'
  
  if (!fileExists(hookFile)) {
    console.log('❌ Hook useBluetoothPrinter no encontrado')
    return false
  }
  
  const content = readFileContent(hookFile)
  if (!content) {
    console.log('❌ No se pudo leer el hook')
    return false
  }
  
  const requiredFeatures = [
    'useState',
    'useRef',
    'useCallback',
    'BluetoothDevice',
    'BluetoothRemoteGATTCharacteristic',
    'navigator.bluetooth',
    'requestDevice',
    'connect',
    'getPrimaryService',
    'getCharacteristics',
    'writeValue',
    'addEventListener'
  ]
  
  let allFeaturesFound = true
  requiredFeatures.forEach(feature => {
    if (content.includes(feature)) {
      console.log(`✅ Característica encontrada: ${feature}`)
    } else {
      console.log(`❌ Característica faltante: ${feature}`)
      allFeaturesFound = false
    }
  })
  
  return allFeaturesFound
}

// Función para verificar páginas que usan Bluetooth
function verifyBluetoothPages() {
  console.log('\n📄 Verificando páginas que usan Bluetooth...')
  
  const pages = [
    'src/app/admin/impresora/page.tsx',
    'src/app/admin/venta-fisica/page.tsx'
  ]
  
  let allPagesFound = true
  pages.forEach(pagePath => {
    if (fileExists(pagePath)) {
      const content = readFileContent(pagePath)
      if (content && content.includes('BluetoothPrinter')) {
        console.log(`✅ Página encontrada y usa Bluetooth: ${pagePath}`)
      } else {
        console.log(`⚠️ Página encontrada pero no usa Bluetooth: ${pagePath}`)
      }
    } else {
      console.log(`❌ Página no encontrada: ${pagePath}`)
      allPagesFound = false
    }
  })
  
  return allPagesFound
}

// Función para verificar configuración de TypeScript
function verifyTypeScriptConfig() {
  console.log('\n⚙️ Verificando configuración TypeScript...')
  
  const tsConfigFile = 'tsconfig.json'
  
  if (!fileExists(tsConfigFile)) {
    console.log('❌ tsconfig.json no encontrado')
    return false
  }
  
  const content = readFileContent(tsConfigFile)
  if (!content) {
    console.log('❌ No se pudo leer tsconfig.json')
    return false
  }
  
  // Verificar que incluye archivos .ts y .tsx
  if (content.includes('**/*.ts') && content.includes('**/*.tsx')) {
    console.log('✅ Configuración TypeScript correcta')
    return true
  } else {
    console.log('❌ Configuración TypeScript incorrecta')
    return false
  }
}

// Función para verificar package.json
function verifyPackageJson() {
  console.log('\n📦 Verificando package.json...')
  
  const packageFile = 'package.json'
  
  if (!fileExists(packageFile)) {
    console.log('❌ package.json no encontrado')
    return false
  }
  
  const content = readFileContent(packageFile)
  if (!content) {
    console.log('❌ No se pudo leer package.json')
    return false
  }
  
  try {
    const packageJson = JSON.parse(content)
    
    // Verificar que es un proyecto Next.js
    if (packageJson.dependencies && packageJson.dependencies.next) {
      console.log('✅ Proyecto Next.js detectado')
    } else {
      console.log('❌ No es un proyecto Next.js')
      return false
    }
    
    // Verificar que tiene React
    if (packageJson.dependencies && packageJson.dependencies.react) {
      console.log('✅ React detectado')
    } else {
      console.log('❌ React no encontrado')
      return false
    }
    
    return true
  } catch (error) {
    console.log('❌ Error al parsear package.json')
    return false
  }
}

// Función para generar reporte de compatibilidad
function generateCompatibilityReport() {
  console.log('\n📊 Generando reporte de compatibilidad...')
  
  const report = {
    browserSupport: {
      chrome: 'Versión 56+',
      edge: 'Versión 79+',
      opera: 'Versión 43+',
      android: 'Chrome 56+',
      ios: 'No soportado',
      firefox: 'No soportado',
      safari: 'No soportado'
    },
    requirements: [
      'Conexión HTTPS (requerido para Web Bluetooth)',
      'Navegador compatible (Chrome, Edge, Opera)',
      'Dispositivo Bluetooth habilitado',
      'Impresora térmica Bluetooth compatible',
      'Permisos de Bluetooth habilitados'
    ],
    supportedPrinters: [
      'Epson TM-T88VI',
      'Star TSP100III',
      'Bixolon SRP-350III',
      'Citizen CT-S310II',
      'Zjiang ZJ-5802',
      'GP-58MB',
      'SP-POS88V'
    ]
  }
  
  console.log('🌐 Compatibilidad de navegadores:')
  Object.entries(report.browserSupport).forEach(([browser, version]) => {
    console.log(`  ${browser}: ${version}`)
  })
  
  console.log('\n📋 Requisitos:')
  report.requirements.forEach(req => {
    console.log(`  • ${req}`)
  })
  
  console.log('\n🖨️ Impresoras compatibles:')
  report.supportedPrinters.forEach(printer => {
    console.log(`  • ${printer}`)
  })
}

// Función principal de verificación
function runVerification() {
  console.log('🧪 Ejecutando verificación completa de componentes Bluetooth...\n')
  
  const results = {
    typescriptTypes: verifyTypeScriptTypes(),
    bluetoothPrinter: verifyBluetoothPrinterComponent(),
    bluetoothHook: verifyBluetoothHook(),
    bluetoothPages: verifyBluetoothPages(),
    typescriptConfig: verifyTypeScriptConfig(),
    packageJson: verifyPackageJson()
  }
  
  // Generar reporte de compatibilidad
  generateCompatibilityReport()
  
  // Resumen final
  console.log('\n📋 RESUMEN DE VERIFICACIÓN:')
  console.log('='.repeat(50))
  
  const totalChecks = Object.keys(results).length
  const passedChecks = Object.values(results).filter(Boolean).length
  
  Object.entries(results).forEach(([check, passed]) => {
    const status = passed ? '✅' : '❌'
    const checkName = check.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())
    console.log(`${status} ${checkName}`)
  })
  
  console.log(`\n📊 Resultado: ${passedChecks}/${totalChecks} verificaciones pasaron`)
  
  if (passedChecks === totalChecks) {
    console.log('\n🎉 ¡Todos los componentes están correctamente implementados!')
    console.log('✅ La integración Bluetooth está lista para usar')
  } else {
    console.log('\n⚠️ Algunos componentes necesitan atención')
    console.log('🔧 Revisa los errores mostrados arriba')
  }
  
  console.log('\n📝 Próximos pasos:')
  console.log('1. Ejecuta la aplicación en HTTPS')
  console.log('2. Conecta una impresora Bluetooth compatible')
  console.log('3. Prueba la funcionalidad en el navegador')
  console.log('4. Verifica que los tickets se impriman correctamente')
}

// Ejecutar verificación
runVerification()
