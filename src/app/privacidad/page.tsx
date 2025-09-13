import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Política de Privacidad - Garras Felinas',
  description: 'Política de privacidad y tratamiento de datos personales de Garras Felinas',
}

export default function PoliticaPrivacidad() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Política de Privacidad</h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 mb-6">
              <strong>Última actualización:</strong> {new Date().toLocaleDateString('es-MX')}
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">1. Información General</h2>
              <p className="text-gray-700 mb-4">
                En <strong>Garras Felinas</strong>, nos comprometemos a proteger la privacidad y los datos personales 
                de nuestros usuarios. Esta Política de Privacidad describe cómo recopilamos, utilizamos, 
                almacenamos y protegemos su información personal de acuerdo con la Ley Federal de Protección 
                de Datos Personales en Posesión de los Particulares (LFPDPPP) de México.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">2. Responsable del Tratamiento</h2>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-gray-700">
                  <strong>Razón Social:</strong> Garras Felinas<br/>
                  <strong>Domicilio:</strong> [Dirección completa]<br/>
                  <strong>Correo electrónico:</strong> privacidad@garrasfelinas.com<br/>
                  <strong>Teléfono:</strong> [Número de contacto]
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">3. Datos Personales que Recopilamos</h2>
              <p className="text-gray-700 mb-4">Recopilamos los siguientes tipos de datos personales:</p>
              
              <h3 className="text-xl font-medium text-gray-800 mb-3">3.1 Datos de Identificación</h3>
              <ul className="list-disc list-inside text-gray-700 mb-4 ml-4">
                <li>Nombre completo</li>
                <li>Correo electrónico</li>
                <li>Número de teléfono</li>
                <li>Fecha de nacimiento (opcional)</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-800 mb-3">3.2 Datos de Contacto y Envío</h3>
              <ul className="list-disc list-inside text-gray-700 mb-4 ml-4">
                <li>Dirección de envío y facturación</li>
                <li>Código postal</li>
                <li>Ciudad y estado</li>
                <li>Referencias de ubicación</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-800 mb-3">3.3 Datos de Navegación</h3>
              <ul className="list-disc list-inside text-gray-700 mb-4 ml-4">
                <li>Dirección IP</li>
                <li>Tipo de navegador</li>
                <li>Páginas visitadas</li>
                <li>Tiempo de permanencia</li>
                <li>Cookies y tecnologías similares</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">4. Finalidades del Tratamiento</h2>
              <p className="text-gray-700 mb-4">Utilizamos sus datos personales para las siguientes finalidades:</p>
              
              <h3 className="text-xl font-medium text-gray-800 mb-3">4.1 Finalidades Primarias (Necesarias)</h3>
              <ul className="list-disc list-inside text-gray-700 mb-4 ml-4">
                <li>Procesar y gestionar sus pedidos</li>
                <li>Coordinar envíos y entregas</li>
                <li>Procesar pagos y facturación</li>
                <li>Brindar atención al cliente</li>
                <li>Cumplir con obligaciones legales</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-800 mb-3">4.2 Finalidades Secundarias (Opcionales)</h3>
              <ul className="list-disc list-inside text-gray-700 mb-4 ml-4">
                <li>Envío de promociones y ofertas especiales</li>
                <li>Mejora de nuestros servicios</li>
                <li>Análisis de comportamiento de compra</li>
                <li>Personalización de la experiencia de usuario</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">5. Derechos ARCO</h2>
              <p className="text-gray-700 mb-4">
                Usted tiene derecho a Acceder, Rectificar, Cancelar u Oponerse al tratamiento de sus datos personales, 
                así como a limitar su uso o divulgación.
              </p>
              
              <div className="bg-amber-50 p-4 rounded-lg mb-4">
                <h4 className="font-semibold text-amber-800 mb-2">Para ejercer sus derechos ARCO:</h4>
                <ul className="list-disc list-inside text-gray-700 ml-4">
                  <li>Envíe un correo a: <strong>privacidad@garrasfelinas.com</strong></li>
                  <li>Incluya una identificación oficial</li>
                  <li>Especifique claramente su solicitud</li>
                  <li>Tiempo de respuesta: 20 días hábiles</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">6. Transferencias de Datos</h2>
              <p className="text-gray-700 mb-4">
                Sus datos personales pueden ser compartidos con terceros únicamente en los siguientes casos:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 ml-4">
                <li>Proveedores de servicios de envío (EnvioClick, EnviosPerros)</li>
                <li>Procesadores de pagos (Stripe)</li>
                <li>Proveedores de servicios en la nube (para almacenamiento seguro)</li>
                <li>Autoridades competentes cuando sea requerido por ley</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">7. Medidas de Seguridad</h2>
              <p className="text-gray-700 mb-4">
                Implementamos medidas de seguridad físicas, técnicas y administrativas para proteger sus datos:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 ml-4">
                <li>Cifrado de datos sensibles</li>
                <li>Acceso restringido a información personal</li>
                <li>Monitoreo continuo de seguridad</li>
                <li>Copias de seguridad regulares</li>
                <li>Protocolos de respuesta a incidentes</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">8. Cookies y Tecnologías Similares</h2>
              <p className="text-gray-700 mb-4">
                Utilizamos cookies para mejorar su experiencia de navegación. Para más información, 
                consulte nuestra <a href="/cookies" className="text-blue-600 hover:text-blue-800 underline">Política de Cookies</a>.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">9. Cambios a esta Política</h2>
              <p className="text-gray-700 mb-4">
                Nos reservamos el derecho de modificar esta Política de Privacidad. Los cambios serán 
                notificados a través de nuestro sitio web y, cuando sea necesario, por correo electrónico.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">10. Contacto</h2>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700">
                  Para cualquier duda sobre esta Política de Privacidad o el tratamiento de sus datos personales, 
                  puede contactarnos en:
                </p>
                <p className="text-gray-700 mt-2">
                  <strong>Email:</strong> privacidad@garrasfelinas.com<br/>
                  <strong>Teléfono:</strong> [Número de contacto]<br/>
                  <strong>Horario de atención:</strong> Lunes a Viernes de 9:00 a 18:00 hrs
                </p>
              </div>
            </section>

            <div className="border-t pt-6 mt-8">
              <p className="text-sm text-gray-500">
                Esta Política de Privacidad cumple con la Ley Federal de Protección de Datos Personales 
                en Posesión de los Particulares (LFPDPPP) y sus reglamentos aplicables en México.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}