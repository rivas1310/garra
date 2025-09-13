import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Política de Cookies - Garras Felinas',
  description: 'Información sobre el uso de cookies y tecnologías similares en Garras Felinas',
}

export default function PoliticaCookies() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Política de Cookies</h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 mb-6">
              <strong>Última actualización:</strong> {new Date().toLocaleDateString('es-MX')}
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">1. ¿Qué son las Cookies?</h2>
              <p className="text-gray-700 mb-4">
                Las cookies son pequeños archivos de texto que se almacenan en su dispositivo cuando 
                visita un sitio web. Estas nos ayudan a mejorar su experiencia de navegación, recordar 
                sus preferencias y analizar cómo utiliza nuestro sitio web.
              </p>
              
              <div className="bg-blue-50 p-4 rounded-lg mb-4">
                <h4 className="font-semibold text-blue-800 mb-2">🍪 Información Importante</h4>
                <p className="text-gray-700">
                  Las cookies no contienen información personal identificable por sí mismas y no pueden 
                  dañar su dispositivo. Puede controlar y eliminar las cookies a través de la configuración 
                  de su navegador.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">2. Tipos de Cookies que Utilizamos</h2>
              
              <h3 className="text-xl font-medium text-gray-800 mb-3">2.1 Cookies Esenciales</h3>
              <p className="text-gray-700 mb-4">
                Estas cookies son necesarias para el funcionamiento básico del sitio web y no se pueden desactivar.
              </p>
              <div className="bg-green-50 p-4 rounded-lg mb-4">
                <ul className="list-disc list-inside text-gray-700 ml-4">
                  <li><strong>Sesión de usuario:</strong> Mantienen su sesión activa mientras navega</li>
                  <li><strong>Carrito de compras:</strong> Recuerdan los productos en su carrito</li>
                  <li><strong>Seguridad:</strong> Protegen contra ataques y fraudes</li>
                  <li><strong>Preferencias de idioma:</strong> Recuerdan su idioma preferido</li>
                </ul>
              </div>

              <h3 className="text-xl font-medium text-gray-800 mb-3">2.2 Cookies de Funcionalidad</h3>
              <p className="text-gray-700 mb-4">
                Mejoran la funcionalidad del sitio web y su experiencia de usuario.
              </p>
              <div className="bg-blue-50 p-4 rounded-lg mb-4">
                <ul className="list-disc list-inside text-gray-700 ml-4">
                  <li><strong>Preferencias de usuario:</strong> Recuerdan sus configuraciones personales</li>
                  <li><strong>Productos favoritos:</strong> Guardan su lista de productos favoritos</li>
                  <li><strong>Historial de navegación:</strong> Recuerdan productos vistos recientemente</li>
                  <li><strong>Configuración de pantalla:</strong> Mantienen sus preferencias de visualización</li>
                </ul>
              </div>

              <h3 className="text-xl font-medium text-gray-800 mb-3">2.3 Cookies de Análisis</h3>
              <p className="text-gray-700 mb-4">
                Nos ayudan a entender cómo los visitantes interactúan con nuestro sitio web.
              </p>
              <div className="bg-yellow-50 p-4 rounded-lg mb-4">
                <ul className="list-disc list-inside text-gray-700 ml-4">
                  <li><strong>Google Analytics:</strong> Analiza el tráfico y comportamiento del sitio</li>
                  <li><strong>Métricas de rendimiento:</strong> Miden la velocidad y rendimiento</li>
                  <li><strong>Mapas de calor:</strong> Analizan la interacción con elementos de la página</li>
                  <li><strong>Estadísticas de conversión:</strong> Miden la efectividad de nuestras campañas</li>
                </ul>
              </div>

              <h3 className="text-xl font-medium text-gray-800 mb-3">2.4 Cookies de Marketing</h3>
              <p className="text-gray-700 mb-4">
                Se utilizan para mostrar anuncios relevantes y medir la efectividad de las campañas publicitarias.
              </p>
              <div className="bg-purple-50 p-4 rounded-lg mb-4">
                <ul className="list-disc list-inside text-gray-700 ml-4">
                  <li><strong>Facebook Pixel:</strong> Para remarketing y anuncios personalizados</li>
                  <li><strong>Google Ads:</strong> Para campañas publicitarias dirigidas</li>
                  <li><strong>Seguimiento de conversiones:</strong> Miden el éxito de las campañas</li>
                  <li><strong>Personalización de anuncios:</strong> Muestran productos relevantes</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">3. Cookies de Terceros</h2>
              <p className="text-gray-700 mb-4">
                Algunos servicios de terceros que utilizamos también pueden establecer cookies en su dispositivo:
              </p>
              
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Servicio</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Propósito</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Duración</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    <tr>
                      <td className="px-4 py-2 text-sm text-gray-700">Google Analytics</td>
                      <td className="px-4 py-2 text-sm text-gray-700">Análisis de tráfico web</td>
                      <td className="px-4 py-2 text-sm text-gray-700">2 años</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 text-sm text-gray-700">Stripe</td>
                      <td className="px-4 py-2 text-sm text-gray-700">Procesamiento de pagos</td>
                      <td className="px-4 py-2 text-sm text-gray-700">Sesión</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 text-sm text-gray-700">Facebook Pixel</td>
                      <td className="px-4 py-2 text-sm text-gray-700">Remarketing y análisis</td>
                      <td className="px-4 py-2 text-sm text-gray-700">90 días</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 text-sm text-gray-700">Google Ads</td>
                      <td className="px-4 py-2 text-sm text-gray-700">Publicidad dirigida</td>
                      <td className="px-4 py-2 text-sm text-gray-700">30 días</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">4. Gestión de Cookies</h2>
              
              <h3 className="text-xl font-medium text-gray-800 mb-3">4.1 Control a través del Navegador</h3>
              <p className="text-gray-700 mb-4">
                Puede controlar y eliminar las cookies a través de la configuración de su navegador:
              </p>
              
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-2">Chrome</h4>
                  <p className="text-sm text-gray-700">
                    Configuración → Privacidad y seguridad → Cookies y otros datos de sitios
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-2">Firefox</h4>
                  <p className="text-sm text-gray-700">
                    Opciones → Privacidad y seguridad → Cookies y datos del sitio
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-2">Safari</h4>
                  <p className="text-sm text-gray-700">
                    Preferencias → Privacidad → Gestionar datos de sitios web
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-2">Edge</h4>
                  <p className="text-sm text-gray-700">
                    Configuración → Privacidad, búsqueda y servicios → Cookies
                  </p>
                </div>
              </div>

              <h3 className="text-xl font-medium text-gray-800 mb-3">4.2 Centro de Preferencias</h3>
              <div className="bg-blue-50 p-4 rounded-lg mb-4">
                <p className="text-gray-700">
                  Puede gestionar sus preferencias de cookies en cualquier momento a través de nuestro 
                  centro de preferencias, accesible desde el banner de cookies o desde el pie de página.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">5. Consecuencias de Desactivar Cookies</h2>
              
              <div className="bg-amber-50 p-4 rounded-lg mb-4">
                <h4 className="font-semibold text-amber-800 mb-2">⚠️ Importante</h4>
                <p className="text-gray-700 mb-2">
                  Si desactiva las cookies, algunas funcionalidades del sitio web pueden no funcionar correctamente:
                </p>
                <ul className="list-disc list-inside text-gray-700 ml-4">
                  <li>No podrá mantener productos en su carrito de compras</li>
                  <li>Tendrá que iniciar sesión cada vez que visite el sitio</li>
                  <li>Sus preferencias no se guardarán</li>
                  <li>Algunas funciones personalizadas no estarán disponibles</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">6. Cookies en Dispositivos Móviles</h2>
              <p className="text-gray-700 mb-4">
                En dispositivos móviles, las cookies funcionan de manera similar. Puede gestionar 
                las cookies a través de la configuración de su navegador móvil o aplicación.
              </p>
              
              <div className="bg-green-50 p-4 rounded-lg mb-4">
                <h4 className="font-semibold text-green-800 mb-2">📱 Aplicaciones Móviles</h4>
                <p className="text-gray-700">
                  Si utiliza nuestra aplicación móvil, también utilizamos tecnologías similares 
                  para mejorar su experiencia, las cuales puede gestionar desde la configuración de la app.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">7. Actualizaciones de esta Política</h2>
              <p className="text-gray-700 mb-4">
                Podemos actualizar esta Política de Cookies ocasionalmente para reflejar cambios 
                en nuestras prácticas o por otros motivos operativos, legales o reglamentarios.
              </p>
              
              <p className="text-gray-700 mb-4">
                Le notificaremos sobre cambios significativos a través de nuestro sitio web o 
                por correo electrónico cuando sea apropiado.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">8. Más Información</h2>
              
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <h4 className="font-semibold text-gray-800 mb-2">Enlaces Útiles</h4>
                <ul className="list-disc list-inside text-gray-700 ml-4">
                  <li><a href="/privacidad" className="text-blue-600 hover:text-blue-800 underline">Política de Privacidad</a></li>
                  <li><a href="/terminos" className="text-blue-600 hover:text-blue-800 underline">Términos de Servicio</a></li>
                  <li><a href="https://www.allaboutcookies.org/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">Más información sobre cookies</a></li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">9. Contacto</h2>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700">
                  Si tiene preguntas sobre nuestra Política de Cookies, puede contactarnos:
                </p>
                <p className="text-gray-700 mt-2">
                  <strong>Email:</strong> cookies@garrasfelinas.com<br/>
                  <strong>Teléfono:</strong> [Número de contacto]<br/>
                  <strong>Dirección:</strong> [Dirección física completa]
                </p>
              </div>
            </section>

            <div className="border-t pt-6 mt-8">
              <p className="text-sm text-gray-500">
                Esta Política de Cookies cumple con el Reglamento General de Protección de Datos (GDPR) 
                y la legislación mexicana aplicable sobre protección de datos personales.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}