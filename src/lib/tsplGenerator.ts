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
    // Offsets calibrados para centrado óptimo en etiquetas 50x20mm
    offsetX: -1,  // Ajuste hacia la izquierda para compensar desplazamiento común
    offsetY: 0,
    // Márgenes no imprimibles típicos para etiquetas térmicas
    marginLeft: 1.5,
    marginRight: 1.5,
    marginTop: 1,
    marginBottom: 1
  },
  '51x25': {
    labelWidth: 51,
    labelHeight: 25,
    dpi: 203,
    gap: 2,
    orientation: 'portrait',
    // Offsets calibrados para centrado óptimo en etiquetas 51x25mm
    offsetX: -0.5,  // Ajuste ligero hacia la izquierda
    offsetY: 0,
    // Márgenes no imprimibles típicos para etiquetas térmicas
    marginLeft: 1.2,
    marginRight: 1.2,
    marginTop: 1,
    marginBottom: 1
  },
  '30x21': {
    labelWidth: 30,
    labelHeight: 21,
    dpi: 203,
    gap: 2,
    orientation: 'portrait',
    // Offsets calibrados para centrado óptimo en etiquetas 30x21mm
    offsetX: -0.8,  // Ajuste hacia la izquierda para etiquetas pequeñas
    offsetY: 0.2,   // Ligero ajuste vertical
    // Márgenes no imprimibles típicos para etiquetas térmicas
    marginLeft: 1,
    marginRight: 1,
    marginTop: 1,
    marginBottom: 1
  },
  '10x21': {
    labelWidth: 10,
    labelHeight: 21,
    dpi: 203,
    gap: 2,
    orientation: 'portrait',
    // Offsets calibrados para centrado óptimo en etiquetas 10x21mm
    offsetX: -0.3,  // Ajuste mínimo hacia la izquierda
    offsetY: 0,
    // Márgenes no imprimibles típicos para etiquetas térmicas
    marginLeft: 0.5,
    marginRight: 0.5,
    marginTop: 0.8,
    marginBottom: 0.8
  },
  '2x1inch': {
    labelWidth: 50.8,  // 2 pulgadas = 50.8mm
    labelHeight: 25.4, // 1 pulgada = 25.4mm
    dpi: 203,
    gap: 2,
    orientation: 'landscape', // Orientación horizontal para aprovechar mejor el espacio
    // Offsets calibrados para centrado óptimo en etiquetas 2x1 pulgadas
    offsetX: -1.5,  // Ajuste hacia la izquierda para compensar márgenes de impresora
    offsetY: 0.5,   // Ligero ajuste vertical hacia abajo
    // Márgenes no imprimibles típicos para etiquetas térmicas de 2x1 pulgadas
    marginLeft: 2,   // Margen izquierdo más amplio para etiquetas grandes
    marginRight: 2,  // Margen derecho más amplio
    marginTop: 1.5,  // Margen superior
    marginBottom: 1.5 // Margen inferior
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

  /**
   * Convierte milímetros a puntos según el DPI
   */
  private mmToDots(mm: number): number {
    return Math.round(mm * (this.config.dpi === 203 ? 8 : 11.811))
  }

  dotsToMm(dots: number): number {
    return dots / (this.config.dpi / 25.4)
  }



  // Mantener compatibilidad con código existente
  private mmToPoints(mm: number): number {
    return this.mmToDots(mm);
  }

  /**
   * Calcula la posición X para centrar texto (devuelve en dots) considerando márgenes
   */
  getCenteredXDotsForText(content: string, font: string, xMul: number): number {
    const W = this.mmToDots(this.config.labelWidth);
    const marginLeftDots = this.mmToDots(this.config.marginLeft || 0);
    const marginRightDots = this.mmToDots(this.config.marginRight || 0);
    const usableWidth = W - marginLeftDots - marginRightDots;
    const w = this.textWidthDots(content, font, xMul);
    return Math.max(marginLeftDots, Math.round(marginLeftDots + (usableWidth - w) / 2));
  }

  /**
   * Calcula la posición X para centrar texto (devuelve en mm para compatibilidad)
   */
  getCenteredX(textLength: number, fontSize: number = 1): number {
    // Mantener compatibilidad con código existente
    const content = 'A'.repeat(textLength); // texto de ejemplo
    const xDots = this.getCenteredXDotsForText(content, fontSize.toString(), 1);
    return this.dotsToMm(xDots);
  }

  /**
   * Convierte coordenadas X de dots a mm
   */
  getCenteredXmmFromDots(xDots: number): number {
    return this.dotsToMm(xDots);
  }

  /**
   * Calcula la posición Y considerando márgenes verticales
   */
  getAdjustedY(y: number): number {
    const marginTop = this.config.marginTop || 0;
    return Math.max(marginTop, y + marginTop);
  }

  /**
   * Obtiene el área imprimible considerando todos los márgenes
   */
  getPrintableArea(): { width: number; height: number; startX: number; startY: number } {
    const marginLeft = this.config.marginLeft || 0;
    const marginRight = this.config.marginRight || 0;
    const marginTop = this.config.marginTop || 0;
    const marginBottom = this.config.marginBottom || 0;
    
    return {
      width: this.config.labelWidth - marginLeft - marginRight,
      height: this.config.labelHeight - marginTop - marginBottom,
      startX: marginLeft,
      startY: marginTop
    };
  }

  /**
   * Calcula la posición X para centrar código de barras (devuelve en dots) considerando márgenes
   */
  getCenteredXDotsForBarcode(type: string, data: string, narrow: number): number {
    const W = this.mmToDots(this.config.labelWidth);
    const marginLeftDots = this.mmToDots(this.config.marginLeft || 0);
    const marginRightDots = this.mmToDots(this.config.marginRight || 0);
    const usableWidth = W - marginLeftDots - marginRightDots;
    const w = this.barcodeWidthDots(type, data, this.mmToDots(narrow)); // narrow viene en mm → pásalo a dots
    return Math.max(marginLeftDots, Math.round(marginLeftDots + (usableWidth - w) / 2));
  }

  /**
   * Calcula la posición X para centrar código de barras (devuelve en mm para compatibilidad)
   */
  getCenteredBarcodeX(barcodeLength: number, narrow: number, wide: number): number {
    // Mantener compatibilidad con código existente usando aproximación
    const labelWidthPoints = this.mmToDots(this.config.labelWidth);
    const barcodeWidthMm = barcodeLength * (narrow + wide) * 0.33;
    const barcodeWidthPoints = this.mmToDots(barcodeWidthMm);
    return this.dotsToMm(Math.max(0, (labelWidthPoints - barcodeWidthPoints) / 2));
  }

  /**
   * Convierte puntos a milímetros según el DPI
   */
  pointsToMm(points: number): number {
    return this.dotsToMm(points);
  }

  /**
   * Calcula el ancho base de fuentes internas TSC en dots
   */
  private fontBaseWidthDots(font: string): number {
    // Anchos aproximados por carácter en dots a 203dpi:
    // "1":8, "2":12, "3":16, "4":24, "5":32 (clásico en TSC)
    const map: Record<string, number> = { "1": 8, "2": 12, "3": 16, "4": 24, "5": 32 };
    return map[font] ?? 12; // fallback
  }

  /**
   * Calcula el ancho total del texto en dots
   */
  private textWidthDots(content: string, font: string, xMul: number): number {
    const base = this.fontBaseWidthDots(font);
    return content.length * base * Math.max(1, xMul);
  }

  /**
   * Calcula el ancho del código de barras en dots usando fórmulas por módulos
   */
  private barcodeWidthDots(type: string, data: string, narrowDots: number): number {
    const t = type.toUpperCase();
    if (t === '128' || t === 'CODE128' || t === 'CODE 128') {
      const modules = 11 * data.length + 55; // start+len+check+stop+quiet
      return modules * narrowDots;
    }
    if (t === 'EAN13' || t === 'EAN-13') {
      const modules = 113; // 95 + quiet (~9x2)
      return modules * narrowDots;
    }
    if (t === 'EAN8' || t === 'EAN-8') {
      const modules = 67 + 18; // 67 + quiet aprox
      return modules * narrowDots;
    }
    if (t === 'UPCA' || t === 'UPC-A') {
      const modules = 95 + 18; // similar a EAN13 en ancho base
      return modules * narrowDots;
    }
    // genérico (Code39/93, etc.): aproxima por longitud
    return Math.max(100, data.length * 11 * narrowDots);
  }

  /**
   * Inicia una nueva etiqueta
   */
  startLabel(): void {
    this.commands = []
    
    // Configurar tamaño de etiqueta
    this.commands.push(`SIZE ${this.config.labelWidth} mm,${this.config.labelHeight} mm`)
    
    // Configurar espacio entre etiquetas
    this.commands.push(`GAP ${this.config.gap} mm,0`)
    
    // Configurar offset para centrado (si está definido)
    if (this.config.offsetX !== undefined || this.config.offsetY !== undefined) {
      const offsetX = this.config.offsetX || 0
      const offsetY = this.config.offsetY || 0
      this.commands.push(`OFFSET ${offsetX} mm`)
    }
    
    // Anclar origen y configurar referencia
    this.commands.push(`REFERENCE 0,0`)     // (0,0) esquina superior izquierda
    this.commands.push(`DIRECTION 1`)       // dirección de impresión
    this.commands.push(`DENSITY 8`)         // densidad de impresión
    this.commands.push(`SPEED 4`)           // velocidad de impresión
    
    // Limpiar buffer
    this.commands.push('CLS')
  }

  /**
   * Agrega texto a la etiqueta
   */
  addText(config: TSPLTextConfig): void {
    const x = this.mmToPoints(config.x)
    const y = this.mmToPoints(config.y)
    
    // Sintaxis correcta TSPL: TEXT X,Y,"font",rotation,x-multiplication,y-multiplication,"content"
    const command = `TEXT ${x},${y},"${config.font}",${config.rotation},${config.xMultiplication},${config.yMultiplication},"${config.content}"`
    
    this.commands.push(command)
  }

  /**
   * Agrega código de barras a la etiqueta
   */
  addBarcode(config: TSPLBarcodeConfig): void {
    const x = this.mmToPoints(config.x)
    const y = this.mmToPoints(config.y)
    const height = this.mmToPoints(config.height)
    
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
}

/**
 * Función de utilidad para generar una etiqueta completa de producto - CORREGIDA
 */
export function generateTestLabelTSPL(
  labelSize: string = '51x25',
  copies: number = 1
): string {
  const config = TSPL_LABEL_CONFIGS[labelSize] || TSPL_LABEL_CONFIGS['51x25']
  const generator = new TSPLGenerator(config)
  
  generator.startLabel()
  
  if (labelSize === '51x25') {
    // Título (centrado automáticamente)
    const titleXDots = generator.getCenteredXDotsForText('ETIQUETA DE PRUEBA', '2', 1)
    const titleX = generator.getCenteredXmmFromDots(titleXDots)
    generator.addText({
      x: titleX,
      y: 2,
      font: '2',
      rotation: 0,
      xMultiplication: 1,
      yMultiplication: 1,
      content: 'ETIQUETA DE PRUEBA'
    })
    
    // Código de barras (centrado automáticamente)
    const barcodeXDots = generator.getCenteredXDotsForBarcode('128', '1234567890123', 2)
    const barcodeX = generator.getCenteredXmmFromDots(barcodeXDots)
    generator.addBarcode({
      x: barcodeX,
      y: 8,
      codeType: '128',
      height: 8,
      humanReadable: 2, // texto centrado debajo del código
      rotation: 0,
      narrow: 2,
      wide: 2,
      content: '1234567890123'
    })
    
    // Precio (centrado automáticamente)
    const priceXDots = generator.getCenteredXDotsForText('$99.99', '3', 1)
    const priceX = generator.getCenteredXmmFromDots(priceXDots)
    generator.addText({
      x: priceX,
      y: 20,
      font: '3',
      rotation: 0,
      xMultiplication: 1,
      yMultiplication: 1,
      content: '$99.99'
    })
  } else if (labelSize === '51x25') {
      // Configuración específica para etiquetas 51x25 (centrado automáticamente)
    const titleXDots = generator.getCenteredXDotsForText('ETIQUETA DE PRUEBA', '2', 1)
    const titleX = generator.getCenteredXmmFromDots(titleXDots)
    generator.addText({
      x: titleX,
      y: 1,
      font: '2',
      rotation: 0,
      xMultiplication: 1,
      yMultiplication: 1,
      content: 'ETIQUETA DE PRUEBA'
    })
    
    // Código de barras (centrado automáticamente)
    const barcodeXDots = generator.getCenteredXDotsForBarcode('128', '1234567890123', 2)
    const barcodeX = generator.getCenteredXmmFromDots(barcodeXDots)
    generator.addBarcode({
      x: barcodeX,
      y: 6,
      codeType: '128',
      height: 6,
      humanReadable: 2, // texto centrado debajo del código
      rotation: 0,
      narrow: 2,
      wide: 2,
      content: '1234567890123'
    })
    
    // Precio (centrado automáticamente)
    const priceXDots = generator.getCenteredXDotsForText('$99.99', '3', 1)
    const priceX = generator.getCenteredXmmFromDots(priceXDots)
    generator.addText({
      x: priceX,
      y: 16,
      font: '3',
      rotation: 0,
      xMultiplication: 1,
      yMultiplication: 1,
      content: '$99.99'
    })
  } else {
    // Configuración genérica para otros tamaños (centrado automático)
    const titleXDots = generator.getCenteredXDotsForText('ETIQUETA DE PRUEBA', '2', 1)
    const titleX = generator.getCenteredXmmFromDots(titleXDots)
    
    generator.addText({
      x: titleX,
      y: 2,
      font: '2',
      rotation: 0,
      xMultiplication: 1,
      yMultiplication: 1,
      content: 'ETIQUETA DE PRUEBA'
    })
    
    const barcodeXDots = generator.getCenteredXDotsForBarcode('128', '1234567890123', 2)
    const barcodeX = generator.getCenteredXmmFromDots(barcodeXDots)
    generator.addBarcode({
      x: barcodeX,
      y: config.labelHeight * 0.3,
      codeType: '128',
      height: config.labelHeight * 0.4,
      humanReadable: 2,
      rotation: 0,
      narrow: 2,
      wide: 2,
      content: '1234567890123'
    })
    
    const priceXDots = generator.getCenteredXDotsForText('$99.99', '3', 1)
    const priceX = generator.getCenteredXmmFromDots(priceXDots)
    generator.addText({
      x: priceX,
      y: config.labelHeight * 0.8,
      font: '3',
      rotation: 0,
      xMultiplication: 1,
      yMultiplication: 1,
      content: '$99.99'
    })
  }
  
  generator.finishLabel(copies)
  generator.endJob()
  
  return generator.getCommandString()
}

/**
 * Función para generar etiqueta de prueba con las nuevas configuraciones de centrado
 */
export function generateUpdatedTestLabel(
  labelSize: string = '51x25'
): string {
  const testData: TSPLLabelData = {
    name: 'PRODUCTO PRUEBA',
    barcode: '1234567890123',
    price: 99.99,
    sku: 'TEST001'
  }
  
  const commands = generateProductLabelTSPL(testData, labelSize, 1)
  
  // Debug: Guardar comandos generados para verificación
  console.log('=== COMANDOS TSPL GENERADOS (DEBUG) ===')
  console.log('Tamaño de etiqueta:', labelSize)
  console.log('Comandos:')
  console.log(commands)
  console.log('=== FIN DEBUG ===')
  
  return commands
}

/**
 * Función para generar patrones de prueba para verificar centrado y uso completo de la etiqueta
 */
export function generateCenteringTestPattern(
  labelSize: string = '51x25'
): string {
  const config = TSPL_LABEL_CONFIGS[labelSize] || TSPL_LABEL_CONFIGS['51x25']
  const generator = new TSPLGenerator(config)
  
  generator.startLabel()

  // Líneas de referencia en las esquinas para verificar márgenes
  generator.addText({
    x: config.marginLeft || 0,
    y: config.marginTop || 0,
    font: '1',
    rotation: 0,
    xMultiplication: 1,
    yMultiplication: 1,
    content: '+'
  })

  // Esquina superior derecha
  generator.addText({
    x: config.labelWidth - (config.marginRight || 0) - 1,
    y: config.marginTop || 0,
    font: '1',
    rotation: 0,
    xMultiplication: 1,
    yMultiplication: 1,
    content: '+'
  })

  // Texto centrado para verificar alineación
  const centerTextXDots = generator.getCenteredXDotsForText('CENTRO', '2', 1)
  const centerTextX = generator.getCenteredXmmFromDots(centerTextXDots)
  generator.addText({
    x: centerTextX,
    y: config.labelHeight / 2 - 2,
    font: '2',
    rotation: 0,
    xMultiplication: 1,
    yMultiplication: 1,
    content: 'CENTRO'
  })

  // Código de barras centrado
  const centerBarcodeXDots = generator.getCenteredXDotsForBarcode('128', 'CENTER', 2)
  const centerBarcodeX = generator.getCenteredXmmFromDots(centerBarcodeXDots)
  generator.addBarcode({
    x: centerBarcodeX,
    y: config.labelHeight / 2 + 2,
    codeType: '128',
    height: 4,
    humanReadable: 1,
    rotation: 0,
    narrow: 2,
    wide: 2,
    content: 'CENTER'
  })

  generator.finishLabel(1)
  generator.endJob()
  return generator.getCommandString()
}

/**
 * Función para generar patrón de prueba de márgenes para verificar área imprimible
 */
export function generateMarginTestPattern(
  labelSize: string = '51x25'
): string {
  const config = TSPL_LABEL_CONFIGS[labelSize] || TSPL_LABEL_CONFIGS['51x25']
  const generator = new TSPLGenerator(config)
  
  generator.startLabel()

  // Marco completo para mostrar área imprimible
  const marginLeft = config.marginLeft || 0
  const marginRight = config.marginRight || 0
  const marginTop = config.marginTop || 0
  const marginBottom = config.marginBottom || 0
  
  const usableWidth = config.labelWidth - marginLeft - marginRight
  const usableHeight = config.labelHeight - marginTop - marginBottom

  // Líneas horizontales superior e inferior
  for (let i = 0; i < usableWidth; i += 4) {
    generator.addText({
      x: marginLeft + i,
      y: marginTop,
      font: '1',
      rotation: 0,
      xMultiplication: 1,
      yMultiplication: 1,
      content: '-'
    })
    
    generator.addText({
      x: marginLeft + i,
      y: config.labelHeight - marginBottom - 2,
      font: '1',
      rotation: 0,
      xMultiplication: 1,
      yMultiplication: 1,
      content: '-'
    })
  }

  // Líneas verticales izquierda y derecha
  for (let i = 0; i < usableHeight; i += 4) {
    generator.addText({
      x: marginLeft,
      y: marginTop + i,
      font: '1',
      rotation: 0,
      xMultiplication: 1,
      yMultiplication: 1,
      content: '|'
    })
    
    generator.addText({
      x: config.labelWidth - marginRight - 2,
      y: marginTop + i,
      font: '1',
      rotation: 0,
      xMultiplication: 1,
      yMultiplication: 1,
      content: '|'
    })
  }

  // Texto central indicando dimensiones
  const dimensionText = `${config.labelWidth}x${config.labelHeight}`
  const dimensionXDots = generator.getCenteredXDotsForText(dimensionText, '1', 1)
  const dimensionX = generator.getCenteredXmmFromDots(dimensionXDots)
  generator.addText({
    x: dimensionX,
    y: config.labelHeight / 2,
    font: '1',
    rotation: 0,
    xMultiplication: 1,
    yMultiplication: 1,
    content: dimensionText
  })

  generator.finishLabel(1)
  generator.endJob()
  return generator.getCommandString()
}

export function generateProductLabelTSPL(
  labelData: TSPLLabelData,
  labelSize: string = '51x25',
  copies: number = 1
): string {
  const config = TSPL_LABEL_CONFIGS[labelSize] || TSPL_LABEL_CONFIGS['51x25']
  const generator = new TSPLGenerator(config)
  
  generator.startLabel()
  
  if (labelSize === '51x25') {
    // Nombre del producto - centrado con nuevos cálculos de márgenes
    const productName = labelData.name.substring(0, 16)
    const nameXDots = generator.getCenteredXDotsForText(productName, '2', 1)
    const nameX = generator.getCenteredXmmFromDots(nameXDots)
    generator.addText({
      x: nameX,
      y: 2,
      font: '2',
      rotation: 0,
      xMultiplication: 1,
      yMultiplication: 1,
      content: productName
    })
    
    // Código de barras - centrado con nuevos cálculos de márgenes
    if (labelData.barcode) {
      const barcodeXDots = generator.getCenteredXDotsForBarcode('128', labelData.barcode, 1)
      const barcodeX = generator.getCenteredXmmFromDots(barcodeXDots)
      generator.addBarcode({
        x: barcodeX,
        y: 8,
        codeType: detectBarcodeType(labelData.barcode),
        height: 8,
        humanReadable: 2,
        rotation: 0,
        narrow: 1,
        wide: 2,
        content: labelData.barcode
      })
    }
    
    // Precio - centrado con nuevos cálculos de márgenes
    const priceText = `$${labelData.price.toFixed(2)}`
    const priceXDots = generator.getCenteredXDotsForText(priceText, '3', 1)
    const priceX = generator.getCenteredXmmFromDots(priceXDots)
    generator.addText({
      x: priceX,
      y: 18,
      font: '3',
      rotation: 0,
      xMultiplication: 1,
      yMultiplication: 1,
      content: priceText
    })
  } else if (labelSize === '50x20') {
    // Configuración específica para etiquetas 50x20mm
    const productName = labelData.name.substring(0, 14)
    const nameXDots = generator.getCenteredXDotsForText(productName, '2', 1)
    const nameX = generator.getCenteredXmmFromDots(nameXDots)
    generator.addText({
      x: nameX,
      y: 1,
      font: '2',
      rotation: 0,
      xMultiplication: 1,
      yMultiplication: 1,
      content: productName
    })
    
    // Código de barras - centrado con nuevos cálculos de márgenes
    if (labelData.barcode) {
      const barcodeXDots = generator.getCenteredXDotsForBarcode('128', labelData.barcode, 1)
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
    
    // Precio - centrado con nuevos cálculos de márgenes
    const priceText = `$${labelData.price.toFixed(2)}`
    const priceXDots = generator.getCenteredXDotsForText(priceText, '3', 1)
    const priceX = generator.getCenteredXmmFromDots(priceXDots)
    generator.addText({
      x: priceX,
      y: 15,
      font: '3',
      rotation: 0,
      xMultiplication: 1,
      yMultiplication: 1,
      content: priceText
    })
  } else if (labelSize === '2x1inch') {
    // Configuración optimizada para etiquetas de 2x1 pulgadas (50.8x25.4mm)
    // Layout horizontal aprovechando el ancho disponible
    const productName = labelData.name.substring(0, 30) // Más caracteres por el ancho mayor
    
    // Dividir el espacio horizontalmente: texto a la izquierda, código de barras al centro, precio a la derecha
    
    // Nombre del producto - lado izquierdo
    generator.addText({
      x: 3, // Margen izquierdo
      y: 3,
      font: '2',
      rotation: 0,
      xMultiplication: 1,
      yMultiplication: 1,
      content: productName
    })
    
    // SKU o información adicional - debajo del nombre
    if (labelData.sku) {
      generator.addText({
        x: 3,
        y: 8,
        font: '1',
        rotation: 0,
        xMultiplication: 1,
        yMultiplication: 1,
        content: `SKU: ${labelData.sku}`
      })
    }
    
    // Código de barras - centro-derecha
    if (labelData.barcode) {
      generator.addBarcode({
        x: 25, // Posición central-derecha
        y: 2,
        codeType: detectBarcodeType(labelData.barcode),
        height: 8,
        humanReadable: 2,
        rotation: 0,
        narrow: 1,
        wide: 2,
        content: labelData.barcode
      })
    }
    
    // Precio - esquina inferior derecha, más grande
    const priceText = `$${labelData.price.toFixed(2)}`
    generator.addText({
      x: 35, // Lado derecho
      y: 18,
      font: '4', // Fuente más grande para el precio
      rotation: 0,
      xMultiplication: 1,
      yMultiplication: 1,
      content: priceText
    })
  } else {
    // Configuración genérica para otros tamaños (centrado automático)
    const productName = labelData.name.substring(0, Math.floor(config.labelWidth * 0.8)) // Ajustar según ancho
    const nameXDots = generator.getCenteredXDotsForText(productName, '2', 1)
    const nameX = generator.getCenteredXmmFromDots(nameXDots)
    
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
      const barcodeXDots = generator.getCenteredXDotsForBarcode('128', labelData.barcode, 1)
      const barcodeX = generator.getCenteredXmmFromDots(barcodeXDots)
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
    const priceXDots = generator.getCenteredXDotsForText(priceText, '3', 1)
    const priceX = generator.getCenteredXmmFromDots(priceXDots)
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
  
  generator.finishLabel(copies)
  generator.endJob()
  
  return generator.getCommandString()
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
      const nameX = generator.pointsToMm(generator.getCenteredX(productName.length, 2))
      
      // Nombre del producto
      generator.addText({
        x: nameX,
        y: 1,
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
      const priceX = generator.pointsToMm(generator.getCenteredX(priceText.length, 3))
      generator.addText({
        x: priceX,
        y: 16,
        font: '3', // Fuente más grande
        rotation: 0,
        xMultiplication: 1,
        yMultiplication: 1,
        content: priceText
      })
    } else if (labelSize === '51x25') {
      // Configuración específica para etiquetas 51x25 (centrado automático)
      const productName = labelData.name.substring(0, 16) // Reducir caracteres para evitar cortes
      const nameX = generator.pointsToMm(generator.getCenteredX(productName.length, 2))
      
      // Nombre del producto
      generator.addText({
        x: nameX,
        y: 1,
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
          y: 5,
          codeType: detectBarcodeType(labelData.barcode),
          height: 5,
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
        y: 14,
        font: '3', // Fuente más grande
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
}/**
 * Genera una etiqueta de prueba específica para 2x1 pulgadas
 */
export function generate2x1InchTestLabel(): string {
  const testData: TSPLLabelData = {
    name: 'Producto de Prueba 2x1"',
    barcode: '1234567890123',
    price: 29.99,
    sku: 'SKU-2X1-001'
  }
  
  return generateProductLabelTSPL(testData, '2x1inch', 1)
}