'use client';

import { useEffect, useState } from "react";
import { useSearchParams } from 'next/navigation';
import SubcategoryGrid from "@/components/SubcategoryGrid";
import PaginatedProductGrid from "@/components/PaginatedProductGrid";

interface CategoriaPageClientProps {
  slug: string;
}

export default function CategoriaPageClient({ slug }: CategoriaPageClientProps) {
  const searchParams = useSearchParams()
  const [categoria, setCategoria] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  // Inicializar subcategoría desde URL si está presente
  const [subcatSeleccionada, setSubcatSeleccionada] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      const subcatFromUrl = urlParams.get('subcat')
      if (subcatFromUrl) {
        console.log('🎯 Inicializando subcategoría desde URL:', subcatFromUrl)
        return subcatFromUrl
      }
    }
    return ''
  })

  // Función para guardar el estado de navegación
  const saveNavigationState = (subcategoria: string) => {
    if (typeof window !== 'undefined') {
      const navigationState = {
        categoria: slug,
        subcategoria: subcategoria,
        timestamp: Date.now()
      }
      console.log('💾 Guardando estado de navegación:', navigationState)
      sessionStorage.setItem('categoryNavigationState', JSON.stringify(navigationState))
    }
  }

  // Función para diagnosticar y limpiar sessionStorage problemático
  const diagnosticSessionStorage = () => {
    if (typeof window === 'undefined') return
    
    try {
      const savedState = sessionStorage.getItem('categoryNavigationState')
      if (savedState) {
        const state = JSON.parse(savedState)
        console.log('🔍 Estado actual en sessionStorage:', state)
        
        // Si hay una subcategoría "Abrigos" guardada y no estamos navegando intencionalmente a ella
        if (state.subcategoria === 'Abrigos' && !searchParams.get('subcat')) {
          console.log('🚨 PROBLEMA DETECTADO: sessionStorage contiene "Abrigos" sin parámetro URL')
          console.log('🧹 Limpiando estado problemático...')
          sessionStorage.removeItem('categoryNavigationState')
          return true // Indica que se limpió el estado
        }
      }
    } catch (error) {
      console.error('Error en diagnóstico de sessionStorage:', error)
    }
    return false
  }

  // Función para restaurar el estado de navegación
  const restoreNavigationState = () => {
    console.log('🔍 Restaurando estado de navegación de categoría')
    
    // Primero diagnosticar y limpiar si es necesario
    const wasCleared = diagnosticSessionStorage()
    if (wasCleared) {
      console.log('✅ Estado problemático limpiado, usando navegación normal')
      return false
    }
    
    const fromParam = searchParams.get('from')
    const subcatFromUrl = searchParams.get('subcat')
    
    console.log('📋 Parámetros de URL categoría - from:', fromParam, 'subcat:', subcatFromUrl)
    
    // Si viene de un producto, restaurar estado guardado
    if (fromParam === 'category' && typeof window !== 'undefined') {
      try {
        const savedState = sessionStorage.getItem('categoryNavigationState')
        if (savedState) {
          const state = JSON.parse(savedState)
          if (state.categoria === slug && (Date.now() - state.timestamp) < 30 * 60 * 1000) {
            console.log('✅ Restaurando desde sessionStorage categoría:', state)
            setSubcatSeleccionada(state.subcategoria || '')
            
            // Actualizar URL para reflejar el estado restaurado
            const newUrl = new URL(window.location.href)
            if (state.subcategoria) {
              newUrl.searchParams.set('subcat', state.subcategoria)
            } else {
              newUrl.searchParams.delete('subcat')
            }
            newUrl.searchParams.delete('from') // Limpiar parámetro from
            window.history.replaceState({}, '', newUrl.toString())
            console.log('🔗 URL actualizada con estado restaurado categoría:', newUrl.toString())
            
            return true
          }
        }
      } catch (error) {
        console.error('Error restoring category navigation state:', error)
      }
    }
    
    // Si hay subcategoría en URL, usarla
    if (subcatFromUrl) {
      console.log('✅ Usando subcategoría desde URL')
      setSubcatSeleccionada(subcatFromUrl)
      saveNavigationState(subcatFromUrl)
      return true
    }
    
    console.log('🚫 No se restauró el estado categoría - navegación normal')
    return false
  }





  // Sincronizar subcategoría con parámetros de URL
  useEffect(() => {
    if (loading) return
    
    const subcatFromUrl = searchParams.get('subcat') || ''
    const fromParam = searchParams.get('from')
    
    console.log('🔄 Sincronización URL - subcat:', subcatFromUrl, 'actual:', subcatSeleccionada, 'from:', fromParam)
    
    // Si viene de un producto, restaurar estado guardado (solo una vez)
    if (fromParam === 'category' && typeof window !== 'undefined') {
      try {
        const savedState = sessionStorage.getItem('categoryNavigationState')
        if (savedState) {
          const state = JSON.parse(savedState)
          if (state.categoria === slug && (Date.now() - state.timestamp) < 30 * 60 * 1000) {
            console.log('🔄 Restaurando subcategoría desde sessionStorage:', state.subcategoria)
            setSubcatSeleccionada(state.subcategoria || '')
            
            // Actualizar URL para reflejar la subcategoría restaurada
            if (state.subcategoria) {
              const newUrl = new URL(window.location.href)
              newUrl.searchParams.set('subcat', state.subcategoria)
              newUrl.searchParams.delete('from') // Limpiar parámetro from
              window.history.replaceState({}, '', newUrl.toString())
              console.log('🔗 URL actualizada con subcategoría restaurada:', newUrl.toString())
            }
            return
          }
        }
      } catch (error) {
        console.error('Error restoring navigation state:', error)
      }
    }
    
    // Solo actualizar si hay diferencia real y no viene de producto
    if (subcatFromUrl !== subcatSeleccionada && fromParam !== 'category') {
      console.log('🔄 Sincronizando subcategoría desde URL:', subcatFromUrl)
      setSubcatSeleccionada(subcatFromUrl)
      if (subcatFromUrl) {
        saveNavigationState(subcatFromUrl)
      }
    }
  }, [searchParams, loading, slug])

  useEffect(() => {
    const loadCategoria = async () => {
      try {
        setLoading(true)
        
        // Diagnosticar sessionStorage antes de cargar
        const wasCleared = diagnosticSessionStorage()
        if (wasCleared) {
          console.log('🧹 SessionStorage limpiado antes de cargar categoría')
        }
        
        // DEBUGGING: Log antes de la petición API
        console.log('🐛 DEBUG - URL antes de fetch API:', window.location.href)
        console.log('🐛 DEBUG - SearchParams antes de fetch:', Object.fromEntries(searchParams.entries()))
        
        const timestamp = Date.now();
        const response = await fetch(`/api/categorias/${slug}?t=${timestamp}&limit=1`)
        if (!response.ok) {
          throw new Error('Error al cargar la categoría')
        }
        const data = await response.json()
        setCategoria(data.categoria || null)
        
        // DEBUGGING: Log después de la petición API
        console.log('🐛 DEBUG - URL después de fetch API:', window.location.href)
        console.log('🐛 DEBUG - SearchParams después de fetch:', Object.fromEntries(searchParams.entries()))
        
        // Restaurar estado de navegación si es necesario
        const fromParam = searchParams.get('from')
        const subcatFromUrl = searchParams.get('subcat')
        
        // Si hay subcategoría en URL o viene de producto, restaurar estado
        if (subcatFromUrl || fromParam === 'category') {
          const restored = restoreNavigationState()
          console.log('🔄 Estado restaurado:', restored)
        }
        
        // DEBUGGING: Log después de restaurar estado
        console.log('🐛 DEBUG - URL después de restaurar estado:', window.location.href)
        console.log('🐛 DEBUG - SearchParams después de restaurar:', Object.fromEntries(searchParams.entries()))
      } catch (error) {
        console.error('Error loading categoria:', error)
      } finally {
        setLoading(false)
      }
    }

    if (!slug) return;
    loadCategoria()
  }, [slug]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;
  }

  if (!categoria) {
    return <div className="min-h-screen flex items-center justify-center text-red-600 font-semibold">Categoría no encontrada</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-elegant">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-white text-title mb-4">{categoria.name}</h1>
        <p className="text-body text-white mb-8">{categoria.description || "Descubre los productos de esta categoría."}</p>

        {/* Subcategorías con imágenes */}
        <SubcategoryGrid
          categoriaSlug={slug}
          subcatSeleccionada={subcatSeleccionada}
          onSubcatChange={(subcat) => {
            console.log('🎯 Cambiando subcategoría a:', subcat);
            setSubcatSeleccionada(subcat);
            saveNavigationState(subcat);
            
            // Actualizar la URL para reflejar el cambio de subcategoría
            const newUrl = new URL(window.location.href);
            if (subcat) {
              newUrl.searchParams.set('subcat', subcat);
            } else {
              newUrl.searchParams.delete('subcat');
            }
            
            // Limpiar parámetro 'from' si existe para evitar conflictos
            newUrl.searchParams.delete('from');
            
            // Usar replaceState para actualizar la URL sin crear nueva entrada en el historial
            window.history.replaceState({}, '', newUrl.toString());
            console.log('🔗 URL actualizada a:', newUrl.toString());
          }}
        />

        {/* Grid de productos con paginación */}
        <PaginatedProductGrid
          categorySlug={slug}
          subcategoria={subcatSeleccionada}
          pageSize={12}
        />
      </div>
    </div>
  );
}