/**
 * Componente para impresión TSPL via Bluetooth
 * Integra la funcionalidad TSPL con la interfaz de usuario
 */

'use client'

import React, { useState } from 'react'

// CSS para animación de spin
const spinKeyframes = `
  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
`

// Inyectar CSS si no existe
if (typeof document !== 'undefined') {
  const styleId = 'tspl-printer-styles'
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style')
    style.id = styleId
    style.textContent = spinKeyframes
    document.head.appendChild(style)
  }
}
import { 
  Bluetooth, 
  BluetoothConnected, 
  Printer, 
  Settings, 
  AlertCircle,
  CheckCircle,
  Loader2,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight
} from 'lucide-react'
import { useTSPLPrinter } from '../hooks/useTSPLPrinter'
import { TSPLLabelData, TSPL_LABEL_CONFIGS } from '@/lib/tsplGenerator'

export interface TSPLPrinterProps {
  selectedProducts?: any[]
  onPrintSuccess?: () => void
  onPrintError?: (error: string) => void
  className?: string
}

export function TSPLPrinter({ 
  selectedProducts = [], 
  onPrintSuccess,
  onPrintError,
  className 
}: TSPLPrinterProps) {
  const {
    isConnected,
    isPrinting,
    error,
    debugInfo,
    connectToPrinter,
    disconnectFromPrinter,
    printProductLabel,
    printMultipleProductLabels,
    printTestLabel,
    printTestArriba,
    printTestAbajo,
    printTestIzquierda,
    printTestDerecha,
    printTestCentro,
    sendTSPLCommands,
    validateTSPLCommands,
    getConnectionStatus,
    clearError,
    device,
    isConnecting
  } = useTSPLPrinter()

  // Estados locales para configuración
  const [labelSize, setLabelSize] = useState('51x25')
  const [copies, setCopies] = useState(1)
  const [showDebugInfo, setShowDebugInfo] = useState(false)
  const [validateCommands, setValidateCommands] = useState(true)


  /**
   * Maneja la conexión/desconexión
   */
  const handleConnectionToggle = async () => {
    if (isConnected) {
      await disconnectFromPrinter()
    } else {
      const success = await connectToPrinter()
      if (!success && onPrintError) {
        onPrintError('No se pudo conectar a la impresora')
      }
    }
  }

  /**
   * Imprime las etiquetas seleccionadas
   */
  const handlePrintSelected = async () => {
    if (selectedProducts.length === 0) {
      onPrintError?.('No hay productos seleccionados')
      return
    }

    // Convertir productos a formato TSPL
    const labels: TSPLLabelData[] = selectedProducts.map(product => ({
      name: product.nombre || product.name || 'Sin nombre',
      barcode: product.codigo_barras || product.barcode || '',
      price: parseFloat(product.precio_venta || product.price || '0'),
      sku: product.sku || product.codigo || ''
    }))

    const success = await printMultipleProductLabels(labels, {
      labelSize,
      copies,
      validateCommands,
      showDebugInfo
    })

    if (success) {
      onPrintSuccess?.()
    } else {
      onPrintError?.('Error al imprimir las etiquetas')
    }
  }

  /**
   * Imprime una etiqueta de prueba
   */
  const handlePrintTest = async () => {
    const success = await printTestLabel(labelSize)
    
    if (success) {
      onPrintSuccess?.()
    } else {
      onPrintError?.('Error al imprimir la etiqueta de prueba')
    }
  }



  /**
   * Obtiene el estado de conexión para mostrar
   */
  const connectionStatus = getConnectionStatus()

  return (
    <div 
      className={className}
      style={{
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        backgroundColor: 'white',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
      }}
    >
      {/* Header */}
      <div style={{
        padding: '16px',
        borderBottom: '1px solid #e5e7eb'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '18px',
          fontWeight: '600'
        }}>
          <Printer style={{ width: '20px', height: '20px' }} />
          Impresión TSPL Bluetooth
        </div>
      </div>
      
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Estado de conexión */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {isConnected ? (
              <BluetoothConnected style={{ width: '16px', height: '16px', color: '#3b82f6' }} />
            ) : (
              <Bluetooth style={{ width: '16px', height: '16px', color: '#9ca3af' }} />
            )}
            <span style={{ fontSize: '14px', fontWeight: '500' }}>
              {isConnected ? `Conectado: ${device?.name || 'Impresora'}` : 'Desconectado'}
            </span>
          </div>
          
          <span style={{
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '12px',
            fontWeight: '500',
            backgroundColor: isConnected ? '#3b82f6' : '#6b7280',
            color: 'white'
          }}>
            {isConnected ? 'Conectado' : 'Desconectado'}
          </span>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '6px'
          }}>
            <AlertCircle style={{ width: '16px', height: '16px', color: '#ef4444' }} />
            <span style={{ fontSize: '14px', color: '#b91c1c', flex: 1 }}>{error}</span>
            <button 
              onClick={clearError}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '16px',
                color: '#b91c1c'
              }}
            >
              ×
            </button>
          </div>
        )}

        {/* Información de debug */}
        {showDebugInfo && debugInfo && (
          <div style={{
            padding: '12px',
            backgroundColor: '#f9fafb',
            border: '1px solid #e5e7eb',
            borderRadius: '6px'
          }}>
            <div style={{ fontSize: '12px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>Información de Debug:</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '12px', color: '#6b7280' }}>
              <div>Comandos totales: {debugInfo.totalCommands}</div>
              <div>Comandos TEXT: {debugInfo.textCommands}</div>
              <div>Comandos BARCODE: {debugInfo.barcodeCommands}</div>
              <div>Etiquetas estimadas: {debugInfo.estimatedLabels}</div>
            </div>
          </div>
        )}

        {/* Separador */}
        <div style={{ height: '1px', backgroundColor: '#e5e7eb' }}></div>

        {/* Configuración */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Settings style={{ width: '16px', height: '16px' }} />
            <span style={{ fontSize: '14px', fontWeight: '500' }}>Configuración</span>
          </div>

          {/* Tamaño de etiqueta y copias */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: '500', display: 'block', marginBottom: '4px' }}>Tamaño de etiqueta</label>
              <select 
                value={labelSize} 
                onChange={(e) => setLabelSize(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              >
                {Object.entries(TSPL_LABEL_CONFIGS).map(([key, config]) => (
                  <option key={key} value={key}>
                    {key} ({config.labelWidth}×{config.labelHeight}mm)
                  </option>
                ))}
              </select>
            </div>

            {/* Número de copias */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: '500', display: 'block', marginBottom: '4px' }}>Copias</label>
              <input
                type="number"
                min="1"
                max="99"
                value={copies}
                onChange={(e) => setCopies(parseInt(e.target.value) || 1)}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              />
            </div>
          </div>



          {/* Opciones avanzadas */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <label style={{ fontSize: '12px', fontWeight: '500' }}>Validar comandos</label>
              <input
                type="checkbox"
                checked={validateCommands}
                onChange={(e) => setValidateCommands(e.target.checked)}
                style={{ width: '16px', height: '16px' }}
              />
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <label style={{ fontSize: '12px', fontWeight: '500' }}>Mostrar debug</label>
              <input
                type="checkbox"
                checked={showDebugInfo}
                onChange={(e) => setShowDebugInfo(e.target.checked)}
                style={{ width: '16px', height: '16px' }}
              />
            </div>
          </div>
        </div>

        {/* Separador */}
        <div style={{ height: '1px', backgroundColor: '#e5e7eb' }}></div>

        {/* Botones de acción */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {/* Botón de conexión/desconexión */}
          <button
            onClick={handleConnectionToggle}
            disabled={isConnecting}
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #dc2626',
              borderRadius: '6px',
              backgroundColor: isConnected ? '#dc2626' : '#fef2f2',
              color: isConnected ? '#ffffff' : '#dc2626',
              fontSize: '14px',
              fontWeight: '500',
              cursor: isConnecting ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              opacity: isConnecting ? 0.6 : 1
            }}
          >
            {isConnecting ? (
              <>
                <Loader2 style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} />
                Conectando...
              </>
            ) : isConnected ? (
              <>
                <BluetoothConnected style={{ width: '16px', height: '16px' }} />
                Desconectar
              </>
            ) : (
              <>
                <Bluetooth style={{ width: '16px', height: '16px' }} />
                Conectar Impresora
              </>
            )}
          </button>

          {/* Configuración de etiqueta */}
          <div style={{ marginTop: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
              Tamaño de Etiqueta:
            </label>
            <select
              value={labelSize}
              onChange={(e) => setLabelSize(e.target.value)}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                fontSize: '14px'
              }}
            >
              {Object.keys(TSPL_LABEL_CONFIGS).map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>

          {/* Número de copias */}
          <div style={{ marginTop: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
              Copias:
            </label>
            <input
              type="number"
              min="1"
              max="10"
              value={copies}
              onChange={(e) => setCopies(parseInt(e.target.value) || 1)}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                fontSize: '14px'
              }}
            />
          </div>

          {/* Imprimir etiqueta de prueba */}
          <button
            onClick={() => printTestLabel(labelSize)}
            disabled={!isConnected || isPrinting}
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #059669',
              borderRadius: '6px',
              backgroundColor: '#f0fdf4',
              color: '#059669',
              fontSize: '14px',
              fontWeight: '500',
              cursor: (!isConnected || isPrinting) ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              opacity: (!isConnected || isPrinting) ? 0.6 : 1
            }}
          >
            {isPrinting ? (
              <>
                <Loader2 style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} />
                Imprimiendo...
              </>
            ) : (
              <>
                <Printer style={{ width: '16px', height: '16px' }} />
                Imprimir Etiqueta de Prueba
              </>
            )}
          </button>

          {/* Espacio para pruebas de movimiento direccional (eliminados) */}

          {/* Imprimir etiquetas seleccionadas */}
          {selectedProducts.length > 0 && (
            <button
              onClick={handlePrintSelected}
              disabled={!isConnected || isPrinting}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #7c3aed',
                borderRadius: '6px',
                backgroundColor: '#f3f4f6',
                color: '#7c3aed',
                fontSize: '14px',
                fontWeight: '500',
                cursor: (!isConnected || isPrinting) ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                opacity: (!isConnected || isPrinting) ? 0.6 : 1
              }}
            >
              {isPrinting ? (
                <>
                  <Loader2 style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} />
                  Imprimiendo...
                </>
              ) : (
                <>
                  <Printer style={{ width: '16px', height: '16px' }} />
                  Imprimir {selectedProducts.length} Etiqueta{selectedProducts.length > 1 ? 's' : ''}
                </>
              )}
            </button>
          )}


        </div>

        {/* Información adicional */}
        {!connectionStatus.isAvailable && (
          <div style={{
            padding: '12px',
            backgroundColor: '#fffbeb',
            border: '1px solid #fde68a',
            borderRadius: '6px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircle style={{ width: '16px', height: '16px', color: '#d97706' }} />
              <span style={{ fontSize: '14px', color: '#92400e' }}>
                Web Bluetooth no está disponible en este navegador
              </span>
            </div>
          </div>
        )}

        {isConnected && (
          <div style={{
            padding: '12px',
            backgroundColor: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: '6px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle style={{ width: '16px', height: '16px', color: '#16a34a' }} />
              <span style={{ fontSize: '14px', color: '#15803d' }}>
                Listo para imprimir etiquetas TSPL
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default TSPLPrinter