import { useState, useEffect, useMemo, useCallback } from 'react'

interface Product {
  id: string
  nombre: string
  codigo_sku: string
  categoria: string
  descripcion?: string
  precio_minorista: number
  precio_mayorista: number
  stock: number
}

interface UseOptimizedProductSearchOptions {
  products: Product[]
  searchTerm: string
  selectedCategory: string
  maxResults?: number
}

interface SearchResult {
  product: Product
  score: number
  exactCodeMatch: boolean
  codeStartsWith: boolean
  nameStartsWith: boolean
}

export function useOptimizedProductSearch({
  products,
  searchTerm,
  selectedCategory,
  maxResults = 50
}: UseOptimizedProductSearchOptions) {
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [isSearching, setIsSearching] = useState(false)

  // Debounce search term para evitar búsquedas excesivas
  useEffect(() => {
    setIsSearching(true)
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
      setIsSearching(false)
    }, 150) // Reducido de 300ms a 150ms para mejor respuesta

    return () => {
      clearTimeout(timer)
      setIsSearching(false)
    }
  }, [searchTerm])

  // Memoizar categorías únicas para evitar recálculos
  const categories = useMemo(() => {
    const uniqueCategories = new Set<string>()
    products.forEach(product => {
      if (product.categoria) {
        uniqueCategories.add(product.categoria)
      }
    })
    return ['todas', ...Array.from(uniqueCategories)]
  }, [products])

  // Función optimizada de búsqueda con scoring
  const searchProducts = useCallback((term: string, category: string): SearchResult[] => {
    if (!term.trim()) {
      // Sin término de búsqueda, mostrar productos por categoría
      const filtered = category === 'todas' 
        ? products 
        : products.filter(p => p.categoria === category)
      
      return filtered.slice(0, maxResults).map(product => ({
        product,
        score: 0,
        exactCodeMatch: false,
        codeStartsWith: false,
        nameStartsWith: false
      }))
    }

    const termLower = term.toLowerCase().trim()
    const results: SearchResult[] = []

    // Pre-calcular términos para optimizar
    const termLength = termLower.length

    for (const product of products) {
      // Verificar categoría primero (más rápido)
      if (category !== 'todas' && product.categoria !== category) {
        continue
      }

      let score = 0
      let exactCodeMatch = false
      let codeStartsWith = false
      let nameStartsWith = false

      // Búsqueda optimizada en código SKU
      const codeLower = product.codigo_sku.toLowerCase()
      if (codeLower === termLower) {
        exactCodeMatch = true
        score = 1000 // Máxima prioridad
      } else if (codeLower.startsWith(termLower)) {
        codeStartsWith = true
        score = 800
      } else if (codeLower.includes(termLower)) {
        score = 600
      }

      // Búsqueda en nombre (solo si no hay coincidencia exacta en código)
      if (score < 800) {
        const nameLower = product.nombre.toLowerCase()
        if (nameLower.startsWith(termLower)) {
          nameStartsWith = true
          score = Math.max(score, 400)
        } else if (nameLower.includes(termLower)) {
          score = Math.max(score, 200)
        }
      }

      // Búsqueda en categoría (peso menor)
      if (score < 200 && product.categoria.toLowerCase().includes(termLower)) {
        score = 100
      }

      // Búsqueda en descripción (peso menor)
      if (score < 100 && product.descripcion?.toLowerCase().includes(termLower)) {
        score = 50
      }

      // Solo agregar si hay coincidencia
      if (score > 0) {
        results.push({
          product,
          score,
          exactCodeMatch,
          codeStartsWith,
          nameStartsWith
        })
      }
    }

    // Ordenar por score (descendente) y limitar resultados
    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, maxResults)
  }, [products, maxResults])

  // Resultados memoizados
  const searchResults = useMemo(() => {
    return searchProducts(debouncedSearchTerm, selectedCategory)
  }, [searchProducts, debouncedSearchTerm, selectedCategory])

  // Productos filtrados (solo los productos, sin metadata de búsqueda)
  const filteredProducts = useMemo(() => {
    return searchResults.map(result => result.product)
  }, [searchResults])

  return {
    filteredProducts,
    searchResults,
    categories,
    isSearching,
    hasResults: searchResults.length > 0,
    resultCount: searchResults.length
  }
}
