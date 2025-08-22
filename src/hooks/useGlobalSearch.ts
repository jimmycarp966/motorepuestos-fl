import { useState, useEffect, useMemo, useCallback } from 'react'
import Fuse from 'fuse.js'
import { useAppStore } from '../store'
import { shallow } from 'zustand/shallow'

// ================================
// TIPOS PARA BÚSQUEDA GLOBAL
// ================================

export interface SearchableItem {
  id: string
  title: string
  subtitle?: string
  description?: string
  category: 'productos' | 'clientes' | 'ventas' | 'empleados' | 'navegacion'
  type: string
  icon?: string
  metadata?: Record<string, any>
  score?: number
  highlighted?: {
    title?: string
    subtitle?: string
    description?: string
  }
}

export interface SearchAction {
  label: string
  action: () => void
  icon?: string
  shortcut?: string
}

export interface SearchResult extends SearchableItem {
  actions: SearchAction[]
  relevance: number
}

export interface SearchFilters {
  categories: string[]
  types: string[]
  dateRange?: {
    from: Date
    to: Date
  }
  onlyFavorites?: boolean
}

export interface SearchOptions {
  threshold: number // 0.0 = exact match, 1.0 = match anything
  includeScore: boolean
  includeMatches: boolean
  findAllMatches: boolean
  minMatchCharLength: number
  location: number // where in the text to expect the match
  distance: number // how far from location a match can be
  useExtendedSearch: boolean
}

// ================================
// CONFIGURACIÓN DE FUSE.JS
// ================================

const defaultSearchOptions: SearchOptions = {
  threshold: 0.4,
  includeScore: true,
  includeMatches: true,
  findAllMatches: true,
  minMatchCharLength: 2,
  location: 0,
  distance: 100,
  useExtendedSearch: true
}

const searchKeys = [
  {
    name: 'title',
    weight: 1.0
  },
  {
    name: 'subtitle',
    weight: 0.8
  },
  {
    name: 'description',
    weight: 0.6
  },
  {
    name: 'metadata.codigo_sku',
    weight: 0.9
  },
  {
    name: 'metadata.categoria',
    weight: 0.7
  },
  {
    name: 'metadata.email',
    weight: 0.8
  },
  {
    name: 'metadata.telefono',
    weight: 0.7
  }
]

// ================================
// HOOK PRINCIPAL DE BÚSQUEDA GLOBAL
// ================================

