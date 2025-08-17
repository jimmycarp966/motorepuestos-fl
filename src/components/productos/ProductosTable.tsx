import React, { useState, useEffect } from 'react'
import { useAppStore } from '../../store'
import { Button } from '../ui/button'
import { Card } from '../ui/card'
import { Plus, Edit, Trash2, Package } from 'lucide-react'
import { ProductoForm } from './ProductoForm'
import { useSearchFilter } from '../../hooks/useSearchFilter'


export const ProductosTable: React.FC = () => {
  console.log('🚀🚀🚀 [ProductosTable] COMPONENTE MONTADO - INICIO 🚀🚀🚀')
  
  const productos = useAppStore((state) => state.productos)
  const loading = useAppStore((state) => state.productosLoading)
  const error = useAppStore((state) => state.productosError)
  const fetchProductos = useAppStore((state) => state.fetchProductos)
  const deleteProducto = useAppStore((state) => state.deleteProducto)
  const addNotification = useAppStore((state) => state.addNotification)
  const [showForm, setShowForm] = useState(false)
  const [editingProducto, setEditingProducto] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState('')

  console.log('🔍 [ProductosTable] Estado actual:', { 
    productos: productos?.length, 
    productosType: typeof productos,
    productosIsArray: Array.isArray(productos),
    loading, 
    error,
    showForm,
    searchTerm
  })

  // Cargar productos al montar el componente
  useEffect(() => {
    console.log('🔍 [ProductosTable] Cargando productos...')
    fetchProductos()
  }, [fetchProductos])

  // Filtrar productos usando el hook personalizado
  const filteredProductos = useSearchFilter({
    data: productos || [],
    searchTerm,
    searchFields: ['nombre', 'descripcion', 'codigo_sku', 'categoria', 'unidad_medida'],
    searchFunction: (producto, term) => {
      return (
        producto.nombre.toLowerCase().includes(term) ||
        (producto.descripcion && producto.descripcion.toLowerCase().includes(term)) ||
        producto.codigo_sku.toLowerCase().includes(term) ||
        producto.categoria.toLowerCase().includes(term) ||
        producto.unidad_medida.toLowerCase().includes(term)
      )
    }
  })

  const handleDelete = async (id: string) => {
    try {
      await deleteProducto(id)
      addNotification({
        id: Date.now().toString(),
        type: 'success',
        title: 'Producto eliminado',
        message: 'El producto se eliminó correctamente'
      })
    } catch (error) {
      addNotification({
        id: Date.now().toString(),
        type: 'error',
        title: 'Error',
        message: 'No se pudo eliminar el producto'
      })
    }
  }

  const handleEdit = (producto: any) => {
    setEditingProducto(producto)
    setShowForm(true)
  }

  const handleFormClose = () => {
    setShowForm(false)
    setEditingProducto(null)
  }



  if (loading) {
    console.log('🔍 [ProductosTable] Mostrando loading...')
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Productos</h1>
            <p className="text-gray-600">Gestiona el catálogo de productos</p>
          </div>
          <Button
            onClick={() => setShowForm(true)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            disabled
          >
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Producto
          </Button>
        </div>
        <Card className="overflow-hidden">
          <div className="flex items-center justify-center p-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Cargando productos...</p>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  if (error) {
    console.log('🔍 [ProductosTable] Mostrando error:', error)
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Productos</h1>
            <p className="text-gray-600">Gestiona el catálogo de productos</p>
          </div>
          <Button
            onClick={() => {
              setShowForm(true)
            }}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Producto
          </Button>
        </div>
        <Card className="overflow-hidden">
          <div className="flex items-center justify-center p-12">
            <div className="text-center">
              <div className="text-red-500 mb-4">
                <Package className="h-12 w-12 mx-auto text-red-400 mb-2" />
                <p className="text-lg font-medium text-red-600">Error al cargar productos</p>
                <p className="text-sm text-gray-600 mt-2">{error}</p>
              </div>
              <Button
                onClick={() => fetchProductos()}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Reintentar
              </Button>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  console.log('🔍 [ProductosTable] Renderizando tabla con productos:', filteredProductos?.length)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Productos</h1>
          <p className="text-gray-600">Gestiona el catálogo de productos</p>
        </div>
        <Button
          onClick={() => setShowForm(true)}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Producto
        </Button>
      </div>

      {/* Buscador */}
      <Card className="p-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Buscar productos por nombre, código, categoría..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-10 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-700"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        {searchTerm && (
          <div className="mt-2 text-sm text-gray-600">
            {filteredProductos?.length === productos?.length ? (
              <span>Mostrando todos los productos</span>
            ) : (
              <span>Encontrados {filteredProductos?.length} de {productos?.length} productos</span>
            )}
          </div>
        )}
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  SKU
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Producto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Costo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Precios
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock Mín.
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Categoría
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProductos && filteredProductos.length > 0 ? (
                filteredProductos.map((producto) => (
                  <tr key={producto.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                      {producto.codigo_sku}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                            <Package className="h-6 w-6 text-white" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {producto.nombre}
                          </div>
                          <div className="text-sm text-gray-500">
                            {producto.descripcion || 'Sin descripción'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="space-y-1">
                        <div className="text-xs text-red-600 font-medium">${producto.costo?.toFixed(2) || '0.00'}</div>
                        <div className="text-xs text-green-600 font-medium">
                          {producto.costo ? ((producto.precio_minorista - producto.costo) / producto.costo * 100).toFixed(1) : '0'}% margen
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="space-y-1">
                        <div className="text-xs text-gray-500">Minorista: ${producto.precio_minorista.toFixed(2)}</div>
                        <div className="text-xs text-gray-500">Mayorista: ${producto.precio_mayorista.toFixed(2)}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        producto.stock > 10 
                          ? 'bg-green-100 text-green-800' 
                          : producto.stock > 0 
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {producto.stock} {producto.unidad_medida}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                        {producto.stock_minimo || 0} {producto.unidad_medida}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {producto.categoria}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        producto.activo 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {producto.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          onClick={() => handleEdit(producto)}
                          className="!bg-blue-600 !hover:bg-blue-700 !text-white !border-0"
                          style={{ backgroundColor: '#2563eb', color: 'white', border: 'none' }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleDelete(producto.id)}
                          className="!bg-red-600 !hover:bg-red-700 !text-white !border-0"
                          style={{ backgroundColor: '#dc2626', color: 'white', border: 'none' }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center">
                    <div className="text-gray-500">
                      <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <p className="text-lg font-medium">
                        {searchTerm ? 'No se encontraron productos' : 'No hay productos'}
                      </p>
                      <p className="text-sm">
                        {searchTerm ? 'Intenta con otros términos de búsqueda' : 'Comienza agregando tu primer producto'}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {showForm && (
        <ProductoForm
          producto={editingProducto}
          onClose={handleFormClose}
        />
      )}
    </div>
  )
}
