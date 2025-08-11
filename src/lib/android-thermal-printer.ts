/**
 * Cliente para el plugin de impresoras térmicas Bluetooth en Android
 * Se comunica con el servidor localhost:8000
 * Compatible con el patrón del conector original de Parzibyte
 */

export interface Operacion {
  nombre: string;
  argumentos: any[];
}

export interface PrintPayload {
  impresora: string;
  serial: string;
  operaciones: Operacion[];
}

export interface PrintResponse {
  success: boolean;
  message?: string;
}

export class ConectorEscposAndroid {
  private ruta: string;
  private operaciones: Operacion[];
  private serial: string;

  // Constantes estáticas
  static URL_PLUGIN_POR_DEFECTO = "http://localhost:8000";
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

  constructor(serial: string = "", ruta: string = ConectorEscposAndroid.URL_PLUGIN_POR_DEFECTO) {
    this.ruta = ruta;
    this.operaciones = [];
    this.serial = serial;
  }

  // ===== OPERACIONES BÁSICAS =====

  Iniciar(): ConectorEscposAndroid {
    this.operaciones.push({ nombre: 'Iniciar', argumentos: [] });
    return this;
  }

  EscribirTexto(texto: string): ConectorEscposAndroid {
    this.operaciones.push({ nombre: 'EscribirTexto', argumentos: [texto] });
    return this;
  }

  Feed(lineas: number = 1): ConectorEscposAndroid {
    this.operaciones.push({ nombre: 'Feed', argumentos: [lineas] });
    return this;
  }

  Corte(lineas: number = 1): ConectorEscposAndroid {
    this.operaciones.push({ nombre: 'Corte', argumentos: [lineas] });
    return this;
  }

  CorteParcial(): ConectorEscposAndroid {
    this.operaciones.push({ nombre: 'CorteParcial', argumentos: [] });
    return this;
  }

  CorteCompletoUno(): ConectorEscposAndroid {
    this.operaciones.push({ nombre: 'CorteCompletoUno', argumentos: [] });
    return this;
  }

  CorteCompletoDos(): ConectorEscposAndroid {
    this.operaciones.push({ nombre: 'CorteCompletoDos', argumentos: [] });
    return this;
  }

  Pulso(pin: number = 48, tiempoEncendido: number = 60, tiempoApagado: number = 120): ConectorEscposAndroid {
    this.operaciones.push({ nombre: 'Pulso', argumentos: [pin, tiempoEncendido, tiempoApagado] });
    return this;
  }

  // ===== FORMATO DE TEXTO =====

  EstablecerAlineacion(alineacion: number): ConectorEscposAndroid {
    this.operaciones.push({ nombre: 'EstablecerAlineacion', argumentos: [alineacion] });
    return this;
  }

  EstablecerTamañoFuente(multiplicadorAncho: number, multiplicadorAlto: number): ConectorEscposAndroid {
    this.operaciones.push({ nombre: 'EstablecerTamañoFuente', argumentos: [multiplicadorAncho, multiplicadorAlto] });
    return this;
  }

  EstablecerEnfatizado(enfatizado: boolean): ConectorEscposAndroid {
    this.operaciones.push({ nombre: 'EstablecerEnfatizado', argumentos: [enfatizado] });
    return this;
  }

  EstablecerSubrayado(subrayado: boolean): ConectorEscposAndroid {
    this.operaciones.push({ nombre: 'EstablecerSubrayado', argumentos: [subrayado] });
    return this;
  }

  EstablecerFuente(fuente: number): ConectorEscposAndroid {
    this.operaciones.push({ nombre: 'EstablecerFuente', argumentos: [fuente] });
    return this;
  }

  EstablecerImpresionBlancoYNegroInversa(invertir: boolean): ConectorEscposAndroid {
    this.operaciones.push({ nombre: 'EstablecerImpresionBlancoYNegroInversa', argumentos: [invertir] });
    return this;
  }

  EstablecerImpresionAlReves(alReves: boolean): ConectorEscposAndroid {
    this.operaciones.push({ nombre: 'EstablecerImpresionAlReves', argumentos: [alReves] });
    return this;
  }

