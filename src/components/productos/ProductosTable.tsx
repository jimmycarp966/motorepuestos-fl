import React, { useState, useEffect } from 'react'
import { useAppStore } from '../../store'
import { useProductosFiltered, useCategorias, useLoadingStates, useErrorStates } from '../../lib/selectors'
import { usePagination, useTableLogic, useCRUDOperations } from '../../hooks/useTableLogic'
import { useComponentShortcuts, createShortcut } from '../../hooks/useKeyboardShortcuts'
import TableBase, { TableColumn, TableAction } from '../shared/TableBase'
import { Edit, Trash2, Package, AlertTriangle, Tag, DollarSign, Filter } from 'lucide-react'
import { ProductoForm } from './ProductoForm'
import { Button } from '../ui/button'
import type { Producto } from '../../store/types'

export const ProductosTable: React.FC = () => {
  // Estados locales con hooks optimizados
  const [stockFilter, setStockFilter] = useState<'all' | 'low' | 'out'>('all')
  const [categoriaFilter, setCategoriaFilter] = useState('')

  // Hooks de tabla y CRUD
  const { tableState, handlers, notifications } = useTableLogic<Producto>()
  
  // Selectores optimizados
  const productosData = useProductosFiltered(tableState.searchTerm, stockFilter, categoriaFilter)
  const categorias = useCategorias()
  const loadingStates = useLoadingStates()
  const errorStates = useErrorStates()
  
  // Acciones del store
  const fetchProductos = useAppStore((state) => state.fetchProductos)
  const deleteProducto = useAppStore((state) => state.deleteProducto)
  const createProducto = useAppStore((state) => state.createProducto)
  const updateProducto = useAppStore((state) => state.updateProducto)

  // CRUD operations con notificaciones automáticas
  const crudOps = useCRUDOperations(
    fetchProductos,
    createProducto,
    updateProducto,
    deleteProducto,
    'Producto'
  )

  // Paginación
  const pagination = usePagination(productosData.productos)

  // Shortcuts para Productos
  const productosShortcuts = [
    createShortcut('n', () => {
      handlers.openCreateForm()
    }, 'Nuevo producto', { ctrlKey: true }),
    
    createShortcut('f', () => {
      // Focus en filtro de stock
      setStockFilter(stockFilter === 'all' ? 'low' : stockFilter === 'low' ? 'out' : 'all')
    }, 'Cambiar filtro de stock', { ctrlKey: true }),
    
    createShortcut('r', () => {
      crudOps.handleRefresh()
    }, 'Refrescar productos', { ctrlKey: true })
  ]

  useComponentShortcuts(productosShortcuts)

  // Cargar datos al montar
  useEffect(() => {
    fetchProductos()
  }, [fetchProductos])

  // Reset paginación cuando cambian filtros
  useEffect(() => {
    pagination.resetPage()
  }, [tableState.searchTerm, stockFilter, categoriaFilter])

  // Handlers para filtros específicos
  const handleStockFilterChange = (filter: 'all' | 'low' | 'out') => {
    setStockFilter(filter)
  }

  const handleCategoriaChange = (categoria: string) => {
    setCategoriaFilter(categoria)
  }

  // Función para obtener color de stock
  const getStockColor = (stock: number, stockMinimo: number) => {
    if (stock <= 0) return 'text-danger-500 bg-danger-500/20 border border-danger-500/30'
    if (stock <= stockMinimo) return 'text-warning-500 bg-warning-500/20 border border-warning-500/30'
    return 'text-success-500 bg-success-500/20 border border-success-500/30'
  }

  // Función para obtener icono de stock
  const getStockIcon = (stock: number, stockMinimo: number) => {
    if (stock <= 0) return <AlertTriangle className="w-4 h-4" />
    if (stock <= stockMinimo) return <AlertTriangle className="w-4 h-4" />
    return <Package className="w-4 h-4" />
  }

  // Definición de columnas
  const columns: TableColumn<Producto>[] = [
    {
      key: 'codigo_sku',
      title: 'Código SKU',
      width: '140px',
      render: (value) => (
        <div className="font-mono text-sm bg-dark-bg-tertiary px-2 py-1 rounded border border-dark-border">
          {value}
        </div>
      )
    },
    {
      key: 'nombre',
      title: 'Nombre',
      render: (value, item) => (
        <div>
          <div className="font-medium text-dark-text-primary">{value}</div>
          {item.descripcion && (
            <div className="text-sm text-dark-text-secondary truncate max-w-xs">
              {item.descripcion}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'categoria',
      title: 'Categoría',
      width: '120px',
      render: (value) => (
        <div className="flex items-center">
          <Tag className="w-4 h-4 mr-2 text-primary-500" />
          <span className="text-sm text-dark-text-primary">{value}</span>
        </div>
      )
    },
    {
      key: 'stock',
      title: 'Stock',
      width: '100px',
      render: (value, item) => (
        <div className={`flex items-center gap-2 px-2 py-1 rounded-full text-xs font-medium ${getStockColor(value, item.stock_minimo)}`}>
          {getStockIcon(value, item.stock_minimo)}
          <span>{value}</span>
        </div>
      )
    },
    {
      key: 'precio_minorista',
      title: 'Precio',
      width: '100px',
      render: (value) => (
        <div className="flex items-center text-success-500 font-medium">
          <DollarSign className="w-4 h-4 mr-1" />
          {value.toLocaleString()}
        </div>
      )
    },
    {
      key: 'unidad_medida',
      title: 'Unidad',
      width: '80px',
      render: (value) => (
        <span className="text-sm text-dark-text-secondary">{value}</span>
      )
    }
  ]

  // Definición de acciones
  const actions: TableAction<Producto>[] = [
    {
      label: 'Editar',
      icon: <Edit className="w-4 h-4" />,
      onClick: (producto) => handlers.openEditForm(producto),
      variant: 'outline'
    },
    {
      label: 'Eliminar',
      icon: <Trash2 className="w-4 h-4" />,
      onClick: async (producto) => {
        await crudOps.handleDelete(producto.id, producto.nombre)
      },
      variant: 'destructive',
      disabled: (producto) => !producto.activo
    }
  ]

  // Handler para cerrar formulario
  const handleFormSuccess = () => {
    handlers.closeForm()
    crudOps.handleRefresh()
  }

  
  return (
    <div className="p-6 space-y-6">
      {/* Filtros adicionales */}
      <div className="flex flex-col sm:flex-row gap-4 bg-dark-bg-secondary p-4 rounded-lg border border-dark-border">
        {/* Filtro por Categoría */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-dark-text-secondary" />
          <span className="text-sm font-medium text-dark-text-primary">Categoría:</span>
          <select
            value={categoriaFilter}
            onChange={(e) => handleCategoriaChange(e.target.value)}
            className="px-3 py-1 border border-dark-border rounded-md text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">Todas las categorías</option>
            {categorias.map(categoria => (
              <option key={categoria} value={categoria}>{categoria}</option>
            ))}
          </select>
        </div>

        {/* Filtros de Stock */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-dark-text-primary">Stock:</span>
          <div className="flex gap-2">
            <Button
              variant={stockFilter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleStockFilterChange('all')}
              className="text-xs"
            >
              Todos ({productosData.total})
            </Button>
            <Button
              variant={stockFilter === 'low' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleStockFilterChange('low')}
              className="text-xs bg-yellow-50 border-yellow-200 text-yellow-700 hover:bg-yellow-100"
            >
              Stock Bajo ({productosData.conStockBajo})
            </Button>
            <Button
              variant={stockFilter === 'out' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleStockFilterChange('out')}
              className="text-xs bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
            >
              Sin Stock ({productosData.sinStock})
            </Button>
          </div>
        </div>

        {/* Información de valor total */}
        <div className="flex items-center gap-2 ml-auto">
          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
            Valor total: ${productosData.totalValue.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Tabla con paginación */}
      <TableBase
        title="Gestión de Productos"
        subtitle="Administra el catálogo de productos y precios"
        items={pagination.currentItems}
        columns={columns}
        actions={actions}
        loading={loadingStates.productos}
        error={errorStates.productos}
        
        searchable={true}
        searchTerm={tableState.searchTerm}
        onSearchChange={handlers.setSearchTerm}
        searchPlaceholder="Buscar por nombre, SKU, categoría..."
        
        pagination={{
          currentPage: pagination.currentPage,
          totalPages: pagination.totalPages,
          totalItems: pagination.totalItems,
          pageSize: pagination.pageSize,
          start: pagination.pageInfo.start,
          end: pagination.pageInfo.end,
          hasNext: pagination.hasNext,
          hasPrev: pagination.hasPrev
        }}
        onPageChange={pagination.goToPage}
        
        onCreate={handlers.openCreateForm}
        createLabel="Nuevo Producto"
        onRefresh={crudOps.handleRefresh}
        
        emptyMessage="No hay productos que coincidan con los filtros seleccionados"
      />

      {/* Formulario de producto */}
      {tableState.showForm && (
        <ProductoForm
          producto={tableState.editingItem}
          onClose={handlers.closeForm}
          onSuccess={handleFormSuccess}
        />
      )}
    </div>
  )
}

export default ProductosTable
