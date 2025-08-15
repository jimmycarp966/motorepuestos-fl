import React, { useEffect } from 'react'
import { useAppStore } from '../../store'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
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
  Cell
} from 'recharts'
import { 
  DollarSign, 
  Users, 
  Package,
  TrendingUp
} from 'lucide-react'

export const Dashboard: React.FC = () => {
  const ventas = useAppStore((state) => state.ventas.ventas)
  const productos = useAppStore((state) => state.productos.productos)
  const clientes = useAppStore((state) => state.clientes.clientes)
  const caja = useAppStore((state) => state.caja)
  const fetchVentas = useAppStore((state) => state.fetchVentas)
  const fetchProductos = useAppStore((state) => state.fetchProductos)
  const fetchClientes = useAppStore((state) => state.fetchClientes)
  const fetchMovimientos = useAppStore((state) => state.fetchMovimientos)

  useEffect(() => {
    fetchVentas()
    fetchProductos()
    fetchClientes()
    fetchMovimientos()
  }, [fetchVentas, fetchProductos, fetchClientes, fetchMovimientos])

  // Calcular KPIs
  const ventasHoy = ventas.filter(v => {
    const hoy = new Date().toDateString()
    const fechaVenta = new Date(v.fecha).toDateString()
    return fechaVenta === hoy
  })

  const totalVentasHoy = ventasHoy.reduce((sum, v) => sum + v.total, 0)
  const productosStockBajo = productos.filter(p => p.stock < 10)
  const clientesActivos = clientes.filter(c => c.activo)

  // Datos para gráficos
  const ventasPorDia = ventas.slice(0, 7).map(v => ({
    fecha: new Date(v.fecha).toLocaleDateString(),
    total: v.total
  })).reverse()

  const productosPorCategoria = productos.reduce((acc, p) => {
    acc[p.categoria] = (acc[p.categoria] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const datosCategoria = Object.entries(productosPorCategoria).map(([categoria, cantidad]) => ({
    name: categoria,
    value: cantidad
  }))

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <h1 style={{ 
        fontSize: '1.875rem', 
        fontWeight: 'bold', 
        color: '#111827',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent'
      }}>Dashboard</h1>
      
      {/* KPIs */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1.5rem'
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '0.75rem',
          padding: '1.5rem',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
          border: '1px solid #e5e7eb',
          transition: 'all 0.2s'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1rem'
          }}>
            <h3 style={{ fontSize: '0.875rem', fontWeight: '500', color: '#6b7280' }}>Ventas Hoy</h3>
            <DollarSign size={20} color="#667eea" />
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827' }}>
            ${totalVentasHoy.toFixed(2)}
          </div>
          <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
            {ventasHoy.length} ventas realizadas
          </p>
        </div>

        <div style={{
          backgroundColor: 'white',
          borderRadius: '0.75rem',
          padding: '1.5rem',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
          border: '1px solid #e5e7eb',
          transition: 'all 0.2s'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1rem'
          }}>
            <h3 style={{ fontSize: '0.875rem', fontWeight: '500', color: '#6b7280' }}>Saldo Caja</h3>
            <TrendingUp size={20} color="#10b981" />
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827' }}>
            ${caja.saldo.toFixed(2)}
          </div>
          <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
            Balance actual
          </p>
        </div>

        <div style={{
          backgroundColor: 'white',
          borderRadius: '0.75rem',
          padding: '1.5rem',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
          border: '1px solid #e5e7eb',
          transition: 'all 0.2s'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1rem'
          }}>
            <h3 style={{ fontSize: '0.875rem', fontWeight: '500', color: '#6b7280' }}>Productos Stock Bajo</h3>
            <Package size={20} color="#f59e0b" />
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827' }}>
            {productosStockBajo.length}
          </div>
          <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
            Menos de 10 unidades
          </p>
        </div>

        <div style={{
          backgroundColor: 'white',
          borderRadius: '0.75rem',
          padding: '1.5rem',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
          border: '1px solid #e5e7eb',
          transition: 'all 0.2s'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1rem'
          }}>
            <h3 style={{ fontSize: '0.875rem', fontWeight: '500', color: '#6b7280' }}>Clientes Activos</h3>
            <Users size={20} color="#8b5cf6" />
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827' }}>
            {clientesActivos.length}
          </div>
          <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
            Total de clientes
          </p>
        </div>
      </div>

      {/* Gráficos */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: '1.5rem'
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '0.75rem',
          padding: '1.5rem',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
          border: '1px solid #e5e7eb'
        }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem', color: '#111827' }}>
            Ventas de los Últimos 7 Días
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={ventasPorDia}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="fecha" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.5rem',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Bar dataKey="total" fill="#667eea" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={{
          backgroundColor: 'white',
          borderRadius: '0.75rem',
          padding: '1.5rem',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
          border: '1px solid #e5e7eb'
        }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem', color: '#111827' }}>
            Productos por Categoría
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={datosCategoria}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {datosCategoria.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.5rem',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Productos con stock bajo */}
      {productosStockBajo.length > 0 && (
        <div style={{
          backgroundColor: 'white',
          borderRadius: '0.75rem',
          padding: '1.5rem',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
          border: '1px solid #e5e7eb'
        }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem', color: '#111827' }}>
            Productos con Stock Bajo
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {productosStockBajo.slice(0, 5).map((producto) => (
              <div key={producto.id} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.75rem',
                backgroundColor: '#fef2f2',
                borderRadius: '0.5rem',
                border: '1px solid #fecaca'
              }}>
                <span style={{ fontWeight: '500', color: '#111827' }}>{producto.nombre}</span>
                <span style={{ color: '#dc2626', fontWeight: 'bold' }}>{producto.stock} unidades</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
