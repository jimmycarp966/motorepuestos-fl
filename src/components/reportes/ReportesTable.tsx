import React, { useState, useEffect } from 'react'
import { useAppStore } from '../../store'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Input } from '../ui/input'
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Package, 
  Users, 
  ShoppingCart,
  Calendar,
  Download,
  Filter,
  FileText,
  PieChart as PieChartIcon
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
  const productos = useAppStore((state) => state.productos.productos)
  const clientes = useAppStore((state) => state.clientes.clientes)
  const movimientos = useAppStore((state) => state.caja.movimientos)
  const fetchVentasPorPeriodo = useAppStore((state) => state.fetchVentasPorPeriodo)
  const fetchProductosMasVendidos = useAppStore((state) => state.fetchProductosMasVendidos)
  const addNotification = useAppStore((state) => state.addNotification)
  
  const [periodo, setPeriodo] = useState<'dia' | 'semana' | 'mes' | 'personalizado'>('semana')
  const [fechaInicio, setFechaInicio] = useState('')
  const [fechaFin, setFechaFin] = useState('')
  const [tipoReporte, setTipoReporte] = useState<'ventas' | 'productos' | 'clientes' | 'caja'>('ventas')
  const [loading, setLoading] = useState(false)
  const [datosReporte, setDatosReporte] = useState<any[]>([])

  useEffect(() => {
    cargarDatosReporte()
  }, [periodo, fechaInicio, fechaFin, tipoReporte])

  const cargarDatosReporte = async () => {
    setLoading(true)
    try {
      let inicio = new Date()
      let fin = new Date()

      switch (periodo) {
        case 'dia':
          inicio.setHours(0, 0, 0, 0)
          fin.setHours(23, 59, 59, 999)
          break
        case 'semana':
          inicio.setDate(inicio.getDate() - 7)
          break
        case 'mes':
          inicio.setMonth(inicio.getMonth() - 1)
          break
        case 'personalizado':
          if (fechaInicio && fechaFin) {
            inicio = new Date(fechaInicio)
            fin = new Date(fechaFin)
          }
          break
      }

      if (tipoReporte === 'ventas') {
        const datos = await fetchVentasPorPeriodo(
          inicio.toISOString().split('T')[0],
          fin.toISOString().split('T')[0]
        )
        setDatosReporte(datos || [])
      } else if (tipoReporte === 'productos') {
        const datos = await fetchProductosMasVendidos(20)
        setDatosReporte(datos || [])
      }
    } catch (error) {
      addNotification({
        id: Date.now().toString(),
        type: 'error',
        title: 'Error',
        message: 'No se pudieron cargar los datos del reporte'
      })
    } finally {
      setLoading(false)
    }
  }

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
      cantidad: ventasProducto,
      categoria: producto.categoria
    }
  }).sort((a, b) => b.cantidad - a.cantidad).slice(0, 10)

  const productosPorCategoria = productos.reduce((acc, p) => {
    acc[p.categoria] = (acc[p.categoria] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const datosCategoria = Object.entries(productosPorCategoria).map(([categoria, cantidad]) => ({
    name: categoria,
    value: cantidad
  }))

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d']

  const exportarReporte = (formato: 'csv' | 'pdf') => {
    try {
      let contenido = ''
      let nombreArchivo = `reporte_${tipoReporte}_${new Date().toISOString().split('T')[0]}`

      if (formato === 'csv') {
        // Generar CSV
        if (tipoReporte === 'ventas') {
          contenido = 'Fecha,Total,Productos\n'
          datosReporte.forEach(item => {
            contenido += `${item.fecha},${item.monto_total},${item.total_ventas}\n`
          })
        } else if (tipoReporte === 'productos') {
          contenido = 'Producto,Cantidad Vendida,Categoría\n'
          datosReporte.forEach(item => {
            contenido += `${item.nombre_producto},${item.cantidad_vendida},${item.categoria}\n`
          })
        }

        // Descargar archivo
        const blob = new Blob([contenido], { type: 'text/csv' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${nombreArchivo}.csv`
        a.click()
        window.URL.revokeObjectURL(url)
      } else {
        // PDF (simulado)
        addNotification({
          id: Date.now().toString(),
          type: 'info',
          title: 'Exportación PDF',
          message: 'Funcionalidad de PDF en desarrollo'
        })
      }

      addNotification({
        id: Date.now().toString(),
        type: 'success',
        title: 'Reporte exportado',
        message: `Reporte exportado como ${formato.toUpperCase()}`
      })
    } catch (error) {
      addNotification({
        id: Date.now().toString(),
        type: 'error',
        title: 'Error',
        message: 'No se pudo exportar el reporte'
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reportes</h1>
          <p className="text-gray-600">Análisis y estadísticas del negocio</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => exportarReporte('csv')}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Exportar CSV
          </Button>
          <Button
            onClick={() => exportarReporte('pdf')}
            variant="outline"
            className="flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            Exportar PDF
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtros del Reporte
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Tipo de reporte */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Reporte
              </label>
              <select
                value={tipoReporte}
                onChange={(e) => setTipoReporte(e.target.value as any)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="ventas">Ventas</option>
                <option value="productos">Productos</option>
                <option value="clientes">Clientes</option>
                <option value="caja">Caja</option>
              </select>
            </div>

            {/* Período */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Período
              </label>
              <select
                value={periodo}
                onChange={(e) => setPeriodo(e.target.value as any)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="dia">Hoy</option>
                <option value="semana">Última semana</option>
                <option value="mes">Último mes</option>
                <option value="personalizado">Personalizado</option>
              </select>
            </div>

            {/* Fecha inicio */}
            {periodo === 'personalizado' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha Inicio
                </label>
                <Input
                  type="date"
                  value={fechaInicio}
                  onChange={(e) => setFechaInicio(e.target.value)}
                />
              </div>
            )}

            {/* Fecha fin */}
            {periodo === 'personalizado' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha Fin
                </label>
                <Input
                  type="date"
                  value={fechaFin}
                  onChange={(e) => setFechaFin(e.target.value)}
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Ventas</CardTitle>
            <ShoppingCart className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {estadisticas.totalVentas}
            </div>
            <p className="text-xs text-muted-foreground">
              Ventas registradas
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              ${estadisticas.totalIngresos.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Total de ingresos
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Egresos Totales</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              ${estadisticas.totalEgresos.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Total de egresos
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Productos</CardTitle>
            <Package className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {estadisticas.totalProductos}
            </div>
            <p className="text-xs text-muted-foreground">
              {estadisticas.productosBajoStock} con stock bajo
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ventas por día */}
        <Card>
          <CardHeader>
            <CardTitle>Ventas por Día</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={ventasChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="fecha" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${value}`, 'Total']} />
                <Line 
                  type="monotone" 
                  dataKey="total" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Productos por categoría */}
        <Card>
          <CardHeader>
            <CardTitle>Productos por Categoría</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={datosCategoria}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {datosCategoria.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} productos`, 'Cantidad']} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tabla de datos */}
      <Card>
        <CardHeader>
          <CardTitle>
            {tipoReporte === 'ventas' && 'Ventas por Período'}
            {tipoReporte === 'productos' && 'Productos Más Vendidos'}
            {tipoReporte === 'clientes' && 'Clientes'}
            {tipoReporte === 'caja' && 'Movimientos de Caja'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    {tipoReporte === 'ventas' && (
                      <>
                        <th className="text-left py-2">Fecha</th>
                        <th className="text-left py-2">Total Ventas</th>
                        <th className="text-left py-2">Monto Total</th>
                      </>
                    )}
                    {tipoReporte === 'productos' && (
                      <>
                        <th className="text-left py-2">Producto</th>
                        <th className="text-left py-2">Cantidad Vendida</th>
                        <th className="text-left py-2">Categoría</th>
                        <th className="text-left py-2">Total Ventas</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {datosReporte.slice(0, 20).map((item, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      {tipoReporte === 'ventas' && (
                        <>
                          <td className="py-2">{item.fecha}</td>
                          <td className="py-2">{item.total_ventas}</td>
                          <td className="py-2">${item.monto_total?.toFixed(2) || '0.00'}</td>
                        </>
                      )}
                      {tipoReporte === 'productos' && (
                        <>
                          <td className="py-2">{item.nombre_producto}</td>
                          <td className="py-2">{item.cantidad_vendida}</td>
                          <td className="py-2">{item.categoria}</td>
                          <td className="py-2">${item.monto_total?.toFixed(2) || '0.00'}</td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
