import React, { useEffect } from 'react'
import { useAppStore } from '../../store'
import { 
  useDashboardKPIs,
  useVentasRecientes,
  useMovimientosRecientes,
  useLoadingStates,
  useErrorStates
} from '../../lib/selectors'
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
  ArrowDownRight,
  AlertCircle
} from 'lucide-react'

export const Dashboard: React.FC = () => {
  // Usar selectores optimizados
  const kpis = useDashboardKPIs()
  const ventasRecientes = useVentasRecientes(5)
  const movimientosRecientes = useMovimientosRecientes(5)
  const loadingStates = useLoadingStates()
  const errorStates = useErrorStates()
  
  // Acciones del store
  const fetchVentas = useAppStore((state) => state.fetchVentas)
  const fetchProductos = useAppStore((state) => state.fetchProductos)
  const fetchClientes = useAppStore((state) => state.fetchClientes)
  const fetchMovimientos = useAppStore((state) => state.fetchMovimientos)

  useEffect(() => {
    // Cargar datos iniciales
    fetchVentas()
    fetchProductos()
    fetchClientes()
    fetchMovimientos()
  }, [fetchVentas, fetchProductos, fetchClientes, fetchMovimientos])

  // Refrescar datos automáticamente
  useEffect(() => {
    const interval = setInterval(() => {
      fetchVentas()
      fetchMovimientos()
    }, 30000) // Refrescar cada 30 segundos

    return () => clearInterval(interval)
  }, [fetchVentas, fetchMovimientos])

  // Indicadores de estado
  const isLoading = loadingStates.ventas || loadingStates.productos || loadingStates.caja
  const hasErrors = errorStates.ventas || errorStates.productos || errorStates.caja

  // Mostrar loading si es necesario
  if (isLoading) {
    return (
      <div style={{ padding: '2rem', fontFamily: 'Inter, system-ui, sans-serif' }}>
        <div style={{ textAlign: 'center', paddingTop: '4rem' }}>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p style={{ color: '#64748b' }}>Cargando dashboard...</p>
        </div>
      </div>
    )
  }

  // Mostrar errores si existen
  if (hasErrors) {
    return (
      <div style={{ padding: '2rem', fontFamily: 'Inter, system-ui, sans-serif' }}>
        <div style={{ textAlign: 'center', paddingTop: '4rem' }}>
          <AlertCircle size={48} style={{ color: '#ef4444', margin: '0 auto 1rem' }} />
          <h3 style={{ color: '#ef4444', marginBottom: '0.5rem' }}>Error en el Dashboard</h3>
          <p style={{ color: '#64748b' }}>No se pudieron cargar los datos. Intente refrescar la página.</p>
        </div>
      </div>
    )
  }

  const kpiCards = [
    {
      title: 'Ventas Hoy',
      value: `$${kpis.totalVentasHoy.toLocaleString('es-ES', { minimumFractionDigits: 2 })}`,
      subtitle: `${kpis.cantidadVentasHoy} ventas`,
      icon: TrendingUp,
      color: '#667eea',
      bgColor: '#f0f4ff',
      trend: kpis.totalVentasHoy > 0 ? 'up' : 'neutral',
      trendValue: kpis.totalVentasHoy > 0 ? '+12%' : '0%'
    },
    {
      title: 'Saldo Caja',
      value: `$${kpis.saldoCaja.toLocaleString('es-ES', { minimumFractionDigits: 2 })}`,
      subtitle: 'Balance actual',
      icon: DollarSign,
      color: '#10b981',
      bgColor: '#f0fdf4',
      trend: kpis.saldoCaja > 0 ? 'up' : 'down',
      trendValue: kpis.saldoCaja > 0 ? '+5%' : '-2%'
    },
    {
      title: 'Productos',
      value: kpis.productosActivos.toString(),
      subtitle: `${kpis.productosStockBajo} con stock bajo`,
      icon: Package,
      color: '#f59e0b',
      bgColor: '#fffbeb',
      trend: kpis.productosStockBajo > 0 ? 'down' : 'up',
      trendValue: kpis.productosStockBajo > 0 ? `⚠️ ${kpis.productosStockBajo}` : '✅'
    },
    {
      title: 'Clientes',
      value: kpis.clientesActivos.toString(),
      subtitle: 'Activos',
      icon: Users,
      color: '#8b5cf6',
      bgColor: '#faf5ff',
      trend: 'up',
      trendValue: '+8%'
    }
  ]

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

          {ventasRecientes.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {ventasRecientes.map((venta, index) => (
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

          {movimientosRecientes.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {movimientosRecientes.map((movimiento, index) => (
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
              {kpis.cantidadVentasHoy}
            </div>
            <div style={{ 
              fontSize: '0.875rem', 
              color: '#64748b',
              fontWeight: '500'
            }}>
              Total Ventas Hoy
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
              ${kpis.ventasSemanaPasada.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
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
              {kpis.productosActivos}
            </div>
            <div style={{ 
              fontSize: '0.875rem', 
              color: '#64748b',
              fontWeight: '500'
            }}>
              Productos Activos
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
              {kpis.clientesActivos}
            </div>
            <div style={{ 
              fontSize: '0.875rem', 
              color: '#64748b',
              fontWeight: '500'
            }}>
              Clientes Activos
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
