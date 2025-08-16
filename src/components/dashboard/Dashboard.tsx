import React, { useEffect, useState } from 'react'
import { useAppStore } from '../../store'
import { useDebug } from '../../hooks/useDebug'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts'
import { 
  DollarSign, 
  Users, 
  Package,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  RefreshCw,
  Calendar,
  Filter,
  Bug
} from 'lucide-react'

export const Dashboard: React.FC = () => {
  const dashboard = useAppStore((state) => state.dashboard)
  const fetchDashboardKPIs = useAppStore((state) => state.fetchDashboardKPIs)
  const fetchVentasPorPeriodo = useAppStore((state) => state.fetchVentasPorPeriodo)
  const fetchProductosMasVendidos = useAppStore((state) => state.fetchProductosMasVendidos)
  const addNotification = useAppStore((state) => state.addNotification)
  const debug = useDebug()
  
  const [periodoVentas, setPeriodoVentas] = useState<'7d' | '30d' | '90d'>('7d')
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    setRefreshing(true)
    try {
      debug.log.info('Cargando datos del dashboard', 'Dashboard')
      
      await Promise.all([
        fetchDashboardKPIs(),
        fetchProductosMasVendidos(10)
      ])
      
      // Cargar ventas por período
      const fechaFin = new Date().toISOString().split('T')[0]
      const fechaInicio = new Date()
      if (periodoVentas === '7d') fechaInicio.setDate(fechaInicio.getDate() - 7)
      else if (periodoVentas === '30d') fechaInicio.setDate(fechaInicio.getDate() - 30)
      else fechaInicio.setDate(fechaInicio.getDate() - 90)
      
      await fetchVentasPorPeriodo(
        fechaInicio.toISOString().split('T')[0],
        fechaFin
      )

      debug.log.success('Dashboard cargado exitosamente', 'Dashboard')
    } catch (error: any) {
      debug.log.error('Error cargando dashboard', 'Dashboard', { error: error.message })
      addNotification({
        id: Date.now().toString(),
        type: 'error',
        title: 'Error',
        message: 'No se pudieron cargar los datos del dashboard'
      })
    } finally {
      setRefreshing(false)
    }
  }

  const handleRefresh = () => {
    loadDashboardData()
  }

  const handlePeriodoChange = (nuevoPeriodo: '7d' | '30d' | '90d') => {
    setPeriodoVentas(nuevoPeriodo)
    loadDashboardData()
  }

  const testDebugLogs = () => {
    debug.log.info('Prueba de log de información', 'Dashboard', { test: true })
    debug.log.warning('Prueba de log de advertencia', 'Dashboard', { test: true })
    debug.log.error('Prueba de log de error', 'Dashboard', { test: true })
    debug.log.success('Prueba de log de éxito', 'Dashboard', { test: true })
    debug.show()
  }

  const kpis = dashboard.kpis
  const ventasPorPeriodo = dashboard.ventasPorPeriodo
  const productosMasVendidos = dashboard.productosMasVendidos

  // Colores para gráficos
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d']

  // Datos para gráfico de productos por categoría
  const productosPorCategoria = productosMasVendidos.reduce((acc: any, item: any) => {
    const categoria = item.categoria || 'Sin categoría'
    acc[categoria] = (acc[categoria] || 0) + item.cantidad_vendida
    return acc
  }, {})

  const datosCategoria = Object.entries(productosPorCategoria).map(([categoria, cantidad]) => ({
    name: categoria,
    value: cantidad
  }))

  if (dashboard.loading && !kpis) {
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
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Vista general del negocio en tiempo real</p>
        </div>
        <div className="flex gap-2">
          {process.env.NODE_ENV === 'development' && (
            <Button
              onClick={testDebugLogs}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Bug className="w-4 h-4" />
              Test Debug
            </Button>
          )}
          <Button
            onClick={handleRefresh}
            disabled={refreshing}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ventas Hoy</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${kpis?.total_ingresos?.toFixed(2) || '0.00'}</div>
            <p className="text-xs text-muted-foreground">
              {kpis?.total_ventas || 0} ventas realizadas
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo Caja</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${kpis?.saldo_caja?.toFixed(2) || '0.00'}</div>
            <p className="text-xs text-muted-foreground">
              Saldo actual disponible
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stock Bajo</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis?.productos_bajo_stock || 0}</div>
            <p className="text-xs text-muted-foreground">
              Productos con stock crítico
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes Activos</CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis?.clientes_activos || 0}</div>
            <p className="text-xs text-muted-foreground">
              Clientes registrados
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ventas por período */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Ventas por Período</CardTitle>
              <div className="flex gap-2">
                {(['7d', '30d', '90d'] as const).map((periodo) => (
                  <Button
                    key={periodo}
                    variant={periodoVentas === periodo ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handlePeriodoChange(periodo)}
                  >
                    {periodo}
                  </Button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={ventasPorPeriodo}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="fecha" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${value}`, 'Total']} />
                <Line 
                  type="monotone" 
                  dataKey="monto_total" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Productos más vendidos */}
        <Card>
          <CardHeader>
            <CardTitle>Productos Más Vendidos</CardTitle>
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
                <Tooltip formatter={(value) => [`${value} unidades`, 'Cantidad']} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tabla de productos más vendidos */}
      <Card>
        <CardHeader>
          <CardTitle>Top Productos por Ventas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Producto</th>
                  <th className="text-left py-2">Categoría</th>
                  <th className="text-left py-2">Cantidad Vendida</th>
                  <th className="text-left py-2">Total Ventas</th>
                </tr>
              </thead>
              <tbody>
                {productosMasVendidos.slice(0, 10).map((producto: any, index: number) => (
                  <tr key={producto.producto_id} className="border-b hover:bg-gray-50">
                    <td className="py-2">{producto.nombre_producto}</td>
                    <td className="py-2">{producto.categoria}</td>
                    <td className="py-2">{producto.cantidad_vendida}</td>
                    <td className="py-2">${producto.monto_total?.toFixed(2) || '0.00'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
