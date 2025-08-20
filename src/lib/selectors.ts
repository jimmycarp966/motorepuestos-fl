import { useMemo, useCallback, useState, useRef } from 'react'
import { shallow } from 'zustand/shallow'
import { useAppStore } from '../store'
import { DateUtils } from './dateUtils'
import { businessCache } from './cacheManager'
import { useCalendarSync } from './calendarSync'
import type { AppStore, Venta, Producto, Cliente, MovimientoCaja } from '../store/types'

// Tipos para filtros avanzados
export interface VentasFilters {
  fechaInicio?: string
  fechaFin?: string
  clienteId?: string
  empleadoId?: string
  metodoPago?: 'efectivo' | 'tarjeta' | 'transferencia' | 'cuenta_corriente'
  tipoPrecio?: 'minorista' | 'mayorista'
  montoMin?: number
  montoMax?: number
}

export interface ProductosFilters {
  categoria?: string
  stockBajo?: boolean
  sinStock?: boolean
  activo?: boolean
  precioMin?: number
  precioMax?: number
  searchTerm?: string
}

// Tipos para selectores optimizados
export interface DashboardKPIs {
  totalVentasHoy: number
  cantidadVentasHoy: number
  saldoCaja: number
  productosActivos: number
  productosStockBajo: number
  clientesActivos: number
  ventasSemanaPasada: number
  ingresosMes: number
}

export interface ProductosFiltered {
  productos: Producto[]
  total: number
  conStockBajo: number
  sinStock: number
  totalValue: number
}

export interface VentasStats {
  ventasHoy: Venta[]
  ventasSemana: Venta[]
  ventasMes: Venta[]
  totalHoy: number
  totalSemana: number
  totalMes: number
  promedioVenta: number
}

// ================================
// SELECTORES PARA DASHBOARD
// ================================

// Selector optimizado para KPIs del dashboard con sincronización de calendario
export const useDashboardKPIs = (): DashboardKPIs => {
  const calendarSync = useCalendarSync()
  
  return useAppStore(
    useCallback((state: AppStore) => {
      // Usar fecha actual del sistema de sincronización
      const fechaHoy = DateUtils.getCurrentLocalDate()
      const unaSemanaPasada = DateUtils.subtractDays(fechaHoy, 7)
      const unMesPasado = DateUtils.subtractDays(fechaHoy, 30)

      console.log(`🔍 [Dashboard KPIs] Fechas calculadas:`, {
        fechaHoy,
        unaSemanaPasada,
        unMesPasado,
        totalVentas: state.ventas.length
      })

      // Filtrar ventas de hoy - comparación robusta de fechas
      const ventasHoy = state.ventas.filter(v => {
        if (v.estado === 'eliminada') return false
        
        // Convertir la fecha de la venta a fecha local
        const ventaDate = new Date(v.fecha)
        const ventaFechaLocal = ventaDate.toLocaleDateString('en-CA') // Formato YYYY-MM-DD
        
        const esHoy = ventaFechaLocal === fechaHoy
        
        console.log(`🔍 [Dashboard KPIs] Comparando venta:`, {
          id: v.id,
          fechaOriginal: v.fecha,
          fechaLocal: ventaFechaLocal,
          fechaHoy: fechaHoy,
          esHoy: esHoy,
          total: v.total
        })
        
        return esHoy
      })
      
      console.log(`🔍 [Dashboard KPIs] Ventas de hoy:`, {
        cantidad: ventasHoy.length,
        total: ventasHoy.reduce((sum, v) => sum + v.total, 0),
        ventas: ventasHoy.map(v => ({ id: v.id, fecha: v.fecha, total: v.total }))
      })
      
      // Filtrar ventas de la semana (excluyendo eliminadas)
      const ventasSemanaPasada = state.ventas.filter(v => 
        v.estado !== 'eliminada' && v.fecha >= unaSemanaPasada
      )
      
      // Filtrar ventas del mes (excluyendo eliminadas)
      const ventasMes = state.ventas.filter(v => 
        v.estado !== 'eliminada' && v.fecha >= unMesPasado
      )

      // Calcular saldo de caja - solo movimientos del día actual (excluyendo eliminados)
      const movimientosHoy = state.caja.movimientos.filter(m => {
        if (m.estado === 'eliminada') return false
        
        // Convertir la fecha del movimiento a fecha local
        const movimientoDate = new Date(m.fecha)
        const movimientoFechaLocal = movimientoDate.toLocaleDateString('en-CA') // Formato YYYY-MM-DD
        
        const esHoy = movimientoFechaLocal === fechaHoy
        
        console.log(`🔍 [Dashboard KPIs] Comparando movimiento:`, {
          id: m.id,
          fechaOriginal: m.fecha,
          fechaLocal: movimientoFechaLocal,
          fechaHoy: fechaHoy,
          esHoy: esHoy,
          tipo: m.tipo,
          monto: m.monto
        })
        
        return esHoy
      })
      
      const saldoCaja = movimientosHoy.reduce((sum, m) => {
        return m.tipo === 'ingreso' ? sum + m.monto : sum - m.monto
      }, 0)

      // Productos con stock bajo
      const productosStockBajo = state.productos.filter(p => 
        p.activo && p.stock <= p.stock_minimo && p.stock > 0
      ).length

      const result = {
        totalVentasHoy: ventasHoy.reduce((sum, v) => sum + v.total, 0),
        cantidadVentasHoy: ventasHoy.length,
        saldoCaja,
        productosActivos: state.productos.filter(p => p.activo).length,
        productosStockBajo,
        clientesActivos: state.clientes.clientes.filter(c => c.activo).length,
        ventasSemanaPasada: ventasSemanaPasada.reduce((sum, v) => sum + v.total, 0),
        ingresosMes: ventasMes.reduce((sum, v) => sum + v.total, 0)
      }

      console.log(`🔍 [Dashboard KPIs] Resultado final:`, result)
      
      return result
    }, [calendarSync.currentDate]),
    shallow
  )
}

