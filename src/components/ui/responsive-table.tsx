import React, { useState } from 'react'
import { cn } from '../../lib/utils'
import { MotorCard } from './motor-card'
import { Button } from './button'
import { useResponsive, useIsMobile } from '../../hooks/useResponsive'
import { ChevronDown, ChevronUp, MoreVertical, Eye, Edit, Trash2 } from 'lucide-react'

// Interfaces para la tabla responsive
export interface TableColumn<T = any> {
  key: string
  title: string
  width?: string
  sortable?: boolean
  render?: (value: any, item: T, index: number) => React.ReactNode
  mobileRender?: (value: any, item: T) => React.ReactNode
  hideOnMobile?: boolean
  priority?: 'high' | 'medium' | 'low' // Para mostrar en mobile
}

export interface TableAction<T = any> {
  label: string
  icon?: React.ComponentType<any>
  onClick: (item: T) => void
  variant?: 'default' | 'primary' | 'secondary' | 'danger'
  showInDropdown?: boolean
  hideOnMobile?: boolean
}

export interface ResponsiveTableProps<T = any> {
  data: T[]
  columns: TableColumn<T>[]
  actions?: TableAction<T>[]
  loading?: boolean
  emptyMessage?: string
  onSort?: (key: string, direction: 'asc' | 'desc') => void
  className?: string
  itemKey?: (item: T) => string | number
  searchable?: boolean
  onSearch?: (term: string) => void
}

