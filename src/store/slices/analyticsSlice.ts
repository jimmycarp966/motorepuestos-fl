import { StateCreator } from 'zustand'
import { AppStore } from '../types'
import { supabase } from '../../lib/supabase'
import { startOfDay, endOfDay, subDays, format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'

// ================================
// TIPOS PARA ANALYTICS
// ================================

export interface VentasTrend {
  fecha: string
  ventas: number
  total: number
  clientes_nuevos: number
  ticket_promedio: number
}

export interface ProductoPopularidad {
  producto_id: string
  nombre: string
  categoria: string
  cantidad_vendida: number
  total_ingresos: number
  veces_vendido: number
  rotacion: number // días promedio entre ventas
}

export interface ClienteAnalytics {
  cliente_id: string
  nombre: string
  total_compras: number
  frecuencia_compra: number // días promedio entre compras
  valor_promedio: number
  ultima_compra: string
  categoria_preferida: string
  estado: 'activo' | 'frecuente' | 'perdido' | 'nuevo'
}

export interface InventarioAnalytics {
  producto_id: string
  nombre: string
  stock_actual: number
  stock_minimo: number
  rotacion_mensual: number
  dias_agotamiento: number | null
  valor_inventario: number
  estado: 'critico' | 'bajo' | 'normal' | 'exceso'
}

export interface PredictionData {
  ventas_proximos_7_dias: number
  productos_criticos: string[]
  clientes_en_riesgo: string[]
  mejor_dia_semana: string
  peor_dia_semana: string
  crecimiento_mensual: number
}

export interface KPIEvolution {
  periodo: string
  ventas_total: number
  tickets: number
  ticket_promedio: number
  clientes_unicos: number
  productos_vendidos: number
  margen_bruto: number
}

export interface AnalyticsState {
  // Datos de tendencias
  ventasTrend: VentasTrend[]
  productosPopulares: ProductoPopularidad[]
  clientesAnalytics: ClienteAnalytics[]
  inventarioAnalytics: InventarioAnalytics[]
  kpiEvolution: KPIEvolution[]
  predicciones: PredictionData | null

  // Estados de carga
  loading: {
    trends: boolean
    productos: boolean
    clientes: boolean
    inventario: boolean
    kpis: boolean
    predicciones: boolean
  }

  // Errores
  error: string | null

  // Configuración de periodo
  periodo: {
    inicio: Date
    fin: Date
    tipo: 'dia' | 'semana' | 'mes' | 'trimestre' | 'año'
  }

  // Última actualización
  lastUpdate: Date | null
}

const initialState: AnalyticsState = {
  ventasTrend: [],
  productosPopulares: [],
  clientesAnalytics: [],
  inventarioAnalytics: [],
  kpiEvolution: [],
  predicciones: null,
  
  loading: {
    trends: false,
    productos: false,
    clientes: false,
    inventario: false,
    kpis: false,
    predicciones: false
  },
  
  error: null,
  
  periodo: {
    inicio: subDays(new Date(), 30),
    fin: new Date(),
    tipo: 'mes'
  },
  
  lastUpdate: null
}

// ================================
// SLICE DE ANALYTICS
// ================================

export const analyticsSlice: StateCreator<
  AppStore,
  [],
  [],
  Pick<AppStore, 
    | 'analytics'
    | 'fetchVentasTrend'
    | 'fetchProductosPopulares' 
    | 'fetchClientesAnalytics'
    | 'fetchInventarioAnalytics'
    | 'fetchKPIEvolution'
    | 'generatePredicciones'
    | 'setAnalyticsPeriodo'
    | 'refreshAllAnalytics'
  >
> = (set, get) => ({
  analytics: initialState,

  // ================================
  // TREND DE VENTAS
  // ================================
  fetchVentasTrend: async (dias: number = 30) => {
    set((state) => ({
      analytics: {
        ...state.analytics,
        loading: { ...state.analytics.loading, trends: true },
        error: null
      }
    }))

    try {
      const fechaInicio = subDays(new Date(), dias)
      
      // Query optimizada para obtener datos de tendencia
      const { data, error } = await supabase
        .rpc('get_ventas_trend', {
          fecha_inicio: fechaInicio.toISOString(),
          fecha_fin: new Date().toISOString()
        })

      if (error) throw error

      // Procesar datos para el gráfico
      const ventasTrend: VentasTrend[] = data.map((item: any) => ({
        fecha: format(parseISO(item.fecha), 'dd/MM', { locale: es }),
        ventas: item.total_ventas || 0,
        total: item.total_ingresos || 0,
        clientes_nuevos: item.clientes_nuevos || 0,
        ticket_promedio: item.total_ventas > 0 
          ? (item.total_ingresos / item.total_ventas) 
          : 0
      }))

      set((state) => ({
        analytics: {
          ...state.analytics,
          ventasTrend,
          loading: { ...state.analytics.loading, trends: false },
          lastUpdate: new Date()
        }
      }))

    } catch (error: any) {
      console.error('❌ [AnalyticsSlice] Error en fetchVentasTrend:', error)
      set((state) => ({
        analytics: {
          ...state.analytics,
          loading: { ...state.analytics.loading, trends: false },
          error: error.message || 'Error al cargar tendencias de ventas'
        }
      }))
    }
  },

  // ================================
  // PRODUCTOS POPULARES
  // ================================
  fetchProductosPopulares: async (limite: number = 20) => {
    set((state) => ({
      analytics: {
        ...state.analytics,
        loading: { ...state.analytics.loading, productos: true },
        error: null
      }
    }))

    try {
      const { periodo } = get().analytics

      const { data, error } = await supabase
        .rpc('get_productos_populares', {
          fecha_inicio: periodo.inicio.toISOString(),
          fecha_fin: periodo.fin.toISOString(),
          limite
        })

      if (error) throw error

      const productosPopulares: ProductoPopularidad[] = data.map((item: any) => ({
        producto_id: item.producto_id,
        nombre: item.nombre,
        categoria: item.categoria,
        cantidad_vendida: item.cantidad_total,
        total_ingresos: item.ingresos_total,
        veces_vendido: item.veces_vendido,
        rotacion: item.rotacion_promedio || 0
      }))

      set((state) => ({
        analytics: {
          ...state.analytics,
          productosPopulares,
          loading: { ...state.analytics.loading, productos: false }
        }
      }))

    } catch (error: any) {
      console.error('❌ [AnalyticsSlice] Error en fetchProductosPopulares:', error)
      set((state) => ({
        analytics: {
          ...state.analytics,
          loading: { ...state.analytics.loading, productos: false },
          error: error.message || 'Error al cargar productos populares'
        }
      }))
    }
  },

  // ================================
  // ANALYTICS DE CLIENTES
  // ================================
  fetchClientesAnalytics: async () => {
    set((state) => ({
      analytics: {
        ...state.analytics,
        loading: { ...state.analytics.loading, clientes: true },
        error: null
      }
    }))

    try {
      const { data, error } = await supabase
        .rpc('get_clientes_analytics')

      if (error) throw error

      const clientesAnalytics: ClienteAnalytics[] = data.map((item: any) => {
        // Calcular estado del cliente
        const diasUltimaCompra = item.dias_ultima_compra || 0
        let estado: ClienteAnalytics['estado'] = 'nuevo'
        
        if (diasUltimaCompra <= 7) estado = 'activo'
        else if (diasUltimaCompra <= 30) estado = 'frecuente'
        else if (diasUltimaCompra > 90) estado = 'perdido'

        return {
          cliente_id: item.cliente_id,
          nombre: item.nombre,
          total_compras: item.total_compras || 0,
          frecuencia_compra: item.frecuencia_promedio || 0,
          valor_promedio: item.ticket_promedio || 0,
          ultima_compra: item.ultima_compra,
          categoria_preferida: item.categoria_preferida || 'Sin preferencia',
          estado
        }
      })

      set((state) => ({
        analytics: {
          ...state.analytics,
          clientesAnalytics,
          loading: { ...state.analytics.loading, clientes: false }
        }
      }))

    } catch (error: any) {
      console.error('❌ [AnalyticsSlice] Error en fetchClientesAnalytics:', error)
      set((state) => ({
        analytics: {
          ...state.analytics,
          loading: { ...state.analytics.loading, clientes: false },
          error: error.message || 'Error al cargar analytics de clientes'
        }
      }))
    }
  },

  // ================================
  // ANALYTICS DE INVENTARIO
  // ================================
  fetchInventarioAnalytics: async () => {
    set((state) => ({
      analytics: {
        ...state.analytics,
        loading: { ...state.analytics.loading, inventario: true },
        error: null
      }
    }))

    try {
      const { data, error } = await supabase
        .rpc('get_inventario_analytics')

      if (error) throw error

      const inventarioAnalytics: InventarioAnalytics[] = data.map((item: any) => {
        // Determinar estado del inventario
        let estado: InventarioAnalytics['estado'] = 'normal'
        const porcentajeStock = item.stock_actual / Math.max(item.stock_minimo, 1)
        
        if (item.stock_actual === 0) estado = 'critico'
        else if (porcentajeStock < 0.5) estado = 'critico'
        else if (porcentajeStock < 1) estado = 'bajo'
        else if (porcentajeStock > 5) estado = 'exceso'

        return {
          producto_id: item.producto_id,
          nombre: item.nombre,
          stock_actual: item.stock_actual,
          stock_minimo: item.stock_minimo,
          rotacion_mensual: item.rotacion_mensual || 0,
          dias_agotamiento: item.dias_agotamiento,
          valor_inventario: item.valor_inventario || 0,
          estado
        }
      })

      set((state) => ({
        analytics: {
          ...state.analytics,
          inventarioAnalytics,
          loading: { ...state.analytics.loading, inventario: false }
        }
      }))

    } catch (error: any) {
      console.error('❌ [AnalyticsSlice] Error en fetchInventarioAnalytics:', error)
      set((state) => ({
        analytics: {
          ...state.analytics,
          loading: { ...state.analytics.loading, inventario: false },
          error: error.message || 'Error al cargar analytics de inventario'
        }
      }))
    }
  },

  // ================================
  // EVOLUCIÓN DE KPIS
  // ================================
  fetchKPIEvolution: async (tipo: 'semanal' | 'mensual' = 'mensual') => {
    set((state) => ({
      analytics: {
        ...state.analytics,
        loading: { ...state.analytics.loading, kpis: true },
        error: null
      }
    }))

    try {
      const { data, error } = await supabase
        .rpc('get_kpi_evolution', {
          tipo_periodo: tipo,
          periodos: tipo === 'semanal' ? 12 : 6 // 12 semanas o 6 meses
        })

      if (error) throw error

      const kpiEvolution: KPIEvolution[] = data.map((item: any) => ({
        periodo: item.periodo,
        ventas_total: item.ventas_total || 0,
        tickets: item.tickets || 0,
        ticket_promedio: item.ticket_promedio || 0,
        clientes_unicos: item.clientes_unicos || 0,
        productos_vendidos: item.productos_vendidos || 0,
        margen_bruto: item.margen_bruto || 0
      }))

      set((state) => ({
        analytics: {
          ...state.analytics,
          kpiEvolution,
          loading: { ...state.analytics.loading, kpis: false }
        }
      }))

    } catch (error: any) {
      console.error('❌ [AnalyticsSlice] Error en fetchKPIEvolution:', error)
      set((state) => ({
        analytics: {
          ...state.analytics,
          loading: { ...state.analytics.loading, kpis: false },
          error: error.message || 'Error al cargar evolución de KPIs'
        }
      }))
    }
  },

  // ================================
  // GENERAR PREDICCIONES
  // ================================
  generatePredicciones: async () => {
    set((state) => ({
      analytics: {
        ...state.analytics,
        loading: { ...state.analytics.loading, predicciones: true },
        error: null
      }
    }))

    try {
      const { ventasTrend, productosPopulares, clientesAnalytics, inventarioAnalytics } = get().analytics

      // Algoritmos de predicción simple (se puede mejorar con ML)
      const predicciones: PredictionData = {
        // Predicción de ventas basada en tendencia
        ventas_proximos_7_dias: calcularPrediccionVentas(ventasTrend),
        
        // Productos que se van a agotar pronto
        productos_criticos: inventarioAnalytics
          .filter(p => p.dias_agotamiento !== null && p.dias_agotamiento <= 7)
          .map(p => p.nombre),
        
        // Clientes en riesgo de abandono
        clientes_en_riesgo: clientesAnalytics
          .filter(c => c.estado === 'perdido' || 
                      (c.estado === 'frecuente' && c.frecuencia_compra > 45))
          .map(c => c.nombre),
        
        // Análisis de días de la semana
        mejor_dia_semana: calcularMejorDiaSemana(ventasTrend),
        peor_dia_semana: calcularPeorDiaSemana(ventasTrend),
        
        // Crecimiento mensual
        crecimiento_mensual: calcularCrecimientoMensual(ventasTrend)
      }

      set((state) => ({
        analytics: {
          ...state.analytics,
          predicciones,
          loading: { ...state.analytics.loading, predicciones: false }
        }
      }))

    } catch (error: any) {
      console.error('❌ [AnalyticsSlice] Error en generatePredicciones:', error)
      set((state) => ({
        analytics: {
          ...state.analytics,
          loading: { ...state.analytics.loading, predicciones: false },
          error: error.message || 'Error al generar predicciones'
        }
      }))
    }
  },

  // ================================
  // CONFIGURAR PERIODO
  // ================================
  setAnalyticsPeriodo: (inicio: Date, fin: Date, tipo: AnalyticsState['periodo']['tipo']) => {
    set((state) => ({
      analytics: {
        ...state.analytics,
        periodo: { inicio, fin, tipo }
      }
    }))
  },

  // ================================
  // REFRESCAR TODOS LOS ANALYTICS
  // ================================
  refreshAllAnalytics: async () => {
    const { 
      fetchVentasTrend, 
      fetchProductosPopulares, 
      fetchClientesAnalytics, 
      fetchInventarioAnalytics, 
      fetchKPIEvolution, 
      generatePredicciones 
    } = get()

    // Ejecutar todas las cargas en paralelo
    await Promise.allSettled([
      fetchVentasTrend(),
      fetchProductosPopulares(),
      fetchClientesAnalytics(),
      fetchInventarioAnalytics(),
      fetchKPIEvolution(),
    ])

    // Generar predicciones al final
    await generatePredicciones()
  }
})

// ================================
// FUNCIONES AUXILIARES DE CÁLCULO
// ================================

function calcularPrediccionVentas(trend: VentasTrend[]): number {
  if (trend.length < 7) return 0
  
  // Promedio de los últimos 7 días
  const ultimosSieteDias = trend.slice(-7)
  const promedio = ultimosSieteDias.reduce((sum, day) => sum + day.total, 0) / 7
  
  // Aplicar factor de crecimiento si hay tendencia positiva
  const primeraMitad = trend.slice(0, Math.floor(trend.length / 2))
  const segundaMitad = trend.slice(Math.floor(trend.length / 2))
  
  const promedioInicial = primeraMitad.reduce((sum, day) => sum + day.total, 0) / primeraMitad.length
  const promedioReciente = segundaMitad.reduce((sum, day) => sum + day.total, 0) / segundaMitad.length
  
  const factorCrecimiento = promedioReciente / Math.max(promedioInicial, 1)
  
  return Math.round(promedio * factorCrecimiento * 7)
}

function calcularMejorDiaSemana(trend: VentasTrend[]): string {
  // Simplificado - en un caso real, se analizarían los días de la semana
  const maxVenta = Math.max(...trend.map(t => t.total))
  const mejorDia = trend.find(t => t.total === maxVenta)
  return mejorDia?.fecha || 'No disponible'
}

function calcularPeorDiaSemana(trend: VentasTrend[]): string {
  const minVenta = Math.min(...trend.map(t => t.total))
  const peorDia = trend.find(t => t.total === minVenta)
  return peorDia?.fecha || 'No disponible'
}

function calcularCrecimientoMensual(trend: VentasTrend[]): number {
  if (trend.length < 14) return 0
  
  const primeraMitad = trend.slice(0, Math.floor(trend.length / 2))
  const segundaMitad = trend.slice(Math.floor(trend.length / 2))
  
  const totalInicial = primeraMitad.reduce((sum, day) => sum + day.total, 0)
  const totalReciente = segundaMitad.reduce((sum, day) => sum + day.total, 0)
  
  return Math.round(((totalReciente - totalInicial) / Math.max(totalInicial, 1)) * 100)
}
