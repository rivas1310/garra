/**
 * Conector ESC/POS para Android - Cliente JavaScript
 * Compatible con el plugin de impresoras térmicas Bluetooth para Android
 * Se comunica con el servidor localhost:8000 a través del endpoint /api/android-printer
 * 
 * Basado en la documentación de Parzibyte
 * https://parzibyte.me/blog/
 */

class ConectorEscposAndroid {
  constructor(serial = "", ruta = "/api/android-printer", phoneIp = null) {
    this.ruta = ruta;
    this.operaciones = [];
    this.serial = serial;
    this.phoneIp = phoneIp;
  }

  // Método para establecer la IP del teléfono
  setPhoneIp(phoneIp) {
    this.phoneIp = phoneIp;
    return this;
  }

  // ===== CONSTANTES ESTÁTICAS =====
  static URL_PLUGIN_POR_DEFECTO = "/api/android-printer";
  static TAMAÑO_IMAGEN_NORMAL = 0;
  static TAMAÑO_IMAGEN_DOBLE_ANCHO = 1;
  static TAMAÑO_IMAGEN_DOBLE_ALTO = 2;
  static TAMAÑO_IMAGEN_DOBLE_ANCHO_Y_ALTO = 3;
  static ALINEACION_IZQUIERDA = 0;
  static ALINEACION_CENTRO = 1;
  static ALINEACION_DERECHA = 2;
  static RECUPERACION_QR_BAJA = 0;
  static RECUPERACION_QR_MEDIA = 1;
  static RECUPERACION_QR_ALTA = 2;
  static RECUPERACION_QR_MEJOR = 3;

  // ===== OPERACIONES BÁSICAS =====

  Iniciar() {
    this.operaciones.push({ nombre: 'Iniciar', argumentos: [] });
    return this;
  }

  EscribirTexto(texto) {
    this.operaciones.push({ nombre: 'EscribirTexto', argumentos: [texto] });
    return this;
  }

  Feed(lineas = 1) {
    this.operaciones.push({ nombre: 'Feed', argumentos: [lineas] });
    return this;
  }

  Corte(lineas = 1) {
    this.operaciones.push({ nombre: 'Corte', argumentos: [lineas] });
    return this;
  }

  CorteParcial() {
    this.operaciones.push({ nombre: 'CorteParcial', argumentos: [] });
    return this;
  }

  Pulso(pin = 48, tiempoEncendido = 60, tiempoApagado = 120) {
    this.operaciones.push({ nombre: 'Pulso', argumentos: [pin, tiempoEncendido, tiempoApagado] });
    return this;
  }

  // ===== FORMATO DE TEXTO =====

  EstablecerAlineacion(alineacion) {
    this.operaciones.push({ nombre: 'EstablecerAlineacion', argumentos: [alineacion] });
    return this;
  }

  EstablecerTamañoFuente(multiplicadorAncho, multiplicadorAlto) {
    this.operaciones.push({ nombre: 'EstablecerTamañoFuente', argumentos: [multiplicadorAncho, multiplicadorAlto] });
    return this;
  }

  EstablecerEnfatizado(enfatizado) {
    this.operaciones.push({ nombre: 'EstablecerEnfatizado', argumentos: [enfatizado] });
    return this;
  }

  EstablecerSubrayado(subrayado) {
    this.operaciones.push({ nombre: 'EstablecerSubrayado', argumentos: [subrayado] });
    return this;
  }

  EstablecerFuente(fuente) {
    this.operaciones.push({ nombre: 'EstablecerFuente', argumentos: [fuente] });
    return this;
  }

  EstablecerImpresionBlancoYNegroInversa(invertir) {
    this.operaciones.push({ nombre: 'EstablecerImpresionBlancoYNegroInversa', argumentos: [invertir] });
    return this;
  }

