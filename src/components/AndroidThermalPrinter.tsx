'use client';

import React, { useState, useEffect } from 'react';
// Importar el ConectorEscposAndroid funcional del ejemplo original
const ConectorEscposAndroid = require('@/utils/ConectorEscposAndroid.js');

interface AndroidThermalPrinterProps {
  sale?: any;
  onPrint?: (success: boolean, message?: string) => void;
}

export default function AndroidThermalPrinter({ sale, onPrint }: AndroidThermalPrinterProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [printerMac, setPrinterMac] = useState('');
  const [serial, setSerial] = useState('');
  const [error, setError] = useState('');
  const [availablePrinters, setAvailablePrinters] = useState<string[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [phoneIp, setPhoneIp] = useState('192.168.0.1'); // IP por defecto basada en la imagen

  // Probar conexión al cargar
  useEffect(() => {
    testConnection();
  }, []);

  const testConnection = async () => {
    try {
      const connected = await ConectorEscposAndroid.testConnection(undefined, phoneIp);
      setIsConnected(connected);
      if (connected) {
        setError('');
        // Intentar obtener impresoras disponibles
        const printers = await ConectorEscposAndroid.obtenerImpresorasConIp(phoneIp);
        setAvailablePrinters(printers);
      } else {
        setError(`No se puede conectar al plugin de Android en ${phoneIp}:8000. Verifica que esté ejecutándose y que la IP sea correcta.`);
      }
    } catch (error) {
      setIsConnected(false);
      setError(`Error al conectar con el plugin de Android en ${phoneIp}:8000`);
    }
  };

  const printTicket = async () => {
    if (!sale) {
      setError('No hay datos de venta para imprimir');
      return;
    }

    if (!printerMac) {
      setError('Debes especificar la dirección MAC de la impresora');
      return;
    }

    setIsPrinting(true);
    setError('');

    try {
      // Preparar datos del ticket
      const items = sale.items?.map((item: any) => ({
        nombre: item.product?.name || item.name || 'Producto',
        precio: item.price || 0,
        cantidad: item.quantity || 1
      })) || [];

      const subtotal = sale.subtotal || items.reduce((sum: number, item: any) => sum + (item.precio * item.cantidad), 0);
      const total = sale.total || subtotal;

      // Generar ticket usando method chaining
      const conector = ConectorEscposAndroid.generarTicketBasico(
        'BAZAR - ENVÍOS PERROS',
        items,
        subtotal,
        total,
        new Date().toLocaleString(),
        serial
      );
      
      // Configurar IP del teléfono
      conector.setPhoneIp(phoneIp);

      // Imprimir ticket
      const result = await conector.imprimirEn(printerMac);

      if (result === true) {
        setError('');
        onPrint?.(true, 'Ticket impreso exitosamente');
      } else {
        setError(result as string || 'Error al imprimir');
        onPrint?.(false, result as string);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setError(`Error al imprimir: ${errorMessage}`);
      onPrint?.(false, errorMessage);
    } finally {
      setIsPrinting(false);
    }
  };

  const printTicketWithLogo = async () => {
    if (!printerMac) {
      setError('Por favor ingresa la MAC de la impresora');
      return;
    }

    setIsPrinting(true);
    setError('');

    try {
      // Crear el conector con la URL personalizada
      const urlPlugin = phoneIp ? `http://${phoneIp}:8000` : 'http://localhost:8000';
      const conector = new ConectorEscposAndroid(serial, urlPlugin);
      
      // Generar ticket con logo usando el patrón del ejemplo funcional
      conector
        .Iniciar()
        .EstablecerAlineacion(ConectorEscposAndroid.ALINEACION_CENTRO)
        .Feed(1)
        .DescargarImagenDeInternetEImprimir('https://res.cloudinary.com/dhwlirnis/image/upload/v1754606987/productos/rqyo1uuaimih7a5lof6d.png', 0, 200)
        .Iniciar()
        .Feed(1)
        .EstablecerAlineacion(ConectorEscposAndroid.ALINEACION_CENTRO)
        .EscribirTexto('BAZAR - ENVÍOS PERROS\n')
        .EscribirTexto('Sistema de envíos\n')
        .EscribirTexto('Teléfono: 123456789\n')
        .EscribirTexto('Fecha: ' + new Date().toLocaleString() + '\n')
        .Feed(1)
        .EstablecerAlineacion(ConectorEscposAndroid.ALINEACION_IZQUIERDA)
        .EscribirTexto('____________________\n')
        .EscribirTexto('Producto 1 (x2)\n')
        .EstablecerAlineacion(ConectorEscposAndroid.ALINEACION_DERECHA)
        .EscribirTexto('$21.00\n')
        .EstablecerAlineacion(ConectorEscposAndroid.ALINEACION_IZQUIERDA)
        .EscribirTexto('Producto 2 (x1)\n')
        .EstablecerAlineacion(ConectorEscposAndroid.ALINEACION_DERECHA)
        .EscribirTexto('$25.00\n')
        .EstablecerAlineacion(ConectorEscposAndroid.ALINEACION_IZQUIERDA)
        .EscribirTexto('Envío\n')
        .EstablecerAlineacion(ConectorEscposAndroid.ALINEACION_DERECHA)
        .EscribirTexto('$5.00\n')
        .EscribirTexto('____________________\n')
        .EscribirTexto('TOTAL: $51.00\n')
        .EscribirTexto('____________________\n')
        .EstablecerAlineacion(ConectorEscposAndroid.ALINEACION_CENTRO)
        .EstablecerEnfatizado(true)
        .EstablecerTamañoFuente(1, 1)
        .EscribirTexto('¡Gracias por su compra!\n')
        .Feed(2)
        .Corte(1);
      
      const result = await conector.imprimirEn(printerMac);
      
      if (result === true) {
        setError('');
        onPrint?.(true, 'Ticket con logo impreso exitosamente');
      } else {
        setError(result as string || 'Error al imprimir');
        onPrint?.(false, result as string);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setError(`Error al imprimir: ${errorMessage}`);
      onPrint?.(false, errorMessage);
    } finally {
      setIsPrinting(false);
    }
  };

  const printTest = async () => {
    if (!printerMac) {
      setError('Por favor ingresa la MAC de la impresora');
      return;
    }

    setIsPrinting(true);
    setError('');

    try {
      // Crear el conector con la URL personalizada
      const urlPlugin = phoneIp ? `http://${phoneIp}:8000` : 'http://localhost:8000';
      const conector = new ConectorEscposAndroid(serial, urlPlugin);
      
      // Generar ticket de prueba usando el patrón del ejemplo funcional
      conector
        .Iniciar()
        .EstablecerAlineacion(ConectorEscposAndroid.ALINEACION_CENTRO)
        .Feed(1)
        .EscribirTexto('TICKET DE PRUEBA\n')
        .EscribirTexto('Bazar - EnviosPerros\n')
        .EscribirTexto('Fecha: ' + new Date().toLocaleString() + '\n')
        .Feed(1)
        .EstablecerAlineacion(ConectorEscposAndroid.ALINEACION_IZQUIERDA)
        .EscribirTexto('Prueba de impresión\n')
        .EscribirTexto('Plugin funcionando correctamente\n')
        .Feed(1)
        .EstablecerAlineacion(ConectorEscposAndroid.ALINEACION_CENTRO)
        .EscribirTexto('¡Impresión exitosa!\n')
        .Feed(2)
        .Corte(1);
      
      const result = await conector.imprimirEn(printerMac);
      
      if (result === true) {
        setError('');
        onPrint?.(true, 'Prueba de impresión exitosa');
      } else {
        setError(result as string || 'Error en la prueba de impresión');
        onPrint?.(false, result as string);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setError(`Error en la prueba: ${errorMessage}`);
      onPrint?.(false, errorMessage);
    } finally {
      setIsPrinting(false);
    }
  };

  const printCustomTicket = async () => {
    if (!printerMac) {
      setError('Por favor ingresa la MAC de la impresora');
      return;
    }

    setIsPrinting(true);
    setError('');

    try {
      // Crear el conector con la URL personalizada
      const urlPlugin = phoneIp ? `http://${phoneIp}:8000` : 'http://localhost:8000';
      const conector = new ConectorEscposAndroid(serial, urlPlugin);
      
      // Crear ticket personalizado siguiendo el patrón del ejemplo funcional
      conector
        .Iniciar()
        .EstablecerAlineacion(ConectorEscposAndroid.ALINEACION_CENTRO)
        .Feed(1)
        .DescargarImagenDeInternetEImprimir('https://res.cloudinary.com/dhwlirnis/image/upload/v1754606987/productos/rqyo1uuaimih7a5lof6d.png', 0, 200)
        .Iniciar()
        .Feed(1)
        .EstablecerAlineacion(ConectorEscposAndroid.ALINEACION_CENTRO)
        .EscribirTexto('Bazar - EnviosPerros\n')
        .EscribirTexto('Demostración completa\n')
        .EscribirTexto('Teléfono: 123456789\n')
        .EscribirTexto('Fecha: ' + new Date().toLocaleString() + '\n')
        .Feed(1)
        .EstablecerAlineacion(ConectorEscposAndroid.ALINEACION_IZQUIERDA)
        .EscribirTexto('____________________\n')
        .EscribirTexto('Producto ejemplo\n')
        .EstablecerAlineacion(ConectorEscposAndroid.ALINEACION_DERECHA)
        .EscribirTexto('$25.00\n')
        .EscribirTexto('____________________\n')
        .EscribirTexto('TOTAL: $25.00\n')
        .EscribirTexto('____________________\n')
        .EstablecerAlineacion(ConectorEscposAndroid.ALINEACION_CENTRO)
        .EstablecerEnfatizado(true)
        .EstablecerTamañoFuente(1, 1)
        .EscribirTexto('¡Gracias por su compra!\n')
        .Feed(1)
        .ImprimirCodigoDeBarras('qr', 'https://bazar-enviosperros.com', ConectorEscposAndroid.TAMAÑO_IMAGEN_NORMAL, 160, 160)
        .Iniciar()
        .EstablecerAlineacion(ConectorEscposAndroid.ALINEACION_CENTRO)
        .Feed(1)
        .ImprimirCodigoDeBarras('code128', 'bazar-enviosperros', ConectorEscposAndroid.TAMAÑO_IMAGEN_NORMAL, 200, 50)
        .Iniciar()
        .EstablecerAlineacion(ConectorEscposAndroid.ALINEACION_CENTRO)
        .Feed(1)
        .EstablecerTamañoFuente(1, 1)
        .EscribirTexto('bazar-enviosperros.com\n')
        .Feed(2)
        .Corte(1)
        .Pulso(48, 60, 120);
      
      const result = await conector.imprimirEn(printerMac);
      
      if (result === true) {
        setError('');
        onPrint?.(true, 'Ticket personalizado impreso exitosamente');
      } else {
        setError(result as string || 'Error al imprimir ticket personalizado');
        onPrint?.(false, result as string);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setError(`Error en la impresión personalizada: ${errorMessage}`);
      onPrint?.(false, errorMessage);
    } finally {
      setIsPrinting(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">🖨️ Impresión con Plugin Android</h3>
      
      {/* Estado de conexión */}
      <div className={`p-3 rounded mb-4 ${isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
        <div className="flex items-center">
          <span className={`w-3 h-3 rounded-full mr-2 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></span>
          {isConnected ? 'Conectado al plugin de Android' : 'No conectado al plugin de Android'}
        </div>
      </div>

      {/* Configuración básica */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Dirección MAC de la impresora *
          </label>
          <input
            type="text"
            value={printerMac}
            onChange={(e) => setPrinterMac(e.target.value)}
            placeholder="FF:FF:FF:FF:FF:FF"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            Obtén la MAC desde el plugin Android en "Ver impresoras disponibles"
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            IP del Teléfono Android *
          </label>
          <input
            type="text"
            value={phoneIp}
            onChange={(e) => setPhoneIp(e.target.value)}
            placeholder="192.168.0.1"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            IP del teléfono Android donde está ejecutándose el plugin (puerto 8000)
          </p>
        </div>

        {/* Impresoras disponibles */}
        {availablePrinters.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Impresoras disponibles:
            </label>
            <select
              value={printerMac}
              onChange={(e) => setPrinterMac(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Seleccionar impresora...</option>
              {availablePrinters.map((printer, index) => (
                <option key={index} value={printer}>
                  {printer}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Configuración avanzada */}
        <div>
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            {showAdvanced ? 'Ocultar' : 'Mostrar'} configuración avanzada
          </button>
        </div>

        {showAdvanced && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Serial/Licencia (opcional)
            </label>
            <input
              type="text"
              value={serial}
              onChange={(e) => setSerial(e.target.value)}
              placeholder="Serial o licencia del plugin"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}
      </div>

      {/* Botones de acción */}
      <div className="flex flex-wrap gap-2 mt-6">
        <button
          onClick={testConnection}
          disabled={isPrinting}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:opacity-50"
        >
          🔄 Probar Conexión
        </button>

        <button
          onClick={printTest}
          disabled={!isConnected || isPrinting || !printerMac}
          className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 disabled:opacity-50"
        >
          🧪 Imprimir Prueba
        </button>

        <button
          onClick={printTicket}
          disabled={!isConnected || isPrinting || !printerMac || !sale}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {isPrinting ? '🖨️ Imprimiendo...' : '🖨️ Imprimir Ticket'}
        </button>

        <button
          onClick={printTicketWithLogo}
          disabled={!isConnected || isPrinting || !printerMac || !sale}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
        >
          {isPrinting ? '🖨️ Imprimiendo...' : '🖨️ Imprimir con Logo'}
        </button>

        <button
          onClick={printCustomTicket}
          disabled={!isConnected || isPrinting || !printerMac}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50"
        >
          {isPrinting ? '🖨️ Imprimiendo...' : '🎨 Ticket Personalizado'}
        </button>
      </div>

      {/* Mensaje de error */}
      {error && (
        <div className="mt-4 p-3 bg-red-100 text-red-800 rounded">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Información de ayuda */}
      <div className="mt-6 p-4 bg-blue-50 rounded">
        <h4 className="font-medium text-blue-900 mb-2">📋 Instrucciones:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Configura la IP del teléfono Android (ej: 192.168.0.1)</li>
          <li>• Asegúrate de que el plugin de Android esté ejecutándose en el puerto 8000</li>
          <li>• Obtén la dirección MAC de tu impresora desde el plugin Android</li>
          <li>• Verifica que la impresora esté encendida y conectada por Bluetooth</li>
          <li>• Usa "Probar Conexión" para verificar la conectividad</li>
          <li>• Usa "Imprimir Prueba" para verificar la impresión</li>
        </ul>
      </div>
    </div>
  );
}
