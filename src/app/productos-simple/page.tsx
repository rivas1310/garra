'use client'

import { useState } from 'react'

export default function ProductosSimplePage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [products] = useState([
    { id: 1, name: 'Vestido Floral', category: 'Mujer', price: 100 },
    { id: 2, name: 'Botas Vaqueras', category: 'Calzado', price: 200 },
    { id: 3, name: 'Blusa Elegante', category: 'Mujer', price: 80 },
    { id: 4, name: 'Zapatos Deportivos', category: 'Calzado', price: 150 },
  ])

  const handleSearch = (search: string) => {
    console.log('🔍 handleSearch ejecutándose con:', search)
    setSearchTerm(search)
  }

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Productos - Versión Simple</h1>
      
      {/* Campo de búsqueda */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Buscar productos..."
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-80 px-4 py-2 border border-gray-300 rounded-lg"
        />
        <p className="mt-2 text-sm text-gray-600">
          Término de búsqueda: "{searchTerm}" | Productos encontrados: {filteredProducts.length}
        </p>
      </div>

      {/* Lista de productos */}
      <div className="space-y-4">
        {filteredProducts.map(product => (
          <div key={product.id} className="p-4 border border-gray-200 rounded-lg">
            <h3 className="font-semibold">{product.name}</h3>
            <p className="text-gray-600">{product.category}</p>
            <p className="text-blue-600 font-bold">${product.price}</p>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && searchTerm && (
        <p className="text-center text-gray-500 mt-8">
          No se encontraron productos para "{searchTerm}"
        </p>
      )}
    </div>
  )
}