  EstablecerModoDeImpresionAlReves(alReves) {
    this.operaciones.push({ nombre: 'EstablecerModoDeImpresionAlReves', argumentos: [alReves] });
    return this;
  }

  EstablecerRotacionDe90Grados(rotar) {
    this.operaciones.push({ nombre: 'EstablecerRotacionDe90Grados', argumentos: [rotar] });
    return this;
  }

  // ===== IMÁGENES =====

  DescargarImagenDeInternetEImprimir(url, tamaño, maximoAncho) {
    this.operaciones.push({ nombre: 'DescargarImagenDeInternetEImprimir', argumentos: [url, tamaño, maximoAncho] });
    return this;
  }

  CargarImagenLocalEImprimir(ruta, tamaño, maximoAncho) {
    this.operaciones.push({ nombre: 'CargarImagenLocalEImprimir', argumentos: [ruta, tamaño, maximoAncho] });
    return this;
  }

  ImprimirImagenEnBase64(imagenBase64, tamaño, maximoAncho) {
    this.operaciones.push({ nombre: 'ImprimirImagenEnBase64', argumentos: [imagenBase64, tamaño, maximoAncho] });
    return this;
  }

  // ===== CÓDIGOS =====

  ImprimirCodigoDeBarras(tipo, datos, tamaño, ancho, alto) {
    this.operaciones.push({ nombre: 'ImprimirCodigoDeBarras', argumentos: [tipo, datos, tamaño, ancho, alto] });
    return this;
  }

  TextoSegunPaginaDeCodigos(numeroPagina, pagina, texto) {
    this.operaciones.push({ nombre: 'TextoSegunPaginaDeCodigos', argumentos: [numeroPagina, pagina, texto] });
    return this;
  }

  // ===== CARACTERES ESPECIALES =====

  HabilitarElModoDeCaracteresChinos() {
    this.operaciones.push({ nombre: 'HabilitarElModoDeCaracteresChinos', argumentos: [] });
    return this;
  }

  DeshabilitarElModoDeCaracteresChinos() {
    this.operaciones.push({ nombre: 'DeshabilitarElModoDeCaracteresChinos', argumentos: [] });
    return this;
  }

  // ===== MÉTODOS DE IMPRESIÓN =====

  /**
   * Imprimir en la impresora especificada
   * @param {string} macImpresora - Dirección MAC de la impresora
   * @returns {Promise<boolean|string>} - true si es exitoso, string con error si falla
   */
  async imprimirEn(macImpresora) {
    const payload = {
      impresora: macImpresora,
      serial: this.serial,
      operaciones: this.operaciones
    };

    try {
      // Construir URL con phoneIp si está disponible
      const url = this.phoneIp ? `${this.ruta}?phoneIp=${encodeURIComponent(this.phoneIp)}` : this.ruta;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      
      if (response.ok && result.success) {
        return true;
      } else {
        return result.message || result.error || 'Error desconocido';
      }
    } catch (error) {
      return `Error de conexión: ${error.message || 'Error desconocido'}`;
    }
  }

  // ===== MÉTODOS ESTÁTICOS =====

  /**
   * Obtener lista de impresoras disponibles
   * @param {string} ruta - Ruta del endpoint (opcional)
   * @returns {Promise<string[]>} - Array de direcciones MAC de impresoras
   */
  static async obtenerImpresoras(ruta, phoneIp) {
    const baseUrl = ruta || ConectorEscposAndroid.URL_PLUGIN_POR_DEFECTO;
    try {
      const params = new URLSearchParams({ endpoint: 'impresoras' });
      if (phoneIp) {
        params.append('phoneIp', phoneIp);
      }
      
      const response = await fetch(`${baseUrl}?${params.toString()}`);
      const result = await response.json();
      return Array.isArray(result) ? result : [];
    } catch (error) {
      console.warn('No se pudieron obtener las impresoras:', error);
      return [];
    }
  }

