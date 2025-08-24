/**
 * Generador de comandos TSPL (TSC Printer Language)
 * Para impresoras de etiquetas térmicas - VERSIÓN CORREGIDA
 */

export interface TSPLLabelData {
  name: string
  barcode: string
  price: number
  sku?: string
}

export interface TSPLConfig {
  labelWidth: number  // en mm
  labelHeight: number // en mm
  dpi: number        // 203 o 300 DPI
  gap: number        // espacio entre etiquetas en mm
  orientation: 'portrait' | 'landscape'
  // Configuraciones de offset para centrado
  offsetX?: number      // offset horizontal en mm (positivo = derecha, negativo = izquierda)
  offsetY?: number      // offset vertical en mm (positivo = abajo, negativo = arriba)
  // Márgenes no imprimibles
  marginLeft?: number   // margen izquierdo no imprimible en mm
  marginRight?: number  // margen derecho no imprimible en mm
  marginTop?: number    // margen superior no imprimible en mm
  marginBottom?: number // margen inferior no imprimible en mm
}

export interface TSPLTextConfig {
  x: number
  y: number
  font: string
  rotation: 0 | 90 | 180 | 270
  xMultiplication: number
  yMultiplication: number
  content: string
}

export interface TSPLBarcodeConfig {
  x: number
  y: number
  codeType: string
  height: number
  humanReadable: 0 | 1 | 2 | 3 // 0=no visible, 1=izquierda, 2=centro, 3=derecha
  rotation: 0 | 90 | 180 | 270
  narrow: number
  wide: number
  content: string
}

/**
 * Configuraciones predefinidas para diferentes tamaños de etiquetas
 */
export const TSPL_LABEL_CONFIGS: Record<string, TSPLConfig> = {
  '50x20': {
    labelWidth: 50,
    labelHeight: 20,
    dpi: 203,
    gap: 2,
    orientation: 'portrait',
    // Offsets corregidos para centrado óptimo en etiquetas 50x20mm
    offsetX: 0,  // Sin offset horizontal para centrado natural
    offsetY: 0,
    // Márgenes no imprimibles reducidos para mejor aprovechamiento
    marginLeft: 0.5,
    marginRight: 0.5,
    marginTop: 0.5,
    marginBottom: 0.5
  },
  '51x25': {
    labelWidth: 51,
    labelHeight: 25,
    dpi: 203,
    gap: 2,
    orientation: 'portrait',
    // Offsets corregidos para centrado óptimo en etiquetas 51x25mm
    offsetX: 0,  // Eliminamos el offset para usar coordenadas naturales
    offsetY: 0,
    // Márgenes no imprimibles reducidos para mejor aprovechamiento
    marginLeft: 0.5,
    marginRight: 0.5,
    marginTop: 0.5,
    marginBottom: 0.5
  },
  '30x21': {
    labelWidth: 30,
    labelHeight: 21,
    dpi: 203,
    gap: 2,
    orientation: 'portrait',
    // Offsets corregidos para centrado óptimo en etiquetas 30x21mm
    offsetX: 0,  // Sin offset horizontal para centrado natural
    offsetY: 0,
    // Márgenes no imprimibles reducidos para mejor aprovechamiento
    marginLeft: 0.3,
    marginRight: 0.3,
    marginTop: 0.5,
    marginBottom: 0.5
  },
  '10x21': {
    labelWidth: 10,
    labelHeight: 21,
    dpi: 203,
    gap: 2,
    orientation: 'portrait',
    // Offsets corregidos para centrado óptimo en etiquetas 10x21mm
    offsetX: 0,  // Sin offset horizontal para centrado natural
    offsetY: 0,
    // Márgenes no imprimibles reducidos para mejor aprovechamiento
    marginLeft: 0.2,
    marginRight: 0.2,
    marginTop: 0.3,
    marginBottom: 0.3
  },
  '2x1inch': {
    labelWidth: 50.8,  // 2 pulgadas = 50.8mm
    labelHeight: 25.4, // 1 pulgada = 25.4mm
    dpi: 203,
    gap: 2,
    orientation: 'landscape', // Orientación horizontal para aprovechar mejor el espacio
    // Offsets ajustados para corregir la posición
    offsetX: 0,  // Sin offset para usar las coordenadas exactas
    offsetY: 0,
    // Márgenes optimizados para etiquetas de 2x1 pulgadas
    marginLeft: 0,   // Sin margen izquierdo para aprovechar todo el espacio
    marginRight: 1,  // Margen derecho para evitar cortes
    marginTop: 0.5,  // Margen superior reducido
    marginBottom: 0.5 // Margen inferior reducido
  }
}

/**
 * Clase principal para generar comandos TSPL
 */
export class TSPLGenerator {
  private config: TSPLConfig
  private commands: string[] = []

  constructor(config: TSPLConfig) {
    this.config = config
  }
  
  // La función mmToDots se define más abajo con documentación completa
  
  // ---- Cálculo de ancho en DOTS ---- 
  private code128EncodedSymbolsCount(data: string): number { 
    // Aproximación: si es numérico y longitud par → Set C (cada par = 1 símbolo) 
    if (/^\d+$/.test(data) && data.length % 2 === 0) return data.length / 2; 
    return data.length; // Set A/B aproximado: 1 símbolo por carácter 
  } 
  
  private barcodeWidthDotsByDots(type: string, data: string, narrowDots: number): number { 
    const t = type.toUpperCase(); 
    // Zona de silencio típica: ~10 módulos por lado 
    const QUIET = 20; 
  
    if (t === '128' || t === 'CODE128' || t === 'CODE 128') { 
      const symbols = this.code128EncodedSymbolsCount(data); 
      // start(11) + data(11*symbols) + check(11) + stop(13) + quiet(20) 
      const modules = 11 * (symbols + 2) + 13 + QUIET; 
      return modules * narrowDots; 
    } 
  
    if (t === 'EAN13' || t === 'EAN-13') { 
      // 95 módulos + quiet (~18) 
      const modules = 95 + QUIET; 
      return modules * narrowDots; 
    } 
  
    if (t === 'EAN8' || t === 'EAN-8') { 
      const modules = 67 + QUIET; 
      return modules * narrowDots; 
    } 
  
    if (t === 'UPCA' || t === 'UPC-A') { 
      const modules = 95 + QUIET; 
      return modules * narrowDots; 
    } 
  
    // genérico 
    return Math.max(100, 11 * data.length * narrowDots); 
  } 
  
  public centeredXBarcodeDots(type: string, data: string, narrowDots: number): number { 
    const labelW = this.mmToDots(this.config.labelWidth); 
    const bw = this.barcodeWidthDotsByDots(type, data, narrowDots); 
    return Math.max(0, Math.round((labelW - bw) / 2)); 
  }