  EstablecerRotacionDe90Grados(rotar: boolean): ConectorEscposAndroid {
    this.operaciones.push({ nombre: 'EstablecerRotacionDe90Grados', argumentos: [rotar] });
    return this;
  }

  // ===== IMÁGENES =====

  DescargarImagenDeInternetEImprimir(url: string, tamaño: number, maximoAncho: number): ConectorEscposAndroid {
    this.operaciones.push({ nombre: 'DescargarImagenDeInternetEImprimir', argumentos: [url, tamaño, maximoAncho] });
    return this;
  }

  CargarImagenLocalEImprimir(ruta: string, tamaño: number, maximoAncho: number): ConectorEscposAndroid {
    this.operaciones.push({ nombre: 'CargarImagenLocalEImprimir', argumentos: [ruta, tamaño, maximoAncho] });
    return this;
  }

  ImprimirImagenEnBase64(imagenBase64: string, tamaño: number, maximoAncho: number): ConectorEscposAndroid {
    this.operaciones.push({ nombre: 'ImprimirImagenEnBase64', argumentos: [imagenBase64, tamaño, maximoAncho] });
    return this;
  }

  // ===== CÓDIGOS =====

  ImprimirCodigoDeBarras(tipo: string, datos: string, tamaño: number, ancho: number, alto: number): ConectorEscposAndroid {
    this.operaciones.push({ nombre: 'ImprimirCodigoDeBarras', argumentos: [tipo, datos, tamaño, ancho, alto] });
    return this;
  }

  TextoSegunPaginaDeCodigos(numeroPagina: number, pagina: string, texto: string): ConectorEscposAndroid {
    this.operaciones.push({ nombre: 'TextoSegunPaginaDeCodigos', argumentos: [numeroPagina, pagina, texto] });
    return this;
  }

  // ===== CARACTERES CHINOS =====

  HabilitarElModoDeCaracteresChinos(): ConectorEscposAndroid {
    this.operaciones.push({ nombre: 'HabilitarElModoDeCaracteresChinos', argumentos: [] });
    return this;
  }

  DeshabilitarElModoDeCaracteresChinos(): ConectorEscposAndroid {
    this.operaciones.push({ nombre: 'DeshabilitarElModoDeCaracteresChinos', argumentos: [] });
    return this;
  }

  // ===== MÉTODOS DE IMPRESIÓN =====

