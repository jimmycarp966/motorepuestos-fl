import type { StateCreator } from 'zustand'
import { supabase } from '../../lib/supabase'
import type { AppStore } from '../index'

export interface CajaDiaria {
  id: string
  fecha: string
  apertura: number
  cierre: number
  total_ingresos: number
  total_egresos: number
  saldo_final: number
  ventas_count: number
  ventas_total: number
  movimientos_count: number
  empleado_id: string
  empleado_nombre: string
  estado: 'abierta' | 'cerrada'
  created_at: string
  updated_at: string
}

export interface CajaHistorialState {
  cajasDiarias: CajaDiaria[]
  loading: boolean
  error: string | null
}

const initialState: CajaHistorialState = {
  cajasDiarias: [],
  loading: false,
  error: null,
}

export const cajaHistorialSlice: StateCreator<AppStore, [], [], Pick<AppStore, 'cajaHistorial' | 'fetchHistorialCajas' | 'obtenerResumenCaja'>> = (set, get) => ({
  cajaHistorial: initialState,

  fetchHistorialCajas: async (fechaInicio?: string, fechaFin?: string) => {
    set((state) => ({ 
      cajaHistorial: { ...state.cajaHistorial, loading: true, error: null } 
    }))

    try {
      let query = supabase
        .from('cajas_diarias')
        .select(`
          *,
          empleado:empleados(nombre)
        `)
        .order('fecha', { ascending: false })

      if (fechaInicio) {
        query = query.gte('fecha', fechaInicio)
      }
      if (fechaFin) {
        query = query.lte('fecha', fechaFin)
      }

      const { data, error } = await query

      if (error) throw error

      const cajasProcesadas = data?.map(caja => ({
        ...caja,
        empleado_nombre: caja.empleado?.nombre || 'N/A'
      })) || []

      set((state) => ({
        cajaHistorial: {
          ...state.cajaHistorial,
          cajasDiarias: cajasProcesadas,
          loading: false
        }
      }))

    } catch (error: any) {
      set((state) => ({
        cajaHistorial: {
          ...state.cajaHistorial,
          loading: false,
          error: error.message
        }
      }))
    }
  },

  obtenerResumenCaja: async (fecha: string) => {
    try {
      // Obtener caja diaria
      const { data: cajaDiaria } = await supabase
        .from('cajas_diarias')
        .select('*')
        .eq('fecha', fecha)
        .single()

      // Obtener movimientos del día
      const { data: movimientos } = await supabase
        .from('movimientos_caja')
        .select('*')
        .gte('fecha', `${fecha}T00:00:00`)
        .lt('fecha', `${fecha}T23:59:59`)
        .order('fecha', { ascending: true })

      // Obtener ventas del día
      const { data: ventas } = await supabase
        .from('ventas')
        .select('*')
        .gte('fecha', `${fecha}T00:00:00`)
        .lt('fecha', `${fecha}T23:59:59`)
        .order('fecha', { ascending: true })

      // Calcular resumen
      const totalIngresos = movimientos?.filter(m => m.tipo === 'ingreso').reduce((sum, m) => sum + m.monto, 0) || 0
      const totalEgresos = movimientos?.filter(m => m.tipo === 'egreso').reduce((sum, m) => sum + m.monto, 0) || 0
      const totalVentas = ventas?.reduce((sum, v) => sum + v.total, 0) || 0
      const ventasCount = ventas?.length || 0

      return {
        cajaDiaria,
        movimientos: movimientos || [],
        ventas: ventas || [],
        resumen: {
          totalIngresos,
          totalEgresos,
          totalVentas,
          ventasCount,
          saldoCalculado: (cajaDiaria?.apertura || 0) + totalIngresos - totalEgresos
        }
      }

    } catch (error: any) {
      throw new Error(`Error obteniendo resumen de caja: ${error.message}`)
    }
  }
})