  /**
   * Convierte milímetros a puntos según el DPI
   * Según la documentación TSPL:
   * 203 DPI → 8 puntos por mm
   * 300 DPI → 11.8 puntos por mm
   */
  private mmToDots(mm: number): number {
    return Math.round(mm * (this.config.dpi === 203 ? 8 : 11.811))
  }

  /**
   * Método público para convertir milímetros a puntos
   */
  convertMmToDots(mm: number): number {
    return this.mmToDots(mm);
  }
  
  /**
   * Establece la dirección de impresión
   * @param direction 0=landscape, 1=portrait
   */
  setDirection(direction: number): void {
    this.commands.push(`DIRECTION ${direction}`);
  }

  /**
   * Convierte puntos a milímetros
   */
  dotsToMm(dots: number): number {
    return dots / (this.config.dpi === 203 ? 8 : 11.811)
  }

  // Mantener compatibilidad con código existente
  private mmToPoints(mm: number): number {
    return this.mmToDots(mm)
  }

  /**
   * Calcula la posición X para centrar texto (devuelve en dots) considerando márgenes
   */
  getCenteredXDotsForText(content: string, font: string, xMul: number): number {
    const W = this.mmToDots(this.config.labelWidth)
    const marginLeftDots = this.mmToDots(this.config.marginLeft || 0)
    const marginRightDots = this.mmToDots(this.config.marginRight || 0)
    const w = this.textWidthDots(content, font, xMul)
    
    // Calcular posición centrada considerando márgenes
    const centeredX = Math.round((W - w) / 2)
    
    // Asegurar que no se salga de los márgenes
    return Math.max(marginLeftDots, Math.min(centeredX, W - marginRightDots - w))
  }

  /**
   * Calcula la posición X para centrar texto (devuelve en mm para compatibilidad)
   */
  getCenteredX(textLength: number, fontSize: number = 1): number {
    // Mantener compatibilidad con código existente
    const content = 'A'.repeat(textLength) // texto de ejemplo
    const xDots = this.getCenteredXDotsForText(content, fontSize.toString(), 1)
    return this.dotsToMm(xDots)
  }

  /**
   * Convierte coordenadas X de dots a mm
   */
  getCenteredXmmFromDots(xDots: number): number {
    return this.dotsToMm(xDots)
  }

  /**
   * Calcula la posición Y considerando márgenes verticales
   */
  getAdjustedY(y: number): number {
    const marginTop = this.config.marginTop || 0
    return Math.max(marginTop, y + marginTop)
  }

  /**
   * Obtiene el área imprimible considerando todos los márgenes
   */
  getPrintableArea(): { width: number; height: number; startX: number; startY: number } {
    const marginLeft = this.config.marginLeft || 0
    const marginRight = this.config.marginRight || 0
    const marginTop = this.config.marginTop || 0
    const marginBottom = this.config.marginBottom || 0
    
    return {
      width: this.config.labelWidth - marginLeft - marginRight,
      height: this.config.labelHeight - marginTop - marginBottom,
      startX: marginLeft,
      startY: marginTop
    }
  }

  /**
   * Calcula la posición X para centrar código de barras (devuelve en dots) considerando márgenes
   */
  getCenteredXDotsForBarcode(type: string, data: string, narrow: number): number {
    const W = this.mmToDots(this.config.labelWidth)
    const marginLeftDots = this.mmToDots(this.config.marginLeft || 0)
    const marginRightDots = this.mmToDots(this.config.marginRight || 0)
    const w = this.barcodeWidthDots(type, data, this.mmToDots(narrow)) // narrow viene en mm → pásalo a dots
    
    // Calcular posición centrada considerando márgenes
    const centeredX = Math.round((W - w) / 2)
    
    // Asegurar que no se salga de los márgenes
    return Math.max(marginLeftDots, Math.min(centeredX, W - marginRightDots - w))
  }

  /**
   * Calcula la posición X para centrar código de barras (devuelve en mm para compatibilidad)
   */
  getCenteredBarcodeX(barcodeLength: number, narrow: number, wide: number): number {
    // Mantener compatibilidad con código existente usando aproximación
    const labelWidthPoints = this.mmToDots(this.config.labelWidth)
    const barcodeWidthMm = barcodeLength * (narrow + wide) * 0.33
    const barcodeWidthPoints = this.mmToDots(barcodeWidthMm)
    return this.dotsToMm(Math.max(0, (labelWidthPoints - barcodeWidthPoints) / 2))
  }

  /**
   * Convierte puntos a milímetros según el DPI
   */
  pointsToMm(points: number): number {
    return this.dotsToMm(points)
  }

  /**
   * Calcula el ancho base de fuentes internas TSC en dots
   * Según la documentación TSPL:
   * Fuente 1: 8 puntos por carácter
   * Fuente 2: 12 puntos por carácter
   * Fuente 3: 16 puntos por carácter
   * Fuente 4: 24 puntos por carácter
   * Fuente 5: 32 puntos por carácter
   */
  private fontBaseWidthDots(font: string): number {
    const map: Record<string, number> = { 
      "1": 8,   // Pequeño
      "2": 12,  // Mediano
      "3": 16,  // Grande
      "4": 24,  // Extra grande
      "5": 32   // Muy grande
    }
    return map[font] ?? 12 // fallback a mediano
  }

  /**
   * Calcula el ancho total del texto en dots
   */
  private textWidthDots(content: string, font: string, xMul: number): number {
    const base = this.fontBaseWidthDots(font)
    return content.length * base * Math.max(1, xMul)
  }

  /**
   * Calcula el ancho del código de barras en dots usando fórmulas por módulos
   * Según la documentación TSPL para códigos de barras
   */
  private barcodeWidthDots(type: string, data: string, narrowDots: number): number {
    const t = type.toUpperCase()
    if (t === '128' || t === 'CODE128' || t === 'CODE 128') {
      // Código 128: 11 módulos por carácter + start/stop/check
      const modules = 11 * data.length + 55 // start+len+check+stop+quiet
      return modules * narrowDots
    }
    if (t === 'EAN13' || t === 'EAN-13') {
      // EAN-13: 95 módulos + quiet zones
      const modules = 113 // 95 + quiet (~9x2)
      return modules * narrowDots
    }
    if (t === 'EAN8' || t === 'EAN-8') {
      // EAN-8: 67 módulos + quiet zones
      const modules = 67 + 18 // 67 + quiet aprox
      return modules * narrowDots
    }
    if (t === 'UPCA' || t === 'UPC-A') {
      // UPC-A: similar a EAN13 en ancho base
      const modules = 95 + 18 // similar a EAN13 en ancho base
      return modules * narrowDots
    }
    // genérico (Code39/93, etc.): aproxima por longitud
    return Math.max(100, data.length * 11 * narrowDots)
  }