  /**
   * Imprimir en la impresora especificada
   */
  async imprimirEn(macImpresora: string): Promise<boolean | string> {
    const payload: PrintPayload = {
      impresora: macImpresora,
      serial: this.serial,
      operaciones: this.operaciones
    };

    try {
      const response = await fetch(`${this.ruta}/imprimir`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      const result = await response.text();
      
      if (response.ok && result === 'true') {
        return true;
      } else {
        return result;
      }
    } catch (error) {
      return `Error de conexión: ${error instanceof Error ? error.message : 'Error desconocido'}`;
    }
  }

  /**
   * Obtener lista de impresoras disponibles
   */
  static async obtenerImpresoras(ruta?: string): Promise<string[]> {
    const url = ruta || ConectorEscposAndroid.URL_PLUGIN_POR_DEFECTO;
    try {
      const response = await fetch(`${url}/impresoras`);
      const result = await response.json();
      return Array.isArray(result) ? result : [];
    } catch (error) {
      console.warn('No se pudieron obtener las impresoras:', error);
      return [];
    }
  }

  /**
   * Probar conexión con el plugin
   */
  static async testConnection(ruta?: string): Promise<boolean> {
    const url = ruta || ConectorEscposAndroid.URL_PLUGIN_POR_DEFECTO;
    try {
      const response = await fetch(`${url}/impresoras`);
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  // ===== FUNCIONES DE CONVENIENCIA =====

  /**
   * Generar un ticket básico usando method chaining
   */
  static generarTicketBasico(
    titulo: string,
    items: Array<{ nombre: string; precio: number; cantidad: number }>,
    subtotal: number,
    total: number,
    fecha: string = new Date().toLocaleString(),
    serial: string = ""
  ): ConectorEscposAndroid {
    const conector = new ConectorEscposAndroid(serial);
    
    conector
      .Iniciar()
      .EstablecerAlineacion(ConectorEscposAndroid.ALINEACION_CENTRO)
      .EstablecerTamañoFuente(2, 2)
      .EscribirTexto(`${titulo}\n`)
      .EstablecerTamañoFuente(1, 1)
      .EscribirTexto(`${fecha}\n`)
      .Feed(1)
      .EstablecerAlineacion(ConectorEscposAndroid.ALINEACION_IZQUIERDA)
      .EscribirTexto('='.repeat(32) + '\n')
      .EscribirTexto('PRODUCTO          CANT  PRECIO\n')
      .EscribirTexto('='.repeat(32) + '\n');

    // Agregar items
    items.forEach(item => {
      const nombre = item.nombre.substring(0, 16).padEnd(16);
      const cantidad = item.cantidad.toString().padStart(3);
      const precio = item.precio.toFixed(2).padStart(8);
      conector.EscribirTexto(`${nombre} ${cantidad} ${precio}\n`);
    });

    // Totales
    conector
      .EscribirTexto('='.repeat(32) + '\n')
      .EstablecerAlineacion(ConectorEscposAndroid.ALINEACION_DERECHA)
      .EscribirTexto(`SUBTOTAL: $${subtotal.toFixed(2)}\n`)
      .EscribirTexto(`TOTAL: $${total.toFixed(2)}\n`)
      .Feed(2)
      .EstablecerAlineacion(ConectorEscposAndroid.ALINEACION_CENTRO)
      .EscribirTexto('¡GRACIAS POR SU COMPRA!\n')
      .Feed(3)
      .Corte(1);

    return conector;
  }

  /**
   * Generar un ticket con logo usando method chaining
   */
  static generarTicketConLogo(
    titulo: string,
    items: Array<{ nombre: string; precio: number; cantidad: number }>,
    subtotal: number,
    total: number,
    logoUrl?: string,
    fecha: string = new Date().toLocaleString(),
    serial: string = ""
  ): ConectorEscposAndroid {
    const conector = new ConectorEscposAndroid(serial);
    
    conector.Iniciar();

    // Agregar logo si se proporciona
    if (logoUrl) {
      conector
        .DescargarImagenDeInternetEImprimir(logoUrl, ConectorEscposAndroid.TAMAÑO_IMAGEN_NORMAL, 216)
        .Feed(1);
    }

    // Resto del ticket
    conector
      .EstablecerAlineacion(ConectorEscposAndroid.ALINEACION_CENTRO)
      .EstablecerTamañoFuente(2, 2)
      .EscribirTexto(`${titulo}\n`)
      .EstablecerTamañoFuente(1, 1)
      .EscribirTexto(`${fecha}\n`)
      .Feed(1)
      .EstablecerAlineacion(ConectorEscposAndroid.ALINEACION_IZQUIERDA)
      .EscribirTexto('='.repeat(32) + '\n')
      .EscribirTexto('PRODUCTO          CANT  PRECIO\n')
      .EscribirTexto('='.repeat(32) + '\n');

    // Agregar items
    items.forEach(item => {
      const nombre = item.nombre.substring(0, 16).padEnd(16);
      const cantidad = item.cantidad.toString().padStart(3);
      const precio = item.precio.toFixed(2).padStart(8);
      conector.EscribirTexto(`${nombre} ${cantidad} ${precio}\n`);
    });

    // Totales
    conector
      .EscribirTexto('='.repeat(32) + '\n')
      .EstablecerAlineacion(ConectorEscposAndroid.ALINEACION_DERECHA)
      .EscribirTexto(`SUBTOTAL: $${subtotal.toFixed(2)}\n`)
      .EscribirTexto(`TOTAL: $${total.toFixed(2)}\n`)
      .Feed(2)
      .EstablecerAlineacion(ConectorEscposAndroid.ALINEACION_CENTRO)
      .EscribirTexto('¡GRACIAS POR SU COMPRA!\n')
      .Feed(3)
      .Corte(1);

    return conector;
  }

  /**
   * Generar un ticket de prueba
   */
  static generarTicketPrueba(serial: string = ""): ConectorEscposAndroid {
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

// Instancia global para usar en toda la aplicación
export const androidPrinter = new ConectorEscposAndroid();

// Exportar también la clase para uso directo
export { ConectorEscposAndroid as AndroidThermalPrinter };
