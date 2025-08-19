import React, { useState, useRef, useEffect } from 'react'
import { cn } from '../../lib/utils'
import { useGlobalSearch, SearchResult } from '../../hooks/useGlobalSearch'
import { MotorCard } from './motor-card'
import { Button } from './button'
import { 
  Search, 
  X, 
  Clock, 
  Star, 
  Filter,
  ArrowRight,
  Command,
  Zap
} from 'lucide-react'

// ================================
// COMPONENTE PRINCIPAL DE BÚSQUEDA
// ================================

interface GlobalSearchProps {
  isOpen: boolean
  onClose: () => void
  placeholder?: string
  className?: string
}

export const GlobalSearch: React.FC<GlobalSearchProps> = ({
  isOpen,
  onClose,
  placeholder = 'Buscar productos, clientes, ventas...',
  className
}) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)

  const {
    searchTerm,
    searchResults,
    isSearching,
    filters,
    searchHistory,
    favorites,
    setSearchTerm,
    setFilters,
    executeAction,
    addToFavorites,
    removeFromFavorites,
    clearHistory,
    getSuggestions
  } = useGlobalSearch()

  // ================================
  // EFECTOS
  // ================================

  // Focus automático cuando se abre
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return

      switch (e.key) {
        case 'Escape':
          onClose()
          break
        case 'ArrowDown':
          e.preventDefault()
          setSelectedIndex(prev => 
            Math.min(prev + 1, searchResults.length - 1)
          )
          break
        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex(prev => Math.max(prev - 1, 0))
          break
        case 'Enter':
          e.preventDefault()
          const selectedResult = searchResults[selectedIndex]
          if (selectedResult?.actions[0]) {
            executeAction(selectedResult.actions[0])
          }
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, searchResults, selectedIndex, onClose, executeAction])

  // Reset selected index when results change
  useEffect(() => {
    setSelectedIndex(0)
  }, [searchResults])

  // ================================
  // RENDERIZADO CONDICIONAL
  // ================================

  if (!isOpen) return null

  const showHistory = !searchTerm && searchHistory.length > 0
  const showSuggestions = !searchTerm && searchHistory.length === 0
  const showResults = searchTerm && searchResults.length > 0
  const showEmpty = searchTerm && !isSearching && searchResults.length === 0

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
      <div className="flex items-start justify-center pt-20 px-4">
        <MotorCard 
          variant="default" 
          className={cn(
            "w-full max-w-2xl max-h-[80vh] overflow-hidden",
            className
          )}
        >
          {/* Header con barra de búsqueda */}
          <div className="p-4 border-b border-dark-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark-text-secondary w-5 h-5" />
              <input
                ref={inputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={placeholder}
                className="w-full pl-10 pr-20 py-3 text-lg border-0 outline-none bg-transparent"
              />
              
              {/* Controles del lado derecho */}
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                {/* Loading indicator */}
                {isSearching && (
                  <div className="animate-spin w-4 h-4 border-2 border-moto-blue border-t-transparent rounded-full" />
                )}
                
                {/* Filter toggle */}
                <Button
                  size="sm"
                  variant={showFilters ? 'primary' : 'default'}
                  onClick={() => setShowFilters(!showFilters)}
                  className="p-2"
                >
                  <Filter className="w-4 h-4" />
                </Button>
                
                {/* Close button */}
                <Button
                  size="sm"
                  variant="default"
                  onClick={onClose}
                  className="p-2"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Filtros expandidos */}
            {showFilters && <SearchFilters filters={filters} setFilters={setFilters} />}
          </div>

          {/* Contenido principal */}
          <div className="max-h-96 overflow-y-auto">
            {/* Historial de búsqueda */}
            {showHistory && (
              <SearchHistory 
                history={searchHistory}
                onSelectHistory={setSearchTerm}
                onClearHistory={clearHistory}
              />
            )}

            {/* Sugerencias */}
            {showSuggestions && (
              <SearchSuggestions 
                suggestions={getSuggestions()}
                onSelectSuggestion={setSearchTerm}
              />
            )}

            {/* Resultados de búsqueda */}
            {showResults && (
              <SearchResults
                results={searchResults}
                selectedIndex={selectedIndex}
                onExecuteAction={executeAction}
                onAddToFavorites={addToFavorites}
                onRemoveFromFavorites={removeFromFavorites}
                favorites={favorites}
              />
            )}

            {/* Estado vacío */}
            {showEmpty && (
              <EmptySearchState searchTerm={searchTerm} />
            )}
          </div>

          {/* Footer con shortcuts */}
          <SearchFooter />
        </MotorCard>
      </div>
    </div>
  )
}

