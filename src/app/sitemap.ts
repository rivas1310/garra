import { MetadataRoute } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXTAUTH_URL || 'https://garra-tienda.com';
  
  try {
    // Páginas estáticas
    const staticPages = [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 1,
      },
      {
        url: `${baseUrl}/categorias`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 0.9,
      },
      {
        url: `${baseUrl}/ofertas`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 0.8,
      },
      {
        url: `${baseUrl}/quienes-somos`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.5,
      },
      {
        url: `${baseUrl}/contacto`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.5,
      },
    ];

    // Obtener todas las categorías
    const categories = await prisma.category.findMany({
      select: {
        slug: true,
        updatedAt: true,
      },
    });

    const categoryPages = categories.map((category) => ({
      url: `${baseUrl}/categorias/${category.slug}`,
      lastModified: category.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));

    // Obtener todos los productos activos
    const products = await prisma.product.findMany({
      where: { 
        isActive: true,
        stock: { gt: 0 }
      },
      select: {
        id: true,
        updatedAt: true,
      },
      take: 1000, // Limitar para evitar sitemaps muy grandes
    });

    const productPages = products.map((product) => ({
      url: `${baseUrl}/productos/${product.id}`,
      lastModified: product.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }));

    return [...staticPages, ...categoryPages, ...productPages];
  } catch (error) {
    console.error('Error generating sitemap:', error);
    
    // Fallback: solo páginas estáticas si hay error
    return [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 1,
      },
      {
        url: `${baseUrl}/categorias`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 0.9,
      },
    ];
  } finally {
    await prisma.$disconnect();
  }
}