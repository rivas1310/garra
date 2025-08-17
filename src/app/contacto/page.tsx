"use client"

import { useState, useEffect } from 'react'
import { Mail, Phone, MapPin, Send, Clock, MessageCircle, CheckCircle, AlertCircle, Facebook, Instagram, Twitter, Linkedin, Youtube } from 'lucide-react'
import { toast } from 'react-hot-toast'
import Script from 'next/script'

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
      value: '+52 33 5193 5392',
      subtitle: 'Lun-Vie 9:00-18:00',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      icon: <Mail className="h-6 w-6" />,
      title: 'Email',
      value: 'info@garrasfelinas.com',
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
      value: 'Mie-Vie: 15:00-21:00',
      subtitle: 'Sáb: 15:00-21:00',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    }
  ]

  const socialLinks = [
    { icon: <Facebook className="h-5 w-5" />, href: 'https://www.facebook.com/share/1FkXZzF2SF/', label: 'Facebook', color: 'hover:bg-blue-600' },
    { icon: <Instagram className="h-5 w-5" />, href: 'https://www.instagram.com/garrasfelinas?utm_source=qr&igsh=MTB6czRyN3NucGg3ZA==', label: 'Instagram', color: 'hover:bg-pink-600' },
    { 
      icon: (
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
        </svg>
      ), 
      href: 'https://www.tiktok.com/@garrasfelina', 
      label: 'TikTok', 
      color: 'hover:bg-black' 
    },
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
                        <p className="text-gray-600">+52 33 5193 5392</p>
                        <p className="text-sm text-gray-500">Mie-Vie 15:00-21:00</p>
                        <p className="text-sm text-gray-500">Sab-Dom 15:00-21:00</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <div className="bg-green-100 p-3 rounded-lg">
                        <Mail className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Email</h4>
                        <p className="text-gray-600">info@garrasfelinas.com</p>
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
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {social.icon}
                        </a>
                      ))}
                    </div>
                    
                    <div className="mt-6">
                      <h4 className="font-semibold text-gray-900 mb-4">Nuestro TikTok</h4>
                      <div className="tiktok-embed-container">
                        <blockquote className="tiktok-embed" cite="https://www.tiktok.com/@garrasfelina" data-unique-id="garrasfelina" data-embed-type="creator" style={{maxWidth: '780px', minWidth: '288px'}}>
               <section>
                 <a target="_blank" href="https://www.tiktok.com/@garrasfelina?refer=creator_embed" rel="noopener noreferrer">@garrasfelina</a>
               </section>
             </blockquote>
                        <Script src="https://www.tiktok.com/embed.js" strategy="lazyOnload" />
                      </div>
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