// Selector para ventas recientes optimizado
export const useVentasRecientes = (limit: number = 5) => {
  return useAppStore(
    useCallback((state: AppStore) => 
      state.ventas
        .filter(v => v.estado !== 'eliminada') // Excluir ventas eliminadas
        .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()) // Usar fecha de venta, no created_at
        .slice(0, limit)
    , [limit]),
    shallow
  )
}

// Selector para movimientos de caja recientes
export const useMovimientosRecientes = (limit: number = 5) => {
  return useAppStore(
    useCallback((state: AppStore) =>
      state.caja.movimientos
        .filter(m => m.estado !== 'eliminada') // Excluir movimientos eliminados
        .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()) // Usar fecha de movimiento, no created_at
        .slice(0, limit)
    , [limit]),
    shallow
  )
}

// ================================
// SELECTORES PARA PRODUCTOS
// ================================

// Selector de productos con filtros optimizado
export const useProductosFiltered = (
  searchTerm: string = '',
  stockFilter: 'all' | 'low' | 'out' = 'all',
  categoria: string = ''
): ProductosFiltered => {
  return useAppStore(
    useCallback((state: AppStore) => {
      let productos = state.productos.filter(p => p.activo)

      // Filtro de búsqueda
      if (searchTerm) {
        const term = searchTerm.toLowerCase()
        productos = productos.filter(p =>
          p.nombre.toLowerCase().includes(term) ||
          p.codigo_sku.toLowerCase().includes(term) ||
          p.categoria.toLowerCase().includes(term) ||
          (p.descripcion && p.descripcion.toLowerCase().includes(term))
        )
      }

      // Filtro por categoría
      if (categoria) {
        productos = productos.filter(p => p.categoria === categoria)
      }

      // Filtro de stock
      if (stockFilter === 'low') {
        productos = productos.filter(p => p.stock <= p.stock_minimo && p.stock > 0)
      } else if (stockFilter === 'out') {
        productos = productos.filter(p => p.stock <= 0)
      }

      // Estadísticas
      const conStockBajo = state.productos.filter(p => 
        p.activo && p.stock <= p.stock_minimo && p.stock > 0
      ).length
      
      const sinStock = state.productos.filter(p => 
        p.activo && p.stock <= 0
      ).length

      const totalValue = productos.reduce((sum, p) => 
        sum + (p.stock * p.precio_minorista), 0
      )

      return {
        productos,
        total: productos.length,
        conStockBajo,
        sinStock,
        totalValue
      }
    }, [searchTerm, stockFilter, categoria]),
    shallow
  )
}

// Selector para categorías únicas
export const useCategorias = () => {
  return useAppStore(
    useCallback((state: AppStore) => {
      const categorias = [...new Set(
        state.productos
          .filter(p => p.activo)
          .map(p => p.categoria)
      )]
      return categorias.sort()
    }, []),
    shallow
  )
}

// Selector para productos con stock crítico
export const useProductosStockCritico = () => {
  return useAppStore(
    useCallback((state: AppStore) =>
      state.productos.filter(p => 
        p.activo && p.stock <= p.stock_minimo
      ).sort((a, b) => a.stock - b.stock)
    , []),
    shallow
  )
}

// ================================
// SELECTORES PARA VENTAS
// ================================

