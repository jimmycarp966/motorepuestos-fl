import React, { useEffect } from 'react'
import { useAppStore } from '../../store'
import { useComponentShortcuts, createShortcut } from '../../hooks/useKeyboardShortcuts'
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

// Importar nuevos componentes mejorados
import { 
  KPICard, 
  MotorCard, 
  KPICardSkeleton, 
  EmptyState, 
  ContextualLoader,
  SpeedometerIcon 
} from '../index'

export const Dashboard: React.FC = () => {
  // Usar selectores optimizados con validaciones
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
  const addNotification = useAppStore((state) => state.addNotification)

  // Estado para retry automático
  const [retryCount, setRetryCount] = React.useState(0)
  const [lastErrorTime, setLastErrorTime] = React.useState<number | null>(null)

  // Shortcuts para Dashboard
  const dashboardShortcuts = [
    createShortcut('r', () => {
      loadDashboardData(true)
      addNotification({
        id: `refresh-${Date.now()}`,
        type: 'info',
        title: 'Dashboard Actualizado',
        message: 'Datos refrescados (Ctrl+R)',
        duration: 1500
      })
    }, 'Refrescar dashboard', { ctrlKey: true }),
    
    createShortcut('F9', () => {
      window.location.reload()
    }, 'Refrescar aplicación completa')
  ]

  useComponentShortcuts(dashboardShortcuts)

  // Función para cargar datos con manejo de errores mejorado
  const loadDashboardData = React.useCallback(async (isRetry = false) => {
    try {
      if (!isRetry) {
        console.log('🔄 [Dashboard] Cargando datos...')
      } else {
        console.log(`🔄 [Dashboard] Reintentando carga (intento ${retryCount + 1})...`)
      }

      // Cargar datos en paralelo con timeout
      await Promise.allSettled([
        Promise.race([
          fetchVentas(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout ventas')), 10000))
        ]),
        Promise.race([
          fetchProductos(), 
          new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout productos')), 10000))
        ]),
        Promise.race([
          fetchClientes(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout clientes')), 10000))
        ]),
        Promise.race([
          fetchMovimientos(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout caja')), 10000))
        ])
      ])

      // Resetear contador de retry si es exitoso
      if (retryCount > 0) {
        setRetryCount(0)
        setLastErrorTime(null)
        addNotification({
          id: Date.now().toString(),
          type: 'success',
          title: 'Dashboard Recuperado',
          message: 'Los datos se cargaron correctamente tras el reintento',
          duration: 3000
        })
      }
    } catch (error) {
      console.error('❌ [Dashboard] Error cargando datos:', error)
      setLastErrorTime(Date.now())
      
      if (!isRetry) {
        addNotification({
          id: Date.now().toString(),
          type: 'warning',
          title: 'Error de Carga',
          message: 'Hubo un problema cargando algunos datos. Reintentando automáticamente...',
          duration: 4000
        })
      }
    }
  }, [fetchVentas, fetchProductos, fetchClientes, fetchMovimientos, retryCount, addNotification])

  useEffect(() => {
    loadDashboardData()
  }, [loadDashboardData])

  // Sistema de retry automático
  useEffect(() => {
    if (lastErrorTime && retryCount < 3) {
      const timeoutId = setTimeout(() => {
        setRetryCount(prev => prev + 1)
        loadDashboardData(true)
      }, Math.min(2000 * Math.pow(2, retryCount), 10000)) // Backoff exponencial

      return () => clearTimeout(timeoutId)
    }
  }, [lastErrorTime, retryCount, loadDashboardData])

  // Refrescar datos automáticamente (solo si no hay errores)
  useEffect(() => {
    if (!lastErrorTime || retryCount >= 3) {
      const interval = setInterval(() => {
        // Solo refrescar ventas y movimientos, que cambian más frecuentemente
        Promise.allSettled([
          fetchVentas(),
          fetchMovimientos()
        ]).catch(error => {
          console.warn('⚠️ [Dashboard] Error en refresh automático:', error)
        })
      }, 30000) // Refrescar cada 30 segundos

      return () => clearInterval(interval)
    }
  }, [fetchVentas, fetchMovimientos, lastErrorTime, retryCount])

  // Indicadores de estado
  const isLoading = loadingStates.ventas || loadingStates.productos || loadingStates.caja
  const hasErrors = errorStates.ventas || errorStates.productos || errorStates.caja

  // Mostrar loading si es necesario con nuevo componente
  if (isLoading) {
    return (
      <div className="p-8 font-sans">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">Resumen general del sistema de gestión</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <KPICardSkeleton />
          <KPICardSkeleton />
          <KPICardSkeleton />
          <KPICardSkeleton />
        </div>
        
        <ContextualLoader type="general" message="Cargando dashboard..." size="lg" />
      </div>
    )
  }

  // Función para retry manual
  const handleRetryManual = () => {
    setRetryCount(0)
    setLastErrorTime(null)
    loadDashboardData()
  }

  // Mostrar errores si existen
  if (hasErrors && retryCount >= 3) {
    return (
      <div style={{ padding: '2rem', fontFamily: 'Inter, system-ui, sans-serif' }}>
        <div style={{ textAlign: 'center', paddingTop: '4rem', maxWidth: '500px', margin: '0 auto' }}>
          <AlertCircle size={48} style={{ color: '#ef4444', margin: '0 auto 1rem' }} />
          <h3 style={{ color: '#ef4444', marginBottom: '1rem', fontSize: '1.5rem' }}>
            Error en el Dashboard
          </h3>
          <p style={{ color: '#64748b', marginBottom: '1.5rem', lineHeight: '1.6' }}>
            No se pudieron cargar los datos después de varios intentos. Esto puede deberse a problemas de conexión o del servidor.
          </p>
          
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={handleRetryManual}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: '500',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#3b82f6'}
            >
              🔄 Reintentar Ahora
            </button>
            
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#6b7280',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: '500',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#4b5563'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#6b7280'}
            >
              🔃 Refrescar Página
            </button>
          </div>

          <p style={{ color: '#9ca3af', fontSize: '0.75rem', marginTop: '1.5rem' }}>
            Si el problema persiste, contacte al administrador del sistema.
          </p>
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
    <div style={{ 
      padding: 'clamp(0.75rem, 3vw, 1rem)', 
      fontFamily: 'Inter, system-ui, sans-serif' 
    }}>

      {/* Header del Dashboard */}
      <div style={{ marginBottom: 'clamp(1rem, 3vw, 1.5rem)' }}>
        <h1 style={{ 
          fontSize: 'clamp(1.25rem, 4vw, 2rem)', 
          fontWeight: '700', 
          color: '#1e293b',
          marginBottom: '0.5rem'
        }}>
          Dashboard
        </h1>
        <p style={{ 
          fontSize: 'clamp(0.75rem, 2vw, 1rem)', 
          color: '#64748b',
          margin: 0
        }}>
          Resumen general del sistema de gestión
        </p>
      </div>

      {/* KPIs Grid - Optimizado para móviles */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(240px, 100%), 1fr))',
        gap: 'clamp(0.75rem, 2vw, 1rem)',
        marginBottom: 'clamp(1rem, 3vw, 1.5rem)'
      }}>
        {kpiCards.map((card, index) => {
          const Icon = card.icon
          return (
            <div key={index} style={{
              backgroundColor: 'white',
              borderRadius: '1rem',
              padding: '1rem',
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
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                backgroundColor: card.bgColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: 0.1
              }}>
                <Icon size={30} style={{ color: card.color }} />
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
                    fontSize: 'clamp(1.5rem, 4vw, 2rem)', 
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
                  <span style={{ display: 'none', '@media (min-width: 640px)': { display: 'inline' } }}>
                    {card.trendValue}
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Contenido en dos columnas */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: '1.5rem',
        '@media (min-width: 768px)': {
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
          gap: '2rem'
        }
      }}>
        {/* Ventas Recientes */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '1rem',
          padding: '1rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            marginBottom: '1rem'
          }}>
            <h3 style={{ 
              fontSize: '1.125rem', 
              fontWeight: '600', 
              color: '#1e293b',
              margin: 0
            }}>
              Ventas Recientes
            </h3>
            <ShoppingCart size={20} style={{ color: '#64748b' }} />
          </div>

          {ventasRecientes.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {ventasRecientes.map((venta, index) => (
                <div key={index} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.75rem',
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
          padding: '1rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            marginBottom: '1rem'
          }}>
            <h3 style={{ 
              fontSize: '1.125rem', 
              fontWeight: '600', 
              color: '#1e293b',
              margin: 0
            }}>
              Movimientos de Caja
            </h3>
            <DollarSign size={20} style={{ color: '#64748b' }} />
          </div>

          {movimientosRecientes.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {movimientosRecientes.map((movimiento, index) => (
                <div key={index} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.75rem',
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
        marginTop: '1.5rem',
        backgroundColor: 'white',
        borderRadius: '1rem',
        padding: '1rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        border: '1px solid #e2e8f0'
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          marginBottom: '1rem'
        }}>
          <h3 style={{ 
            fontSize: '1.125rem', 
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
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '1rem'
        }}>
          <div style={{
            textAlign: 'center',
            padding: '1rem',
            backgroundColor: '#f8fafc',
            borderRadius: '0.75rem',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ 
              fontSize: 'clamp(1.5rem, 4vw, 2rem)', 
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
              fontSize: 'clamp(1.5rem, 4vw, 2rem)', 
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
              fontSize: 'clamp(1.5rem, 4vw, 2rem)', 
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
              fontSize: 'clamp(1.5rem, 4vw, 2rem)', 
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
