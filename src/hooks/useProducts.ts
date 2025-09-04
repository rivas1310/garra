import { useState, useEffect, useCallback, useRef } from 'react';

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  images: string[];
  category?: { name: string };
  stock: number;
  isActive: boolean;
  conditionTag?: string;
  isOnSale: boolean;
  totalStock: number;
  variants: any[];
}

interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface UseProductsOptions {
  category?: string;
  subcategory?: string;
  search?: string;
  sort?: string;
  minPrice?: number;
  maxPrice?: number;
  isOnSale?: boolean;
  conditionTag?: string;
  admin?: boolean;
  initialLimit?: number;
}

export function useProducts(options: UseProductsOptions = {}) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(options.initialLimit || 20);
  
  // Usar useRef para evitar recrear la función fetchProducts
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const fetchProducts = useCallback(async (pageNum: number = 1, reset: boolean = false) => {
    setLoading(true);
    setError(null);
    
    try {
      const currentOptions = optionsRef.current;
      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: limit.toString(),
        ...(currentOptions.category && { category: currentOptions.category }),
        ...(currentOptions.subcategory && { subcategory: currentOptions.subcategory }),
        ...(currentOptions.search && { search: currentOptions.search }),
        ...(currentOptions.sort && { sort: currentOptions.sort }),
        ...(currentOptions.minPrice !== undefined && { minPrice: currentOptions.minPrice.toString() }),
        ...(currentOptions.maxPrice !== undefined && { maxPrice: currentOptions.maxPrice.toString() }),
        ...(currentOptions.isOnSale && { isOnSale: 'true' }),
        ...(currentOptions.conditionTag && { conditionTag: currentOptions.conditionTag }),
        ...(currentOptions.admin && { admin: 'true' }),
        t: Date.now().toString(), // Evitar caché
      });

      const response = await fetch(`/api/productos?${params}`);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      if (reset) {
        setProducts(data.productos || []);
      } else {
        setProducts(prev => [...prev, ...(data.productos || [])]);
      }
      
      setPagination(data.pagination);
      setPage(pageNum);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  }, [limit]); // Solo dependencia de limit

  const loadMore = useCallback(() => {
    if (pagination?.hasNextPage && !loading) {
      fetchProducts(page + 1, false);
    }
  }, [pagination?.hasNextPage, page, loading, fetchProducts]);

  const refresh = useCallback(() => {
    setPage(1);
    fetchProducts(1, true);
  }, [fetchProducts]);

  const goToPage = useCallback((pageNum: number) => {
    if (pageNum >= 1 && pageNum <= (pagination?.totalPages || 1)) {
      fetchProducts(pageNum, true);
    }
  }, [fetchProducts, pagination?.totalPages]);

  // Efecto para cargar productos iniciales
  useEffect(() => {
    fetchProducts(1, true);
  }, []); // Solo se ejecuta una vez al montar el componente

  // Efecto separado para recargar cuando cambien las opciones importantes
  useEffect(() => {
    // Solo recargar si no es la carga inicial
    if (products.length > 0) {
      setPage(1);
      fetchProducts(1, true);
    }
  }, [options.category, options.subcategory, options.search, options.sort, options.admin]);

  return {
    products,
    loading,
    error,
    pagination,
    currentPage: page,
    loadMore,
    refresh,
    goToPage,
    hasMore: pagination?.hasNextPage || false,
  };
}
