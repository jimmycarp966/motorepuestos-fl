import { useState, useEffect, useRef, useCallback } from 'react'

interface Product {
  id: string
  nombre: string
  codigo_sku: string
  categoria: string
  descripcion?: string
  precio_minorista: number
  precio_mayorista: number
  stock: number
  unidad_medida: string
}

interface UseProductSearchOptions {
  products: Product[]
  searchTerm: string
  selectedCategory: string
  onProductSelect: (product: Product) => void
}

export function useProductSearch({
  products,
  searchTerm,
  selectedCategory,
  onProductSelect
}: UseProductSearchOptions) {
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [isNavigating, setIsNavigating] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const selectedProductRef = useRef<HTMLDivElement>(null)

  // Función para priorizar productos por código SKU
  const prioritizeByCode = useCallback((products: Product[], term: string) => {
    if (!term.trim()) return products

    const termLower = term.toLowerCase()
    
    return products.sort((a, b) => {
      const aCodeMatch = a.codigo_sku.toLowerCase().includes(termLower)
      const bCodeMatch = b.codigo_sku.toLowerCase().includes(termLower)
      
      // Si ambos coinciden con código, mantener orden original
      if (aCodeMatch && bCodeMatch) return 0
      
      // Priorizar coincidencias de código
      if (aCodeMatch && !bCodeMatch) return -1
      if (!aCodeMatch && bCodeMatch) return 1
      
      // Si ninguno coincide con código, mantener orden original
      return 0
    })
  }, [])

  // Filtrar y ordenar productos
  useEffect(() => {
    if (!products) {
      setFilteredProducts([])
      return
    }

    if (!searchTerm.trim()) {
      const filtered = selectedCategory === 'todas' 
        ? products 
        : products.filter(p => p.categoria === selectedCategory)
      setFilteredProducts(filtered)
      setSelectedIndex(-1)
      return
    }

    const term = searchTerm.toLowerCase().trim()
    
    let filtered = products.filter(producto => {
      const matchesSearch = 
        producto.nombre.toLowerCase().includes(term) ||
        producto.codigo_sku.toLowerCase().includes(term) ||
        producto.categoria.toLowerCase().includes(term) ||
        (producto.descripcion && producto.descripcion.toLowerCase().includes(term))
      
      const matchesCategory = selectedCategory === 'todas' || producto.categoria === selectedCategory
      
      return matchesSearch && matchesCategory
    })

    // Priorizar por código SKU
    filtered = prioritizeByCode(filtered, term)
    
    setFilteredProducts(filtered)
    setSelectedIndex(-1)
  }, [products, searchTerm, selectedCategory, prioritizeByCode])

  // Navegación por teclado
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!filteredProducts.length) return

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        setIsNavigating(true)
        setSelectedIndex(prev => 
          prev < filteredProducts.length - 1 ? prev + 1 : 0
        )
        break
        
      case 'ArrowUp':
        event.preventDefault()
        setIsNavigating(true)
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : filteredProducts.length - 1
        )
        break
        
      case 'Enter':
        event.preventDefault()
        if (selectedIndex >= 0 && selectedIndex < filteredProducts.length) {
          onProductSelect(filteredProducts[selectedIndex])
          setSelectedIndex(-1)
          setIsNavigating(false)
        }
        break
        
      case 'Escape':
        setSelectedIndex(-1)
        setIsNavigating(false)
        break
    }
  }, [filteredProducts, selectedIndex, onProductSelect])

  // Scroll automático al elemento seleccionado
  useEffect(() => {
    if (selectedIndex >= 0 && selectedProductRef.current && containerRef.current) {
      // Usar setTimeout para asegurar que el DOM se haya actualizado
      setTimeout(() => {
        if (selectedProductRef.current) {
          selectedProductRef.current.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
            inline: 'nearest'
          })
        }
      }, 0)
    }
  }, [selectedIndex])

  // Event listeners para navegación
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  // Resetear navegación cuando cambia el término de búsqueda
  useEffect(() => {
    setSelectedIndex(-1)
    setIsNavigating(false)
  }, [searchTerm])

  return {
    filteredProducts,
    selectedIndex,
    isNavigating,
    containerRef,
    selectedProductRef
  }
}