  /**
   * Inicia una nueva etiqueta
   * Según la documentación TSPL, la secuencia correcta es:
   * SIZE → GAP → OFFSET → REFERENCE → DIRECTION → DENSITY → SPEED → CLS
   */
  startLabel(): void {
    this.commands = []
    
    // Configurar tamaño de etiqueta (SIZE es el primer comando obligatorio)
    this.commands.push(`SIZE ${this.config.labelWidth} mm,${this.config.labelHeight} mm`)
    
    // Configurar espacio entre etiquetas
    this.commands.push(`GAP ${this.config.gap} mm,0`)
    
    // Configurar offset solo si es necesario (0 = sin offset)
    if (this.config.offsetX !== undefined && this.config.offsetX !== 0) {
      this.commands.push(`OFFSET ${this.config.offsetX} mm`)
    }
    
    // Anclar origen y configurar referencia para mejor centrado
    this.commands.push(`REFERENCE 0,0`)     // (0,0) esquina superior izquierda
    this.commands.push(`DIRECTION 1`)       // dirección de impresión
    this.commands.push(`DENSITY 8`)         // densidad de impresión
    this.commands.push(`SPEED 4`)           // velocidad de impresión
    
    // Limpiar buffer (CLS es obligatorio antes de agregar contenido)
    this.commands.push('CLS')
  }

  /**
   * Agrega texto a la etiqueta
   * Sintaxis TSPL correcta: TEXT x,y,"font",rotation,x-multiplication,y-multiplication,"content"
   */
  addText(config: TSPLTextConfig): void {
    // Convertir coordenadas de mm a puntos
    const x = this.mmToDots(config.x)
    const y = this.mmToDots(config.y)
    
    // Sintaxis correcta TSPL: TEXT X,Y,"font",rotation,x-multiplication,y-multiplication,"content"
    const command = `TEXT ${x},${y},"${config.font}",${config.rotation},${config.xMultiplication},${config.yMultiplication},"${config.content}"`
    
    this.commands.push(command)
  }

  /**
   * Agrega código de barras a la etiqueta
   * Sintaxis TSPL correcta: BARCODE x,y,"code_type",height,human_readable,rotation,narrow,wide,"content"
   */
  addBarcode(config: TSPLBarcodeConfig): void {
    // Convertir coordenadas y altura de mm a puntos
    const x = this.mmToDots(config.x)
    const y = this.mmToDots(config.y)
    const height = this.mmToDots(config.height)
    
    // Sintaxis correcta TSPL: BARCODE x,y,"code_type",height,human_readable,rotation,narrow,wide,"content"
    const command = `BARCODE ${x},${y},"${config.codeType}",${height},${config.humanReadable},${config.rotation},${config.narrow},${config.wide},"${config.content}"`
    
    this.commands.push(command)
  }

  /**
   * Finaliza la etiqueta y la marca para impresión
   */
  finishLabel(copies: number = 1): void {
    this.commands.push(`PRINT ${copies}`)
  }

  /**
   * Finaliza el trabajo de impresión
   */
  endJob(): void {
    this.commands.push('END')
  }

  /**
   * Obtiene todos los comandos TSPL generados
   */
  getCommands(): string[] {
    return [...this.commands]
  }

  /**
   * Obtiene los comandos como string listo para enviar a la impresora
   * Según la documentación TSPL, usar \r\n como separador
   */
  getCommandString(): string {
    return this.commands.join('\r\n')
  }

  /**
   * Limpia todos los comandos
   */
  clear(): void {
    this.commands = []
  }

  /**
   * Genera una etiqueta de prueba de centrado mejorada
   */
  generateCenteringTestLabel(): void {
    // Líneas de referencia en las esquinas para verificar márgenes
    this.addText({
      x: this.config.marginLeft || 0,
      y: this.config.marginTop || 0,
      font: '1',
      rotation: 0,
      xMultiplication: 1,
      yMultiplication: 1,
      content: '+'
    })

    // Esquina superior derecha
    this.addText({
      x: this.config.labelWidth - (this.config.marginRight || 0) - 1,
      y: this.config.marginTop || 0,
      font: '1',
      rotation: 0,
      xMultiplication: 1,
      yMultiplication: 1,
      content: '+'
    })

    // Texto centrado para verificar alineación
    const centerTextXDots = this.getCenteredXDotsForText('CENTRO', '2', 1)
    const centerTextX = this.dotsToMm(centerTextXDots)
    this.addText({
      x: centerTextX,
      y: this.config.labelHeight / 2 - 2,
      font: '2',
      rotation: 0,
      xMultiplication: 1,
      yMultiplication: 1,
      content: 'CENTRO'
    })

    // Código de barras centrado
    const centerBarcodeXDots = this.getCenteredXDotsForBarcode('128', 'CENTER', 2)
    const centerBarcodeX = this.dotsToMm(centerBarcodeXDots)
    this.addBarcode({
      x: centerBarcodeX,
      y: this.config.labelHeight / 2 + 2,
      codeType: '128',
      height: 4,
      humanReadable: 1,
      rotation: 0,
      narrow: 2,
      wide: 2,
      content: 'CENTER'
    })
  }
}

/**
 * Obtiene las coordenadas del centro de la etiqueta en diferentes unidades
 */
export function getLabelCenterCoordinates(labelSize: string = '51x25'): {
  centerXmm: number
  centerYmm: number
  centerXdots: number
  centerYdots: number
  labelInfo: {
    width: number
    height: number
    dpi: number
    printableArea: { width: number; height: number; startX: number; startY: number }
  }
} {
  const config = TSPL_LABEL_CONFIGS[labelSize] || TSPL_LABEL_CONFIGS['51x25']
  const generator = new TSPLGenerator(config)
  
  // Coordenadas del centro en mm
  const centerXmm = config.labelWidth / 2
  const centerYmm = config.labelHeight / 2
  
  // Coordenadas del centro en dots
  const centerXdots = Math.round(generator.convertMmToDots(centerXmm))
  const centerYdots = Math.round(generator.convertMmToDots(centerYmm))
  
  // Área imprimible
  const printableArea = generator.getPrintableArea()
  
  return {
    centerXmm,
    centerYmm,
    centerXdots,
    centerYdots,
    labelInfo: {
      width: config.labelWidth,
      height: config.labelHeight,
      dpi: config.dpi,
      printableArea
    }
  }
}

