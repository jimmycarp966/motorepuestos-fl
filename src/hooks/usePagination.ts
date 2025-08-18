import { useState, useCallback, useMemo } from 'react'

// Interfaz para configuración de paginación
export interface PaginationConfig {
  pageSize?: number
  initialPage?: number
  totalItems?: number
}

// Interfaz para el resultado de paginación
export interface PaginationResult<T> {
  // Datos actuales
  currentData: T[]
  currentPage: number
  pageSize: number
  totalPages: number
  totalItems: number
  
  // Estados
  hasNextPage: boolean
  hasPreviousPage: boolean
  isFirstPage: boolean
  isLastPage: boolean
  
  // Acciones
  nextPage: () => void
  previousPage: () => void
  goToPage: (page: number) => void
  setPageSize: (size: number) => void
  reset: () => void
  
  // Para infinite scroll
  loadMore: () => void
  hasMore: boolean
}

// Hook principal de paginación
export const usePagination = <T>(
  data: T[],
  config: PaginationConfig = {}
): PaginationResult<T> => {
  const {
    pageSize: initialPageSize = 20,
    initialPage = 1,
    totalItems: externalTotalItems
  } = config
  
  const [currentPage, setCurrentPage] = useState(initialPage)
  const [pageSize, setPageSizeState] = useState(initialPageSize)
  
  // Calcular totales
  const totalItems = externalTotalItems ?? data.length
  const totalPages = Math.ceil(totalItems / pageSize)
  
  // Datos de la página actual
  const currentData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    return data.slice(startIndex, endIndex)
  }, [data, currentPage, pageSize])
  
  // Estados de navegación
  const hasNextPage = currentPage < totalPages
  const hasPreviousPage = currentPage > 1
  const isFirstPage = currentPage === 1
  const isLastPage = currentPage === totalPages
  
  // Para infinite scroll
  const hasMore = hasNextPage
  
  // Acciones
  const nextPage = useCallback(() => {
    if (hasNextPage) {
      setCurrentPage(prev => prev + 1)
    }
  }, [hasNextPage])
  
  const previousPage = useCallback(() => {
    if (hasPreviousPage) {
      setCurrentPage(prev => prev - 1)
    }
  }, [hasPreviousPage])
  
  const goToPage = useCallback((page: number) => {
    const clampedPage = Math.max(1, Math.min(page, totalPages))
    setCurrentPage(clampedPage)
  }, [totalPages])
  
  const setPageSize = useCallback((size: number) => {
    setPageSizeState(size)
    // Recalcular página actual para mantener posición aproximada
    const currentItem = (currentPage - 1) * pageSize + 1
    const newPage = Math.ceil(currentItem / size)
    setCurrentPage(newPage)
  }, [currentPage, pageSize])
  
  const reset = useCallback(() => {
    setCurrentPage(initialPage)
    setPageSizeState(initialPageSize)
  }, [initialPage, initialPageSize])
  
  const loadMore = useCallback(() => {
    if (hasMore) {
      nextPage()
    }
  }, [hasMore, nextPage])
  
  return {
    currentData,
    currentPage,
    pageSize,
    totalPages,
    totalItems,
    hasNextPage,
    hasPreviousPage,
    isFirstPage,
    isLastPage,
    nextPage,
    previousPage,
    goToPage,
    setPageSize,
    reset,
    loadMore,
    hasMore
  }
}

// Hook para paginación con carga remota
export const useRemotePagination = <T>(
  fetchFn: (page: number, pageSize: number) => Promise<{
    data: T[]
    total: number
    hasMore?: boolean
  }>,
  config: PaginationConfig = {}
) => {
  const { pageSize: initialPageSize = 20, initialPage = 1 } = config
  
  const [currentPage, setCurrentPage] = useState(initialPage)
  const [pageSize, setPageSizeState] = useState(initialPageSize)
  const [data, setData] = useState<T[]>([])
  const [totalItems, setTotalItems] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const totalPages = Math.ceil(totalItems / pageSize)
  const hasNextPage = currentPage < totalPages
  const hasPreviousPage = currentPage > 1
  
  // Función para cargar datos
  const loadData = useCallback(async (page: number, size: number) => {
    setLoading(true)
    setError(null)
    
    try {
      const result = await fetchFn(page, size)
      setData(result.data)
      setTotalItems(result.total)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }, [fetchFn])
  
  // Cargar datos cuando cambie la página o tamaño
  const loadCurrentData = useCallback(() => {
    loadData(currentPage, pageSize)
  }, [currentPage, pageSize, loadData])
  
  // Acciones
  const nextPage = useCallback(() => {
    if (hasNextPage) {
      setCurrentPage(prev => prev + 1)
    }
  }, [hasNextPage])
  
  const previousPage = useCallback(() => {
    if (hasPreviousPage) {
      setCurrentPage(prev => prev - 1)
    }
  }, [hasPreviousPage])
  
  const goToPage = useCallback((page: number) => {
    const clampedPage = Math.max(1, Math.min(page, totalPages))
    setCurrentPage(clampedPage)
  }, [totalPages])
  
  const setPageSize = useCallback((size: number) => {
    setPageSizeState(size)
    setCurrentPage(1) // Reset a primera página
  }, [])
  
  const reset = useCallback(() => {
    setCurrentPage(initialPage)
    setPageSizeState(initialPageSize)
    setData([])
    setTotalItems(0)
    setError(null)
  }, [initialPage, initialPageSize])
  
  return {
    // Datos
    data,
    currentPage,
    pageSize,
    totalPages,
    totalItems,
    
    // Estados
    loading,
    error,
    hasNextPage,
    hasPreviousPage,
    isFirstPage: currentPage === 1,
    isLastPage: currentPage === totalPages,
    
    // Acciones
    nextPage,
    previousPage,
    goToPage,
    setPageSize,
    reset,
    loadData: loadCurrentData,
    
    // Para infinite scroll
    hasMore: hasNextPage
  }
}

// Hook para infinite scroll
export const useInfiniteScroll = <T>(
  fetchFn: (page: number, pageSize: number) => Promise<{
    data: T[]
    hasMore: boolean
  }>,
  config: PaginationConfig = {}
) => {
  const { pageSize: initialPageSize = 20 } = config
  
  const [data, setData] = useState<T[]>([])
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return
    
    setLoading(true)
    setError(null)
    
    try {
      const result = await fetchFn(page, initialPageSize)
      
      setData(prev => [...prev, ...result.data])
      setHasMore(result.hasMore)
      setPage(prev => prev + 1)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }, [page, loading, hasMore, fetchFn, initialPageSize])
  
  const reset = useCallback(() => {
    setData([])
    setPage(1)
    setHasMore(true)
    setError(null)
  }, [])
  
  return {
    data,
    loading,
    hasMore,
    error,
    loadMore,
    reset
  }
}

export default usePagination
