import React, { useState, useEffect } from 'react'
import { useAppStore } from '../../store'
import { Button } from '../ui/button'
import { Card } from '../ui/card'
import { Input } from '../ui/input'
import { Plus, Edit, Trash2, Package, Search, Filter, AlertTriangle, Eye } from 'lucide-react'
import { ProductoForm } from './ProductoForm'

export const ProductosTable: React.FC = () => {
  const productos = useAppStore((state) => state.productos.productos)
  const loading = useAppStore((state) => state.productos.loading)
  const deleteProducto = useAppStore((state) => state.deleteProducto)
  const addNotification = useAppStore((state) => state.addNotification)
  
  const [showForm, setShowForm] = useState(false)
  const [editingProducto, setEditingProducto] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategoria, setFilterCategoria] = useState('')
  const [filterStock, setFilterStock] = useState<'all' | 'low' | 'out'>('all')
  const [sortBy, setSortBy] = useState<'nombre' | 'precio' | 'stock' | 'categoria'>('nombre')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  // Filtrar y ordenar productos
  const filteredProductos = productos
    .filter(producto => {
      const matchesSearch = producto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          producto.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategoria = !filterCategoria || producto.categoria === filterCategoria
      const matchesStock = filterStock === 'all' || 
                          (filterStock === 'low' && producto.stock < 10) ||
                          (filterStock === 'out' && producto.stock === 0)
      
      return matchesSearch && matchesCategoria && matchesStock
    })
    .sort((a, b) => {
      let aValue = a[sortBy]
      let bValue = b[sortBy]
      
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase()
        bValue = bValue.toLowerCase()
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

  // Obtener categorías únicas
  const categorias = [...new Set(productos.map(p => p.categoria))].sort()

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

  const handleSort = (field: 'nombre' | 'precio' | 'stock' | 'categoria') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('asc')
    }
  }

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', text: 'Sin stock' }
    if (stock < 10) return { color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200', text: 'Stock bajo' }
    return { color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200', text: 'En stock' }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
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

      {/* Filtros y búsqueda */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Búsqueda */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Buscar productos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filtro por categoría */}
          <select
            value={filterCategoria}
            onChange={(e) => setFilterCategoria(e.target.value)}
            className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Todas las categorías</option>
            {categorias.map(categoria => (
              <option key={categoria} value={categoria}>{categoria}</option>
            ))}
          </select>

          {/* Filtro por stock */}
          <select
            value={filterStock}
            onChange={(e) => setFilterStock(e.target.value as 'all' | 'low' | 'out')}
            className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Todo el stock</option>
            <option value="low">Stock bajo (&lt;10)</option>
            <option value="out">Sin stock</option>
          </select>

          {/* Estadísticas */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Package className="h-4 w-4" />
            <span>{filteredProductos.length} de {productos.length} productos</span>
          </div>
        </div>
      </Card>

      {/* Tabla */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Producto
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('categoria')}
                >
                  Categoría
                  {sortBy === 'categoria' && (
                    <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                  )}
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('precio')}
                >
                  Precio
                  {sortBy === 'precio' && (
                    <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                  )}
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('stock')}
                >
                  Stock
                  {sortBy === 'stock' && (
                    <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                  )}
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
              {filteredProductos.map((producto) => {
                const stockStatus = getStockStatus(producto.stock)
                
                return (
                  <tr key={producto.id} className="hover:bg-gray-50">
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
                            {producto.descripcion}
                          </div>
                          <div className="text-xs text-gray-400">
                            {producto.unidad_medida}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {producto.categoria}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        ${producto.precio.toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className={`text-sm font-medium ${stockStatus.color}`}>
                          {producto.stock}
                        </span>
                        {producto.stock < 10 && (
                          <AlertTriangle className="ml-2 h-4 w-4 text-orange-500" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${stockStatus.bg} ${stockStatus.color} ${stockStatus.border}`}>
                        {stockStatus.text}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <Button
                          onClick={() => handleEdit(producto)}
                          variant="ghost"
                          size="sm"
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          onClick={() => handleDelete(producto.id)}
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Estado vacío */}
        {filteredProductos.length === 0 && (
          <div className="text-center py-12">
            <Package className="h-12 w-12 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm || filterCategoria || filterStock !== 'all' 
                ? 'No se encontraron productos' 
                : 'No hay productos registrados'
              }
            </h3>
            <p className="text-gray-500">
              {searchTerm || filterCategoria || filterStock !== 'all'
                ? 'Intenta ajustar los filtros de búsqueda'
                : 'Comienza agregando tu primer producto'
              }
            </p>
          </div>
        )}
      </Card>

      {/* Formulario */}
      {showForm && (
        <ProductoForm
          producto={editingProducto}
          onClose={handleFormClose}
        />
      )}
    </div>
  )
}
