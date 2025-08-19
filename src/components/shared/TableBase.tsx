import React, { ReactNode } from 'react'
import { Button } from '../ui/button'
import { Card } from '../ui/card'
import { Input } from '../ui/input'
import { 
  Search, 
  Plus, 
  RefreshCw, 
  ChevronLeft, 
  ChevronRight,
  MoreHorizontal,
  CheckSquare,
  Square
} from 'lucide-react'
import { config } from '../../lib/config'

// Tipos para el componente base
export interface TableColumn<T> {
  key: keyof T | string
  title: string
  width?: string
  render?: (value: any, item: T, index: number) => ReactNode
  sortable?: boolean
  searchable?: boolean
  mobilePriority?: boolean // Nueva propiedad para priorizar columnas en móvil
}

export interface TableAction<T> {
  label: string
  icon?: ReactNode
  onClick: (item: T) => void
  variant?: 'default' | 'outline' | 'destructive'
  disabled?: (item: T) => boolean
  hidden?: (item: T) => boolean
}

export interface PaginationInfo {
  currentPage: number
  totalPages: number
  totalItems: number
  pageSize: number
  start: number
  end: number
  hasNext: boolean
  hasPrev: boolean
}

export interface TableBaseProps<T> {
  // Datos
  items: T[]
  columns: TableColumn<T>[]
  loading?: boolean
  error?: string | null
  
  // Funcionalidades
  searchable?: boolean
  searchTerm?: string
  onSearchChange?: (term: string) => void
  searchPlaceholder?: string
  
  // Paginación
  pagination?: PaginationInfo
  onPageChange?: (page: number) => void
  
  // Acciones
  actions?: TableAction<T>[]
  onRefresh?: () => void
  onCreate?: () => void
  createLabel?: string
  
  // Selección múltiple
  selectable?: boolean
  selectedItems?: string[]
  onSelectionChange?: (selectedIds: string[]) => void
  getItemId?: (item: T) => string
  
  // Personalización
  title?: string
  subtitle?: string
  emptyMessage?: string
  className?: string
  
  // Estados
  showCreateButton?: boolean
  showRefreshButton?: boolean
}

