import CategoriaPageClient from "./CategoriaPageClient";

interface CategoriaPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function CategoriaPage({ params }: CategoriaPageProps) {
  const { slug } = await params;
  return <CategoriaPageClient slug={slug} />;
}