import type { StateCreator } from 'zustand'
import { supabase } from '../../lib/supabase'
import type { AppStore, CajaHistorialState } from '../types'

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
        id: caja.id,
        fecha: caja.fecha,
        apertura: caja.apertura || 0,
        cierre: caja.cierre || 0,
        total_ingresos: caja.total_ingresos || 0,
        total_egresos: caja.total_egresos || 0,
        saldo_final: caja.saldo_final || 0,
        ventas_count: caja.ventas_count || 0,
        ventas_total: caja.ventas_total || 0,
        movimientos_count: caja.movimientos_count || 0,
        empleado_id: caja.empleado_id,
        empleado_nombre: caja.empleado?.nombre || 'N/A',
        estado: caja.estado,
        created_at: caja.created_at,
        updated_at: caja.updated_at
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
