import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ProductDetailClient from './ProductDetailClient';
import prisma from '@/lib/prisma';

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

// Configurar el comportamiento dinámico
export const dynamicParams = true; // Permitir rutas dinámicas no pre-generadas
export const revalidate = 3600; // Revalidar cada hora

// Generar parámetros estáticos para las rutas más comunes
export async function generateStaticParams() {
  try {
    // Obtener los primeros 50 productos para pre-generar
    const products = await prisma.product.findMany({
      take: 50,
      select: { id: true },
      where: { isActive: true }
    });
    
    return products.map((product) => ({
      id: product.id,
    }));
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
}

// Función para obtener datos del producto
async function getProduct(id: string) {
  try {
    // Construir la URL base correcta para el entorno
    const baseUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}`
      : process.env.NEXTAUTH_URL || 'http://localhost:3000';
    
    const res = await fetch(`${baseUrl}/api/productos/${id}`, {
      cache: 'no-store'
    });
    
    if (!res.ok) {
      return null;
    }
    
    return await res.json();
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
}

// Generar metadatos dinámicos
export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await getProduct(id);
  
  if (!product) {
    return {
      title: 'Producto no encontrado',
      description: 'El producto que buscas no está disponible.'
    };
  }

  const title = `${product.name} - Garra Tienda`;
  const description = product.description || `Compra ${product.name} al mejor precio. ${product.variants?.length ? 'Disponible en múltiples colores y tallas.' : ''}`;
  const images = product.images?.length ? product.images.map((img: string) => ({
    url: img,
    alt: product.name
  })) : [];

  return {
    title,
    description,
    keywords: `${product.name}, ${product.category?.name || ''}, ${product.subcategory?.name || ''}, tienda online, comprar`,
    openGraph: {
      title,
      description,
      type: 'website',
      images,
      siteName: 'Garra Tienda',
      locale: 'es_ES'
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: images.length ? [images[0].url] : []
    },
    alternates: {
      canonical: `/productos/${id}`
    }
  };
}

// Componente servidor
export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  const product = await getProduct(id);
  
  if (!product) {
    notFound();
  }

  // Datos estructurados JSON-LD
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "description": product.description,
    "image": product.images || [],
    "brand": {
      "@type": "Brand",
      "name": "Garra Tienda"
    },
    "category": product.category?.name,
    "offers": {
      "@type": "AggregateOffer",
      "priceCurrency": "MXN",
      "lowPrice": product.price,
      "highPrice": product.price,
      "availability": product.variants?.some((v: any) => v.stock > 0) 
        ? "https://schema.org/InStock" 
        : "https://schema.org/OutOfStock",
      "seller": {
        "@type": "Organization",
        "name": "Garra Tienda"
      }
    },
    "aggregateRating": product.rating ? {
      "@type": "AggregateRating",
      "ratingValue": product.rating,
      "ratingCount": product.reviewCount || 1
    } : undefined
  };

  return (
    <>
      {/* Datos estructurados */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData)
        }}
      />
      
      {/* Componente cliente */}
      <ProductDetailClient initialProduct={product} />
    </>
  );
}