// Selector de estadísticas de ventas optimizado
export const useVentasStats = (): VentasStats => {
  return useAppStore(
    useCallback((state: AppStore) => {
      const fechaHoy = DateUtils.getCurrentDate()
      const inicioSemana = DateUtils.subtractDays(fechaHoy, 7)
      const inicioMes = DateUtils.subtractDays(fechaHoy, 30)

      const ventasHoy = state.ventas.filter(v => {
        const ventaFecha = typeof v.fecha === 'string' ? v.fecha.split('T')[0] : v.fecha
        return ventaFecha === fechaHoy
      })
      const ventasSemana = state.ventas.filter(v => v.fecha >= inicioSemana)
      const ventasMes = state.ventas.filter(v => v.fecha >= inicioMes)

      const totalHoy = ventasHoy.reduce((sum, v) => sum + v.total, 0)
      const totalSemana = ventasSemana.reduce((sum, v) => sum + v.total, 0)
      const totalMes = ventasMes.reduce((sum, v) => sum + v.total, 0)

      return {
        ventasHoy,
        ventasSemana,
        ventasMes,
        totalHoy,
        totalSemana,
        totalMes,
        promedioVenta: ventasMes.length > 0 ? totalMes / ventasMes.length : 0
      }
    }, []),
    shallow
  )
}

// Selector para top productos más vendidos
export const useTopProductosVendidos = (limit: number = 10) => {
  return useAppStore(
    useCallback((state: AppStore) => {
      const productosVendidos = new Map<string, { producto: Producto, cantidad: number, ingresos: number }>()

      // Procesar todas las ventas
      state.ventas.forEach(venta => {
        venta.items?.forEach(item => {
          const existing = productosVendidos.get(item.producto_id)
          const producto = state.productos.find(p => p.id === item.producto_id)
          
          if (producto) {
            if (existing) {
              existing.cantidad += item.cantidad
              existing.ingresos += item.subtotal
            } else {
              productosVendidos.set(item.producto_id, {
                producto,
                cantidad: item.cantidad,
                ingresos: item.subtotal
              })
            }
          }
        })
      })

      return Array.from(productosVendidos.values())
        .sort((a, b) => b.cantidad - a.cantidad)
        .slice(0, limit)
    }, [limit]),
    shallow
  )
}

// ================================
// SELECTORES PARA CLIENTES
// ================================

// Selector de clientes filtrados
export const useClientesFiltered = (
  searchTerm: string = '',
  soloActivos: boolean = true
) => {
  return useAppStore(
    useCallback((state: AppStore) => {
      let clientes = state.clientes.clientes

      if (soloActivos) {
        clientes = clientes.filter(c => c.activo)
      }

      if (searchTerm) {
        const term = searchTerm.toLowerCase()
        clientes = clientes.filter(c =>
          c.nombre.toLowerCase().includes(term) ||
          (c.email && c.email.toLowerCase().includes(term)) ||
          (c.telefono && c.telefono.includes(term))
        )
      }

      return clientes
    }, [searchTerm, soloActivos]),
    shallow
  )
}

// Selector para clientes con cuenta corriente
export const useClientesCuentaCorriente = () => {
  return useAppStore(
    useCallback((state: AppStore) =>
      state.clientes.clientes
        .filter(c => c.activo && c.limite_credito > 0)
        .sort((a, b) => b.saldo_cuenta_corriente - a.saldo_cuenta_corriente)
    , []),
    shallow
  )
}

// ================================
// SELECTORES PARA CAJA
// ================================

// Selector de estado de caja optimizado
export const useEstadoCaja = () => {
  return useAppStore(
    useCallback((state: AppStore) => {
      const fechaHoy = DateUtils.getCurrentDate()
      const movimientosHoy = state.caja.movimientos.filter(m => 
        DateUtils.isToday(m.fecha)
      )

      const ingresosDia = movimientosHoy
        .filter(m => m.tipo === 'ingreso')
        .reduce((sum, m) => sum + m.monto, 0)

      const egresosDia = movimientosHoy
        .filter(m => m.tipo === 'egreso')
        .reduce((sum, m) => sum + m.monto, 0)

      // Calcular saldo total solo de movimientos activos (no eliminados)
      const saldoTotal = state.caja.movimientos
        .filter(m => m.estado !== 'eliminada')
        .reduce((sum, m) => {
          return m.tipo === 'ingreso' ? sum + m.monto : sum - m.monto
        }, 0)

      return {
        cajaAbierta: state.caja.cajaAbierta,
        saldoTotal,
        ingresosDia,
        egresosDia,
        saldoDia: ingresosDia - egresosDia,
        movimientosHoy: movimientosHoy.length
      }
    }, []),
    shallow
  )
}

