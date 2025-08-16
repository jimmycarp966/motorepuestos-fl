import React, { useEffect } from 'react'
import { useAppStore } from '../../store'

export const SimpleDashboard: React.FC = () => {
  const ventas = useAppStore((state) => state.ventas.ventas)
  const productos = useAppStore((state) => state.productos.productos)
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
  const productosStockBajo = productos.filter(p => p.stock < 10)
  const clientesActivos = clientes.filter(c => c.activo)

  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ 
        fontSize: '2rem', 
        fontWeight: 'bold', 
        color: '#333',
        marginBottom: '2rem',
        textAlign: 'center'
      }}>
        Dashboard - Motorepuestos F.L.
      </h1>
      
      {/* KPIs */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '1.5rem',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          border: '1px solid #e0e0e0'
        }}>
          <h3 style={{ fontSize: '1rem', color: '#666', marginBottom: '0.5rem' }}>Ventas Hoy</h3>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#333' }}>
            ${totalVentasHoy.toFixed(2)}
          </div>
          <p style={{ fontSize: '0.875rem', color: '#666', marginTop: '0.25rem' }}>
            {ventasHoy.length} ventas realizadas
          </p>
        </div>

        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '1.5rem',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          border: '1px solid #e0e0e0'
        }}>
          <h3 style={{ fontSize: '1rem', color: '#666', marginBottom: '0.5rem' }}>Saldo Caja</h3>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#333' }}>
            ${caja.saldo.toFixed(2)}
          </div>
          <p style={{ fontSize: '0.875rem', color: '#666', marginTop: '0.25rem' }}>
            Balance actual
          </p>
        </div>

        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '1.5rem',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          border: '1px solid #e0e0e0'
        }}>
          <h3 style={{ fontSize: '1rem', color: '#666', marginBottom: '0.5rem' }}>Productos Stock Bajo</h3>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#333' }}>
            {productosStockBajo.length}
          </div>
          <p style={{ fontSize: '0.875rem', color: '#666', marginTop: '0.25rem' }}>
            Menos de 10 unidades
          </p>
        </div>

        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '1.5rem',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          border: '1px solid #e0e0e0'
        }}>
          <h3 style={{ fontSize: '1rem', color: '#666', marginBottom: '0.5rem' }}>Clientes Activos</h3>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#333' }}>
            {clientesActivos.length}
          </div>
          <p style={{ fontSize: '0.875rem', color: '#666', marginTop: '0.25rem' }}>
            Total de clientes
          </p>
        </div>
      </div>

      {/* Información de datos */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '1.5rem',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        border: '1px solid #e0e0e0'
      }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#333', marginBottom: '1rem' }}>
          Información del Sistema
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div>
            <strong>Total Ventas:</strong> {ventas.length}
          </div>
          <div>
            <strong>Total Productos:</strong> {productos.length}
          </div>
          <div>
            <strong>Total Clientes:</strong> {clientes.length}
          </div>
          <div>
            <strong>Movimientos Caja:</strong> {caja.movimientos.length}
          </div>
        </div>
      </div>

      {/* Productos con stock bajo */}
      {productosStockBajo.length > 0 && (
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '1.5rem',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          border: '1px solid #e0e0e0',
          marginTop: '1.5rem'
        }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#333', marginBottom: '1rem' }}>
            Productos con Stock Bajo
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {productosStockBajo.slice(0, 5).map((producto) => (
              <div key={producto.id} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.75rem',
                backgroundColor: '#fff5f5',
                borderRadius: '4px',
                border: '1px solid #fed7d7'
              }}>
                <span style={{ fontWeight: '500', color: '#333' }}>{producto.nombre}</span>
                <span style={{ color: '#e53e3e', fontWeight: 'bold' }}>{producto.stock} unidades</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Debug info */}
      <div style={{
        backgroundColor: '#f7fafc',
        borderRadius: '8px',
        padding: '1rem',
        marginTop: '1.5rem',
        border: '1px solid #e2e8f0'
      }}>
        <h4 style={{ fontSize: '1rem', fontWeight: 'bold', color: '#333', marginBottom: '0.5rem' }}>
          Debug Info
        </h4>
        <div style={{ fontSize: '0.875rem', color: '#666' }}>
          <div>Ventas cargadas: {ventas.length}</div>
          <div>Productos cargados: {productos.length}</div>
          <div>Clientes cargados: {clientes.length}</div>
          <div>Movimientos cargados: {caja.movimientos.length}</div>
        </div>
      </div>
    </div>
  )
}
