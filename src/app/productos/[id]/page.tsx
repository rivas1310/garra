import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import ProductDetailClient from './ProductDetailClient'
import { Metadata } from 'next'

// Configuración para Next.js
export const dynamicParams = true
export const revalidate = 3600

// Generar rutas estáticas para los productos más populares
export async function generateStaticParams() {
  try {
    const products = await prisma.product.findMany({
      where: {
        isActive: true
      },
      select: {
        id: true
      },
      take: 50,
      orderBy: {
        createdAt: 'desc'
      }
    })

    return products.map((product) => ({
      id: product.id
    }))
  } catch (error) {
    console.error('Error generating static params:', error)
    return []
  }
}

// Función para obtener el producto directamente desde la base de datos
async function getProduct(id: string) {
  try {
    const product = await prisma.product.findUnique({
      where: { 
        id: id,
        isActive: true 
      },
      include: {
        category: true,
        variants: true
      }
    })

    if (!product) {
      return null
    }

    // Calcular stock total
    const totalStock = product.variants && product.variants.length > 0
      ? product.variants.reduce((sum, variant) => sum + (variant.stock || 0), 0)
      : product.stock || 0

    return {
      ...product,
      totalStock,
      isAvailable: totalStock > 0
    }
  } catch (error) {
    console.error('Error fetching product:', error)
    return null
  }
}

// Generar metadatos dinámicos
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const product = await getProduct(params.id)

  if (!product) {
    return {
      title: 'Producto no encontrado',
      description: 'El producto que buscas no existe o no está disponible.'
    }
  }

  return {
    title: `${product.name} - Garra Felinas`,
    description: product.description || `Compra ${product.name} en Garra Felinas. Precio: $${product.price}`,
    openGraph: {
      title: product.name,
      description: product.description || `Compra ${product.name} en Garra Felinas`,
      images: product.images && product.images.length > 0 ? [product.images[0]] : [],
    },
  }
}

export default async function ProductPage({ params }: { params: { id: string } }) {
  const product = await getProduct(params.id)

  if (!product) {
    notFound()
  }

  // Datos estructurados para SEO
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.images,
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: 'MXN',
      availability: product.isAvailable ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock'
    }
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData)
        }}
      />
      <ProductDetailClient initialProduct={product} />
    </>
  )
}