export const useGlobalSearch = (initialFilters?: SearchFilters) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState<SearchFilters>(initialFilters || {
    categories: [],
    types: []
  })
  const [isSearching, setIsSearching] = useState(false)
  const [searchHistory, setSearchHistory] = useState<string[]>([])
  const [favorites, setFavorites] = useState<string[]>([])

  // Obtener datos del store
  const {
    productos,
    clientes,
    ventas,
    empleados,
    setCurrentModule,
    loading
  } = useAppStore(state => ({
    productos: state.productos || [],
    clientes: state.clientes || [],
    ventas: state.ventas || [],
    empleados: state.empleados || [],
    setCurrentModule: state.setCurrentModule,
    loading: state.loading
  }), shallow)

  // ================================
  // CREAR ÍNDICES DE BÚSQUEDA
  // ================================

  const searchableItems = useMemo(() => {
    const items: SearchableItem[] = []

    // Productos
    productos.forEach(producto => {
      items.push({
        id: `producto-${producto.id}`,
        title: producto.nombre,
        subtitle: `SKU: ${producto.codigo_sku}`,
        description: `${producto.categoria} - Stock: ${producto.stock} - $${producto.precio_minorista}`,
        category: 'productos',
        type: 'producto',
        icon: '📦',
        metadata: {
          codigo_sku: producto.codigo_sku,
          categoria: producto.categoria,
          precio: producto.precio_minorista,
          stock: producto.stock,
          precio_mayorista: producto.precio_mayorista
        }
      })
    })

    // Clientes
    clientes.forEach(cliente => {
      items.push({
        id: `cliente-${cliente.id}`,
        title: cliente.nombre,
        subtitle: cliente.email || cliente.telefono,
        description: `Cliente ${cliente.activo ? 'activo' : 'inactivo'}`,
        category: 'clientes',
        type: 'cliente',
        icon: '👤',
        metadata: {
          email: cliente.email,
          telefono: cliente.telefono,
          activo: cliente.activo
        }
      })
    })

    // Ventas recientes (últimas 50)
    ventas.slice(0, 50).forEach(venta => {
      const clienteNombre = venta.cliente?.nombre || 'Cliente sin nombre'
      const empleadoNombre = venta.empleado?.nombre || 'Empleado sin nombre'
      
      items.push({
        id: `venta-${venta.id}`,
        title: `Venta #${venta.id.slice(-8)}`,
        subtitle: `${clienteNombre} - $${venta.total}`,
        description: `Por ${empleadoNombre} - ${new Date(venta.created_at).toLocaleDateString()}`,
        category: 'ventas',
        type: 'venta',
        icon: '💰',
        metadata: {
          total: venta.total,
          cliente: clienteNombre,
          empleado: empleadoNombre,
          fecha: venta.created_at
        }
      })
    })

    // Empleados
    empleados.forEach(empleado => {
      items.push({
        id: `empleado-${empleado.id}`,
        title: empleado.nombre,
        subtitle: `${empleado.rol} - ${empleado.email}`,
        description: `Empleado ${empleado.activo ? 'activo' : 'inactivo'}`,
        category: 'empleados',
        type: 'empleado',
        icon: '👷',
        metadata: {
          email: empleado.email,
          rol: empleado.rol,
          activo: empleado.activo
        }
      })
    })

    // Elementos de navegación
    const navigationItems = [
      {
        id: 'nav-dashboard',
        title: 'Dashboard',
        subtitle: 'Panel principal',
        description: 'Resumen y estadísticas generales',
        category: 'navegacion' as const,
        type: 'pagina',
        icon: '📊',
        metadata: { module: 'dashboard' }
      },
      {
        id: 'nav-productos',
        title: 'Productos',
        subtitle: 'Gestión de inventario',
        description: 'Administrar productos y categorías',
        category: 'navegacion' as const,
        type: 'pagina',
        icon: '📦',
        metadata: { module: 'productos' }
      },
      {
        id: 'nav-ventas',
        title: 'Ventas',
        subtitle: 'Gestión de ventas',
        description: 'Registrar y consultar ventas',
        category: 'navegacion' as const,
        type: 'pagina',
        icon: '💰',
        metadata: { module: 'ventas' }
      },
      {
        id: 'nav-clientes',
        title: 'Clientes',
        subtitle: 'Gestión de clientes',
        description: 'Administrar información de clientes',
        category: 'navegacion' as const,
        type: 'pagina',
        icon: '👤',
        metadata: { module: 'clientes' }
      },
      {
        id: 'nav-empleados',
        title: 'Empleados',
        subtitle: 'Gestión de personal',
        description: 'Administrar empleados y permisos',
        category: 'navegacion' as const,
        type: 'pagina',
        icon: '👷',
        metadata: { module: 'empleados' }
      },
      {
        id: 'nav-caja',
        title: 'Caja',
        subtitle: 'Gestión de caja',
        description: 'Control de ingresos y egresos',
        category: 'navegacion' as const,
        type: 'pagina',
        icon: '💳',
        metadata: { module: 'caja' }
      },
      {
        id: 'nav-reportes',
        title: 'Reportes',
        subtitle: 'Informes y análisis',
        description: 'Generar reportes detallados',
        category: 'navegacion' as const,
        type: 'pagina',
        icon: '📈',
        metadata: { module: 'reportes' }
      }
    ]

    items.push(...navigationItems)

    return items
  }, [productos, clientes, ventas, empleados])

  // ================================
  // CONFIGURAR FUSE.JS
  // ================================

  const fuse = useMemo(() => {
    return new Fuse(searchableItems, {
      keys: searchKeys,
      ...defaultSearchOptions
    })
  }, [searchableItems])

  // ================================
  // FUNCIÓN DE BÚSQUEDA
  // ================================

  const search = useCallback((term: string): SearchResult[] => {
    if (!term.trim()) return []

    setIsSearching(true)

    try {
      const results = fuse.search(term, { limit: 20 })
      
      const processedResults: SearchResult[] = results.map(result => {
        const item = result.item
        const score = result.score || 0
        const relevance = 1 - score // Invertir score para que mayor relevancia = mayor número

        // Crear acciones contextuales
        const actions = generateActions(item, setCurrentModule)

        // Generar highlights si hay matches
        const highlighted = generateHighlights(result.matches || [])

        return {
          ...item,
          actions,
          relevance,
          score,
          highlighted
        }
      })

      // Aplicar filtros
      const filteredResults = applyFilters(processedResults, filters)

      // Ordenar por relevancia y categoría
      const sortedResults = sortResults(filteredResults)

      return sortedResults

    } catch (error) {
      console.error('❌ Error en búsqueda global:', error)
      return []
    } finally {
      setIsSearching(false)
    }
  }, [fuse, filters, setCurrentModule])

  // ================================
  // BÚSQUEDA CON DEBOUNCE
  // ================================

  const [debouncedTerm, setDebouncedTerm] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedTerm(searchTerm)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchTerm])

  useEffect(() => {
    if (debouncedTerm) {
      const results = search(debouncedTerm)
      setSearchResults(results)
      
      // Agregar a historial si no está vacío y no existe
      if (debouncedTerm.length > 2 && !searchHistory.includes(debouncedTerm)) {
        setSearchHistory(prev => [debouncedTerm, ...prev.slice(0, 9)]) // Mantener últimos 10
      }
    } else {
      setSearchResults([])
    }
  }, [debouncedTerm, search, searchHistory])

  // ================================
  // FUNCIONES DE CONTROL
  // ================================

  const clearSearch = useCallback(() => {
    setSearchTerm('')
    setSearchResults([])
  }, [])

  const executeAction = useCallback((action: SearchAction) => {
    action.action()
    clearSearch()
  }, [clearSearch])

  const addToFavorites = useCallback((itemId: string) => {
    setFavorites(prev => {
      if (prev.includes(itemId)) return prev
      return [...prev, itemId]
    })
  }, [])

  const removeFromFavorites = useCallback((itemId: string) => {
    setFavorites(prev => prev.filter(id => id !== itemId))
  }, [])

  const clearHistory = useCallback(() => {
    setSearchHistory([])
  }, [])

  // ================================
  // BÚSQUEDAS SUGERIDAS
  // ================================

  const getSuggestions = useCallback((): string[] => {
    const suggestions = [
      'productos con stock bajo',
      'clientes activos',
      'ventas de hoy',
      'empleados administradores'
    ]

    // Agregar sugerencias basadas en datos existentes
    if (productos.length > 0) {
      const categorias = [...new Set(productos.map(p => p.categoria))]
      suggestions.push(...categorias.map(cat => `productos ${cat}`))
    }

    return suggestions
  }, [productos])

  // ================================
  // CARGAR CONFIGURACIÓN DESDE LOCALSTORAGE
  // ================================

  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem('search_history')
      if (savedHistory) {
        setSearchHistory(JSON.parse(savedHistory))
      }

      const savedFavorites = localStorage.getItem('search_favorites')
      if (savedFavorites) {
        setFavorites(JSON.parse(savedFavorites))
      }
    } catch (error) {
      console.warn('⚠️ Error cargando configuración de búsqueda:', error)
    }
  }, [])

  // ================================
  // GUARDAR CONFIGURACIÓN EN LOCALSTORAGE
  // ================================

  useEffect(() => {
    try {
      localStorage.setItem('search_history', JSON.stringify(searchHistory))
    } catch (error) {
      console.warn('⚠️ Error guardando historial de búsqueda:', error)
    }
  }, [searchHistory])

  useEffect(() => {
    try {
      localStorage.setItem('search_favorites', JSON.stringify(favorites))
    } catch (error) {
      console.warn('⚠️ Error guardando favoritos de búsqueda:', error)
    }
  }, [favorites])

  return {
    // Estado
    searchTerm,
    searchResults,
    isSearching,
    filters,
    searchHistory,
    favorites,
    
    // Funciones
    setSearchTerm,
    setFilters,
    search,
    clearSearch,
    executeAction,
    addToFavorites,
    removeFromFavorites,
    clearHistory,
    getSuggestions,
    
    // Metadatos
    totalItems: searchableItems.length,
    isLoading: loading
  }
}

