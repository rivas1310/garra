/**
 * Script para verificar si el plugin Android está ejecutándose
 * Uso: node scripts/verificar-plugin-android.js
 */

console.log('🔍 VERIFICANDO PLUGIN ANDROID\n');

async function verificarPlugin() {
    const urls = [
        'http://localhost:8000/impresoras',
        'http://127.0.0.1:8000/impresoras',
        'http://192.168.1.1:8000/impresoras', // IP común de router
        'http://192.168.0.1:8000/impresoras'  // IP común de router
    ];

    console.log('📱 INSTRUCCIONES IMPORTANTES:');
    console.log('1. Asegúrate de que el plugin Android esté ejecutándose en tu teléfono');
    console.log('2. Verifica que el plugin esté escuchando en el puerto 8000');
    console.log('3. Si estás usando la IP del teléfono, reemplaza localhost con la IP correcta\n');

    for (const url of urls) {
        try {
            console.log(`🔗 Probando: ${url}`);
            const response = await fetch(url, {
                method: 'GET',
                timeout: 5000
            });
            
            if (response.ok) {
                const data = await response.json();
                console.log(`✅ CONEXIÓN EXITOSA: ${url}`);
                console.log(`📊 Impresoras disponibles: ${data.length}`);
                if (data.length > 0) {
                    console.log('📋 Impresoras encontradas:');
                    data.forEach((impresora, index) => {
                        console.log(`   ${index + 1}. ${impresora.name || 'Sin nombre'} - ${impresora.address || 'Sin MAC'}`);
                    });
                }
                return true;
            } else {
                console.log(`❌ Error HTTP: ${response.status} - ${response.statusText}`);
            }
        } catch (error) {
            console.log(`❌ Error de conexión: ${error.message}`);
        }
    }

    console.log('\n❌ NO SE PUDO CONECTAR AL PLUGIN');
    console.log('\n🔧 SOLUCIONES:');
    console.log('1. Verifica que el plugin Android esté ejecutándose');
    console.log('2. Asegúrate de que esté escuchando en el puerto 8000');
    console.log('3. Si usas la IP del teléfono, actualiza la URL en android-printer.html');
    console.log('4. Verifica que no haya firewall bloqueando la conexión');
    
    return false;
}

// Función para obtener la IP del dispositivo
async function obtenerIPLocal() {
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        console.log(`🌐 IP pública del dispositivo: ${data.ip}`);
    } catch (error) {
        console.log('❌ No se pudo obtener la IP pública');
    }
}

// Ejecutar verificación
(async () => {
    console.log('🚀 Iniciando verificación del plugin Android...\n');
    
    await obtenerIPLocal();
    console.log('');
    
    const conectado = await verificarPlugin();
    
    if (!conectado) {
        console.log('\n📋 PRÓXIMOS PASOS:');
        console.log('1. Ejecuta el plugin Android en tu teléfono');
        console.log('2. Verifica que esté escuchando en el puerto 8000');
        console.log('3. Obtén la IP de tu teléfono Android');
        console.log('4. Actualiza la URL en android-printer.html si es necesario');
        console.log('5. Abre la página en el navegador del teléfono Android');
    }
})();