/**
 * Función de utilidad para generar una etiqueta completa de producto - CORREGIDA
 */
export function generateProductLabelTSPL(
  labelData: TSPLLabelData,
  labelSize: string = '51x25',
  copies: number = 1
): string {
  const config = TSPL_LABEL_CONFIGS[labelSize] || TSPL_LABEL_CONFIGS['51x25']
  
  // Generar comandos TSPL directamente según la documentación oficial
  const commands: string[] = []
  
  // 1. Configuración de etiqueta
  commands.push(`SIZE ${config.labelWidth} mm,${config.labelHeight} mm`)
  commands.push(`GAP ${config.gap} mm,0`)
  commands.push('REFERENCE 0,0')
  commands.push('DIRECTION 1')
  commands.push('DENSITY 8')
  commands.push('SPEED 4')
  
  // Añadimos configuración especial para etiqueta 51x25
  if (labelSize === '51x25') {
    commands.push('OFFSET 0,0')
    commands.push('SET TEAR ON')
  }
  
  commands.push('CLS')
  
  if (labelSize === '2x1inch') {
    // Etiqueta de 2x1 pulgadas (50.8mm x 25.4mm) a 203 DPI
    // Usar el generador TSPL para centrado correcto
    const generator = new TSPLGenerator(config)
    
    // Nombre del producto centrado
    const productName = labelData.name.substring(0, 30)
    const centerXText = generator.getCenteredXDotsForText(productName, "2", 1)
    commands.push(`TEXT ${centerXText},16,"2",0,1,1,"${productName}"`)
    
    // SKU centrado
    if (labelData.sku) {
      const skuText = `SKU: ${labelData.sku}`
      const centerXSku = generator.getCenteredXDotsForText(skuText, "1", 1)
      commands.push(`TEXT ${centerXSku},64,"1",0,1,1,"${skuText}"`)
    }
    
    // Código de barras centrado
    if (labelData.barcode) {
    const type = "128";
    const moduleDots = 2;              // el mismo que pasarás a BARCODE narrow
    const cxBarcode = generator.centeredXBarcodeDots(type, labelData.barcode, moduleDots);
    commands.push(`BARCODE ${cxBarcode},112,"${type}",48,2,0,${moduleDots},${moduleDots},"${labelData.barcode}"`);
  }
    
    // Precio centrado
    const priceText = `$${labelData.price.toFixed(2)}`
    const centerXPrice = generator.getCenteredXDotsForText(priceText, "4", 1)
    commands.push(`TEXT ${centerXPrice},176,"4",0,1,1,"${priceText}"`)
    
  } else if (labelSize === '51x25') {
    // Etiqueta de 51x25mm a 203 DPI - Usando la configuración de 30x21mm
    
    // Usar el generador TSPL para centrado correcto
    const generator = new TSPLGenerator(config)
    
    // Nombre del producto centrado
    const productName = labelData.name.substring(0, 20)
    const centerXText = generator.getCenteredXDotsForText(productName, "2", 1)
    commands.push(`TEXT ${centerXText},16,"2",0,1,1,"${productName}"`)
    
    // Código de barras centrado
    if (labelData.barcode) {
      commands.push(`BARCODE 200,80,"128",40,2,0,2,2,"${labelData.barcode}"`)
    }
    
    // Precio centrado
    const priceText = `$${labelData.price.toFixed(2)}`
    const centerXPrice = generator.getCenteredXDotsForText(priceText, "3", 1)
    commands.push(`TEXT ${centerXPrice},144,"3",0,1,1,"${priceText}"`)
    
  } else if (labelSize === '50x20') {
    // Etiqueta de 50x20mm a 203 DPI
    // 50mm = 400 puntos, 20mm = 160 puntos
    const centerX = 200 // Centro de 400 puntos
    
    // Nombre del producto centrado
    const productName = labelData.name.substring(0, 18)
    commands.push(`TEXT ${centerX},16,"2",0,1,1,"${productName}"`)
    
    // Código de barras centrado
    if (labelData.barcode) {
      commands.push(`BARCODE ${centerX},80,"128",40,2,0,2,2,"${labelData.barcode}"`)
    }
    
    // Precio centrado
    const priceText = `$${labelData.price.toFixed(2)}`
    commands.push(`TEXT ${centerX},144,"3",0,1,1,"${priceText}"`)
    
  } else {
    // Configuración genérica para otros tamaños
    const widthPoints = Math.round(config.labelWidth * (config.dpi === 203 ? 8 : 11.811))
    const heightPoints = Math.round(config.labelHeight * (config.dpi === 203 ? 8 : 11.811))
    const centerX = Math.round(widthPoints / 2)
    
    // Nombre del producto centrado
    const productName = labelData.name.substring(0, Math.floor(config.labelWidth * 0.8))
    commands.push(`TEXT ${centerX},16,"2",0,1,1,"${productName}"`)
    
    // Código de barras centrado
    if (labelData.barcode) {
      const barcodeHeight = 48 // altura en puntos (6mm a 203 DPI)
      commands.push(`BARCODE ${centerX},80,"128",${barcodeHeight},2,0,2,2,"${labelData.barcode}"`)
    }
    
    // Precio centrado
    const priceText = `$${labelData.price.toFixed(2)}`
    commands.push(`TEXT ${centerX},160,"3",0,1,1,"${priceText}"`)
  }
  
  // Finalizar etiqueta
  commands.push(`PRINT ${copies}`)
  commands.push('END')
  
  return commands.join('\r\n')
}

/**
 * Función para generar múltiples etiquetas - CORREGIDA
 */