// ================================
// SELECTORES PARA UI
// ================================

// Selector de loading states corregido
export const useLoadingStates = () => {
  return useAppStore(
    useCallback((state: AppStore) => ({
      productos: state.loading || false,
      ventas: state.loading || false,    
      clientes: state.clientes?.loading || false,
      empleados: state.empleados?.loading || false,
      caja: state.caja?.loading || false
    }), []),
    shallow
  )
}

// Selector de errores corregido
export const useErrorStates = () => {
  return useAppStore(
    useCallback((state: AppStore) => ({
      productos: state.error || null,
      ventas: state.error || null,
      clientes: state.clientes?.error || null,
      empleados: state.empleados?.error || null,
      caja: state.caja?.error || null
    }), []),
    shallow
  )
}

// ================================
// SELECTORES GRANULARES OPTIMIZADOS
// ================================

// Hook para memoización estable de filtros
const useStableFilter = <T>(filter: T): T => {
  const filterRef = useRef(filter)
  const filterStringRef = useRef('')
  
  const currentFilterString = JSON.stringify(filter)
  
  if (currentFilterString !== filterStringRef.current) {
    filterRef.current = filter
    filterStringRef.current = currentFilterString
  }
  
  return filterRef.current
}

// Selector granular para ventas con filtros avanzados
export const useVentasFiltered = (filters: VentasFilters = {}) => {
  const stableFilters = useStableFilter(filters)
  
  return useAppStore(
    useCallback((state: AppStore) => {
      const ventas = state.ventas || []
      
      // Aplicar filtros de forma optimizada
      const filtered = ventas.filter(venta => {
        // Filtro por rango de fechas
        if (stableFilters.fechaInicio && new Date(venta.fecha) < new Date(stableFilters.fechaInicio)) {
          return false
        }
        if (stableFilters.fechaFin && new Date(venta.fecha) > new Date(stableFilters.fechaFin)) {
          return false
        }
        
        // Filtros específicos
        if (stableFilters.clienteId && venta.cliente_id !== stableFilters.clienteId) return false
        if (stableFilters.empleadoId && venta.empleado_id !== stableFilters.empleadoId) return false
        if (stableFilters.metodoPago && venta.metodo_pago !== stableFilters.metodoPago) return false
        if (stableFilters.tipoPrecio && venta.tipo_precio !== stableFilters.tipoPrecio) return false
        
        // Filtros por monto
        if (stableFilters.montoMin && venta.total < stableFilters.montoMin) return false
        if (stableFilters.montoMax && venta.total > stableFilters.montoMax) return false
        
        return true
      })
      
      return {
        ventas: filtered,
        total: filtered.reduce((sum, v) => sum + v.total, 0),
        count: filtered.length,
        loading: state.loading,
        error: state.error
      }
    }, [stableFilters]),
    shallow
  )
}

// ================================
// SELECTORES PARA NOTIFICACIONES
// ================================

// Selector de notificaciones por tipo
export const useNotificationsByType = (type?: 'success' | 'error' | 'warning' | 'info') => {
  return useAppStore(
    useCallback((state: AppStore) => {
      const notifications = state.notifications.notifications
      return type 
        ? notifications.filter(n => n.type === type)
        : notifications
    }, [type]),
    shallow
  )
}

// ================================
// HOOK PERSONALIZADO PARA PAGINACIÓN
// ================================

export const usePagination = <T>(
  data: T[],
  pageSize: number = 50
) => {
  const [currentPage, setCurrentPage] = useState(0)
  
  const paginatedData = useMemo(() => {
    const startIndex = currentPage * pageSize
    return data.slice(startIndex, startIndex + pageSize)
  }, [data, currentPage, pageSize])

  const totalPages = Math.ceil(data.length / pageSize)
  
  const goToPage = useCallback((page: number) => {
    setCurrentPage(Math.max(0, Math.min(page, totalPages - 1)))
  }, [totalPages])

  const nextPage = useCallback(() => {
    goToPage(currentPage + 1)
  }, [currentPage, goToPage])

  const prevPage = useCallback(() => {
    goToPage(currentPage - 1)
  }, [currentPage, goToPage])

  return {
    data: paginatedData,
    currentPage,
    totalPages,
    pageSize,
    total: data.length,
    goToPage,
    nextPage,
    prevPage,
    hasNext: currentPage < totalPages - 1,
    hasPrev: currentPage > 0
  }
}

// ================================
// EXPORT DE TODOS LOS SELECTORES
// ================================
// Los selectores ya están exportados individualmente arriba
