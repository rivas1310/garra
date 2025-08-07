const fetch = require('node-fetch');

// Simular exactamente lo que hace la aplicación
async function debugEnviosPerros() {
  console.log('🔍 Debugging EnviosPerros...\n');
  
  // 1. Primero, hacer la solicitud directa a EnviosPerros
  console.log('1️⃣ Haciendo solicitud directa a EnviosPerros...');
  
  const enviosPerrosPayload = {
    depth: 30.01,
    width: 20.01,
    height: 15.01,
    weight: 2,
    origin: {
      codePostal: "44100"
    },
    destination: {
      codePostal: "44200"
    }
  };
  
  try {
    const enviosPerrosResponse = await fetch('https://staging-app.enviosperros.com/api/v2/shipping/rates', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer 4ExUSFztbANYkmlOkAFNH3JbUSHSYo5VS8Mcg6r1',
        'User-Agent': 'BazarFashion/1.0'
      },
      body: JSON.stringify(enviosPerrosPayload)
    });
    
    const enviosPerrosData = await enviosPerrosResponse.json();
    console.log('📋 Respuesta directa de EnviosPerros:');
    console.log(JSON.stringify(enviosPerrosData, null, 2));
    console.log('\n');
    
    // 2. Simular el procesamiento que hace la aplicación
    console.log('2️⃣ Simulando procesamiento de la aplicación...');
    
    let result = {
      success: enviosPerrosResponse.ok,
      statusCode: enviosPerrosResponse.status,
      data: enviosPerrosData,
      message: enviosPerrosData.message
    };
    
    console.log('📋 Resultado inicial:', {
      success: result.success,
      statusCode: result.statusCode,
      hasData: !!result.data,
      hasMessage: !!result.message,
      dataLength: result.data ? (Array.isArray(result.data) ? result.data.length : 'N/A') : 'N/A',
      messageLength: result.message ? (Array.isArray(result.message) ? result.message.length : 'N/A') : 'N/A'
    });
    
    // 3. Simular el movimiento de datos de message a data
    if (result.message && Array.isArray(result.message) && result.message.length > 0) {
      console.log('📋 Moviendo datos de message a data...');
      result.data = result.message;
      console.log('📋 Datos movidos:', result.data.length, 'tarifas');
    }
    
    // 4. Verificar si hay datos válidos
    let hasValidData = false;
    if (result.data && Array.isArray(result.data) && result.data.length > 0) {
      hasValidData = true;
      console.log('📋 Datos válidos encontrados:', result.data.length, 'tarifas');
    }
    
    console.log('📋 ¿Tiene datos válidos?', hasValidData);
    
    // 5. Si no hay datos válidos, crear tarifa ficticia
    if (!hasValidData) {
      console.log('⚠️ Creando tarifa ficticia...');
      result.data = [{
        title: "Servicio de Envío Estándar",
        deliveryType: {
          name: "Estándar",
          company: "Estafeta",
          description: "Servicio estándar de entrega",
          feature: "Entrega a domicilio"
        },
        packageSize: "1",
        cost: 150,
        currency: "MXN",
        pickup: false,
        available: true,
        service: "ESTAFETA_ECONOMICO",
        carrier: "Estafeta"
      }];
    }
    
    // 6. Simular la transformación de datos
    console.log('3️⃣ Transformando datos...');
    
    let formattedData;
    if (result.data && Array.isArray(result.data)) {
      console.log('📋 Procesando array de datos...');
      formattedData = {
        message: result.data.map((item) => {
          // Determinar la paquetería
          let carrier = item.deliveryType?.company || item.carrier || item.provider || "";
          
          if (!carrier && item.service && typeof item.service === 'string') {
            const serviceStr = item.service.toUpperCase();
            if (serviceStr.includes('ESTAFETA')) {
              carrier = "Estafeta";
            } else if (serviceStr.includes('REDPACK')) {
              carrier = "RedPack";
            } else if (serviceStr.includes('JTEXPRESS')) {
              carrier = "JT Express";
            } else if (serviceStr.includes('PAQUETEEXPRESS')) {
              carrier = "Paquete Express";
            } else if (serviceStr.includes('DHL')) {
              carrier = "DHL";
            } else if (serviceStr.includes('FEDEX')) {
              carrier = "FedEx";
            } else if (serviceStr.includes('99MINUTOS')) {
              carrier = "99Minutos";
            } else if (serviceStr.includes('UPS')) {
              carrier = "UPS";
            }
          }
          
          if (!carrier) {
            carrier = "Paquetería";
          }
          
          return {
            title: item.title || "Servicio de Envío Estándar",
            deliveryType: {
              name: item.deliveryType?.name || "Estándar",
              feature: item.deliveryType?.feature || "Entrega a domicilio",
              description: item.deliveryType?.description || "Servicio estándar de entrega",
              company: carrier
            },
            packageSize: item.packageSize || "1",
            cost: typeof item.cost === 'number' ? item.cost : 150,
            currency: item.currency || "MXN",
            pickup: item.pickup === true ? true : false,
            service: item.service || "",
            carrier: carrier,
            available: item.available !== false,
            status_description: item.status_description || ""
          };
        })
      };
    }
    
    console.log('📋 Resultado final:');
    console.log(JSON.stringify(formattedData, null, 2));
    console.log('📋 Cantidad de tarifas finales:', formattedData.message.length);
    
    // 7. Mostrar cada tarifa
    console.log('\n📦 Tarifas finales:');
    formattedData.message.forEach((rate, index) => {
      console.log(`\n📦 Tarifa ${index + 1}:`);
      console.log(`   Título: ${rate.title}`);
      console.log(`   Compañía: ${rate.deliveryType.company}`);
      console.log(`   Costo: $${rate.cost}`);
      console.log(`   Disponible: ${rate.available}`);
      console.log(`   Status: ${rate.status_description || 'N/A'}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Ejecutar el debugging
debugEnviosPerros(); 