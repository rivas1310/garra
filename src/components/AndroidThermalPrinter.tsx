'use client';

import React, { useState, useEffect } from 'react';
import { ConectorEscposAndroid } from '@/lib/android-thermal-printer';

interface AndroidThermalPrinterProps {
  lastSale?: any;
  onPrint?: (success: boolean, message?: string) => void;
}

export default function AndroidThermalPrinter({ lastSale, onPrint }: AndroidThermalPrinterProps) {
  const [macImpresora, setMacImpresora] = useState('');
  const [serial, setSerial] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availablePrinters, setAvailablePrinters] = useState<string[]>([]);

  // Probar conexión al montar el componente
  useEffect(() => {
    testConnection();
  }, []);

  const testConnection = async () => {
    try {
      const connected = await ConectorEscposAndroid.testConnection();
      setIsConnected(connected);
      
      if (connected) {
        // Intentar obtener impresoras disponibles
        const printers = await ConectorEscposAndroid.obtenerImpresoras();
        setAvailablePrinters(printers);
        setError(null);
      } else {
        setError('No se pudo conectar al plugin Android');
      }
    } catch (err) {
      setError('Error al probar conexión');
      setIsConnected(false);
    }
  };

  const printTest = async () => {
    if (!macImpresora) {
      setError('Por favor ingresa la MAC de la impresora');
      return;
    }

    setIsPrinting(true);
    setError(null);

    try {
      const conector = ConectorEscposAndroid.generarTicketPrueba(serial);
      const result = await conector.imprimirEn(macImpresora);
      
      if (result === true) {
        setError(null);
        onPrint?.(true, 'Ticket de prueba impreso correctamente');
      } else {
        setError(`Error al imprimir: ${result}`);
        onPrint?.(false, result);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error desconocido';
      setError(`Error: ${errorMsg}`);
      onPrint?.(false, errorMsg);
    } finally {
      setIsPrinting(false);
    }
  };

  const printTicket = async () => {
    if (!macImpresora) {
      setError('Por favor ingresa la MAC de la impresora');
      return;
    }

    if (!lastSale) {
      setError('No hay datos de venta para imprimir');
      return;
    }

    setIsPrinting(true);
    setError(null);

    try {
      // Calcular subtotal si no existe
      const subtotal = lastSale.subtotal || lastSale.items?.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0) || 0;
      const total = lastSale.total || subtotal;

      const items = lastSale.items?.map((item: any) => ({
        nombre: item.name || item.product?.name || 'Producto',
        precio: item.price || 0,
        cantidad: item.quantity || 1
      })) || [];

      const conector = ConectorEscposAndroid.generarTicketBasico(
        'Bazar - EnviosPerros',
        items,
        subtotal,
        total,
        new Date().toLocaleString(),
        serial
      );

      const result = await conector.imprimirEn(macImpresora);
      
      if (result === true) {
        setError(null);
        onPrint?.(true, 'Ticket impreso correctamente');
      } else {
        setError(`Error al imprimir: ${result}`);
        onPrint?.(false, result);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error desconocido';
      setError(`Error: ${errorMsg}`);
      onPrint?.(false, errorMsg);
    } finally {
      setIsPrinting(false);
    }
  };

  const printTicketWithLogo = async () => {
    if (!macImpresora) {
      setError('Por favor ingresa la MAC de la impresora');
      return;
    }

    if (!lastSale) {
      setError('No hay datos de venta para imprimir');
      return;
    }

    setIsPrinting(true);
    setError(null);

    try {
      // Calcular subtotal si no existe
      const subtotal = lastSale.subtotal || lastSale.items?.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0) || 0;
      const total = lastSale.total || subtotal;

      const items = lastSale.items?.map((item: any) => ({
        nombre: item.name || item.product?.name || 'Producto',
        precio: item.price || 0,
        cantidad: item.quantity || 1
      })) || [];

      const logoUrl = 'https://res.cloudinary.com/dhwlirnis/image/upload/v1754606987/productos/rqyo1uuaimih7a5lof6d.png';

      const conector = ConectorEscposAndroid.generarTicketConLogo(
        'Bazar - EnviosPerros',
        items,
        subtotal,
        total,
        logoUrl,
        new Date().toLocaleString(),
        serial
      );

      const result = await conector.imprimirEn(macImpresora);
      
      if (result === true) {
        setError(null);
        onPrint?.(true, 'Ticket con logo impreso correctamente');
      } else {
        setError(`Error al imprimir: ${result}`);
        onPrint?.(false, result);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error desconocido';
      setError(`Error: ${errorMsg}`);
      onPrint?.(false, errorMsg);
    } finally {
      setIsPrinting(false);
    }
  };

  const printCustomTicket = async () => {
    if (!macImpresora) {
      setError('Por favor ingresa la MAC de la impresora');
      return;
    }

    setIsPrinting(true);
    setError(null);

    try {
      const conector = new ConectorEscposAndroid(serial);
      
      conector
        .Iniciar()
        .EstablecerAlineacion(ConectorEscposAndroid.ALINEACION_CENTRO)
        .Feed(1)
        .DescargarImagenDeInternetEImprimir("https://res.cloudinary.com/dhwlirnis/image/upload/v1754606987/productos/rqyo1uuaimih7a5lof6d.png", 0, 200)
        .Iniciar()
        .Feed(1)
        .EstablecerAlineacion(ConectorEscposAndroid.ALINEACION_CENTRO)
        .EscribirTexto("Bazar - EnviosPerros\n")
        .EscribirTexto("Sistema de envíos\n")
        .EscribirTexto("Teléfono: 123456789\n")
        .EscribirTexto("Fecha: " + (new Date().toLocaleString()) + "\n")
        .Feed(1)
        .EstablecerAlineacion(ConectorEscposAndroid.ALINEACION_IZQUIERDA)
        .EscribirTexto("____________________\n")
        .EscribirTexto("Producto 1 (x2)\n")
        .EstablecerAlineacion(ConectorEscposAndroid.ALINEACION_DERECHA)
        .EscribirTexto("$21.00\n")
        .EstablecerAlineacion(ConectorEscposAndroid.ALINEACION_IZQUIERDA)
        .EscribirTexto("Producto 2 (x1)\n")
        .EstablecerAlineacion(ConectorEscposAndroid.ALINEACION_DERECHA)
        .EscribirTexto("$25.00\n")
        .EstablecerAlineacion(ConectorEscposAndroid.ALINEACION_IZQUIERDA)
        .EscribirTexto("Envío\n")
        .EstablecerAlineacion(ConectorEscposAndroid.ALINEACION_DERECHA)
        .EscribirTexto("$5.00\n")
        .EscribirTexto("____________________\n")
        .EscribirTexto("TOTAL: $51.00\n")
        .EscribirTexto("____________________\n")
        .EstablecerAlineacion(ConectorEscposAndroid.ALINEACION_CENTRO)
        .EstablecerEnfatizado(true)
        .EstablecerTamañoFuente(1, 1)
        .EscribirTexto("¡Gracias por su compra!\n")
        .Feed(1)
        .ImprimirCodigoDeBarras("qr", "https://bazar-enviosperros.com", ConectorEscposAndroid.TAMAÑO_IMAGEN_NORMAL, 160, 160)
        .Iniciar()
        .EstablecerAlineacion(ConectorEscposAndroid.ALINEACION_CENTRO)
        .Feed(1)
        .ImprimirCodigoDeBarras("code128", "bazar-enviosperros", ConectorEscposAndroid.TAMAÑO_IMAGEN_NORMAL, 200, 50)
        .Iniciar()
        .EstablecerAlineacion(ConectorEscposAndroid.ALINEACION_CENTRO)
        .Feed(1)
        .EstablecerTamañoFuente(1, 1)
        .EscribirTexto("bazar-enviosperros.com\n")
        .Feed(2)
        .Corte(1)
        .Pulso(48, 60, 120);

      const result = await conector.imprimirEn(macImpresora);
      
      if (result === true) {
        setError(null);
        onPrint?.(true, 'Ticket personalizado impreso correctamente');
      } else {
        setError(`Error al imprimir: ${result}`);
        onPrint?.(false, result);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error desconocido';
      setError(`Error: ${errorMsg}`);
      onPrint?.(false, errorMsg);
    } finally {
      setIsPrinting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-blue-800 mb-2">
          Plugin Android - Impresora Térmica
        </h3>
        <p className="text-sm text-blue-600">
          Estado: {isConnected ? '✅ Conectado' : '❌ Desconectado'}
        </p>
        {availablePrinters.length > 0 && (
          <p className="text-sm text-blue-600">
            Impresoras disponibles: {availablePrinters.length}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            MAC de la impresora:
          </label>
          <input
            type="text"
            value={macImpresora}
            onChange={(e) => setMacImpresora(e.target.value)}
            placeholder="Ej: 00:11:22:33:44:55"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Licencia (opcional):
          </label>
          <input
            type="text"
            value={serial}
            onChange={(e) => setSerial(e.target.value)}
            placeholder="Licencia si cuentas con ella"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={testConnection}
          disabled={isPrinting}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Probar Conexión
        </button>

        <button
          onClick={printTest}
          disabled={!isConnected || isPrinting || !macImpresora}
          className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Imprimir Prueba
        </button>

        <button
          onClick={printTicket}
          disabled={!isConnected || isPrinting || !macImpresora || !lastSale}
          className="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Imprimir Ticket
        </button>

        <button
          onClick={printTicketWithLogo}
          disabled={!isConnected || isPrinting || !macImpresora || !lastSale}
          className="px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Imprimir con Logo
        </button>

        <button
          onClick={printCustomTicket}
          disabled={!isConnected || isPrinting || !macImpresora}
          className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Ticket Personalizado
        </button>
      </div>

      {isPrinting && (
        <div className="bg-yellow-50 p-3 rounded-lg">
          <p className="text-yellow-800">🖨️ Imprimiendo...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 p-3 rounded-lg">
          <p className="text-red-800">❌ {error}</p>
        </div>
      )}

      <div className="bg-gray-50 p-3 rounded-lg">
        <h4 className="font-medium text-gray-800 mb-2">Instrucciones:</h4>
        <ol className="text-sm text-gray-600 space-y-1">
          <li>1. Asegúrate de que el plugin Android esté ejecutándose en tu teléfono</li>
          <li>2. El plugin debe estar escuchando en el puerto 8000</li>
          <li>3. Ingresa la dirección MAC de tu impresora Bluetooth</li>
          <li>4. Haz clic en "Probar Conexión" para verificar</li>
          <li>5. Usa cualquiera de los botones de impresión para probar</li>
        </ol>
      </div>
    </div>
  );
}
