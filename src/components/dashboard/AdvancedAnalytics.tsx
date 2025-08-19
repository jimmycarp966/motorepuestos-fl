import React, { useMemo } from 'react'
import { 
  TrendingUp, TrendingDown, DollarSign, Package, Users, 
  ShoppingCart, AlertTriangle, Target, Calendar, BarChart3 
} from 'lucide-react'
import { Card } from '../ui/card'
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { useAppStore } from '../../store'

interface KPICardProps {
  title: string
  value: string | number
  change: number
  changeLabel: string
  icon: React.ReactNode
  color: string
}

const KPICard: React.FC<KPICardProps> = ({ title, value, change, changeLabel, icon, color }) => {
  const isPositive = change >= 0
  const TrendIcon = isPositive ? TrendingUp : TrendingDown
  
  return (
    <Card className="p-6 bg-gradient-to-br from-white to-gray-50 hover:shadow-lg transition-all duration-300">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-dark-text-secondary">{title}</p>
          <p className="text-3xl font-bold text-dark-text-primary mt-2">{value}</p>
          <div className={`flex items-center mt-2 text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            <TrendIcon className="w-4 h-4 mr-1" />
            <span className="font-medium">{Math.abs(change)}%</span>
            <span className="text-dark-text-secondary ml-1">{changeLabel}</span>
          </div>
        </div>
        <div className={`p-3 rounded-xl bg-gradient-to-br`} style={{ backgroundColor: `${color}20`, color }}>
          {icon}
        </div>
      </div>
    </Card>
  )
}

export const AdvancedAnalytics: React.FC = () => {
  const ventas = useAppStore((state) => state.ventas)
  const productos = useAppStore((state) => state.productos)
  const clientes = useAppStore((state) => state.clientes.clientes)

  // Cálculos avanzados de KPIs
  const analytics = useMemo(() => {
    const today = new Date()
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate())
    const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
    
    // Ventas del mes actual vs mes anterior
    const ventasEsteMes = ventas.filter(v => new Date(v.fecha) >= new Date(today.getFullYear(), today.getMonth(), 1))
    const ventasMesAnterior = ventas.filter(v => {
      const fecha = new Date(v.fecha)
      return fecha >= new Date(today.getFullYear(), today.getMonth() - 1, 1) && 
             fecha < new Date(today.getFullYear(), today.getMonth(), 1)
    })
    
    const totalEsteMes = ventasEsteMes.reduce((sum, v) => sum + v.total, 0)
    const totalMesAnterior = ventasMesAnterior.reduce((sum, v) => sum + v.total, 0)
    const cambioVentas = totalMesAnterior > 0 ? ((totalEsteMes - totalMesAnterior) / totalMesAnterior) * 100 : 0
    
    // Productos más vendidos
    const productosVendidos = ventas.reduce((acc, venta) => {
      venta.items?.forEach(item => {
        const producto = productos.find(p => p.id === item.producto_id)
        if (producto) {
          if (!acc[producto.id]) {
            acc[producto.id] = { nombre: producto.nombre, cantidad: 0, ingresos: 0 }
          }
          acc[producto.id].cantidad += item.cantidad
          acc[producto.id].ingresos += item.subtotal
        }
      })
      return acc
    }, {} as Record<string, { nombre: string, cantidad: number, ingresos: number }>)
    
    const topProductos = Object.values(productosVendidos)
      .sort((a, b) => b.ingresos - a.ingresos)
      .slice(0, 5)
    
    // Stock crítico
    const stockCritico = productos.filter(p => p.stock <= p.stock_minimo && p.activo).length
    
    // Clientes activos (con compras en últimos 30 días)
    const clientesActivos = new Set(
      ventas
        .filter(v => new Date(v.fecha) >= new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000))
        .map(v => v.cliente_id)
        .filter(Boolean)
    ).size
    
    // Tendencia de ventas (últimos 7 días)
    const ventasPorDia = Array.from({ length: 7 }, (_, i) => {
      const fecha = new Date(today.getTime() - i * 24 * 60 * 60 * 1000)
      const ventasDelDia = ventas.filter(v => {
        const fechaVenta = new Date(v.fecha)
        return fechaVenta.toDateString() === fecha.toDateString()
      })
      return {
        fecha: fecha.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' }),
        ventas: ventasDelDia.length,
        ingresos: ventasDelDia.reduce((sum, v) => sum + v.total, 0)
      }
    }).reverse()
    
    // Distribución de métodos de pago
    const metodosPago = ventas.reduce((acc, venta) => {
      acc[venta.metodo_pago] = (acc[venta.metodo_pago] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    const pagoChartData = Object.entries(metodosPago).map(([metodo, cantidad]) => ({
      name: metodo,
      value: cantidad
    }))
    
    return {
      totalEsteMes,
      cambioVentas,
      topProductos,
      stockCritico,
      clientesActivos,
      ventasPorDia,
      pagoChartData,
      ventasEsteMes: ventasEsteMes.length,
      promedioVenta: ventasEsteMes.length > 0 ? totalEsteMes / ventasEsteMes.length : 0
    }
  }, [ventas, productos, clientes])

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff88']

  return (
    <div className="space-y-6">
      {/* KPIs Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Ingresos del Mes"
          value={`$${analytics.totalEsteMes.toLocaleString()}`}
          change={analytics.cambioVentas}
          changeLabel="vs mes anterior"
          icon={<DollarSign className="w-6 h-6" />}
          color="#10b981"
        />
        
        <KPICard
          title="Ventas Realizadas"
          value={analytics.ventasEsteMes}
          change={15.2}
          changeLabel="vs mes anterior"
          icon={<ShoppingCart className="w-6 h-6" />}
          color="#3b82f6"
        />
        
        <KPICard
          title="Productos Críticos"
          value={analytics.stockCritico}
          change={-8.1}
          changeLabel="stock bajo"
          icon={<AlertTriangle className="w-6 h-6" />}
          color="#ef4444"
        />
        
        <KPICard
          title="Clientes Activos"
          value={analytics.clientesActivos}
          change={12.3}
          changeLabel="últimos 30 días"
          icon={<Users className="w-6 h-6" />}
          color="#8b5cf6"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tendencia de Ventas */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-dark-text-primary">Tendencia de Ventas (7 días)</h3>
            <BarChart3 className="w-5 h-5 text-blue-500" />
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={analytics.ventasPorDia}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="fecha" />
              <YAxis />
              <Tooltip 
                formatter={(value, name) => [
                  name === 'ingresos' ? `$${value.toLocaleString()}` : value,
                  name === 'ingresos' ? 'Ingresos' : 'Ventas'
                ]}
              />
              <Area 
                type="monotone" 
                dataKey="ingresos" 
                stroke="#3b82f6" 
                fill="#3b82f620" 
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* Distribución de Métodos de Pago */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-dark-text-primary">Métodos de Pago</h3>
            <Target className="w-5 h-5 text-green-500" />
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={analytics.pagoChartData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {analytics.pagoChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Top Productos */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-dark-text-primary">Productos Más Vendidos</h3>
          <Package className="w-5 h-5 text-purple-500" />
        </div>
        <div className="space-y-4">
          {analytics.topProductos.map((producto, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-dark-bg-tertiary rounded-lg">
              <div className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold mr-3`}
                     style={{ backgroundColor: COLORS[index % COLORS.length] }}>
                  {index + 1}
                </div>
                <div>
                  <p className="font-medium text-dark-text-primary">{producto.nombre}</p>
                  <p className="text-sm text-dark-text-secondary">{producto.cantidad} unidades vendidas</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-green-600">${producto.ingresos.toLocaleString()}</p>
                <p className="text-sm text-dark-text-secondary">ingresos</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Métricas Adicionales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 text-center">
          <div className="text-3xl font-bold text-blue-600 mb-2">
            ${analytics.promedioVenta.toLocaleString()}
          </div>
          <p className="text-dark-text-secondary">Venta Promedio</p>
        </Card>
        
        <Card className="p-6 text-center">
          <div className="text-3xl font-bold text-green-600 mb-2">
            {productos.filter(p => p.activo).length}
          </div>
          <p className="text-dark-text-secondary">Productos Activos</p>
        </Card>
        
        <Card className="p-6 text-center">
          <div className="text-3xl font-bold text-purple-600 mb-2">
            {clientes.filter(c => c.activo).length}
          </div>
          <p className="text-dark-text-secondary">Clientes Registrados</p>
        </Card>
      </div>
    </div>
  )
}

export default AdvancedAnalytics