export function generateMultipleProductLabelsTSPL(
  labels: TSPLLabelData[],
  labelSize: string = '51x25'
): string {
  const config = TSPL_LABEL_CONFIGS[labelSize] || TSPL_LABEL_CONFIGS['51x25']
  const allCommands: string[] = []
  
  labels.forEach((labelData, index) => {
    const generator = new TSPLGenerator(config)
    
    // Iniciar nueva etiqueta
    generator.startLabel()
    
    if (labelSize === '51x25') {
      // Configuración específica para etiquetas 51x25 (centrado automático)
      const productName = labelData.name.substring(0, 16) // Reducir caracteres para evitar cortes
      
      // Usar el método mejorado de centrado con getCenteredXDotsForText
      const nameXDots = generator.getCenteredXDotsForText(productName, "2", 1)
      const nameX = generator.getCenteredXmmFromDots(nameXDots)
      
      // Nombre del producto
      generator.addText({
        x: nameX,
        y: 3,
        font: '2',
        rotation: 0,
        xMultiplication: 1,
        yMultiplication: 1,
        content: productName
      })
      
      // Código de barras
      if (labelData.barcode) {
        // Usar el método mejorado de centrado con getCenteredXDotsForBarcode
        const barcodeXDots = generator.getCenteredXDotsForBarcode("128", labelData.barcode, 2)
        const barcodeX = generator.getCenteredXmmFromDots(barcodeXDots)
        
        generator.addBarcode({
          x: barcodeX,
          y: 6,
          codeType: detectBarcodeType(labelData.barcode),
          height: 6,
          humanReadable: 2,
          rotation: 0,
          narrow: 1,
          wide: 2,
          content: labelData.barcode
        })
      }
      
      // Precio
      const priceText = `$${labelData.price.toFixed(2)}`
      // Usar el método mejorado de centrado con getCenteredXDotsForText
      const priceXDots = generator.getCenteredXDotsForText(priceText, "3", 1)
      const priceX = generator.getCenteredXmmFromDots(priceXDots)
      
      generator.addText({
        x: priceX,
        y: 14,
        font: '3', // Fuente más grande
        rotation: 0,
        xMultiplication: 1,
        yMultiplication: 1,
        content: priceText
      })
    } else if (labelSize === '2x1inch') {
      // Configuración específica para etiquetas de 2x1 pulgadas (centrado automático)
      const productName = labelData.name.substring(0, 30) // Más caracteres por el ancho mayor
      const nameXDots = generator.getCenteredXDotsForText(productName, '2', 1)
      const nameX = generator.getCenteredXmmFromDots(nameXDots)
      
      // Nombre del producto
      generator.addText({
        x: nameX,
        y: 3,
        font: '2',
        rotation: 0,
        xMultiplication: 1,
        yMultiplication: 1,
        content: productName
      })
      
      // SKU o información adicional
      if (labelData.sku) {
        const skuText = `SKU: ${labelData.sku}`
        const skuXDots = generator.getCenteredXDotsForText(skuText, '1', 1)
        const skuX = generator.getCenteredXmmFromDots(skuXDots)
        generator.addText({
          x: skuX,
          y: 8,
          font: '1',
          rotation: 0,
          xMultiplication: 1,
          yMultiplication: 1,
          content: skuText
        })
      }
      
      // Código de barras
      if (labelData.barcode) {
        const barcodeXDots = generator.getCenteredXDotsForBarcode('128', labelData.barcode, 1)
        const barcodeX = generator.getCenteredXmmFromDots(barcodeXDots)
        generator.addBarcode({
          x: barcodeX,
          y: 12,
          codeType: detectBarcodeType(labelData.barcode),
          height: 8,
          humanReadable: 2,
          rotation: 0,
          narrow: 1,
          wide: 2,
          content: labelData.barcode
        })
      }
      
      // Precio
      const priceText = `$${labelData.price.toFixed(2)}`
      const priceXDots = generator.getCenteredXDotsForText(priceText, '4', 1)
      const priceX = generator.getCenteredXmmFromDots(priceXDots)
      generator.addText({
        x: priceX,
        y: 22,
        font: '4', // Fuente más grande para el precio
        rotation: 0,
        xMultiplication: 1,
        yMultiplication: 1,
        content: priceText
      })
    } else {
      // Configuración genérica para otros tamaños (centrado automático)
      const productName = labelData.name.substring(0, Math.floor(config.labelWidth * 0.8)) // Ajustar según ancho
      const nameX = generator.pointsToMm(generator.getCenteredX(productName.length, 2))
      
      // Nombre del producto
      generator.addText({
        x: nameX,
        y: 2,
        font: '2',
        rotation: 0,
        xMultiplication: 1,
        yMultiplication: 1,
        content: productName
      })
      
      // Código de barras
      if (labelData.barcode) {
        const barcodeX = generator.pointsToMm(generator.getCenteredBarcodeX(labelData.barcode.length, 1, 2))
        generator.addBarcode({
          x: barcodeX,
          y: config.labelHeight * 0.3,
          codeType: detectBarcodeType(labelData.barcode),
          height: config.labelHeight * 0.4,
          humanReadable: 2,
          rotation: 0,
          narrow: 1,
          wide: 2,
          content: labelData.barcode
        })
      }
      
      // Precio
      const priceText = `$${labelData.price.toFixed(2)}`
      const priceX = generator.pointsToMm(generator.getCenteredX(priceText.length, 3))
      generator.addText({
        x: priceX,
        y: config.labelHeight * 0.8,
        font: '3',
        rotation: 0,
        xMultiplication: 1,
        yMultiplication: 1,
        content: priceText
      })
    }
    
    // Finalizar etiqueta
    generator.finishLabel(1)
    
    // Agregar comandos de esta etiqueta al array total
    allCommands.push(...generator.getCommands())
  })
  
  // Agregar comando END al final
  allCommands.push('END')
  
  return allCommands.join('\r\n')
}

/**
 * Función de prueba para mover la etiqueta ARRIBA
 */
export function generateTestLabelArribaTSPL(
  labelSize: string = '51x25',
  copies: number = 1
): string {
  const config = TSPL_LABEL_CONFIGS[labelSize] || TSPL_LABEL_CONFIGS['51x25']
  
  const commands: string[] = []
  commands.push(`SIZE ${config.labelWidth} mm,${config.labelHeight} mm`)
  commands.push(`GAP ${config.gap} mm,0`)
  commands.push('REFERENCE 0,0')
  commands.push('DIRECTION 1')
  commands.push('DENSITY 8')
  commands.push('SPEED 4')
  commands.push('CLS')
  
  // PRUEBA: Mover TODO hacia ARRIBA (Y menor)
  commands.push('TEXT 100,5,"2",0,1,1,"ARRIBA"')
  commands.push('BARCODE 100,25,"128",30,2,0,2,2,"TEST123"')
  commands.push('TEXT 100,60,"1",0,1,1,"Posicion: ARRIBA"')
  
  commands.push(`PRINT ${copies}`)
  commands.push('END')
  
  return commands.join('\r\n')
}

/**
 * Función de prueba para mover la etiqueta ABAJO
 */
export function generateTestLabelAbajoTSPL(
  labelSize: string = '51x25',
  copies: number = 1
): string {
  const config = TSPL_LABEL_CONFIGS[labelSize] || TSPL_LABEL_CONFIGS['51x25']
  
  const commands: string[] = []
  commands.push(`SIZE ${config.labelWidth} mm,${config.labelHeight} mm`)
  commands.push(`GAP ${config.gap} mm,0`)
  commands.push('REFERENCE 0,0')
  commands.push('DIRECTION 1')
  commands.push('DENSITY 8')
  commands.push('SPEED 4')
  commands.push('CLS')
  
  // PRUEBA: Mover TODO hacia ABAJO (Y mayor)
  commands.push('TEXT 100,120,"2",0,1,1,"ABAJO"')
  commands.push('BARCODE 100,140,"128",30,2,0,2,2,"TEST123"')
  commands.push('TEXT 100,175,"1",0,1,1,"Posicion: ABAJO"')
  
  commands.push(`PRINT ${copies}`)
  commands.push('END')
  
  return commands.join('\r\n')
}

