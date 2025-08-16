import type { StateCreator } from 'zustand'
import { supabase } from '../../lib/supabase'
import type { AppStore } from '../index'

export interface DashboardKPI {
  total_ventas: number
  total_ingresos: number
  total_egresos: number
  productos_bajo_stock: number
  clientes_activos: number
  saldo_caja: number
}

export interface DashboardState {
  kpis: DashboardKPI | null
  ventasPorPeriodo: any[]
  productosMasVendidos: any[]
  loading: boolean
  error: string | null
}

const initialState: DashboardState = {
  kpis: null,
  ventasPorPeriodo: [],
  productosMasVendidos: [],
  loading: false,
  error: null,
}

export const dashboardSlice: StateCreator<AppStore, [], [], Pick<AppStore, 'dashboard' | 'fetchDashboardKPIs' | 'fetchVentasPorPeriodo' | 'fetchProductosMasVendidos'>> = (set, get) => ({
  dashboard: initialState,

  // Obtener KPIs en tiempo real usando función RPC
  fetchDashboardKPIs: async () => {
    set((state) => ({ dashboard: { ...state.dashboard, loading: true, error: null } }))
    
    try {
      // Usar función RPC para obtener estadísticas
      const { data: kpisData, error: kpisError } = await supabase.rpc('obtener_estadisticas_dashboard')
      
      if (kpisError) throw kpisError

      // Calcular saldo de caja
      const { data: movimientos } = await supabase
        .from('caja_movimientos')
        .select('tipo, monto')
        .order('fecha', { ascending: false })

      const saldoCaja = movimientos?.reduce((saldo, mov) => {
        return mov.tipo === 'ingreso' ? saldo + mov.monto : saldo - mov.monto
      }, 0) || 0

      const kpis: DashboardKPI = {
        total_ventas: kpisData?.[0]?.total_ventas || 0,
        total_ingresos: kpisData?.[0]?.total_ingresos || 0,
        total_egresos: kpisData?.[0]?.total_egresos || 0,
        productos_bajo_stock: kpisData?.[0]?.productos_bajo_stock || 0,
        clientes_activos: kpisData?.[0]?.clientes_activos || 0,
        saldo_caja: saldoCaja,
      }

      set((state) => ({ 
        dashboard: { 
          ...state.dashboard, 
          kpis, 
          loading: false 
        } 
      }))
    } catch (error: any) {
      set((state) => ({ 
        dashboard: { 
          ...state.dashboard, 
          loading: false, 
          error: error.message 
        } 
      }))
    }
  },

  // Obtener ventas por período
  fetchVentasPorPeriodo: async (fechaInicio: string, fechaFin: string) => {
    set((state) => ({ dashboard: { ...state.dashboard, loading: true, error: null } }))
    
    try {
      const { data, error } = await supabase.rpc('obtener_ventas_por_periodo', {
        fecha_inicio: fechaInicio,
        fecha_fin: fechaFin
      })
      
      if (error) throw error

      set((state) => ({ 
        dashboard: { 
          ...state.dashboard, 
          ventasPorPeriodo: data || [], 
          loading: false 
        } 
      }))
    } catch (error: any) {
      set((state) => ({ 
        dashboard: { 
          ...state.dashboard, 
          loading: false, 
          error: error.message 
        } 
      }))
    }
  },

  // Obtener productos más vendidos
  fetchProductosMasVendidos: async (limite: number = 10) => {
    set((state) => ({ dashboard: { ...state.dashboard, loading: true, error: null } }))
    
    try {
      const { data, error } = await supabase.rpc('obtener_productos_mas_vendidos', {
        limite: limite
      })
      
      if (error) throw error

      set((state) => ({ 
        dashboard: { 
          ...state.dashboard, 
          productosMasVendidos: data || [], 
          loading: false 
        } 
      }))
    } catch (error: any) {
      set((state) => ({ 
        dashboard: { 
          ...state.dashboard, 
          loading: false, 
          error: error.message 
        } 
      }))
    }
  },
})