// ================================
// FUNCIONES AUXILIARES
// ================================

function generateActions(item: SearchableItem, setCurrentModule: any): SearchAction[] {
  const actions: SearchAction[] = []

  switch (item.category) {
    case 'productos':
      actions.push(
        {
          label: 'Ver producto',
          action: () => setCurrentModule('productos'),
          icon: '👁️',
          shortcut: 'Enter'
        },
        {
          label: 'Editar',
          action: () => setCurrentModule('productos'),
          icon: '✏️',
          shortcut: 'Ctrl+E'
        }
      )
      break

    case 'clientes':
      actions.push(
        {
          label: 'Ver cliente',
          action: () => setCurrentModule('clientes'),
          icon: '👁️',
          shortcut: 'Enter'
        },
        {
          label: 'Nueva venta',
          action: () => setCurrentModule('ventas'),
          icon: '💰',
          shortcut: 'Ctrl+N'
        }
      )
      break

    case 'ventas':
      actions.push(
        {
          label: 'Ver venta',
          action: () => setCurrentModule('ventas'),
          icon: '👁️',
          shortcut: 'Enter'
        }
      )
      break

    case 'empleados':
      actions.push(
        {
          label: 'Ver empleado',
          action: () => setCurrentModule('empleados'),
          icon: '👁️',
          shortcut: 'Enter'
        }
      )
      break

    case 'navegacion':
      actions.push(
        {
          label: 'Ir a página',
          action: () => setCurrentModule(item.metadata?.module),
          icon: '🚀',
          shortcut: 'Enter'
        }
      )
      break
  }

  return actions
}

