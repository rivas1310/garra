"use client"

import { useState } from 'react'
import { Mail, Phone, MapPin, Send, Clock, MessageCircle, CheckCircle, AlertCircle, Facebook, Instagram, Twitter, Linkedin, Youtube } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface ContactForm {
  nombre: string
  email: string
  telefono: string
  asunto: string
  mensaje: string
  tipoConsulta: string
}

export default function ContactoPage() {
  const [form, setForm] = useState<ContactForm>({
    nombre: '',
    email: '',
    telefono: '',
    asunto: '',
    mensaje: '',
    tipoConsulta: 'general'
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState<'form' | 'faq' | 'map'>('form')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simular envío
    setTimeout(() => {
      setIsSubmitting(false)
      toast.success('¡Mensaje enviado correctamente! Te responderemos pronto.')
      setForm({
        nombre: '',
        email: '',
        telefono: '',
        asunto: '',
        mensaje: '',
        tipoConsulta: 'general'
      })
    }, 2000)
  }

  const contactInfo = [
    {
      icon: <Phone className="h-6 w-6" />,
      title: 'Teléfono',
      value: '+52 (33) 1234-5678',
      subtitle: 'Lun-Vie 9:00-18:00',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      icon: <Mail className="h-6 w-6" />,
      title: 'Email',
      value: 'contacto@bazarfashion.com',
      subtitle: 'Respuesta en 24h',
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      icon: <MapPin className="h-6 w-6" />,
      title: 'Dirección',
      value: 'Zapopan Centro, Corredor Turístico',
      subtitle: 'Guadalajara, Jalisco',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      icon: <Clock className="h-6 w-6" />,
      title: 'Horarios',
      value: 'Lun-Vie: 9:00-18:00',
      subtitle: 'Sáb: 10:00-14:00',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    }
  ]

  const socialLinks = [
    { icon: <Facebook className="h-5 w-5" />, href: '#', label: 'Facebook', color: 'hover:bg-blue-600' },
    { icon: <Instagram className="h-5 w-5" />, href: '#', label: 'Instagram', color: 'hover:bg-pink-600' },
    { icon: <Twitter className="h-5 w-5" />, href: '#', label: 'Twitter', color: 'hover:bg-blue-400' },
    { icon: <Linkedin className="h-5 w-5" />, href: '#', label: 'LinkedIn', color: 'hover:bg-blue-700' },
    { icon: <Youtube className="h-5 w-5" />, href: '#', label: 'YouTube', color: 'hover:bg-red-600' }
  ]

  const faqs = [
    {
      question: '¿Cuánto tiempo tarda el envío?',
      answer: 'Los envíos estándar tardan 3-5 días hábiles. Envíos express disponibles en 24-48 horas.'
    },
    {
      question: '¿Puedo devolver un producto?',
      answer: 'Sí, aceptamos devoluciones hasta 15 días después de la compra. El producto debe estar en su estado original y tiene que ser artículo nuevo. Los artículos marcados como segunda mano no son elegibles para devolución. Ten en cuenta que el artículo que devuelves tiene que estar en óptimas condiciones, ya que si no fuera así tendrás que pagar el envío de nuevo para que te lo podamos regresar.'
    },
    {
      question: '¿Tienen tienda física?',
      answer: 'Sí, contamos con tienda física en Guadalajara, Jalisco, en Zapopan Centro en el corredor turístico. Contáctanos para mayor información.'
    },
    {
      question: '¿Ofrecen envío internacional?',
      answer: 'Por el momento solo realizamos envíos a la República Mexicana.'
    },
    {
      question: '¿Puedo recoger mi producto en la tienda física?',
      answer: 'Es posible recoger tus productos en nuestra sucursal siempre y cuando contemos con ellos en la tienda, ya que contamos con bodega. Si un artículo está en bodega se entregaría al día siguiente.'
    }
  ]

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-700 py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Contáctanos
          </h1>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            ¿Tienes preguntas, sugerencias o necesitas ayuda? Estamos aquí para ayudarte. 
            Nuestro equipo está listo para responder todas tus consultas.
          </p>
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => setActiveTab('form')}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                activeTab === 'form'
                  ? 'bg-white text-blue-600 shadow-lg'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              <MessageCircle className="h-5 w-5 inline mr-2" />
              Enviar Mensaje
            </button>
            <button
              onClick={() => setActiveTab('faq')}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                activeTab === 'faq'
                  ? 'bg-white text-blue-600 shadow-lg'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              <CheckCircle className="h-5 w-5 inline mr-2" />
              Preguntas Frecuentes
            </button>
            <button
              onClick={() => setActiveTab('map')}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                activeTab === 'map'
                  ? 'bg-white text-blue-600 shadow-lg'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              <MapPin className="h-5 w-5 inline mr-2" />
              Ubicación
            </button>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Contact Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {contactInfo.map((info, index) => (
              <div key={index} className={`${info.bgColor} p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow`}>
                <div className={`${info.color} mb-4`}>
                  {info.icon}
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{info.title}</h3>
                <p className="text-gray-700 font-medium">{info.value}</p>
                <p className="text-sm text-gray-500 mt-1">{info.subtitle}</p>
              </div>
            ))}
          </div>

          {/* Tab Content */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            {/* Form Tab */}
            {activeTab === 'form' && (
              <div className="grid lg:grid-cols-2 gap-0">
                {/* Contact Form */}
                <div className="p-8 lg:p-12">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Envíanos un mensaje</h2>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nombre completo *
                        </label>
                        <input
                          type="text"
                          name="nombre"
                          value={form.nombre}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                          placeholder="Tu nombre completo"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email *
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={form.email}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                          placeholder="tu@email.com"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Teléfono
                        </label>
                        <input
                          type="tel"
                          name="telefono"
                          value={form.telefono}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                          placeholder="+52 (33) 1234-5678"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Tipo de consulta
                        </label>
                        <select
                          name="tipoConsulta"
                          value={form.tipoConsulta}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        >
                          <option value="general">Consulta general</option>
                          <option value="producto">Información de producto</option>
                          <option value="envio">Envíos y devoluciones</option>
                          <option value="tecnico">Soporte técnico</option>
                          <option value="comercial">Aspectos comerciales</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Asunto *
                      </label>
                      <input
                        type="text"
                        name="asunto"
                        value={form.asunto}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        placeholder="¿En qué podemos ayudarte?"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Mensaje *
                      </label>
                      <textarea
                        name="mensaje"
                        value={form.mensaje}
                        onChange={handleChange}
                        required
                        rows={5}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
                        placeholder="Cuéntanos más detalles sobre tu consulta..."
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Enviando...
                        </>
                      ) : (
                        <>
                          <Send className="h-5 w-5" />
                          Enviar mensaje
                        </>
                      )}
                    </button>
                  </form>
                </div>

                {/* Contact Info Sidebar */}
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-8 lg:p-12">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Información de contacto</h3>
                  
                  <div className="space-y-6 mb-8">
                    <div className="flex items-start space-x-4">
                      <div className="bg-blue-100 p-3 rounded-lg">
                        <Phone className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Línea directa</h4>
                        <p className="text-gray-600">+52 (33) 1234-5678</p>
                        <p className="text-sm text-gray-500">Lun-Vie 9:00-18:00</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <div className="bg-green-100 p-3 rounded-lg">
                        <Mail className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Email</h4>
                        <p className="text-gray-600">contacto@bazarfashion.com</p>
                        <p className="text-sm text-gray-500">Respuesta en 24h</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <div className="bg-purple-100 p-3 rounded-lg">
                        <MapPin className="h-6 w-6 text-purple-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Oficina</h4>
                        <p className="text-gray-600">Zapopan Centro, Corredor Turístico</p>
                        <p className="text-sm text-gray-500">Guadalajara, Jalisco</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-4">Síguenos en redes sociales</h4>
                    <div className="flex space-x-3">
                      {socialLinks.map((social, index) => (
                        <a
                          key={index}
                          href={social.href}
                          className={`p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-all ${social.color} text-gray-600 hover:text-white`}
                          aria-label={social.label}
                        >
                          {social.icon}
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* FAQ Tab */}
            {activeTab === 'faq' && (
              <div className="p-8 lg:p-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-8">Preguntas Frecuentes</h2>
                <div className="space-y-6">
                  {faqs.map((faq, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-6 hover:bg-gray-100 transition-colors">
                      <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                        <AlertCircle className="h-5 w-5 text-blue-600 mr-2" />
                        {faq.question}
                      </h3>
                      <p className="text-gray-600">{faq.answer}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Map Tab */}
            {activeTab === 'map' && (
              <div className="p-8 lg:p-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-8">Nuestra ubicación</h2>
                <div className="bg-gray-200 rounded-lg h-96 flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 font-medium">Mapa interactivo</p>
                    <p className="text-sm text-gray-500">Zapopan Centro, Corredor Turístico, Guadalajara, Jalisco</p>
                  </div>
                </div>
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-gray-900">Horarios de atención</h4>
                    <p className="text-gray-600">Lun-Vie: 9:00-18:00</p>
                    <p className="text-gray-600">Sáb: 10:00-14:00</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <h4 className="font-semibold text-gray-900">Estacionamiento</h4>
                    <p className="text-gray-600">Gratuito para clientes</p>
                    <p className="text-gray-600">Acceso por Corredor Turístico</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <h4 className="font-semibold text-gray-900">Transporte público</h4>
                    <p className="text-gray-600">Centro de Zapopan</p>
                    <p className="text-gray-600">Corredor Turístico</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  )
} 