// Componente de tabla mobile-first
export const ResponsiveTable = <T extends Record<string, any>>({
  data,
  columns,
  actions = [],
  loading = false,
  emptyMessage = 'No hay datos disponibles',
  onSort,
  className,
  itemKey = (item, index) => item.id || index,
  searchable = false,
  onSearch
}: ResponsiveTableProps<T>) => {
  const { isMobile, isTablet } = useResponsive()
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [expandedRows, setExpandedRows] = useState<Set<string | number>>(new Set())
  const [searchTerm, setSearchTerm] = useState('')

  // Manejar ordenamiento
  const handleSort = (key: string) => {
    if (!onSort) return

    const newDirection = sortKey === key && sortDirection === 'asc' ? 'desc' : 'asc'
    setSortKey(key)
    setSortDirection(newDirection)
    onSort(key, newDirection)
  }

  // Manejar expansión de filas en mobile
  const toggleRowExpansion = (key: string | number) => {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(key)) {
      newExpanded.delete(key)
    } else {
      newExpanded.add(key)
    }
    setExpandedRows(newExpanded)
  }

  // Filtrar columnas por prioridad en mobile
  const getVisibleColumns = () => {
    if (!isMobile) return columns

    // En mobile, mostrar solo columnas de alta prioridad inicialmente
    return columns.filter(col => 
      !col.hideOnMobile && (col.priority === 'high' || !col.priority)
    )
  }

  // Obtener columnas ocultas para el detalle expandible
  const getHiddenColumns = () => {
    if (!isMobile) return []
    return columns.filter(col => 
      col.hideOnMobile || col.priority === 'low' || col.priority === 'medium'
    )
  }

  // Renderizado para mobile (cards)
  const renderMobileView = () => (
    <div className="space-y-3">
      {data.map((item, index) => {
        const key = itemKey(item, index)
        const isExpanded = expandedRows.has(key)
        const visibleColumns = getVisibleColumns()
        const hiddenColumns = getHiddenColumns()

        return (
          <MotorCard key={key} variant="default" className="p-4">
            {/* Contenido principal siempre visible */}
            <div className="space-y-3">
              {visibleColumns.map((column) => (
                <div key={column.key} className="flex justify-between items-start">
                  <span className="text-sm font-medium text-dark-text-secondary min-w-0 mr-3">
                    {column.title}
                  </span>
                  <div className="text-sm text-dark-text-primary text-right flex-1 min-w-0">
                    {column.mobileRender 
                      ? column.mobileRender(item[column.key], item)
                      : column.render 
                        ? column.render(item[column.key], item, index)
                        : item[column.key]
                    }
                  </div>
                </div>
              ))}

              {/* Botón para expandir/contraer si hay columnas ocultas */}
              {hiddenColumns.length > 0 && (
                <button
                  onClick={() => toggleRowExpansion(key)}
                  className="flex items-center justify-center w-full pt-3 border-t border-dark-border text-sm text-dark-text-secondary hover:text-dark-text-primary transition-colors"
                >
                  {isExpanded ? (
                    <>
                      <ChevronUp className="w-4 h-4 mr-1" />
                      Mostrar menos
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-4 h-4 mr-1" />
                      Ver más detalles
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Contenido expandible */}
            {isExpanded && hiddenColumns.length > 0 && (
              <div className="mt-4 pt-4 border-t border-dark-border space-y-3">
                {hiddenColumns.map((column) => (
                  <div key={column.key} className="flex justify-between items-start">
                    <span className="text-sm font-medium text-dark-text-secondary min-w-0 mr-3">
                      {column.title}
                    </span>
                    <div className="text-sm text-dark-text-primary text-right flex-1 min-w-0">
                      {column.mobileRender 
                        ? column.mobileRender(item[column.key], item)
                        : column.render 
                          ? column.render(item[column.key], item, index)
                          : item[column.key]
                      }
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Acciones en mobile */}
            {actions.length > 0 && (
              <div className="mt-4 pt-4 border-t border-dark-border">
                <div className="flex flex-wrap gap-2">
                  {actions
                    .filter(action => !action.hideOnMobile)
                    .slice(0, 2) // Máximo 2 acciones principales
                    .map((action, actionIndex) => (
                      <Button
                        key={actionIndex}
                        size="sm"
                        variant={action.variant || 'default'}
                        onClick={() => action.onClick(item)}
                        className="flex-1 min-w-0"
                      >
                        {action.icon && <action.icon className="w-4 h-4 mr-1" />}
                        {action.label}
                      </Button>
                    ))}
                  
                  {/* Dropdown para acciones adicionales */}
                  {actions.length > 2 && (
                    <MobileActionsDropdown 
                      actions={actions.slice(2)} 
                      item={item} 
                    />
                  )}
                </div>
              </div>
            )}
          </MotorCard>
        )
      })}
    </div>
  )

  // Renderizado para desktop (tabla tradicional)
  const renderDesktopView = () => (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-dark-border">
            {columns.map((column) => (
              <th
                key={column.key}
                className={cn(
                  "px-4 py-3 text-left text-sm font-semibold text-dark-text-primary",
                  column.sortable && "cursor-pointer hover:bg-dark-bg-tertiary",
                  column.width && `w-[${column.width}]`
                )}
                onClick={() => column.sortable && handleSort(column.key)}
              >
                <div className="flex items-center gap-2">
                  {column.title}
                  {column.sortable && sortKey === column.key && (
                    sortDirection === 'asc' 
                      ? <ChevronUp className="w-4 h-4" />
                      : <ChevronDown className="w-4 h-4" />
                  )}
                </div>
              </th>
            ))}
            {actions.length > 0 && (
              <th className="px-4 py-3 text-right text-sm font-semibold text-dark-text-primary w-32">
                Acciones
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr 
              key={itemKey(item, index)} 
              className="border-b border-dark-border hover:bg-dark-bg-tertiary transition-colors"
            >
              {columns.map((column) => (
                <td key={column.key} className="px-4 py-3 text-sm text-dark-text-primary">
                  {column.render 
                    ? column.render(item[column.key], item, index)
                    : item[column.key]
                  }
                </td>
              ))}
              {actions.length > 0 && (
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    {actions.slice(0, 2).map((action, actionIndex) => (
                      <Button
                        key={actionIndex}
                        size="sm"
                        variant={action.variant || 'default'}
                        onClick={() => action.onClick(item)}
                      >
                        {action.icon && <action.icon className="w-4 h-4" />}
                        <span className="hidden lg:inline ml-1">{action.label}</span>
                      </Button>
                    ))}
                    {actions.length > 2 && (
                      <DesktopActionsDropdown 
                        actions={actions.slice(2)} 
                        item={item} 
                      />
                    )}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )

  // Estado de carga
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-moto-blue"></div>
        <span className="ml-3 text-dark-text-secondary">Cargando...</span>
      </div>
    )
  }

  // Estado vacío
  if (data.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-dark-text-secondary">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className={cn("w-full", className)}>
      {/* Barra de búsqueda si está habilitada */}
      {searchable && (
        <div className="mb-4">
          <input
            type="text"
            placeholder="Buscar..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              onSearch?.(e.target.value)
            }}
            className="w-full px-3 py-2 border border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      )}

      {/* Renderizado condicional según dispositivo */}
      {isMobile || isTablet ? renderMobileView() : renderDesktopView()}
    </div>
  )
}

// Componente para dropdown de acciones en mobile
const MobileActionsDropdown: React.FC<{
  actions: TableAction[]
  item: any
}> = ({ actions, item }) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      <Button
        size="sm"
        variant="default"
        onClick={() => setIsOpen(!isOpen)}
        className="px-3"
      >
        <MoreVertical className="w-4 h-4" />
      </Button>
      
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)} 
          />
          <div className="absolute right-0 top-full mt-1 w-48 bg-dark-bg-secondary rounded-lg shadow-dark-lg border border-dark-border z-20">
            {actions.map((action, index) => (
              <button
                key={index}
                onClick={() => {
                  action.onClick(item)
                  setIsOpen(false)
                }}
                className="w-full px-4 py-2 text-left text-sm hover:bg-dark-bg-tertiary first:rounded-t-lg last:rounded-b-lg flex items-center"
              >
                {action.icon && <action.icon className="w-4 h-4 mr-2" />}
                {action.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

// Componente para dropdown de acciones en desktop
const DesktopActionsDropdown: React.FC<{
  actions: TableAction[]
  item: any
}> = ({ actions, item }) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      <Button
        size="sm"
        variant="default"
        onClick={() => setIsOpen(!isOpen)}
      >
        <MoreVertical className="w-4 h-4" />
      </Button>
      
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)} 
          />
          <div className="absolute right-0 top-full mt-1 w-48 bg-dark-bg-secondary rounded-lg shadow-dark-lg border border-dark-border z-20">
            {actions.map((action, index) => (
              <button
                key={index}
                onClick={() => {
                  action.onClick(item)
                  setIsOpen(false)
                }}
                className="w-full px-4 py-2 text-left text-sm hover:bg-dark-bg-tertiary first:rounded-t-lg last:rounded-b-lg flex items-center"
              >
                {action.icon && <action.icon className="w-4 h-4 mr-2" />}
                {action.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default ResponsiveTable
