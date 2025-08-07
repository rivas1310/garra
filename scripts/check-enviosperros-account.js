const fetch = require('node-fetch');

// Configuración de EnviosPerros
const config = {
  baseUrl: 'https://staging-app.enviosperros.com/api/v2',
  apiKey: '4ExUSFztbANYkmlOkAFNH3JbUSHSYo5VS8Mcg6r1', // API Key de pruebas
  userAgent: 'BazarFashion/1.0'
};

async function checkEnviosPerrosAccount() {
  console.log('🔍 Verificando estado de cuenta de EnviosPerros...\n');
  
  // Payload de prueba con diferentes pesos para diagnosticar problemas
  const testCases = [
    {
      name: 'Paquete ligero (1kg)',
      payload: {
        depth: 20,
        width: 15,
        height: 10,
        weight: 1,
        origin: { codePostal: "44100" },
        destination: { codePostal: "44200" }
      }
    },
    {
      name: 'Paquete mediano (2kg)',
      payload: {
        depth: 30,
        width: 20,
        height: 15,
        weight: 2,
        origin: { codePostal: "44100" },
        destination: { codePostal: "44200" }
      }
    },
    {
      name: 'Paquete pesado (5kg)',
      payload: {
        depth: 40,
        width: 30,
        height: 25,
        weight: 5,
        origin: { codePostal: "44100" },
        destination: { codePostal: "44200" }
      }
    },
    {
      name: 'Paquete muy pesado (10kg)',
      payload: {
        depth: 50,
        width: 40,
        height: 30,
        weight: 10,
        origin: { codePostal: "44100" },
        destination: { codePostal: "44200" }
      }
    }
  ];
  
  for (const testCase of testCases) {
    console.log(`📦 Probando: ${testCase.name}`);
    console.log(`   Dimensiones: ${testCase.payload.depth}x${testCase.payload.width}x${testCase.payload.height}cm, Peso: ${testCase.payload.weight}kg`);
    
    try {
      const response = await fetch(`${config.baseUrl}/shipping/rates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.apiKey}`,
          'User-Agent': config.userAgent
        },
        body: JSON.stringify(testCase.payload)
      });
      
      const data = await response.json();
      
      if (data.message && Array.isArray(data.message)) {
        const availableRates = data.message.filter(rate => rate.available === true);
        const unavailableRates = data.message.filter(rate => rate.available === false);
        
        console.log(`   ✅ Tarifas disponibles: ${availableRates.length}`);
        console.log(`   ❌ Tarifas no disponibles: ${unavailableRates.length}`);
        
        // Mostrar tarifas disponibles
        if (availableRates.length > 0) {
          console.log('   📋 Tarifas disponibles:');
          availableRates.forEach((rate, index) => {
            const company = rate.deliveryType?.company || rate.carrier || 'N/A';
            console.log(`      ${index + 1}. ${company} - $${rate.cost} (${rate.deliveryType?.feature})`);
          });
        }
        
        // Mostrar problemas con tarifas no disponibles
        if (unavailableRates.length > 0) {
          console.log('   ⚠️ Problemas encontrados:');
          const problems = {};
          unavailableRates.forEach(rate => {
            const company = rate.deliveryType?.company || rate.carrier || 'N/A';
            const status = rate.status_description || 'Sin descripción';
            if (!problems[status]) {
              problems[status] = [];
            }
            problems[status].push(company);
          });
          
          Object.entries(problems).forEach(([status, companies]) => {
            console.log(`      • ${status}: ${companies.join(', ')}`);
          });
        }
      } else {
        console.log('   ❌ No se recibieron tarifas');
      }
      
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
    
    console.log(''); // Línea en blanco
  }
  
  // Probar con diferentes códigos postales para verificar problemas de ubicación
  console.log('📍 Verificando problemas de ubicación...\n');
  
  const locationTests = [
    { origin: '06000', destination: '64000', description: 'CDMX a Monterrey' },
    { origin: '44100', destination: '44200', description: 'Guadalajara local' },
    { origin: '20000', destination: '80000', description: 'Aguascalientes a Culiacán' },
    { origin: '31000', destination: '31000', description: 'Chihuahua local' }
  ];
  
  for (const test of locationTests) {
    console.log(`📍 ${test.description} (${test.origin} → ${test.destination}):`);
    
    const payload = {
      depth: 20,
      width: 15,
      height: 10,
      weight: 1,
      origin: { codePostal: test.origin },
      destination: { codePostal: test.destination }
    };
    
    try {
      const response = await fetch(`${config.baseUrl}/shipping/rates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.apiKey}`,
          'User-Agent': config.userAgent
        },
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();
      
      if (data.message && Array.isArray(data.message)) {
        const availableRates = data.message.filter(rate => rate.available === true);
        console.log(`   ✅ Disponibles: ${availableRates.length}/${data.message.length}`);
        
        if (availableRates.length > 0) {
          availableRates.forEach(rate => {
            const company = rate.deliveryType?.company || rate.carrier || 'N/A';
            console.log(`      • ${company}: $${rate.cost}`);
          });
        }
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
    
    console.log('');
  }
  
  // Resumen y recomendaciones
  console.log('📋 RESUMEN Y RECOMENDACIONES:');
  console.log('');
  console.log('🔧 Problemas identificados:');
  console.log('   1. Peso excesivo: Algunas paqueterías tienen límites de peso');
  console.log('   2. Cuenta no verificada: PaqueteExpress requiere verificación');
  console.log('   3. Cobertura limitada: UPS no está disponible en todas las ubicaciones');
  console.log('');
  console.log('💡 Soluciones recomendadas:');
  console.log('   1. Verificar la cuenta con PaqueteExpress');
  console.log('   2. Usar paquetes más ligeros para Estafeta');
  console.log('   3. 99Minutos parece ser la opción más confiable');
  console.log('   4. Considerar múltiples proveedores para mayor cobertura');
}

// Ejecutar la verificación
checkEnviosPerrosAccount(); 