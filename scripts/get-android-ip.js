/**
 * Script para ayudar a encontrar la IP del móvil Android
 */

console.log('📱 GUÍA PARA OBTENER LA IP DE TU MÓVIL ANDROID\n');

console.log('🔍 PASOS PARA ENCONTRAR LA IP:');
console.log('='.repeat(50));

console.log('\n1️⃣ En tu móvil Android:');
console.log('   - Ve a Configuración/Ajustes');
console.log('   - Busca "Wi-Fi" o "Conexiones"');
console.log('   - Toca en tu red Wi-Fi conectada');
console.log('   - Busca "Dirección IP" o "IP"');
console.log('   - Anota esa IP (ejemplo: 192.168.1.100)');

console.log('\n2️⃣ Verificar que ambos dispositivos estén en la misma red:');
console.log('   - Tu PC debe estar conectado a la misma red Wi-Fi');
console.log('   - Tu móvil Android debe estar conectado a la misma red Wi-Fi');

console.log('\n3️⃣ Probar la conexión:');
console.log('   - Una vez que tengas la IP, ejecuta:');
console.log('   - node scripts/test-android-ip.js TU_IP_AQUI');

console.log('\n📋 EJEMPLOS DE IPs COMUNES:');
console.log('   - 192.168.1.100');
console.log('   - 192.168.0.100');
console.log('   - 10.0.0.100');
console.log('   - 172.20.10.100');

console.log('\n⚠️ IMPORTANTE:');
console.log('   - La IP puede cambiar cada vez que te conectes');
console.log('   - Verifica la IP cada vez que uses el plugin');
console.log('   - Asegúrate de que el plugin esté ejecutándose en el móvil');

console.log('\n🚀 Próximo paso:');
console.log('   Ejecuta: node scripts/test-android-ip.js TU_IP_AQUI');
