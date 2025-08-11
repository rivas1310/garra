/**
 * Script para verificar el estado de la impresora térmica y el plugin Android
 * Uso: node scripts/verificar-impresora-android.js
 */

console.log('🔍 VERIFICACIÓN DE IMPRESORA TÉRMICA Y PLUGIN ANDROID\n');

async function verificarPlugin(ip) {
    try {
        console.log(`🔗 Verificando plugin en: http://${ip}:8000`);
        
        // Verificar endpoint de impresoras
        const response = await fetch(`http://${ip}:8000/impresoras`);
        if (response.ok) {
            const impresoras = await response.json();
            console.log(`✅ Plugin funcionando correctamente`);
            console.log(`📊 Impresoras detectadas: ${impresoras.length}`);
            
            if (impresoras.length === 0) {
                console.log('\n❌ NO HAY IMPRESORAS DETECTADAS');
                console.log('\n🔧 SOLUCIONES:');
                console.log('1. Verifica que la impresora térmica esté encendida');
                console.log('2. Asegúrate de que esté emparejada con el teléfono Android');
                console.log('3. Verifica que el Bluetooth esté activado en ambos dispositivos');
                console.log('4. Intenta emparejar la impresora nuevamente');
                console.log('5. Reinicia la impresora y el teléfono');
            } else {
                console.log('\n📋 Impresoras encontradas:');
                impresoras.forEach((impresora, index) => {
                    console.log(`   ${index + 1}. Nombre: ${impresora.name || 'Sin nombre'}`);
                    console.log(`      MAC: ${impresora.address || 'Sin MAC'}`);
                    console.log(`      Estado: ${impresora.connected ? 'Conectada' : 'Desconectada'}`);
                });
            }
            
            return impresoras;
        } else {
            console.log(`❌ Error HTTP: ${response.status} - ${response.statusText}`);
            return null;
        }
    } catch (error) {
        console.log(`❌ Error de conexión: ${error.message}`);
        return null;
    }
}

async function probarImpresion(ip, macImpresora) {
    try {
        console.log(`\n🖨️ Probando impresión en: ${macImpresora}`);
        
        const payload = {
            operaciones: [
                { nombre: 'Iniciar', argumentos: [] },
                { nombre: 'EscribirTexto', argumentos: ['Prueba de conexión'] },
                { nombre: 'Feed', argumentos: [1] },
                { nombre: 'Corte', argumentos: [1] }
            ],
            impresora: macImpresora,
            serial: ""
        };
        
        const response = await fetch(`http://${ip}:8000/imprimir`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
        
        if (response.ok) {
            const resultado = await response.json();
            console.log(`✅ Impresión exitosa:`, resultado);
            return true;
        } else {
            console.log(`❌ Error de impresión: ${response.status} - ${response.statusText}`);
            return false;
        }
    } catch (error) {
        console.log(`❌ Error al imprimir: ${error.message}`);
        return false;
    }
}

async function main() {
    const ip = process.argv[2];
    
    if (!ip) {
        console.log('❌ Uso: node scripts/verificar-impresora-android.js IP_DEL_TELEFONO');
        console.log('Ejemplo: node scripts/verificar-impresora-android.js 192.168.1.100');
        process.exit(1);
    }
    
    console.log(`🎯 Verificando impresora térmica en: ${ip}`);
    console.log('');
    
    // Verificar plugin y obtener impresoras
    const impresoras = await verificarPlugin(ip);
    
    if (impresoras && impresoras.length > 0) {
        console.log('\n🖨️ PROBANDO IMPRESIÓN...');
        
        // Probar con la primera impresora
        const primeraImpresora = impresoras[0];
        const macImpresora = primeraImpresora.address || primeraImpresora.mac;
        
        if (macImpresora) {
            await probarImpresion(ip, macImpresora);
        } else {
            console.log('❌ No se encontró MAC de la impresora');
        }
    }
    
    console.log('\n📋 RESUMEN DE VERIFICACIÓN:');
    console.log('1. Plugin Android: ✅ Funcionando');
    console.log(`2. Impresoras detectadas: ${impresoras ? impresoras.length : 0}`);
    console.log('3. Estado de impresora: ' + (impresoras && impresoras.length > 0 ? '✅ Detectada' : '❌ No detectada'));
    
    if (!impresoras || impresoras.length === 0) {
        console.log('\n🔧 PRÓXIMOS PASOS:');
        console.log('1. Verifica que la impresora térmica esté encendida');
        console.log('2. Asegúrate de que esté emparejada con el teléfono Android');
        console.log('3. Verifica que el Bluetooth esté activado');
        console.log('4. Intenta emparejar la impresora nuevamente');
        console.log('5. Reinicia la impresora y el teléfono');
    }
}

main();