/**
 * Función de prueba para mover la etiqueta IZQUIERDA
 */
export function generateTestLabelIzquierdaTSPL(
  labelSize: string = '51x25',
  copies: number = 1
): string {
  const config = TSPL_LABEL_CONFIGS[labelSize] || TSPL_LABEL_CONFIGS['51x25']
  
  const commands: string[] = []
  commands.push(`SIZE ${config.labelWidth} mm,${config.labelHeight} mm`)
  commands.push(`GAP ${config.gap} mm,0`)
  commands.push('REFERENCE 0,0')
  commands.push('DIRECTION 1')
  commands.push('DENSITY 8')
  commands.push('SPEED 4')
  // Añadimos un SHIFT negativo para mover todo a la izquierda
  commands.push('SHIFT -30,0')
  commands.push('CLS')
  
  // PRUEBA: Mover TODO hacia IZQUIERDA
  // Usamos coordenadas normales, el SHIFT negativo se encargará de moverlas a la izquierda
  commands.push('TEXT 10,50,"3",0,1,1,"EXTREMO IZQ"')
  commands.push('BARCODE 10,70,"128",30,2,0,2,2,"TEST123"')
  commands.push('TEXT 10,105,"1",0,1,1,"Posicion: IZQUIERDA"')
  
  commands.push(`PRINT ${copies}`)
  commands.push('END')
  
  return commands.join('\r\n')
}

/**
 * Función de prueba para mover la etiqueta DERECHA
 */
export function generateTestLabelDerechaTSPL(
  labelSize: string = '51x25',
  copies: number = 1
): string {
  const config = TSPL_LABEL_CONFIGS[labelSize] || TSPL_LABEL_CONFIGS['51x25']
  
  const commands: string[] = []
  commands.push(`SIZE ${config.labelWidth} mm,${config.labelHeight} mm`)
  commands.push(`GAP ${config.gap} mm,0`)
  commands.push('REFERENCE 0,0')
  commands.push('DIRECTION 1')
  commands.push('DENSITY 8')
  commands.push('SPEED 4')
  // Añadimos un SHIFT para mover todo a la derecha
  commands.push('SHIFT 30,0')
  commands.push('CLS')
  
  // PRUEBA: Mover TODO hacia DERECHA
  // Usamos coordenadas normales, el SHIFT se encargará de moverlas a la derecha
  commands.push('TEXT 10,50,"2",0,1,1,"DER"')
  commands.push('BARCODE 10,70,"128",30,2,0,2,2,"TEST123"')
  commands.push('TEXT 10,105,"1",0,1,1,"Posicion: DERECHA"')
  
  commands.push(`PRINT ${copies}`)
  commands.push('END')
  
  return commands.join('\r\n')
}

/**
 * Función de prueba para coordenadas intermedias (CENTRO)
 */
export function generateTestLabelCentroTSPL(
  labelSize: string = '51x25',
  copies: number = 1
): string {
  const config = TSPL_LABEL_CONFIGS[labelSize] || TSPL_LABEL_CONFIGS['51x25']
  
  const commands: string[] = []
  commands.push(`SIZE ${config.labelWidth} mm,${config.labelHeight} mm`)
  commands.push(`GAP ${config.gap} mm,0`)
  commands.push('REFERENCE 0,0')
  commands.push('DIRECTION 1')
  commands.push('DENSITY 8')
  commands.push('SPEED 4')
  commands.push('CLS')
  
  // PRUEBA: Usar coordenadas X más pequeñas pero positivas
  commands.push('TEXT 10,50,"2",0,1,1,2,"CENTRO"')
  commands.push('BARCODE 10,70,"128",30,2,0,2,2,2,"TEST123"')
  commands.push('TEXT 10,105,"1",0,1,1,2,"Posicion: CENTRO"')
  
  commands.push(`PRINT ${copies}`)
  commands.push('END')
  
  return commands.join('\r\n')
}

/**
 * Función de prueba para etiquetas en orientación landscape
 */
export function generateTestLabelLandscapeTSPL(
  labelSize: string = '2x1inch',
  copies: number = 1
): string {
  const config = TSPL_LABEL_CONFIGS[labelSize] || TSPL_LABEL_CONFIGS['2x1inch'];
  
  // Inicializar generador TSPL (igual que en múltiples etiquetas)
  const generator = new TSPLGenerator(config);
  
  // Iniciar nueva etiqueta
  generator.startLabel();
  
  // Configurar para orientación landscape
  generator.setDirection(0); // 0 para landscape (horizontal)
  
  // Nombre del producto (centrado)
  const productName = "PRUEBA";
  const nameX = generator.pointsToMm(generator.getCenteredX(productName.length, 3));
  
  generator.addText({
    x: nameX,
    y: 1, // Posición Y más arriba
    font: '3', // Fuente más grande
    rotation: 0,
    xMultiplication: 1,
    yMultiplication: 1,
    content: productName
  });
  
  // Código de barras (centrado)
  const barcode = "TEST123";
  const barcodeX = generator.pointsToMm(generator.getCenteredBarcodeX(barcode.length, 1, 2));
  
  generator.addBarcode({
    x: barcodeX,
    y: 6, // Posición Y más arriba
    codeType: "128",
    height: 8, // Altura del código de barras
    humanReadable: 2, // Texto legible centrado
    rotation: 0,
    narrow: 1,
    wide: 2,
    content: barcode
  });
  
  // Texto adicional (centrado)
  const additionalText = "LANDSCAPE";
  const textX = generator.pointsToMm(generator.getCenteredX(additionalText.length, 3));
  
  generator.addText({
    x: textX,
    y: 16, // Posición Y más arriba
    font: '3', // Fuente más grande
    rotation: 0,
    xMultiplication: 1,
    yMultiplication: 1,
    content: additionalText
  });
  
  // Finalizar etiqueta
  generator.finishLabel(copies);
  generator.endJob();
  
  return generator.getCommandString();
}

/**
 * Función para generar etiquetas de producto en orientación landscape
 */