  /**
   * Probar conexión con el plugin
   * @param {string} ruta - Ruta del endpoint (opcional)
   * @returns {Promise<boolean>} - true si la conexión es exitosa
   */
  static async testConnection(ruta, phoneIp) {
    const baseUrl = ruta || ConectorEscposAndroid.URL_PLUGIN_POR_DEFECTO;
    try {
      const params = new URLSearchParams({ endpoint: 'impresoras' });
      if (phoneIp) {
        params.append('phoneIp', phoneIp);
      }
      
      const response = await fetch(`${baseUrl}?${params.toString()}`);
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  /**
   * Generar un ticket básico usando method chaining
   * @param {string} titulo - Título del ticket
   * @param {Array} items - Array de items {nombre, precio, cantidad}
   * @param {number} subtotal - Subtotal
   * @param {number} total - Total
   * @param {string} fecha - Fecha (opcional)
   * @param {string} serial - Serial/licencia (opcional)
   * @returns {ConectorEscposAndroid} - Instancia del conector
   */
  static generarTicketBasico(titulo, items, subtotal, total, fecha, serial = "") {
    fecha = fecha || new Date().toLocaleString();
    const conector = new ConectorEscposAndroid(serial);
    
    conector
      .Iniciar()
      .EstablecerAlineacion(ConectorEscposAndroid.ALINEACION_CENTRO)
      .EstablecerTamañoFuente(2, 2)
      .EscribirTexto(titulo + '\n')
      .EstablecerTamañoFuente(1, 1)
      .EscribirTexto(fecha + '\n')
      .Feed(1)
      .EstablecerAlineacion(ConectorEscposAndroid.ALINEACION_IZQUIERDA)
      .EscribirTexto('____________________\n');

    // Agregar items
    items.forEach(item => {
      conector.EscribirTexto(`${item.nombre} x${item.cantidad}\n`);
      conector.EstablecerAlineacion(ConectorEscposAndroid.ALINEACION_DERECHA);
      conector.EscribirTexto(`$${item.precio.toFixed(2)}\n`);
      conector.EstablecerAlineacion(ConectorEscposAndroid.ALINEACION_IZQUIERDA);
    });

    conector
      .EscribirTexto('____________________\n')
      .EstablecerAlineacion(ConectorEscposAndroid.ALINEACION_DERECHA)
      .EscribirTexto(`Subtotal: $${subtotal.toFixed(2)}\n`)
      .EstablecerEnfatizado(true)
      .EscribirTexto(`TOTAL: $${total.toFixed(2)}\n`)
      .EstablecerEnfatizado(false)
      .EscribirTexto('____________________\n')
      .EstablecerAlineacion(ConectorEscposAndroid.ALINEACION_CENTRO)
      .Feed(1)
      .EscribirTexto('¡Gracias por su compra!\n')
      .Feed(2)
      .Corte(1);

    return conector;
  }

  /**
   * Generar un ticket de prueba
   * @param {string} serial - Serial/licencia (opcional)
   * @returns {ConectorEscposAndroid} - Instancia del conector
   */
  static generarTicketPrueba(serial = "") {
    const conector = new ConectorEscposAndroid(serial);
    
    conector
      .Iniciar()
      .EstablecerAlineacion(ConectorEscposAndroid.ALINEACION_CENTRO)
      .EstablecerTamañoFuente(2, 2)
      .EscribirTexto('PRUEBA DE IMPRESIÓN\n')
      .EstablecerTamañoFuente(1, 1)
      .EscribirTexto('Plugin Android funcionando\n')
      .EscribirTexto(`${new Date().toLocaleString()}\n`)
      .Feed(2)
      .Corte(1);

    return conector;
  }
}

// Hacer disponible globalmente si se usa en el navegador
if (typeof window !== 'undefined') {
  window.ConectorEscposAndroid = ConectorEscposAndroid;
}

// Exportar para uso en módulos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ConectorEscposAndroid;
}