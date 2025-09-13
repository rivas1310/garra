import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Términos de Servicio - Garras Felinas',
  description: 'Términos y condiciones de uso del sitio web y servicios de Garras Felinas',
}

export default function TerminosServicio() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Términos de Servicio</h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 mb-6">
              <strong>Última actualización:</strong> {new Date().toLocaleDateString('es-MX')}
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">1. Aceptación de los Términos</h2>
              <p className="text-gray-700 mb-4">
                Al acceder y utilizar el sitio web de <strong>Garras Felinas</strong>, usted acepta estar sujeto 
                a estos Términos de Servicio y a todas las leyes y regulaciones aplicables. Si no está de 
                acuerdo con alguno de estos términos, no debe utilizar este sitio web.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">2. Descripción del Servicio</h2>
              <p className="text-gray-700 mb-4">
                <strong>Garras Felinas</strong> es una plataforma de comercio electrónico especializada en la 
                venta de prendas de vestir, calzado y accesorios de segunda mano (preloved, gently used, 
                Like New, vintage, etc.), así como piezas únicas recuperadas o reutilizadas.
              </p>
              
              <div className="bg-amber-50 p-4 rounded-lg mb-4">
                <h4 className="font-semibold text-amber-800 mb-2">⚠️ Importante:</h4>
                <p className="text-gray-700">
                  Todos nuestros productos son de segunda mano. No vendemos artículos nuevos salvo que 
                  se indique expresamente lo contrario.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">3. Registro de Usuario</h2>
              <h3 className="text-xl font-medium text-gray-800 mb-3">3.1 Creación de Cuenta</h3>
              <ul className="list-disc list-inside text-gray-700 mb-4 ml-4">
                <li>Debe proporcionar información veraz y actualizada</li>
                <li>Es responsable de mantener la confidencialidad de su contraseña</li>
                <li>Debe notificar inmediatamente cualquier uso no autorizado de su cuenta</li>
                <li>Debe ser mayor de 18 años o contar con autorización de un tutor legal</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-800 mb-3">3.2 Suspensión de Cuenta</h3>
              <p className="text-gray-700 mb-4">
                Nos reservamos el derecho de suspender o cancelar cuentas que violen estos términos.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">4. Productos y Precios</h2>
              
              <h3 className="text-xl font-medium text-gray-800 mb-3">4.1 Descripción de Productos</h3>
              <ul className="list-disc list-inside text-gray-700 mb-4 ml-4">
                <li>Todas las prendas son inspeccionadas y descritas con precisión</li>
                <li>Las fotografías son reales del producto que recibirá</li>
                <li>El estado de cada artículo se indica claramente</li>
                <li>Las medidas se proporcionan cuando están disponibles</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-800 mb-3">4.2 Precios y Disponibilidad</h3>
              <ul className="list-disc list-inside text-gray-700 mb-4 ml-4">
                <li>Los precios están sujetos a cambios sin previo aviso</li>
                <li>Los productos están sujetos a disponibilidad</li>
                <li>Nos reservamos el derecho de limitar cantidades</li>
                <li>Los precios incluyen IVA cuando aplique</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">5. Proceso de Compra</h2>
              
              <h3 className="text-xl font-medium text-gray-800 mb-3">5.1 Pedidos</h3>
              <ul className="list-disc list-inside text-gray-700 mb-4 ml-4">
                <li>Al realizar un pedido, hace una oferta de compra</li>
                <li>Confirmamos la aceptación mediante correo electrónico</li>
                <li>Nos reservamos el derecho de rechazar pedidos</li>
                <li>Los pedidos están sujetos a verificación de pago</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-800 mb-3">5.2 Métodos de Pago</h3>
              <p className="text-gray-700 mb-4">Aceptamos los siguientes métodos de pago:</p>
              <ul className="list-disc list-inside text-gray-700 mb-4 ml-4">
                <li>Tarjetas de crédito y débito (Visa, MasterCard, American Express)</li>
                <li>Transferencias bancarias</li>
                <li>Pagos en efectivo (solo en ventas físicas)</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">6. Envíos y Entregas</h2>
              
              <h3 className="text-xl font-medium text-gray-800 mb-3">6.1 Áreas de Cobertura</h3>
              <p className="text-gray-700 mb-4">
                Realizamos envíos a toda la República Mexicana a través de nuestros socios logísticos.
              </p>

              <h3 className="text-xl font-medium text-gray-800 mb-3">6.2 Tiempos de Entrega</h3>
              <ul className="list-disc list-inside text-gray-700 mb-4 ml-4">
                <li>Los tiempos son estimados y pueden variar</li>
                <li>No somos responsables por retrasos de terceros</li>
                <li>Se proporcionará número de seguimiento cuando esté disponible</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-800 mb-3">6.3 Costos de Envío</h3>
              <p className="text-gray-700 mb-4">
                Los costos de envío se calculan según destino, peso y dimensiones del paquete.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">7. Política de Devoluciones</h2>
              
              <div className="bg-red-50 p-4 rounded-lg mb-4">
                <h4 className="font-semibold text-red-800 mb-2">🚫 Política Estricta</h4>
                <p className="text-gray-700">
                  <strong>NO se aceptan cambios ni devoluciones</strong> en ninguna de las prendas, 
                  salvo en caso de defecto grave no informado previamente o error en el envío.
                </p>
              </div>

              <h3 className="text-xl font-medium text-gray-800 mb-3">7.1 Excepciones</h3>
              <ul className="list-disc list-inside text-gray-700 mb-4 ml-4">
                <li>Producto significativamente diferente a la descripción</li>
                <li>Defecto grave no mencionado en la descripción</li>
                <li>Error en el envío (producto incorrecto)</li>
                <li>Daño durante el transporte</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-800 mb-3">7.2 Proceso de Reclamación</h3>
              <p className="text-gray-700 mb-4">
                Las reclamaciones deben realizarse dentro de las 48 horas posteriores a la recepción 
                del producto, acompañadas de fotografías que evidencien el problema.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">8. Propiedad Intelectual</h2>
              <p className="text-gray-700 mb-4">
                Todo el contenido del sitio web, incluyendo textos, imágenes, logotipos, y diseño, 
                está protegido por derechos de autor y otras leyes de propiedad intelectual.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">9. Limitación de Responsabilidad</h2>
              <p className="text-gray-700 mb-4">
                <strong>Garras Felinas</strong> no será responsable por daños indirectos, incidentales, 
                especiales o consecuentes que resulten del uso o la imposibilidad de usar nuestros servicios.
              </p>
              
              <div className="bg-blue-50 p-4 rounded-lg mb-4">
                <h4 className="font-semibold text-blue-800 mb-2">📋 Limitaciones Específicas</h4>
                <ul className="list-disc list-inside text-gray-700 ml-4">
                  <li>Variaciones naturales en productos de segunda mano</li>
                  <li>Diferencias de color debido a pantallas o iluminación</li>
                  <li>Retrasos en entregas por causas de fuerza mayor</li>
                  <li>Problemas técnicos temporales del sitio web</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">10. Uso Aceptable</h2>
              <p className="text-gray-700 mb-4">Al utilizar nuestro sitio web, usted se compromete a:</p>
              <ul className="list-disc list-inside text-gray-700 mb-4 ml-4">
                <li>No utilizar el sitio para actividades ilegales</li>
                <li>No intentar acceder a áreas restringidas</li>
                <li>No interferir con el funcionamiento del sitio</li>
                <li>Respetar los derechos de otros usuarios</li>
                <li>Proporcionar información veraz</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">11. Modificaciones</h2>
              <p className="text-gray-700 mb-4">
                Nos reservamos el derecho de modificar estos términos en cualquier momento. 
                Los cambios serán efectivos inmediatamente después de su publicación en el sitio web.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">12. Ley Aplicable y Jurisdicción</h2>
              <p className="text-gray-700 mb-4">
                Estos términos se rigen por las leyes de México. Cualquier disputa será resuelta 
                en los tribunales competentes de [Ciudad, Estado].
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">13. Contacto</h2>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700">
                  Para preguntas sobre estos Términos de Servicio, puede contactarnos:
                </p>
                <p className="text-gray-700 mt-2">
                  <strong>Email:</strong> legal@garrasfelinas.com<br/>
                  <strong>Teléfono:</strong> [Número de contacto]<br/>
                  <strong>Dirección:</strong> [Dirección física completa]
                </p>
              </div>
            </section>

            <div className="border-t pt-6 mt-8">
              <p className="text-sm text-gray-500">
                Estos Términos de Servicio cumplen con la Ley Federal de Protección al Consumidor 
                de México y demás legislación aplicable.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}