export function generateProductLandscapeTSPL(
  labelData: TSPLLabelData,
  copies: number = 1
): string {
  // Comandos TSPL directos para etiqueta de producto en landscape con SHIFT negativo
  return `SIZE 50 mm, 25 mm
GAP 2 mm, 0 mm
DIRECTION 0
REFERENCE 0, 0
OFFSET 0 mm
CLS
SHIFT -20, -10
TEXT 100, 5, "3", 0, 1, 1, "${labelData.name}"
BARCODE 100, 40, "128", 50, 1, 0, 2, 2, "${labelData.barcode}"
TEXT 100, 100, "4", 0, 1, 1, "$${labelData.price.toFixed(2)}"
PRINT ${copies}
END`;
}

/**
 * Función para generar una etiqueta con orientación landscape
 * Diseñada específicamente para etiquetas de 2x1 pulgadas (50.8mm x 25.4mm)
 */
export function generateLandscapeLabelTSPL(
  labelSize: string = '2x1inch',
  copies: number = 1,
  data: {
    productName: string;
    barcode: string;
    price: string;
    sku?: string;
  } = {
    productName: 'Producto de Prueba',
    barcode: '1234567890123',
    price: '$29.99',
    sku: ''
  }
): string {
  const config = TSPL_LABEL_CONFIGS[labelSize] || TSPL_LABEL_CONFIGS['2x1inch']
  
  // Generar comandos TSPL
  const commands: string[] = []
  
  // Configuración de etiqueta
  commands.push(`SIZE ${config.labelWidth} mm,${config.labelHeight} mm`)
  commands.push(`GAP ${config.gap} mm,0`)
  commands.push('REFERENCE 0,0')
  commands.push('DIRECTION 0') // 0 para landscape (horizontal)
  commands.push('DENSITY 8')
  commands.push('SPEED 4')
  
  // Calcular dimensiones en puntos
  const widthDots = Math.round(config.labelWidth * (config.dpi === 203 ? 8 : 11.811))
  const heightDots = Math.round(config.labelHeight * (config.dpi === 203 ? 8 : 11.811))
  
  // Calcular posiciones centradas
  const centerX = Math.round(widthDots / 2)
  const centerY = Math.round(heightDots / 2)
  
  // Limpiar buffer
  commands.push('CLS')
  
  // Nombre del producto (centrado, parte superior)
  const productNameY = 10
  commands.push(`TEXT ${centerX},${productNameY},"3",0,1,1,"${data.productName}"`)
  
  // Código de barras (centrado, parte media)
  const barcodeY = productNameY + 30
  commands.push(`BARCODE ${centerX},${barcodeY},"128",50,1,0,2,2,"${data.barcode}"`)
  
  // Precio (centrado, parte inferior)
  const priceY = barcodeY + 90
  commands.push(`TEXT ${centerX},${priceY},"4",0,1,1,"${data.price}"`)
  
  // SKU (si existe, parte inferior)
  if (data.sku) {
    const skuY = priceY + 30
    commands.push(`TEXT ${centerX},${skuY},"2",0,1,1,"SKU: ${data.sku}"`)
  }
  
  // Imprimir
  commands.push(`PRINT ${copies}`)
  commands.push('END')
  
  return commands.join('\r\n')
}

/**
 * Función optimizada para generar etiquetas de producto en orientación landscape
 * Con mejor posicionamiento y soporte para diferentes tamaños de etiqueta
 */
export function generateProductLabelLandscapeTSPL(
  labelData: TSPLLabelData,
  labelSize: string = '2x1inch',
  copies: number = 1
): string {
  const config = TSPL_LABEL_CONFIGS[labelSize] || TSPL_LABEL_CONFIGS['2x1inch']
  
  // Inicializar generador TSPL
  const generator = new TSPLGenerator(config)
  
  // Configurar para orientación landscape
  const commands: string[] = []
  commands.push(`SIZE ${config.labelWidth} mm,${config.labelHeight} mm`)
  commands.push(`GAP ${config.gap} mm,0`)
  commands.push('REFERENCE 0,0')
  commands.push('DIRECTION 0') // 0 para landscape (horizontal)
  commands.push('DENSITY 8')
  commands.push('SPEED 4')
  
  // Calcular dimensiones en puntos
  const widthDots = generator.convertMmToDots(config.labelWidth)
  const heightDots = generator.convertMmToDots(config.labelHeight)
  
  // Limpiar buffer
  commands.push('CLS')
  
  // Calcular posiciones óptimas para landscape
  const marginX = generator.convertMmToDots(2) // 2mm de margen
  const marginY = generator.convertMmToDots(2) // 2mm de margen
  const availableWidth = widthDots - (marginX * 2)
  const availableHeight = heightDots - (marginY * 2)
  
  // Nombre del producto (parte superior)
  const nameX = Math.round(widthDots / 2) // Centrado horizontalmente
  const nameY = marginY + generator.convertMmToDots(2)
  commands.push(`TEXT ${nameX},${nameY},"3",0,1,1,"${labelData.name}"`)
  
  // Código de barras (parte central)
  const barcodeHeight = generator.convertMmToDots(10) // 10mm de altura
  const barcodeX = Math.round(widthDots / 2) // Centrado horizontalmente
  const barcodeY = nameY + generator.convertMmToDots(8)
  commands.push(`BARCODE ${barcodeX},${barcodeY},"128",${barcodeHeight},1,0,2,2,"${labelData.barcode}"`)
  
  // Precio (parte inferior)
  const priceX = Math.round(widthDots / 2) // Centrado horizontalmente
  const priceY = barcodeY + barcodeHeight + generator.convertMmToDots(5)
  commands.push(`TEXT ${priceX},${priceY},"4",0,1,1,"$${labelData.price.toFixed(2)}"`)
  
  // SKU (si existe, parte inferior)
  if (labelData.sku) {
    const skuX = Math.round(widthDots / 2) // Centrado horizontalmente
    const skuY = priceY + generator.convertMmToDots(5)
    commands.push(`TEXT ${skuX},${skuY},"2",0,1,1,"SKU: ${labelData.sku}"`)
  }
  
  // Imprimir
  commands.push(`PRINT ${copies}`)
  commands.push('END')
  
  return commands.join('\r\n')
}

/**
 * Función básica para etiquetas en orientación landscape
 * Implementación simplificada con comandos TSPL directos
 */
export function generateSimpleLandscapeTSPL(
  labelData: TSPLLabelData,
  copies: number = 1
): string {
  // Comandos TSPL directos sin complicaciones
  return `SIZE 50.8 mm, 25.4 mm
GAP 2 mm, 0 mm
DIRECTION 0
REFERENCE 0,0
SPEED 4
DENSITY 8
SET TEAR ON
CLS
TEXT 50, 20, "3", 0, 1, 1, "${labelData.name}"
BARCODE 50, 60, "128", 50, 1, 0, 2, 2, "${labelData.barcode}"
TEXT 50, 130, "4", 0, 1, 1, "$${labelData.price.toFixed(2)}"
PRINT ${copies}
END`;
}

