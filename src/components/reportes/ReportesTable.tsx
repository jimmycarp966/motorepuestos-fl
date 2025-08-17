import React, { useState, useEffect } from 'react'
import { useAppStore } from '../../store'
import { Button } from '../ui/button'
import { Card } from '../ui/card'
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Package, 
  Users, 
  ShoppingCart,
  Calendar,
  Download
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts'

export const ReportesTable: React.FC = () => {
  const ventas = useAppStore((state) => state.ventas.ventas)
  const productos = useAppStore((state) => state.productos)
  const clientes = useAppStore((state) => state.clientes.clientes)
  const movimientos = useAppStore((state) => state.caja.movimientos)
  const [periodo, setPeriodo] = useState<'dia' | 'semana' | 'mes'>('dia')

  // Calcular estadísticas
  const estadisticas = {
    totalVentas: ventas.length,
    totalIngresos: movimientos.filter(m => m.tipo === 'ingreso').reduce((sum, m) => sum + m.monto, 0),
    totalEgresos: movimientos.filter(m => m.tipo === 'egreso').reduce((sum, m) => sum + m.monto, 0),
    totalProductos: productos.length,
    totalClientes: clientes.length,
    productosBajoStock: productos.filter(p => p.stock < 10).length,
  }

  // Datos para gráficos
  const ventasPorDia = ventas.reduce((acc, venta) => {
    const fecha = new Date(venta.fecha).toLocaleDateString()
    acc[fecha] = (acc[fecha] || 0) + venta.total
    return acc
  }, {} as Record<string, number>)

  const ventasChartData = Object.entries(ventasPorDia).map(([fecha, total]) => ({
    fecha,
    total
  })).slice(-7) // Últimos 7 días

  const productosMasVendidos = productos.map(producto => {
    const ventasProducto = ventas.flatMap(v => v.items || [])
      .filter(item => item.producto_id === producto.id)
      .reduce((sum, item) => sum + item.cantidad, 0)
    
    return {
      nombre: producto.nombre,
      ventas: ventasProducto
    }
  }).sort((a, b) => b.ventas - a.ventas).slice(0, 5)

  const categoriasData = productos.reduce((acc, producto) => {
    acc[producto.categoria] = (acc[producto.categoria] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const categoriasChartData = Object.entries(categoriasData).map(([categoria, cantidad]) => ({
    categoria,
    cantidad
  }))

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

  const exportarReporte = () => {
    const data = {
      estadisticas,
      ventas: ventasChartData,
      productosMasVendidos,
      categorias: categoriasChartData
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `reporte-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reportes</h1>
          <p className="text-gray-600">Análisis y estadísticas del negocio</p>
        </div>
        <div className="flex space-x-3">
          <select
            value={periodo}
            onChange={(e) => setPeriodo(e.target.value as 'dia' | 'semana' | 'mes')}
            className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="dia">Hoy</option>
            <option value="semana">Esta semana</option>
            <option value="mes">Este mes</option>
          </select>
          <Button
            onClick={exportarReporte}
            variant="outline"
            className="flex items-center"
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Estadísticas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                <ShoppingCart className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Ventas</p>
              <p className="text-2xl font-bold text-gray-900">{estadisticas.totalVentas}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Ingresos Totales</p>
              <p className="text-2xl font-bold text-green-600">${estadisticas.totalIngresos.toFixed(2)}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-red-500 to-pink-500 flex items-center justify-center">
                <TrendingDown className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Egresos Totales</p>
              <p className="text-2xl font-bold text-red-600">${estadisticas.totalEgresos.toFixed(2)}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 flex items-center justify-center">
                <Package className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Productos</p>
              <p className="text-2xl font-bold text-gray-900">{estadisticas.totalProductos}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ventas por día */}
        <Card className="p-6">
          <h3 className="text-lg font-medium mb-4">Ventas por Día</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={ventasChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="fecha" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="total" stroke="#8884d8" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Productos más vendidos */}
        <Card className="p-6">
          <h3 className="text-lg font-medium mb-4">Productos Más Vendidos</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={productosMasVendidos}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="nombre" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="ventas" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Distribución por categorías */}
        <Card className="p-6">
          <h3 className="text-lg font-medium mb-4">Productos por Categoría</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoriasChartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ categoria, porcentaje }) => `${categoria} ${porcentaje}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="cantidad"
              >
                {categoriasChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* Alertas */}
        <Card className="p-6">
          <h3 className="text-lg font-medium mb-4">Alertas y Notificaciones</h3>
          <div className="space-y-4">
            {estadisticas.productosBajoStock > 0 && (
              <div className="flex items-center p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <Package className="w-5 h-5 text-yellow-600 mr-3" />
                <div>
                  <p className="font-medium text-yellow-800">
                    {estadisticas.productosBajoStock} productos con stock bajo
                  </p>
                  <p className="text-sm text-yellow-600">Revisar inventario</p>
                </div>
              </div>
            )}
            
            {estadisticas.totalEgresos > estadisticas.totalIngresos && (
              <div className="flex items-center p-3 bg-red-50 border border-red-200 rounded-lg">
                <TrendingDown className="w-5 h-5 text-red-600 mr-3" />
                <div>
                  <p className="font-medium text-red-800">
                    Egresos superan ingresos
                  </p>
                  <p className="text-sm text-red-600">Revisar gastos</p>
                </div>
              </div>
            )}

            {estadisticas.totalVentas === 0 && (
              <div className="flex items-center p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <ShoppingCart className="w-5 h-5 text-blue-600 mr-3" />
                <div>
                  <p className="font-medium text-blue-800">
                    No hay ventas registradas
                  </p>
                  <p className="text-sm text-blue-600">Registrar primera venta</p>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
