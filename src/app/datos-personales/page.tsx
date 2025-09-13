import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Política de Tratamiento de Datos Personales - Garras Felinas',
  description: 'Información sobre cómo tratamos y protegemos sus datos personales en Garras Felinas',
}

export default function PoliticaDatosPersonales() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Política de Tratamiento de Datos Personales</h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 mb-6">
              <strong>Última actualización:</strong> {new Date().toLocaleDateString('es-MX')}
            </p>

            <div className="bg-blue-50 p-6 rounded-lg mb-8">
              <h2 className="text-xl font-semibold text-blue-800 mb-3">🔒 Compromiso con la Privacidad</h2>
              <p className="text-gray-700">
                En Garras Felinas nos comprometemos a proteger y respetar su privacidad. Esta política 
                explica cómo recopilamos, utilizamos, almacenamos y protegemos sus datos personales 
                conforme a la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP).
              </p>
            </div>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">1. Responsable del Tratamiento</h2>
              
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <p className="text-gray-700">
                  <strong>Denominación:</strong> Garras Felinas<br/>
                  <strong>Domicilio:</strong> [Dirección completa]<br/>
                  <strong>RFC:</strong> [RFC de la empresa]<br/>
                  <strong>Correo electrónico:</strong> privacidad@garrasfelinas.com<br/>
                  <strong>Teléfono:</strong> [Número de contacto]
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">2. Datos Personales que Recopilamos</h2>
              
              <h3 className="text-xl font-medium text-gray-800 mb-3">2.1 Datos de Identificación</h3>
              <div className="bg-green-50 p-4 rounded-lg mb-4">
                <ul className="list-disc list-inside text-gray-700 ml-4">
                  <li>Nombre completo</li>
                  <li>Fecha de nacimiento</li>
                  <li>Género</li>
                  <li>Fotografía (opcional)</li>
                  <li>Firma electrónica</li>
                </ul>
              </div>

              <h3 className="text-xl font-medium text-gray-800 mb-3">2.2 Datos de Contacto</h3>
              <div className="bg-blue-50 p-4 rounded-lg mb-4">
                <ul className="list-disc list-inside text-gray-700 ml-4">
                  <li>Dirección de correo electrónico</li>
                  <li>Número de teléfono móvil y fijo</li>
                  <li>Dirección postal completa</li>
                  <li>Código postal</li>
                  <li>Ciudad y estado de residencia</li>
                </ul>
              </div>

              <h3 className="text-xl font-medium text-gray-800 mb-3">2.3 Datos Financieros y Patrimoniales</h3>
              <div className="bg-yellow-50 p-4 rounded-lg mb-4">
                <ul className="list-disc list-inside text-gray-700 ml-4">
                  <li>Información de tarjetas de crédito/débito (tokenizada)</li>
                  <li>Historial de compras y transacciones</li>
                  <li>Preferencias de pago</li>
                  <li>Datos de facturación</li>
                </ul>
              </div>

              <h3 className="text-xl font-medium text-gray-800 mb-3">2.4 Datos de Navegación y Comportamiento</h3>
              <div className="bg-purple-50 p-4 rounded-lg mb-4">
                <ul className="list-disc list-inside text-gray-700 ml-4">
                  <li>Dirección IP</li>
                  <li>Tipo de navegador y dispositivo</li>
                  <li>Páginas visitadas y tiempo de permanencia</li>
                  <li>Productos visualizados y búsquedas realizadas</li>
                  <li>Cookies y tecnologías similares</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">3. Finalidades del Tratamiento</h2>
              
              <h3 className="text-xl font-medium text-gray-800 mb-3">3.1 Finalidades Primarias (Necesarias)</h3>
              <div className="bg-red-50 p-4 rounded-lg mb-4">
                <p className="text-gray-700 mb-2"><strong>Estas finalidades son necesarias para la relación jurídica:</strong></p>
                <ul className="list-disc list-inside text-gray-700 ml-4">
                  <li>Procesamiento y cumplimiento de pedidos</li>
                  <li>Facturación y cobranza</li>
                  <li>Atención al cliente y soporte técnico</li>
                  <li>Gestión de devoluciones y garantías</li>
                  <li>Cumplimiento de obligaciones legales</li>
                  <li>Seguridad y prevención de fraudes</li>
                </ul>
              </div>

              <h3 className="text-xl font-medium text-gray-800 mb-3">3.2 Finalidades Secundarias (Opcionales)</h3>
              <div className="bg-orange-50 p-4 rounded-lg mb-4">
                <p className="text-gray-700 mb-2"><strong>Requieren su consentimiento expreso:</strong></p>
                <ul className="list-disc list-inside text-gray-700 ml-4">
                  <li>Envío de promociones y ofertas especiales</li>
                  <li>Marketing directo y publicidad personalizada</li>
                  <li>Análisis de comportamiento y preferencias</li>
                  <li>Mejora de productos y servicios</li>
                  <li>Investigación de mercado</li>
                  <li>Programas de lealtad y recompensas</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">4. Fundamento Legal</h2>
              
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-2">📋 Ejecución de Contrato</h4>
                  <p className="text-sm text-gray-700">
                    Procesamiento necesario para el cumplimiento de la compra-venta
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-2">✅ Consentimiento</h4>
                  <p className="text-sm text-gray-700">
                    Para finalidades secundarias como marketing y análisis
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-2">⚖️ Obligación Legal</h4>
                  <p className="text-sm text-gray-700">
                    Cumplimiento de obligaciones fiscales y regulatorias
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-2">🛡️ Interés Legítimo</h4>
                  <p className="text-sm text-gray-700">
                    Seguridad, prevención de fraudes y mejora de servicios
                  </p>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">5. Derechos ARCO</h2>
              
              <p className="text-gray-700 mb-4">
                Como titular de datos personales, usted tiene los siguientes derechos:
              </p>
              
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div className="border border-blue-200 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">🔍 Acceso</h4>
                  <p className="text-sm text-gray-700">
                    Conocer qué datos personales tenemos sobre usted y cómo los utilizamos
                  </p>
                </div>
                <div className="border border-green-200 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-800 mb-2">✏️ Rectificación</h4>
                  <p className="text-sm text-gray-700">
                    Solicitar la corrección de datos inexactos o incompletos
                  </p>
                </div>
                <div className="border border-red-200 p-4 rounded-lg">
                  <h4 className="font-semibold text-red-800 mb-2">🗑️ Cancelación</h4>
                  <p className="text-sm text-gray-700">
                    Solicitar la eliminación de sus datos cuando no sean necesarios
                  </p>
                </div>
                <div className="border border-purple-200 p-4 rounded-lg">
                  <h4 className="font-semibold text-purple-800 mb-2">🚫 Oposición</h4>
                  <p className="text-sm text-gray-700">
                    Oponerse al tratamiento de sus datos para fines específicos
                  </p>
                </div>
              </div>

              <div className="bg-amber-50 p-4 rounded-lg mb-4">
                <h4 className="font-semibold text-amber-800 mb-2">📧 Cómo Ejercer sus Derechos</h4>
                <p className="text-gray-700">
                  Para ejercer cualquiera de estos derechos, envíe un correo a 
                  <strong> privacidad@garrasfelinas.com</strong> con:
                </p>
                <ul className="list-disc list-inside text-gray-700 ml-4 mt-2">
                  <li>Nombre completo y correo electrónico registrado</li>
                  <li>Descripción clara del derecho que desea ejercer</li>
                  <li>Documentos que acrediten su identidad</li>
                </ul>
                <p className="text-gray-700 mt-2">
                  <strong>Tiempo de respuesta:</strong> Máximo 20 días hábiles
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">6. Transferencias de Datos</h2>
              
              <p className="text-gray-700 mb-4">
                Sus datos personales pueden ser compartidos con:
              </p>
              
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Destinatario</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Finalidad</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Base Legal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    <tr>
                      <td className="px-4 py-2 text-sm text-gray-700">Proveedores de pago</td>
                      <td className="px-4 py-2 text-sm text-gray-700">Procesamiento de pagos</td>
                      <td className="px-4 py-2 text-sm text-gray-700">Ejecución de contrato</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 text-sm text-gray-700">Empresas de logística</td>
                      <td className="px-4 py-2 text-sm text-gray-700">Entrega de productos</td>
                      <td className="px-4 py-2 text-sm text-gray-700">Ejecución de contrato</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 text-sm text-gray-700">Autoridades fiscales</td>
                      <td className="px-4 py-2 text-sm text-gray-700">Cumplimiento legal</td>
                      <td className="px-4 py-2 text-sm text-gray-700">Obligación legal</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 text-sm text-gray-700">Proveedores de marketing</td>
                      <td className="px-4 py-2 text-sm text-gray-700">Campañas publicitarias</td>
                      <td className="px-4 py-2 text-sm text-gray-700">Consentimiento</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">7. Medidas de Seguridad</h2>
              
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-800 mb-2">🔐 Técnicas</h4>
                  <ul className="list-disc list-inside text-gray-700 ml-4 text-sm">
                    <li>Cifrado SSL/TLS</li>
                    <li>Firewalls y sistemas de detección</li>
                    <li>Copias de seguridad regulares</li>
                    <li>Autenticación de dos factores</li>
                  </ul>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">👥 Administrativas</h4>
                  <ul className="list-disc list-inside text-gray-700 ml-4 text-sm">
                    <li>Capacitación del personal</li>
                    <li>Políticas de acceso restringido</li>
                    <li>Auditorías de seguridad</li>
                    <li>Acuerdos de confidencialidad</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">8. Conservación de Datos</h2>
              
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <p className="text-gray-700 mb-2">
                  <strong>Criterios de conservación:</strong>
                </p>
                <ul className="list-disc list-inside text-gray-700 ml-4">
                  <li><strong>Datos de clientes activos:</strong> Mientras mantenga su cuenta</li>
                  <li><strong>Historial de compras:</strong> 10 años (obligación fiscal)</li>
                  <li><strong>Datos de marketing:</strong> Hasta que retire su consentimiento</li>
                  <li><strong>Datos de navegación:</strong> 24 meses máximo</li>
                  <li><strong>Cookies:</strong> Según configuración del usuario</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">9. Menores de Edad</h2>
              
              <div className="bg-red-50 p-4 rounded-lg mb-4">
                <h4 className="font-semibold text-red-800 mb-2">🚫 Política de Menores</h4>
                <p className="text-gray-700">
                  Nuestros servicios están dirigidos a personas mayores de 18 años. No recopilamos 
                  intencionalmente datos personales de menores de edad. Si detectamos que hemos 
                  recopilado datos de un menor, los eliminaremos inmediatamente.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">10. Cambios a esta Política</h2>
              
              <p className="text-gray-700 mb-4">
                Nos reservamos el derecho de modificar esta política en cualquier momento. 
                Los cambios significativos serán notificados a través de:
              </p>
              
              <ul className="list-disc list-inside text-gray-700 ml-4 mb-4">
                <li>Correo electrónico a usuarios registrados</li>
                <li>Aviso prominente en nuestro sitio web</li>
                <li>Notificación en la aplicación móvil</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">11. Contacto y Quejas</h2>
              
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <h4 className="font-semibold text-gray-800 mb-2">📞 Datos de Contacto</h4>
                <p className="text-gray-700">
                  <strong>Responsable de Protección de Datos:</strong><br/>
                  Email: privacidad@garrasfelinas.com<br/>
                  Teléfono: [Número de contacto]<br/>
                  Dirección: [Dirección completa]
                </p>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg mb-4">
                <h4 className="font-semibold text-blue-800 mb-2">⚖️ Instituto Nacional de Transparencia (INAI)</h4>
                <p className="text-gray-700">
                  Si no está satisfecho con nuestra respuesta, puede presentar una queja ante el INAI:
                </p>
                <p className="text-gray-700 mt-2">
                  <strong>Sitio web:</strong> <a href="https://www.inai.org.mx" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">www.inai.org.mx</a><br/>
                  <strong>Teléfono:</strong> 800 835 4324
                </p>
              </div>
            </section>

            <div className="border-t pt-6 mt-8">
              <p className="text-sm text-gray-500">
                Esta Política de Tratamiento de Datos Personales cumple con la Ley Federal de Protección 
                de Datos Personales en Posesión de los Particulares (LFPDPPP) y su Reglamento, 
                así como con los Lineamientos del Aviso de Privacidad emitidos por el INAI.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}