// ================================
// COMPONENTE DE FILTROS
// ================================

interface SearchFiltersProps {
  filters: any
  setFilters: (filters: any) => void
}

const SearchFilters: React.FC<SearchFiltersProps> = ({ filters, setFilters }) => {
  const categories = [
    { id: 'productos', label: 'Productos', icon: '📦' },
    { id: 'clientes', label: 'Clientes', icon: '👤' },
    { id: 'ventas', label: 'Ventas', icon: '💰' },
    { id: 'empleados', label: 'Empleados', icon: '👷' },
    { id: 'navegacion', label: 'Navegación', icon: '🧭' }
  ]

  const toggleCategory = (categoryId: string) => {
    const newCategories = filters.categories.includes(categoryId)
      ? filters.categories.filter((c: string) => c !== categoryId)
      : [...filters.categories, categoryId]
    
    setFilters({ ...filters, categories: newCategories })
  }

  return (
    <div className="mt-4 pt-4 border-t border-dark-border">
      <div className="flex flex-wrap gap-2">
        {categories.map(category => (
          <Button
            key={category.id}
            size="sm"
            variant={filters.categories.includes(category.id) ? 'primary' : 'default'}
            onClick={() => toggleCategory(category.id)}
            className="text-sm"
          >
            <span className="mr-1">{category.icon}</span>
            {category.label}
          </Button>
        ))}
      </div>
    </div>
  )
}

// ================================
// COMPONENTE DE HISTORIAL
// ================================

interface SearchHistoryProps {
  history: string[]
  onSelectHistory: (term: string) => void
  onClearHistory: () => void
}

const SearchHistory: React.FC<SearchHistoryProps> = ({
  history,
  onSelectHistory,
  onClearHistory
}) => (
  <div className="p-4">
    <div className="flex items-center justify-between mb-3">
      <h3 className="text-sm font-semibold text-dark-text-primary flex items-center">
        <Clock className="w-4 h-4 mr-2" />
        Búsquedas recientes
      </h3>
      <Button
        size="sm"
        variant="default"
        onClick={onClearHistory}
        className="text-xs text-dark-text-secondary hover:text-dark-text-primary"
      >
        Limpiar
      </Button>
    </div>
    
    <div className="space-y-1">
      {history.slice(0, 5).map((term, index) => (
        <button
          key={index}
          onClick={() => onSelectHistory(term)}
          className="w-full text-left px-3 py-2 rounded-lg hover:bg-dark-bg-tertiary text-sm text-dark-text-primary transition-colors"
        >
          {term}
        </button>
      ))}
    </div>
  </div>
)

// ================================
// COMPONENTE DE SUGERENCIAS
// ================================

interface SearchSuggestionsProps {
  suggestions: string[]
  onSelectSuggestion: (suggestion: string) => void
}

const SearchSuggestions: React.FC<SearchSuggestionsProps> = ({
  suggestions,
  onSelectSuggestion
}) => (
  <div className="p-4">
    <h3 className="text-sm font-semibold text-dark-text-primary mb-3 flex items-center">
      <Zap className="w-4 h-4 mr-2" />
      Búsquedas sugeridas
    </h3>
    
    <div className="space-y-1">
      {suggestions.slice(0, 6).map((suggestion, index) => (
        <button
          key={index}
          onClick={() => onSelectSuggestion(suggestion)}
          className="w-full text-left px-3 py-2 rounded-lg hover:bg-dark-bg-tertiary text-sm text-dark-text-secondary transition-colors"
        >
          {suggestion}
        </button>
      ))}
    </div>
  </div>
)

// ================================
// COMPONENTE DE RESULTADOS
// ================================

interface SearchResultsProps {
  results: SearchResult[]
  selectedIndex: number
  onExecuteAction: (action: any) => void
  onAddToFavorites: (id: string) => void
  onRemoveFromFavorites: (id: string) => void
  favorites: string[]
}