function TableBase<T>({
  items,
  columns,
  loading = false,
  error = null,
  
  searchable = true,
  searchTerm = '',
  onSearchChange,
  searchPlaceholder = 'Buscar...',
  
  pagination,
  onPageChange,
  
  actions = [],
  onRefresh,
  onCreate,
  createLabel = 'Nuevo',
  
  selectable = false,
  selectedItems = [],
  onSelectionChange,
  getItemId = (item: any) => item.id,
  
  title,
  subtitle,
  emptyMessage = 'No hay elementos para mostrar',
  className = '',
  
  showCreateButton = true,
  showRefreshButton = true
}: TableBaseProps<T>) {

  // Manejar selección individual
  const handleItemSelection = (item: T) => {
    if (!onSelectionChange) return
    
    const itemId = getItemId(item)
    const isSelected = selectedItems.includes(itemId)
    
    if (isSelected) {
      onSelectionChange(selectedItems.filter(id => id !== itemId))
    } else {
      onSelectionChange([...selectedItems, itemId])
    }
  }

  // Manejar selección de todos
  const handleSelectAll = () => {
    if (!onSelectionChange) return
    
    const allIds = items.map(getItemId)
    const allSelected = allIds.every(id => selectedItems.includes(id))
    
    if (allSelected) {
      onSelectionChange([])
    } else {
      onSelectionChange(allIds)
    }
  }

  // Obtener columnas prioritarias para móvil
  const mobileColumns = columns.filter(col => col.mobilePriority !== false)

  // Estados de carga y error
  if (loading) {
    return (
      <Card className={`p-8 ${className}`}>
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mr-3"></div>
          <span className="text-dark-text-secondary">Cargando...</span>
        </div>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={`p-8 ${className}`}>
        <div className="text-center">
          <div className="text-danger-500 mb-4">
            <div className="text-lg font-medium text-dark-text-primary">Error al cargar datos</div>
            <p className="text-sm text-dark-text-secondary mt-2">{error}</p>
          </div>
          {onRefresh && (
            <Button onClick={onRefresh} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Reintentar
            </Button>
          )}
        </div>
      </Card>
    )
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          {title && <h1 className="text-2xl font-bold text-dark-text-primary">{title}</h1>}
          {subtitle && <p className="text-dark-text-secondary">{subtitle}</p>}
        </div>
        
        <div className="flex gap-2">
          {showRefreshButton && onRefresh && (
            <Button
              onClick={onRefresh}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="hidden sm:inline">Actualizar</span>
            </Button>
          )}
          
          {showCreateButton && onCreate && (
            <Button
              onClick={onCreate}
              variant="default"
            >
              <Plus className="w-4 h-4 mr-2" />
              {createLabel}
            </Button>
          )}
        </div>
      </div>

      {/* Búsqueda */}
      {searchable && (
        <Card className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary-500 w-4 h-4" />
            <Input
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => onSearchChange?.(e.target.value)}
              className="pl-10"
            />
          </div>
        </Card>
      )}

      {/* Información de selección */}
      {selectable && selectedItems.length > 0 && (
        <div className="bg-primary-500/20 border border-primary-500/30 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-primary-500">
              {selectedItems.length} elemento(s) seleccionado(s)
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onSelectionChange?.([])}
            >
              Deseleccionar todos
            </Button>
          </div>
        </div>
      )}

      {/* Tabla */}
      <Card className="overflow-hidden">
        {items.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-dark-text-secondary mb-4">
              <div className="text-lg font-medium text-dark-text-primary">Sin resultados</div>
              <p className="text-sm mt-2">{emptyMessage}</p>
            </div>
            {onCreate && (
              <Button onClick={onCreate}>
                <Plus className="w-4 h-4 mr-2" />
                {createLabel}
              </Button>
            )}
          </div>
        ) : (
          <>
            {/* Vista de escritorio - Tabla */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-dark-bg-tertiary">
                  <tr>
                    {selectable && (
                      <th className="w-12 px-4 py-3 text-left">
                        <button
                          onClick={handleSelectAll}
                          className="flex items-center justify-center w-full"
                        >
                          {selectedItems.length === items.length ? (
                            <CheckSquare className="w-4 h-4 text-primary-500" />
                          ) : selectedItems.length > 0 ? (
                            <div className="w-4 h-4 bg-primary-500 rounded border-2 border-primary-500 relative">
                              <div className="w-2 h-0.5 bg-dark-text-primary absolute top-1.5 left-1"></div>
                            </div>
                          ) : (
                            <Square className="w-4 h-4 text-dark-text-secondary" />
                          )}
                        </button>
                      </th>
                    )}
                    
                    {columns.map((column, index) => (
                      <th
                        key={index}
                        className="px-4 py-3 text-left text-xs font-medium text-dark-text-secondary uppercase tracking-wider"
                        style={{ width: column.width }}
                      >
                        {column.title}
                      </th>
                    ))}
                    
                    {actions.length > 0 && (
                      <th className="px-4 py-3 text-left text-xs font-medium text-dark-text-secondary uppercase tracking-wider">
                        Acciones
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-dark-bg-secondary divide-y divide-dark-border">
                  {items.map((item, index) => {
                    const itemId = getItemId(item)
                    const isSelected = selectedItems.includes(itemId)
                    
                    return (
                      <tr
                        key={itemId}
                        className={`hover:bg-dark-bg-tertiary transition-colors ${
                          isSelected ? 'bg-primary-500/10' : ''
                        }`}
                      >
                        {selectable && (
                          <td className="w-12 px-4 py-3">
                            <button
                              onClick={() => handleItemSelection(item)}
                              className="flex items-center justify-center w-full"
                            >
                              {isSelected ? (
                                <CheckSquare className="w-4 h-4 text-primary-500" />
                              ) : (
                                <Square className="w-4 h-4 text-dark-text-secondary hover:text-dark-text-primary" />
                              )}
                            </button>
                          </td>
                        )}
                        
                        {columns.map((column, colIndex) => (
                          <td key={colIndex} className="px-4 py-3 text-sm text-dark-text-primary">
                            {column.render
                              ? column.render(
                                  typeof column.key === 'string' && column.key.includes('.')
                                    ? column.key.split('.').reduce((obj, key) => obj?.[key], item)
                                    : (item as any)[column.key],
                                  item,
                                  index
                                )
                              : typeof column.key === 'string' && column.key.includes('.')
                              ? column.key.split('.').reduce((obj, key) => obj?.[key], item)
                              : (item as any)[column.key]
                            }
                          </td>
                        ))}
                        
                        {actions.length > 0 && (
                          <td className="px-4 py-3 text-sm">
                            <div className="flex items-center gap-2">
                              {actions
                                .filter(action => !action.hidden?.(item))
                                .map((action, actionIndex) => (
                                  <Button
                                    key={actionIndex}
                                    size="sm"
                                    variant={action.variant || 'outline'}
                                    onClick={() => action.onClick(item)}
                                    disabled={action.disabled?.(item)}
                                    className="h-8 px-3"
                                  >
                                    {action.icon && <span className="mr-1">{action.icon}</span>}
                                    <span className="hidden sm:inline">{action.label}</span>
                                  </Button>
                                ))
                              }
                            </div>
                          </td>
                        )}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Vista móvil - Cards */}
            <div className="lg:hidden">
              <div className="p-4 space-y-4">
                {items.map((item, index) => {
                  const itemId = getItemId(item)
                  const isSelected = selectedItems.includes(itemId)
                  
                  return (
                    <div
                      key={itemId}
                      className={`bg-dark-bg-secondary border rounded-lg p-4 shadow-dark-sm ${
                        isSelected ? 'border-primary-500/30 bg-primary-500/10' : 'border-dark-border'
                      }`}
                    >
                      {/* Selección */}
                      {selectable && (
                        <div className="flex justify-end mb-3">
                          <button
                            onClick={() => handleItemSelection(item)}
                            className="flex items-center justify-center"
                          >
                            {isSelected ? (
                              <CheckSquare className="w-5 h-5 text-primary-500" />
                            ) : (
                              <Square className="w-5 h-5 text-dark-text-secondary" />
                            )}
                          </button>
                        </div>
                      )}

                      {/* Contenido de la card */}
                      <div className="space-y-3">
                        {mobileColumns.map((column, colIndex) => (
                          <div key={colIndex} className="flex justify-between items-start">
                            <span className="text-sm font-medium text-dark-text-secondary min-w-0 flex-1">
                              {column.title}:
                            </span>
                            <div className="text-sm text-dark-text-primary min-w-0 flex-1 text-right">
                              {column.render
                                ? column.render(
                                    typeof column.key === 'string' && column.key.includes('.')
                                      ? column.key.split('.').reduce((obj, key) => obj?.[key], item)
                                      : (item as any)[column.key],
                                    item,
                                    index
                                  )
                                : typeof column.key === 'string' && column.key.includes('.')
                                ? column.key.split('.').reduce((obj, key) => obj?.[key], item)
                                : (item as any)[column.key]
                              }
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Acciones */}
                      {actions.length > 0 && (
                        <div className="flex gap-2 mt-4 pt-3 border-t border-dark-border">
                          {actions
                            .filter(action => !action.hidden?.(item))
                            .map((action, actionIndex) => (
                              <Button
                                key={actionIndex}
                                size="sm"
                                variant={action.variant || 'outline'}
                                onClick={() => action.onClick(item)}
                                disabled={action.disabled?.(item)}
                                className="flex-1"
                              >
                                {action.icon && <span className="mr-1">{action.icon}</span>}
                                {action.label}
                              </Button>
                            ))
                          }
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </>
        )}

        {/* Paginación */}
        {pagination && pagination.totalPages > 1 && (
          <div className="px-4 py-3 border-t border-dark-border bg-dark-bg-tertiary">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-dark-text-secondary">
                Mostrando {pagination.start} a {pagination.end} de {pagination.totalItems} resultados
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange?.(pagination.currentPage - 1)}
                  disabled={!pagination.hasPrev}
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Anterior</span>
                </Button>
                
                <span className="text-sm text-dark-text-secondary px-3">
                  Página {pagination.currentPage + 1} de {pagination.totalPages}
                </span>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange?.(pagination.currentPage + 1)}
                  disabled={!pagination.hasNext}
                >
                  <span className="hidden sm:inline">Siguiente</span>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}

export default TableBase
