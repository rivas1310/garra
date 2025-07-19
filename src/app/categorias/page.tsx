import Categories from '@/components/Categories'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Categorías | Bazar Fashion',
  description: 'Explora todas las categorías de ropa, accesorios y más en Bazar Fashion. Encuentra productos para cada estilo y ocasión.'
}

export default function CategoriasPage() {
  return (
    <main className="min-h-screen bg-gradient-elegant">
      <Categories />
    </main>
  )
} 