/**
 * Función de utilidad para generar una etiqueta completa de producto - CORREGIDA
 */
export function generateTestLabelTSPL(
  labelSize: string = '51x25',
  copies: number = 1
): string {
  const config = TSPL_LABEL_CONFIGS[labelSize] || TSPL_LABEL_CONFIGS['51x25']
  
  // Generar comandos TSPL directamente según la documentación oficial
  const commands: string[] = []
  
  // 1. Configuración de etiqueta
  commands.push(`SIZE ${config.labelWidth} mm,${config.labelHeight} mm`)
  commands.push(`GAP ${config.gap} mm,0`)
  commands.push('REFERENCE 0,0')
  commands.push('DIRECTION 1')
  commands.push('DENSITY 8')
  commands.push('SPEED 4')
  commands.push('CLS')
  
  if (labelSize === '2x1inch') {
    // Etiqueta de 2x1 pulgadas (50.8mm x 25.4mm) a 203 DPI
    // 50.8mm = 406 puntos, 25.4mm = 203 puntos
    
    // Calcular centro real considerando el ancho de la etiqueta
    const labelWidthPoints = 406 // 50.8mm * 8 puntos/mm
    const centerX = Math.round(labelWidthPoints / 2)
    
    // Título centrado
    commands.push(`TEXT ${centerX},16,"3",0,1,1,"ETIQUETA 2x1""`)
    
    // Nombre del producto centrado
    commands.push(`TEXT ${centerX},64,"2",0,1,1,"Producto de Prueba"`)
    
    // Código de barras centrado
    commands.push(`BARCODE ${centerX},112,"128",48,2,0,2,2,"1234567890123"`)
    
    // Precio centrado
    commands.push(`TEXT ${centerX},176,"4",0,1,1,"$29.99"`)
    
  } else if (labelSize === '51x25') {
    // Etiqueta de 51x25mm a 203 DPI
    // 51mm = 408 puntos, 25mm = 200 puntos
    
    // Calcular centro real
    const labelWidthPoints = 408 // 51mm * 8 puntos/mm
    const centerX = Math.round(labelWidthPoints / 2)
    
    // Título centrado
    commands.push(`TEXT ${centerX},16,"3",0,1,1,"ETIQUETA 51x25"`)
    
    // Nombre del producto centrado
    commands.push(`TEXT ${centerX},64,"2",0,1,1,"Producto de Prueba"`)
    
    // Código de barras centrado
    commands.push(`BARCODE ${centerX},112,"128",48,2,0,2,2,"1234567890123"`)
    
    // Precio centrado
    commands.push(`TEXT ${centerX},176,"4",0,1,1,"$29.99"`)
    
  } else if (labelSize === '50x20') {
    // Etiqueta de 50x20mm a 203 DPI
    // 50mm = 400 puntos, 20mm = 160 puntos
    
    // Calcular centro real
    const labelWidthPoints = 400 // 50mm * 8 puntos/mm
    const centerX = Math.round(labelWidthPoints / 2)
    
    // Título centrado
    commands.push(`TEXT ${centerX},16,"3",0,1,1,"ETIQUETA 50x20"`)
    
    // Nombre del producto centrado
    commands.push(`TEXT ${centerX},64,"2",0,1,1,"Producto de Prueba"`)
    
    // Código de barras centrado
    commands.push(`BARCODE ${centerX},112,"128",48,2,0,2,2,"1234567890123"`)
    
    // Precio centrado
    commands.push(`TEXT ${centerX},176,"4",0,1,1,"$29.99"`)
    
  } else {
    // Configuración genérica para otros tamaños
    const widthPoints = Math.round(config.labelWidth * (config.dpi === 203 ? 8 : 11.811))
    const heightPoints = Math.round(config.labelHeight * (config.dpi === 203 ? 8 : 11.811))
    const centerX = Math.round(widthPoints / 2)
    
    // Título centrado
    commands.push(`TEXT ${centerX},16,"3",0,1,1,"ETIQUETA ${labelSize}"`)
    
    // Nombre del producto centrado
    commands.push(`TEXT ${centerX},64,"2",0,1,1,"Producto de Prueba"`)
    
    // Código de barras centrado
    commands.push(`BARCODE ${centerX},112,"128",48,2,0,2,2,"1234567890123"`)
    
    // Precio centrado
    commands.push(`TEXT ${centerX},176,"4",0,1,1,"$29.99"`)
  }
  
  // Finalizar etiqueta
  commands.push(`PRINT ${copies}`)
  commands.push('END')
  
  return commands.join('\r\n')
}

/**
 * Función de utilidad para detectar el tipo de código de barras
 */
export function detectBarcodeType(barcode: string): string {
  if (!barcode) return '128'
  
  // EAN-13: 13 dígitos
  if (/^\d{13}$/.test(barcode)) {
    return 'EAN13'
  }
  
  // EAN-8: 8 dígitos
  if (/^\d{8}$/.test(barcode)) {
    return 'EAN8'
  }
  
  // UPC-A: 12 dígitos
  if (/^\d{12}$/.test(barcode)) {
    return 'UPCA'
  }
  
  // Por defecto CODE128 para alfanuméricos
  return '128'
}

/**
 * Función para validar comandos TSPL
 */
export function validateTSPLCommands(commands: string): boolean {
  const lines = commands.split('\r\n')
  
  // Verificar que tenga comandos básicos
  const hasSize = lines.some(line => line.startsWith('SIZE'))
  const hasCls = lines.some(line => line.startsWith('CLS'))
  const hasPrint = lines.some(line => line.startsWith('PRINT'))
  const hasEnd = lines.some(line => line.startsWith('END'))
  
  return hasSize && hasCls && hasPrint && hasEnd
}

/**
 * Función para obtener información de debug de comandos TSPL
 */
export function getTSPLDebugInfo(commands: string): {
  totalCommands: number
  textCommands: number
  barcodeCommands: number
  printCommands: number
  estimatedLabels: number
} {
  const lines = commands.split('\r\n')
  
  return {
    totalCommands: lines.length,
    textCommands: lines.filter(line => line.startsWith('TEXT')).length,
    barcodeCommands: lines.filter(line => line.startsWith('BARCODE')).length,
    printCommands: lines.filter(line => line.startsWith('PRINT')).length,
    estimatedLabels: lines.filter(line => line.startsWith('PRINT')).length
  }
}

/**
 * Función de utilidad para generar una etiqueta completa de producto - CORREGIDA
 */