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
import { useCalendarSync } from '../../lib/calendarSync'
import { DateUtils } from '../../lib/dateUtils'

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

// Función para formatear venta para mostrar productos vendidos
const formatearVentaParaMostrar = (venta: any) => {
  if (!venta.items || venta.items.length === 0) {
    return 'Venta de productos'
  }
  
  const productos = venta.items.map((item: any) => {
    const nombreProducto = item.producto?.nombre || 'Producto desconocido'
    return `${nombreProducto} x${item.cantidad}`
  })
  
  if (productos.length === 1) {
    return productos[0]
  } else if (productos.length <= 3) {
    return productos.join(', ')
  } else {
    const primerProducto = productos[0]
    return `${primerProducto} +${productos.length - 1} más`
  }
}

export const Dashboard: React.FC = () => {
  // Limpiar localStorage de fechas antiguas al iniciar
  React.useEffect(() => {
    const currentDate = DateUtils.getCurrentLocalDate()
    const lastLoadDate = localStorage.getItem('dashboard_last_load_date')
    const lastCheckDate = localStorage.getItem('dashboard_last_check_date')
    
    // Si las fechas guardadas no coinciden con la fecha actual, limpiarlas
    if (lastLoadDate && lastLoadDate !== currentDate) {
      localStorage.removeItem('dashboard_last_load_date')
      console.log(`🧹 [Dashboard] Limpiando fecha antigua del localStorage: ${lastLoadDate}`)
    }
    
    if (lastCheckDate && lastCheckDate !== currentDate) {
      localStorage.removeItem('dashboard_last_check_date')
      console.log(`🧹 [Dashboard] Limpiando fecha de verificación antigua: ${lastCheckDate}`)
    }
  }, [])

  // FORZAR LIMPIEZA DE CACHE Y RECARGA AL INICIAR
  React.useEffect(() => {
    console.log('🚀 [Dashboard] Iniciando dashboard con limpieza de cache forzada')
    
    // Limpiar cache del navegador
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => {
          caches.delete(name)
        })
        console.log('🧹 [Dashboard] Cache del navegador limpiado')
      })
    }
    
    // Forzar recarga de datos
    setTimeout(() => {
      console.log('🔄 [Dashboard] Forzando recarga inicial de datos')
      loadDashboardData(true)
    }, 1000)
  }, [])

  // DEBUGGING: Verificar fechas de ventas
  React.useEffect(() => {
    const ventas = useAppStore.getState().ventas
    console.log('🔍 [Dashboard Debug] Todas las ventas:', ventas.map(v => ({
      id: v.id,
      fecha: v.fecha,
      fechaFormateada: new Date(v.fecha).toLocaleDateString('es-ES'),
      total: v.total,
      concepto: v.concepto
    })))
    
    const fechaHoy = DateUtils.getCurrentLocalDate()
    console.log('🔍 [Dashboard Debug] Fecha actual:', fechaHoy)
    
    const ventasHoy = ventas.filter(v => {
      const ventaFecha = new Date(v.fecha).toISOString().split('T')[0]
      return ventaFecha === fechaHoy
    })
    
    console.log('🔍 [Dashboard Debug] Ventas de hoy (comparación directa):', {
      cantidad: ventasHoy.length,
      total: ventasHoy.reduce((sum, v) => sum + v.total, 0),
      ventas: ventasHoy.map(v => ({
        id: v.id,
        fecha: v.fecha,
        fechaFormateada: new Date(v.fecha).toLocaleDateString('es-ES'),
        total: v.total
      }))
    })
  }, [])

  // Usar selectores optimizados con validaciones
  const kpis = useDashboardKPIs()
  const ventasRecientes = useVentasRecientes(5)
  const movimientosRecientes = useMovimientosRecientes(5)
  const loadingStates = useLoadingStates()
  const errorStates = useErrorStates()
  const calendarSync = useCalendarSync()
  
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
    // Verificar si cambió el día y forzar actualización
    const currentDate = DateUtils.getCurrentLocalDate()
    const lastLoadDate = localStorage.getItem('dashboard_last_load_date')
    
    if (lastLoadDate !== currentDate) {
      console.log(`🔄 [Dashboard] Cambio de día detectado: ${lastLoadDate} → ${currentDate}`)
      localStorage.setItem('dashboard_last_load_date', currentDate)
      
      // Forzar refresco completo de datos
      try {
        await Promise.all([
          fetchVentas(),
          fetchProductos(),
          fetchClientes(),
          fetchMovimientos()
        ])
        
        addNotification({
          id: `day-change-${Date.now()}`,
          type: 'info',
          title: 'Nuevo Día',
          message: `Dashboard actualizado para ${currentDate}`,
          duration: 3000
        })
      } catch (error) {
        console.error('Error al actualizar datos del nuevo día:', error)
      }
    }
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

  // Monitorear cambios de día
  useEffect(() => {
    const checkDayChange = () => {
      const currentDate = DateUtils.getCurrentLocalDate()
      const lastCheckDate = localStorage.getItem('dashboard_last_check_date')
      
      if (lastCheckDate !== currentDate) {
        console.log(`🔄 [Dashboard] Cambio de día detectado en monitoreo: ${lastCheckDate} → ${currentDate}`)
        localStorage.setItem('dashboard_last_check_date', currentDate)
        
        // Forzar refresco completo de datos
        Promise.all([
          fetchVentas(),
          fetchProductos(),
          fetchClientes(),
          fetchMovimientos()
        ]).then(() => {
          addNotification({
            id: `day-change-${Date.now()}`,
            type: 'info',
            title: 'Nuevo Día',
            message: `Dashboard actualizado para ${currentDate}`,
            duration: 3000
          })
        }).catch(error => {
          console.error('Error al actualizar datos del nuevo día:', error)
        })
      }
    }

    // Verificar cada 30 segundos si cambió el día
    const intervalId = setInterval(checkDayChange, 30000)
    
    // Verificar cuando la ventana se vuelve activa
    const handleFocus = () => {
      checkDayChange()
    }
    
    // Verificar cuando el usuario regresa a la pestaña
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        checkDayChange()
      }
    }
    
    window.addEventListener('focus', handleFocus)
    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    return () => {
      clearInterval(intervalId)
      window.removeEventListener('focus', handleFocus)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [fetchVentas, fetchProductos, fetchClientes, fetchMovimientos, addNotification])

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
      <div className="p-8 font-sans bg-dark-bg-primary">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-dark-text-primary mb-2">Dashboard</h1>
          <p className="text-dark-text-secondary">Resumen general del sistema de gestión</p>
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
      <div style={{ padding: '2rem', fontFamily: 'Inter, system-ui, sans-serif', backgroundColor: '#000000' }}>
        <div style={{ textAlign: 'center', paddingTop: '4rem', maxWidth: '500px', margin: '0 auto' }}>
          <AlertCircle size={48} style={{ color: '#F44336', margin: '0 auto 1rem' }} />
          <h3 style={{ color: '#F44336', marginBottom: '1rem', fontSize: '1.5rem' }}>
            Error en el Dashboard
          </h3>
          <p style={{ color: '#B0B0B0', marginBottom: '1.5rem', lineHeight: '1.6' }}>
            No se pudieron cargar los datos después de varios intentos. Esto puede deberse a problemas de conexión o del servidor.
          </p>
          
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={handleRetryManual}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#2979FF',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: '500',
                transition: 'background-color 0.2s',
                boxShadow: '0 0 20px rgba(41, 121, 255, 0.3)'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1e6bff'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2979FF'}
            >
              🔄 Reintentar Ahora
            </button>
            
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#121212',
                color: '#FFFFFF',
                border: '1px solid #2C2C2C',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: '500',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1E1E1E'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#121212'}
            >
              🔃 Refrescar Página
            </button>
          </div>

          <p style={{ color: '#B0B0B0', fontSize: '0.75rem', marginTop: '1.5rem', opacity: 0.7 }}>
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
      color: '#2979FF',
      bgColor: 'rgba(41, 121, 255, 0.1)',
      trend: kpis.totalVentasHoy > 0 ? 'up' : 'neutral',
      trendValue: kpis.totalVentasHoy > 0 ? '+12%' : '0%'
    },
    {
      title: 'Saldo Caja',
      value: `$${kpis.saldoCaja.toLocaleString('es-ES', { minimumFractionDigits: 2 })}`,
      subtitle: 'Balance actual',
      icon: DollarSign,
      color: '#4CAF50',
      bgColor: 'rgba(76, 175, 80, 0.1)',
      trend: kpis.saldoCaja > 0 ? 'up' : 'down',
      trendValue: kpis.saldoCaja > 0 ? '+5%' : '-2%'
    },
    {
      title: 'Productos',
      value: kpis.productosActivos.toString(),
      subtitle: `${kpis.productosStockBajo} con stock bajo`,
      icon: Package,
      color: '#FF9800',
      bgColor: 'rgba(255, 152, 0, 0.1)',
      trend: kpis.productosStockBajo > 0 ? 'down' : 'up',
      trendValue: kpis.productosStockBajo > 0 ? `⚠️ ${kpis.productosStockBajo}` : '✅'
    },
    {
      title: 'Clientes',
      value: kpis.clientesActivos.toString(),
      subtitle: 'Activos',
      icon: Users,
      color: '#7C4DFF',
      bgColor: 'rgba(124, 77, 255, 0.1)',
      trend: 'up',
      trendValue: '+8%'
    }
  ]

  return (
    <div style={{ 
      padding: 'clamp(0.75rem, 3vw, 1rem)', 
      fontFamily: 'Inter, system-ui, sans-serif',
      backgroundColor: '#000000',
      minHeight: '100vh'
    }}>

      {/* Header del Dashboard */}
      <div style={{ marginBottom: 'clamp(1rem, 3vw, 1.5rem)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
          <div>
            <h1 style={{ 
              fontSize: 'clamp(1.25rem, 4vw, 2rem)', 
              fontWeight: '700', 
              color: '#FFFFFF',
              marginBottom: '0.5rem'
            }}>
              Dashboard
            </h1>
            <p style={{ 
              fontSize: 'clamp(0.75rem, 2vw, 1rem)', 
              color: '#B0B0B0',
              margin: 0
            }}>
              Resumen general del sistema de gestión
            </p>
          </div>
          
          {/* Indicador de sincronización de calendario */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 0.75rem',
            backgroundColor: calendarSync.syncInProgress ? 'rgba(255, 152, 0, 0.2)' : 'rgba(76, 175, 80, 0.2)',
            border: `1px solid ${calendarSync.syncInProgress ? '#FF9800' : '#4CAF50'}`,
            borderRadius: '0.5rem',
            fontSize: '0.75rem'
          }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: calendarSync.syncInProgress ? '#FF9800' : '#4CAF50',
              animation: calendarSync.syncInProgress ? 'pulse 2s infinite' : 'none'
            }} />
            <span style={{ color: calendarSync.syncInProgress ? '#FF9800' : '#4CAF50' }}>
              {calendarSync.syncInProgress ? 'Sincronizando...' : `Día: ${calendarSync.currentDate}`}
            </span>
          </div>
        </div>
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
              backgroundColor: '#121212',
              borderRadius: '1rem',
              padding: '1rem',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.6), 0 2px 4px -2px rgba(0, 0, 0, 0.3)',
              border: '1px solid #2C2C2C',
              position: 'relative',
              overflow: 'hidden',
              transition: 'all 0.2s ease'
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
                opacity: 0.3
              }}>
                <Icon size={30} style={{ color: card.color }} />
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ 
                    fontSize: '0.875rem', 
                    color: '#B0B0B0',
                    fontWeight: '500',
                    marginBottom: '0.5rem'
                  }}>
                    {card.title}
                  </div>
                  <div style={{ 
                    fontSize: 'clamp(1.5rem, 4vw, 2rem)', 
                    fontWeight: '700', 
                    color: '#FFFFFF',
                    marginBottom: '0.25rem'
                  }}>
                    {card.value}
                  </div>
                  <div style={{ 
                    fontSize: '0.875rem', 
                    color: '#B0B0B0'
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
                  backgroundColor: card.trend === 'up' ? 'rgba(76, 175, 80, 0.2)' : 
                                   card.trend === 'down' ? 'rgba(244, 51, 54, 0.2)' : '#1E1E1E',
                  color: card.trend === 'up' ? '#4CAF50' : 
                         card.trend === 'down' ? '#F44336' : '#B0B0B0',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  border: `1px solid ${card.trend === 'up' ? '#4CAF50' : 
                                      card.trend === 'down' ? '#F44336' : '#2C2C2C'}`
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
          backgroundColor: '#121212',
          borderRadius: '1rem',
          padding: '1rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.6), 0 2px 4px -2px rgba(0, 0, 0, 0.3)',
          border: '1px solid #2C2C2C'
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
              color: '#FFFFFF',
              margin: 0
            }}>
              Ventas Recientes
            </h3>
            <ShoppingCart size={20} style={{ color: '#2979FF' }} />
          </div>

          {ventasRecientes.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {ventasRecientes.map((venta, index) => (
                <div key={index} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.75rem',
                  backgroundColor: '#1E1E1E',
                  borderRadius: '0.75rem',
                  border: '1px solid #2C2C2C',
                  transition: 'all 0.2s ease'
                }}>
                  <div>
                    <div style={{ 
                      fontSize: '0.875rem', 
                      fontWeight: '600', 
                      color: '#FFFFFF',
                      marginBottom: '0.25rem'
                    }}>
                      {formatearVentaParaMostrar(venta)}
                    </div>
                    <div style={{ 
                      fontSize: '0.75rem', 
                      color: '#B0B0B0',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      <Calendar size={12} />
                      {DateUtils.formatDate(venta.fecha, 'short')}
                    </div>
                  </div>
                  <div style={{ 
                    fontSize: '1rem', 
                    fontWeight: '700', 
                    color: '#4CAF50'
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
              color: '#B0B0B0'
            }}>
              <ShoppingCart size={48} style={{ marginBottom: '1rem', opacity: 0.5, color: '#B0B0B0' }} />
              <p>No hay ventas recientes</p>
            </div>
          )}
        </div>

        {/* Movimientos de Caja */}
        <div style={{
          backgroundColor: '#121212',
          borderRadius: '1rem',
          padding: '1rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.6), 0 2px 4px -2px rgba(0, 0, 0, 0.3)',
          border: '1px solid #2C2C2C'
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
              color: '#FFFFFF',
              margin: 0
            }}>
              Movimientos de Caja
            </h3>
            <DollarSign size={20} style={{ color: '#FF9800' }} />
          </div>

          {movimientosRecientes.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {movimientosRecientes.map((movimiento, index) => (
                <div key={index} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.75rem',
                  backgroundColor: '#1E1E1E',
                  borderRadius: '0.75rem',
                  border: '1px solid #2C2C2C',
                  transition: 'all 0.2s ease'
                }}>
                  <div>
                    <div style={{ 
                      fontSize: '0.875rem', 
                      fontWeight: '600', 
                      color: '#FFFFFF',
                      marginBottom: '0.25rem'
                    }}>
                      {movimiento.tipo}
                    </div>
                    <div style={{ 
                      fontSize: '0.75rem', 
                      color: '#B0B0B0',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      <Clock size={12} />
                      {DateUtils.formatDate(movimiento.fecha, 'short')}
                    </div>
                  </div>
                  <div style={{ 
                    fontSize: '1rem', 
                    fontWeight: '700', 
                    color: movimiento.tipo === 'ingreso' ? '#4CAF50' : '#F44336'
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
              color: '#B0B0B0'
            }}>
              <DollarSign size={48} style={{ marginBottom: '1rem', opacity: 0.5, color: '#B0B0B0' }} />
              <p>No hay movimientos recientes</p>
            </div>
          )}
        </div>
      </div>

      {/* Estadísticas adicionales */}
      <div style={{
        marginTop: '1.5rem',
        backgroundColor: '#121212',
        borderRadius: '1rem',
        padding: '1rem',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.6), 0 2px 4px -2px rgba(0, 0, 0, 0.3)',
        border: '1px solid #2C2C2C'
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
            color: '#FFFFFF',
            margin: 0
          }}>
            Resumen del Período
          </h3>
          <BarChart3 size={20} style={{ color: '#2979FF' }} />
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '1rem'
        }}>
          <div style={{
            textAlign: 'center',
            padding: '1rem',
            backgroundColor: '#1E1E1E',
            borderRadius: '0.75rem',
            border: '1px solid #2C2C2C',
            transition: 'all 0.2s ease'
          }}>
            <div style={{ 
              fontSize: 'clamp(1.5rem, 4vw, 2rem)', 
              fontWeight: '700', 
              color: '#2979FF',
              marginBottom: '0.5rem'
            }}>
              {kpis.cantidadVentasHoy}
            </div>
            <div style={{ 
              fontSize: '0.875rem', 
              color: '#B0B0B0',
              fontWeight: '500'
            }}>
              Total Ventas Hoy
            </div>
          </div>

          <div style={{
            textAlign: 'center',
            padding: '1rem',
            backgroundColor: '#1E1E1E',
            borderRadius: '0.75rem',
            border: '1px solid #2C2C2C',
            transition: 'all 0.2s ease'
          }}>
            <div style={{ 
              fontSize: 'clamp(1.5rem, 4vw, 2rem)', 
              fontWeight: '700', 
              color: '#4CAF50',
              marginBottom: '0.5rem'
            }}>
              ${kpis.ventasSemanaPasada.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
            </div>
            <div style={{ 
              fontSize: '0.875rem', 
              color: '#B0B0B0',
              fontWeight: '500'
            }}>
              Ventas Última Semana
            </div>
          </div>

          <div style={{
            textAlign: 'center',
            padding: '1rem',
            backgroundColor: '#1E1E1E',
            borderRadius: '0.75rem',
            border: '1px solid #2C2C2C',
            transition: 'all 0.2s ease'
          }}>
            <div style={{ 
              fontSize: 'clamp(1.5rem, 4vw, 2rem)', 
              fontWeight: '700', 
              color: '#FF9800',
              marginBottom: '0.5rem'
            }}>
              {kpis.productosActivos}
            </div>
            <div style={{ 
              fontSize: '0.875rem', 
              color: '#B0B0B0',
              fontWeight: '500'
            }}>
              Productos Activos
            </div>
          </div>

          <div style={{
            textAlign: 'center',
            padding: '1rem',
            backgroundColor: '#1E1E1E',
            borderRadius: '0.75rem',
            border: '1px solid #2C2C2C',
            transition: 'all 0.2s ease'
          }}>
            <div style={{ 
              fontSize: 'clamp(1.5rem, 4vw, 2rem)', 
              fontWeight: '700', 
              color: '#7C4DFF',
              marginBottom: '0.5rem'
            }}>
              {kpis.clientesActivos}
            </div>
            <div style={{ 
              fontSize: '0.875rem', 
              color: '#B0B0B0',
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
