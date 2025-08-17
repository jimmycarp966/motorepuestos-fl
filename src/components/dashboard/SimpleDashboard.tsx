import React, { useEffect } from 'react'
import { useAppStore } from '../../store'

export const SimpleDashboard: React.FC = () => {
  const ventas = useAppStore((state) => state.ventas.ventas)
  const productos = useAppStore((state) => state.productos)
  const clientes = useAppStore((state) => state.clientes.clientes)
  const caja = useAppStore((state) => state.caja)
  const fetchVentas = useAppStore((state) => state.fetchVentas)
  const fetchProductos = useAppStore((state) => state.fetchProductos)
  const fetchClientes = useAppStore((state) => state.fetchClientes)
  const fetchMovimientos = useAppStore((state) => state.fetchMovimientos)

  useEffect(() => {
    console.log('🔄 SimpleDashboard: Cargando datos...')
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
  const productosStockBajo = (productos || []).filter(p => p.stock < 10)
  const clientesActivos = clientes.filter(c => c.activo)

  return (
    <div style={{ padding: '1rem', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem' }}>
        Dashboard Simple
      </h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ 
          backgroundColor: 'white', 
          padding: '1rem', 
          borderRadius: '0.5rem', 
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.5rem' }}>
            Ventas Hoy
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: '600', color: '#667eea' }}>
            ${totalVentasHoy.toFixed(2)}
          </div>
        </div>

        <div style={{ 
          backgroundColor: 'white', 
          padding: '1rem', 
          borderRadius: '0.5rem', 
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.5rem' }}>
            Productos Stock Bajo
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: '600', color: '#f59e0b' }}>
            {productosStockBajo.length}
          </div>
        </div>

        <div style={{ 
          backgroundColor: 'white', 
          padding: '1rem', 
          borderRadius: '0.5rem', 
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.5rem' }}>
            Clientes Activos
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: '600', color: '#10b981' }}>
            {clientesActivos.length}
          </div>
        </div>
      </div>

      <div style={{ 
        backgroundColor: 'white', 
        padding: '1rem', 
        borderRadius: '0.5rem', 
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        border: '1px solid #e2e8f0'
      }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>
          Resumen de Datos
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
          <div>
            <strong>Total Ventas:</strong> {ventas.length}
          </div>
          <div>
            <strong>Total Productos:</strong> {(productos || []).length}
          </div>
          <div>
            <strong>Total Clientes:</strong> {clientes.length}
          </div>
          <div>
            <strong>Total Movimientos:</strong> {caja.movimientos.length}
          </div>
        </div>
      </div>

      <div style={{ 
        backgroundColor: '#f8fafc', 
        padding: '1rem', 
        borderRadius: '0.5rem', 
        marginTop: '1rem',
        border: '1px solid #e2e8f0'
      }}>
        <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.5rem' }}>
          Estado de Carga
        </h3>
        <div style={{ fontSize: '0.875rem', color: '#666' }}>
          <div>Ventas cargadas: {ventas.length}</div>
          <div>Productos cargados: {(productos || []).length}</div>
          <div>Clientes cargados: {clientes.length}</div>
          <div>Movimientos cargados: {caja.movimientos.length}</div>
        </div>
      </div>
    </div>
  )
}
