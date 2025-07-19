"use client";

import { useState } from "react";
import { Save, Settings } from "lucide-react";

export default function ConfiguracionAdminPage() {
  const [storeName, setStoreName] = useState("Mi Tienda Online");
  const [storeEmail, setStoreEmail] = useState("info@mitienda.com");
  const [enablePayments, setEnablePayments] = useState(true);
  const [enableShipping, setEnableShipping] = useState(true);
  const [theme, setTheme] = useState("claro");

  return (
    <div className="min-h-screen bg-gradient-elegant">
      <div className="bg-white shadow-elegant border-b border-neutral-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-3">
            <Settings className="h-7 w-7 text-primary-600" />
            <h1 className="text-2xl font-bold text-neutral-700">Configuración de la Tienda</h1>
          </div>
        </div>
      </div>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form className="space-y-8 bg-white rounded-lg shadow-elegant p-8 border border-neutral-100">
          {/* Datos generales */}
          <div>
            <h2 className="text-lg font-semibold text-title mb-4">Datos Generales</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-title mb-2">Nombre de la tienda</label>
                <input
                  type="text"
                  value={storeName}
                  onChange={e => setStoreName(e.target.value)}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-title mb-2">Email de contacto</label>
                <input
                  type="email"
                  value={storeEmail}
                  onChange={e => setStoreEmail(e.target.value)}
                  className="input-field"
                />
              </div>
            </div>
          </div>
          {/* Métodos de pago */}
          <div>
            <h2 className="text-lg font-semibold text-title mb-4">Métodos de Pago</h2>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={enablePayments}
                  onChange={e => setEnablePayments(e.target.checked)}
                  className="form-checkbox"
                />
                Habilitar pagos en línea
              </label>
            </div>
          </div>
          {/* Métodos de envío */}
          <div>
            <h2 className="text-lg font-semibold text-title mb-4">Métodos de Envío</h2>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={enableShipping}
                  onChange={e => setEnableShipping(e.target.checked)}
                  className="form-checkbox"
                />
                Habilitar envíos nacionales
              </label>
            </div>
          </div>
          {/* Personalización */}
          <div>
            <h2 className="text-lg font-semibold text-title mb-4">Personalización</h2>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="theme"
                  value="claro"
                  checked={theme === "claro"}
                  onChange={() => setTheme("claro")}
                />
                Tema claro
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="theme"
                  value="oscuro"
                  checked={theme === "oscuro"}
                  onChange={() => setTheme("oscuro")}
                />
                Tema oscuro
              </label>
            </div>
          </div>
          <button type="submit" className="btn-primary flex items-center gap-2">
            <Save className="h-5 w-5" />
            Guardar Cambios
          </button>
        </form>
      </div>
    </div>
  );
} 