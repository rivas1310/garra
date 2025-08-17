import { NextRequest, NextResponse } from 'next/server'
import { log } from '@/lib/secureLogger'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    log.error('🔍 API subcategory-counts llamada')
    
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    
    log.error('📊 Categoría solicitada:', category)

    if (!category) {
      log.error('❌ Categoría no proporcionada')
      return NextResponse.json(
        { error: 'Categoría requerida' },
        { status: 400 }
      )
    }

    // Caso especial para verificar subcategorías en la BD
    if (category === 'check') {
      log.error('🔍 Verificando subcategorías en la base de datos...')
      
      try {
        const subcategories = await prisma.product.findMany({
          where: {
            isActive: true,
            subcategoria: { not: null }
          },
          select: {
            subcategoria: true
          },
          distinct: ['subcategoria']
        })
        
        const uniqueSubcategories = subcategories
          .map(item => item.subcategoria)
          .filter(Boolean)
          .sort()
        
        log.error('📋 Subcategorías únicas encontradas:', uniqueSubcategories)
        
        return NextResponse.json({
          success: true,
          message: 'Subcategorías únicas en la base de datos',
          subcategories: uniqueSubcategories,
          count: uniqueSubcategories.length
        })
        
      } catch (error) {
        log.error('❌ Error obteniendo subcategorías:', error)
        return NextResponse.json(
          { error: 'Error obteniendo subcategorías' },
          { status: 500 }
        )
      }
    }

    // Caso especial para listar todas las categorías disponibles
    if (category === 'list-categories') {
      log.error('📋 Listando todas las categorías disponibles...')
      
      try {
        const categories = await prisma.category.findMany({
          select: { slug: true, name: true }
        })
        
        log.error('✅ Categorías encontradas:', categories)
        
        return NextResponse.json({
          success: true,
          message: 'Categorías disponibles',
          categories: categories.map(cat => ({ slug: cat.slug, name: cat.name }))
        })
        
      } catch (error) {
        log.error('❌ Error obteniendo categorías:', error)
        return NextResponse.json(
          { error: 'Error obteniendo categorías' },
          { status: 500 }
        )
      }
    }

    // Obtener subcategorías dinámicamente para la categoría solicitada
    log.error(`🔍 Obteniendo subcategorías para categoría: ${category}`)
    
    let subcategories: string[] = []
    
    try {
      // Buscar productos de la categoría específica
      const categoryProducts = await prisma.product.findMany({
        where: {
          isActive: true,
          category: {
            slug: category
          },
          subcategoria: { not: null }
        },
        select: {
          subcategoria: true
        },
        distinct: ['subcategoria']
      })
      
      subcategories = categoryProducts
        .map(item => item.subcategoria)
        .filter((subcat): subcat is string => subcat !== null)
        .sort()
      
      log.error(`📋 Subcategorías encontradas para ${category}:`, subcategories)
      
      if (subcategories.length === 0) {
        log.error(`⚠️  No se encontraron subcategorías para: ${category}`)
        return NextResponse.json({
          success: true,
          category,
          counts: {},
          total: 0,
          message: 'No se encontraron subcategorías para esta categoría'
        })
      }
    } catch (error) {
      log.error(`❌ Error obteniendo subcategorías para ${category}:`, error)
      return NextResponse.json(
        { error: `Error obteniendo subcategorías para ${category}` },
        { status: 500 }
      )
    }

    // Obtener conteos reales para cada subcategoría
    log.error('🔢 Obteniendo conteos reales de la base de datos...')
    
    const counts: Record<string, number> = {}
    
    for (const subcategory of subcategories) {
      try {
        log.error(`📊 Contando productos para: ${subcategory}`)
        
        // Consulta real a la base de datos
        const count = await prisma.product.count({
          where: {
            AND: [
              {
                OR: [
                  { subcategoria: subcategory },
                  { subcategoria: { contains: subcategory, mode: 'insensitive' } }
                ]
              },
              { isActive: true }
            ]
          }
        })
        
        counts[subcategory] = count
        log.error(`✅ ${subcategory}: ${count} productos reales`)
        
      } catch (subcatError) {
        log.error(`❌ Error contando ${subcategory}:`, subcatError)
        counts[subcategory] = 0
      }
    }

    const total = Object.values(counts).reduce((sum, count) => sum + count, 0)
    log.error(`🎯 Total de productos reales: ${total}`)

    return NextResponse.json({
      success: true,
      category,
      counts,
      total
    })

  } catch (error) {
    log.error('💥 Error general en la API:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor', details: error instanceof Error ? error.message : 'Error desconocido' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
