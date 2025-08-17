import React, { useEffect } from 'react'
import { useAppStore } from '../../store'
import { 
  TrendingUp, 
  DollarSign, 
  Package, 
  Users, 
  ShoppingCart, 
  BarChart3,
  Calendar,
  Clock,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'
import { useDebug } from '../../hooks/useDebug'

export const Dashboard: React.FC = () => {
  // Registrar componente para debug
  const { logError, logInfo } = useDebug({ componentName: 'Dashboard' })
  
  const ventas = useAppStore((state) => state.ventas)
  const productos = useAppStore((state) => state.productos)
  const clientes = useAppStore((state) => state.clientes.clientes)
  const caja = useAppStore((state) => state.caja)
  const fetchVentas = useAppStore((state) => state.fetchVentas)
  const fetchProductos = useAppStore((state) => state.fetchProductos)
  const fetchClientes = useAppStore((state) => state.fetchClientes)
  const fetchMovimientos = useAppStore((state) => state.fetchMovimientos)

  useEffect(() => {
    logInfo('Cargando datos del dashboard')
    fetchVentas()
    fetchProductos()
    fetchClientes()
    fetchMovimientos()
  }, [fetchVentas, fetchProductos, fetchClientes, fetchMovimientos, logInfo])

  // Refrescar datos cuando cambien las ventas o movimientos
  useEffect(() => {
    const interval = setInterval(() => {
      fetchVentas()
      fetchMovimientos()
    }, 30000) // Refrescar cada 30 segundos

    return () => clearInterval(interval)
  }, [fetchVentas, fetchMovimientos])

  // Calcular KPIs
  const ventasHoy = (ventas || []).filter(v => {
    const hoy = new Date().toDateString()
    return new Date(v.fecha).toDateString() === hoy
  })
  
  const totalVentasHoy = ventasHoy.reduce((sum, v) => sum + (v.total || 0), 0)
  const saldoCaja = (caja.movimientos || []).reduce((sum, m) => sum + (m.monto || 0), 0)
  const productosActivos = (productos || []).filter(p => p.activo).length
  const clientesActivos = (clientes || []).filter(c => c.activo).length

  // Obtener ventas de la semana pasada para comparación
  const unaSemanaAtras = new Date()
  unaSemanaAtras.setDate(unaSemanaAtras.getDate() - 7)
  const ventasSemanaPasada = (ventas || []).filter(v => new Date(v.fecha) >= unaSemanaAtras)
  const totalVentasSemana = ventasSemanaPasada.reduce((sum, v) => sum + (v.total || 0), 0)

  const kpiCards = [
    {
      title: 'Ventas Hoy',
      value: `$${totalVentasHoy.toLocaleString('es-ES', { minimumFractionDigits: 2 })}`,
      subtitle: `${ventasHoy.length} ventas`,
      icon: TrendingUp,
      color: '#667eea',
      bgColor: '#f0f4ff',
      trend: totalVentasHoy > 0 ? 'up' : 'neutral',
      trendValue: totalVentasHoy > 0 ? '+12%' : '0%'
    },
    {
      title: 'Saldo Caja',
      value: `$${saldoCaja.toLocaleString('es-ES', { minimumFractionDigits: 2 })}`,
      subtitle: 'Balance actual',
      icon: DollarSign,
      color: '#10b981',
      bgColor: '#f0fdf4',
      trend: saldoCaja > 0 ? 'up' : 'down',
      trendValue: saldoCaja > 0 ? '+5%' : '-2%'
    },
    {
      title: 'Productos',
      value: productosActivos.toString(),
      subtitle: 'En inventario',
      icon: Package,
      color: '#f59e0b',
      bgColor: '#fffbeb',
      trend: 'up',
      trendValue: '+3%'
    },
    {
      title: 'Clientes',
      value: clientesActivos.toString(),
      subtitle: 'Activos',
      icon: Users,
      color: '#8b5cf6',
      bgColor: '#faf5ff',
      trend: 'up',
      trendValue: '+8%'
    }
  ]

  const recentVentas = (ventas || []).slice(0, 5)
  const recentMovimientos = (caja.movimientos || []).slice(0, 5)

  return (
    <div style={{ padding: '2rem', fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Header del Dashboard */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ 
          fontSize: '2rem', 
          fontWeight: '700', 
          color: '#1e293b',
          marginBottom: '0.5rem'
        }}>
          Dashboard
        </h1>
        <p style={{ 
          fontSize: '1rem', 
          color: '#64748b',
          margin: 0
        }}>
          Resumen general del sistema de gestión
        </p>
      </div>

      {/* KPIs Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        {kpiCards.map((card, index) => {
          const Icon = card.icon
          return (
            <div key={index} style={{
              backgroundColor: 'white',
              borderRadius: '1rem',
              padding: '1.5rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              border: '1px solid #e2e8f0',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Icono de fondo */}
              <div style={{
                position: 'absolute',
                top: '-10px',
                right: '-10px',
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                backgroundColor: card.bgColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: 0.1
              }}>
                <Icon size={40} style={{ color: card.color }} />
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ 
                    fontSize: '0.875rem', 
                    color: '#64748b',
                    fontWeight: '500',
                    marginBottom: '0.5rem'
                  }}>
                    {card.title}
                  </div>
                  <div style={{ 
                    fontSize: '2rem', 
                    fontWeight: '700', 
                    color: '#1e293b',
                    marginBottom: '0.25rem'
                  }}>
                    {card.value}
                  </div>
                  <div style={{ 
                    fontSize: '0.875rem', 
                    color: '#64748b'
                  }}>
                    {card.subtitle}
                  </div>
                </div>

                {/* Indicador de tendencia */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '0.375rem',
                  backgroundColor: card.trend === 'up' ? '#f0fdf4' : 
                                   card.trend === 'down' ? '#fef2f2' : '#f8fafc',
                  color: card.trend === 'up' ? '#10b981' : 
                         card.trend === 'down' ? '#ef4444' : '#64748b',
                  fontSize: '0.75rem',
                  fontWeight: '600'
                }}>
                  {card.trend === 'up' ? <ArrowUpRight size={12} /> : 
                   card.trend === 'down' ? <ArrowDownRight size={12} /> : null}
                  {card.trendValue}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Contenido en dos columnas */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: '2rem'
      }}>
        {/* Ventas Recientes */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '1rem',
          padding: '1.5rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            marginBottom: '1.5rem'
          }}>
            <h3 style={{ 
              fontSize: '1.25rem', 
              fontWeight: '600', 
              color: '#1e293b',
              margin: 0
            }}>
              Ventas Recientes
            </h3>
            <ShoppingCart size={20} style={{ color: '#64748b' }} />
          </div>

          {recentVentas.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {recentVentas.map((venta, index) => (
                <div key={index} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '1rem',
                  backgroundColor: '#f8fafc',
                  borderRadius: '0.75rem',
                  border: '1px solid #e2e8f0'
                }}>
                  <div>
                    <div style={{ 
                      fontSize: '0.875rem', 
                      fontWeight: '600', 
                      color: '#1e293b',
                      marginBottom: '0.25rem'
                    }}>
                      Venta #{venta.id}
                    </div>
                    <div style={{ 
                      fontSize: '0.75rem', 
                      color: '#64748b',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      <Calendar size={12} />
                      {new Date(venta.fecha).toLocaleDateString('es-ES')}
                    </div>
                  </div>
                  <div style={{ 
                    fontSize: '1rem', 
                    fontWeight: '700', 
                    color: '#10b981'
                  }}>
                    ${venta.total?.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{
              textAlign: 'center',
              padding: '2rem',
              color: '#64748b'
            }}>
              <ShoppingCart size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
              <p>No hay ventas recientes</p>
            </div>
          )}
        </div>

        {/* Movimientos de Caja */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '1rem',
          padding: '1.5rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            marginBottom: '1.5rem'
          }}>
            <h3 style={{ 
              fontSize: '1.25rem', 
              fontWeight: '600', 
              color: '#1e293b',
              margin: 0
            }}>
              Movimientos de Caja
            </h3>
            <DollarSign size={20} style={{ color: '#64748b' }} />
          </div>

          {recentMovimientos.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {recentMovimientos.map((movimiento, index) => (
                <div key={index} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '1rem',
                  backgroundColor: '#f8fafc',
                  borderRadius: '0.75rem',
                  border: '1px solid #e2e8f0'
                }}>
                  <div>
                    <div style={{ 
                      fontSize: '0.875rem', 
                      fontWeight: '600', 
                      color: '#1e293b',
                      marginBottom: '0.25rem'
                    }}>
                      {movimiento.tipo}
                    </div>
                    <div style={{ 
                      fontSize: '0.75rem', 
                      color: '#64748b',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      <Clock size={12} />
                      {new Date(movimiento.fecha).toLocaleDateString('es-ES')}
                    </div>
                  </div>
                  <div style={{ 
                    fontSize: '1rem', 
                    fontWeight: '700', 
                                         color: movimiento.tipo === 'ingreso' ? '#10b981' : '#ef4444'
                   }}>
                     {movimiento.tipo === 'ingreso' ? '+' : '-'}${Math.abs(movimiento.monto || 0).toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{
              textAlign: 'center',
              padding: '2rem',
              color: '#64748b'
            }}>
              <DollarSign size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
              <p>No hay movimientos recientes</p>
            </div>
          )}
        </div>
      </div>

      {/* Estadísticas adicionales */}
      <div style={{
        marginTop: '2rem',
        backgroundColor: 'white',
        borderRadius: '1rem',
        padding: '1.5rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        border: '1px solid #e2e8f0'
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          marginBottom: '1.5rem'
        }}>
          <h3 style={{ 
            fontSize: '1.25rem', 
            fontWeight: '600', 
            color: '#1e293b',
            margin: 0
          }}>
            Resumen del Período
          </h3>
          <BarChart3 size={20} style={{ color: '#64748b' }} />
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1.5rem'
        }}>
          <div style={{
            textAlign: 'center',
            padding: '1rem',
            backgroundColor: '#f8fafc',
            borderRadius: '0.75rem',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ 
              fontSize: '2rem', 
              fontWeight: '700', 
              color: '#667eea',
              marginBottom: '0.5rem'
            }}>
              {(ventas || []).length}
            </div>
            <div style={{ 
              fontSize: '0.875rem', 
              color: '#64748b',
              fontWeight: '500'
            }}>
              Total Ventas
            </div>
          </div>

          <div style={{
            textAlign: 'center',
            padding: '1rem',
            backgroundColor: '#f8fafc',
            borderRadius: '0.75rem',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ 
              fontSize: '2rem', 
              fontWeight: '700', 
              color: '#10b981',
              marginBottom: '0.5rem'
            }}>
              ${totalVentasSemana.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
            </div>
            <div style={{ 
              fontSize: '0.875rem', 
              color: '#64748b',
              fontWeight: '500'
            }}>
              Ventas Última Semana
            </div>
          </div>

          <div style={{
            textAlign: 'center',
            padding: '1rem',
            backgroundColor: '#f8fafc',
            borderRadius: '0.75rem',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ 
              fontSize: '2rem', 
              fontWeight: '700', 
              color: '#f59e0b',
              marginBottom: '0.5rem'
            }}>
              {(productos || []).length}
            </div>
            <div style={{ 
              fontSize: '0.875rem', 
              color: '#64748b',
              fontWeight: '500'
            }}>
              Total Productos
            </div>
          </div>

          <div style={{
            textAlign: 'center',
            padding: '1rem',
            backgroundColor: '#f8fafc',
            borderRadius: '0.75rem',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ 
              fontSize: '2rem', 
              fontWeight: '700', 
              color: '#8b5cf6',
              marginBottom: '0.5rem'
            }}>
              {(clientes || []).length}
            </div>
            <div style={{ 
              fontSize: '0.875rem', 
              color: '#64748b',
              fontWeight: '500'
            }}>
              Total Clientes
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