function generateHighlights(matches: any[]): SearchableItem['highlighted'] {
  const highlighted: SearchableItem['highlighted'] = {}

  matches.forEach(match => {
    const key = match.key as keyof SearchableItem['highlighted']
    if (key === 'title' || key === 'subtitle' || key === 'description') {
      // Simplificado - en un caso real se procesarían los índices de matches
      highlighted[key] = match.value
    }
  })

  return highlighted
}

function applyFilters(results: SearchResult[], filters: SearchFilters): SearchResult[] {
  let filtered = results

  if (filters.categories.length > 0) {
    filtered = filtered.filter(result => 
      filters.categories.includes(result.category)
    )
  }

  if (filters.types.length > 0) {
    filtered = filtered.filter(result => 
      filters.types.includes(result.type)
    )
  }

  if (filters.onlyFavorites) {
    // Esta lógica requeriría acceso a los favoritos desde el hook
    // filtered = filtered.filter(result => favorites.includes(result.id))
  }

  return filtered
}

function sortResults(results: SearchResult[]): SearchResult[] {
  return results.sort((a, b) => {
    // Priorizar por categoría
    const categoryPriority = {
      'navegacion': 4,
      'productos': 3,
      'clientes': 2,
      'ventas': 1,
      'empleados': 0
    }

    const aPriority = categoryPriority[a.category] || 0
    const bPriority = categoryPriority[b.category] || 0

    if (aPriority !== bPriority) {
      return bPriority - aPriority
    }

    // Luego por relevancia
    return b.relevance - a.relevance
  })
}

export default useGlobalSearch
export type { SearchResult, SearchableItem, SearchAction, SearchFilters, SearchOptions }