const SearchResults: React.FC<SearchResultsProps> = ({
  results,
  selectedIndex,
  onExecuteAction,
  onAddToFavorites,
  onRemoveFromFavorites,
  favorites
}) => (
  <div className="py-2">
    {results.map((result, index) => {
      const isFavorite = favorites.includes(result.id)
      const isSelected = index === selectedIndex

      return (
        <div
          key={result.id}
          className={cn(
            "mx-2 mb-1 p-3 rounded-lg transition-all duration-150 cursor-pointer",
            isSelected 
              ? "bg-moto-blue-50 border-l-4 border-moto-blue" 
              : "hover:bg-dark-bg-tertiary"
          )}
          onClick={() => result.actions[0] && onExecuteAction(result.actions[0])}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              {/* Header */}
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">{result.icon}</span>
                <h4 className="font-semibold text-dark-text-primary truncate">
                  {result.highlighted?.title || result.title}
                </h4>
                <span className="px-2 py-1 text-xs rounded-full bg-dark-bg-tertiary text-dark-text-secondary">
                  {result.category}
                </span>
              </div>

              {/* Subtitle */}
              {result.subtitle && (
                <p className="text-sm text-dark-text-secondary mb-1">
                  {result.highlighted?.subtitle || result.subtitle}
                </p>
              )}

              {/* Description */}
              {result.description && (
                <p className="text-sm text-dark-text-secondary line-clamp-2">
                  {result.highlighted?.description || result.description}
                </p>
              )}

              {/* Actions */}
              <div className="flex items-center gap-2 mt-2">
                {result.actions.slice(0, 2).map((action, actionIndex) => (
                  <Button
                    key={actionIndex}
                    size="sm"
                    variant={actionIndex === 0 ? 'primary' : 'default'}
                    onClick={(e) => {
                      e.stopPropagation()
                      onExecuteAction(action)
                    }}
                    className="text-xs"
                  >
                    {action.icon && <span className="mr-1">{action.icon}</span>}
                    {action.label}
                    {action.shortcut && (
                      <span className="ml-1 text-xs opacity-60">
                        {action.shortcut}
                      </span>
                    )}
                  </Button>
                ))}
              </div>
            </div>

            {/* Sidebar actions */}
            <div className="flex flex-col items-center gap-1 ml-3">
              {/* Favorite toggle */}
              <Button
                size="sm"
                variant="default"
                onClick={(e) => {
                  e.stopPropagation()
                  isFavorite 
                    ? onRemoveFromFavorites(result.id)
                    : onAddToFavorites(result.id)
                }}
                className="p-1"
              >
                <Star 
                  className={cn(
                    "w-4 h-4",
                    isFavorite ? "fill-yellow-400 text-yellow-400" : "text-dark-text-secondary"
                  )} 
                />
              </Button>

              {/* Relevance score */}
              <div className="text-xs text-dark-text-secondary text-center">
                {Math.round(result.relevance * 100)}%
              </div>
            </div>
          </div>
        </div>
      )
    })}
  </div>
)

// ================================
// COMPONENTE DE ESTADO VACÍO
// ================================

interface EmptySearchStateProps {
  searchTerm: string
}

const EmptySearchState: React.FC<EmptySearchStateProps> = ({ searchTerm }) => (
  <div className="p-8 text-center">
    <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
      <Search className="w-8 h-8 text-dark-border" />
    </div>
    <h3 className="text-lg font-semibold text-dark-text-primary mb-2">
      Sin resultados
    </h3>
    <p className="text-dark-text-secondary mb-4">
      No encontramos resultados para "{searchTerm}"
    </p>
    <div className="text-sm text-dark-text-secondary">
      <p>Intenta:</p>
      <ul className="mt-2 space-y-1">
        <li>• Verificar la ortografía</li>
        <li>• Usar términos más generales</li>
        <li>• Buscar por código SKU o categoría</li>
      </ul>
    </div>
  </div>
)

// ================================
// COMPONENTE DE FOOTER
// ================================

const SearchFooter: React.FC = () => (
  <div className="px-4 py-3 bg-dark-bg-tertiary border-t border-dark-border">
    <div className="flex items-center justify-between text-xs text-dark-text-secondary">
      <div className="flex items-center gap-4">
        <span className="flex items-center gap-1">
          <ArrowRight className="w-3 h-3" />
          Seleccionar
        </span>
        <span className="flex items-center gap-1">
          <Command className="w-3 h-3" />
          + K Abrir búsqueda
        </span>
      </div>
      <span>ESC para cerrar</span>
    </div>
  </div>
)

export default GlobalSearch
