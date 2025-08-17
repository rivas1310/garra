import { useState, useEffect } from 'react'
import { log } from '@/lib/secureLogger'

interface SubcategoryCount {
  [key: string]: number
}

export function useSubcategoryCounts(categoriaSlug: string) {
  const [counts, setCounts] = useState<SubcategoryCount>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!categoriaSlug) {
      setCounts({})
      setLoading(false)
      return
    }

      const fetchCounts = async () => {
    try {
      setLoading(true)
      setError(null)
      
      log.error(`🔍 Hook: Obteniendo conteos para categoría: ${categoriaSlug}`)
      const response = await fetch(`/api/productos/subcategory-counts?category=${categoriaSlug}`)
      
      log.error(`📡 Hook: Response status: ${response.status}`)
      log.error(`📡 Hook: Response ok: ${response.ok}`)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        log.error('❌ Hook: Error response:', errorData)
        throw new Error(`Error ${response.status}: ${errorData.error || 'Error al obtener conteos de subcategorías'}`)
      }
      
      const data = await response.json()
      log.error('✅ Hook: Datos recibidos:', data)
      setCounts(data.counts || {})
    } catch (err) {
      log.error('💥 Hook: Error completo:', err)
      setError(err instanceof Error ? err.message : 'Error desconocido')
      // En caso de error, usar conteos por defecto
      setCounts({})
    } finally {
      setLoading(false)
    }
  }

    fetchCounts()
  }, [categoriaSlug])

  return { counts, loading, error }
}
