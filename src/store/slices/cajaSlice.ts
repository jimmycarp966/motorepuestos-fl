import type { StateCreator } from 'zustand'
import { supabase } from '../../lib/supabase'
import type { AppStore, CajaState, MovimientoCaja } from '../index'

const initialState: CajaState = {
  movimientos: [],
  saldo: 0,
  loading: false,
  error: null,
}

export const cajaSlice: StateCreator<AppStore, [], [], Pick<AppStore, 'caja' | 'fetchMovimientos' | 'registrarIngreso' | 'registrarEgreso' | 'arqueoCaja' | 'fetchMovimientosPorPeriodo'>> = (set, get) => ({
  caja: initialState,

  fetchMovimientos: async () => {
    set((state) => ({ caja: { ...state.caja, loading: true, error: null } }))
    try {
      const { data, error } = await supabase
        .from('caja_movimientos')
        .select(`
          *,
          empleado:empleados(*)
        `)
        .order('fecha', { ascending: false })
      
      if (error) throw error

      // Calcular saldo actual
      const saldo = data?.reduce((total, mov) => {
        return mov.tipo === 'ingreso' ? total + mov.monto : total - mov.monto
      }, 0) || 0

      set((state) => ({ 
        caja: { 
          ...state.caja, 
          movimientos: data || [], 
          saldo,
          loading: false 
        } 
      }))
    } catch (error: any) {
      set((state) => ({ 
        caja: { 
          ...state.caja, 
          loading: false, 
          error: error.message 
        } 
      }))
    }
  },

  registrarIngreso: async (monto: number, concepto: string) => {
    set((state) => ({ caja: { ...state.caja, loading: true, error: null } }))
    
    try {
      const currentUser = get().auth.user
      if (!currentUser) throw new Error('Usuario no autenticado')

      const { data, error } = await supabase
        .from('caja_movimientos')
        .insert([{
          tipo: 'ingreso',
          monto,
          concepto,
          empleado_id: currentUser.id,
          fecha: new Date().toISOString(),
        }])
        .select()
        .single()

      if (error) throw error

      // Actualizar estado local
      const newMovimiento = {
        ...data,
        empleado: currentUser
      }

      set((state) => ({
        caja: {
          ...state.caja,
          movimientos: [newMovimiento, ...state.caja.movimientos],
          saldo: state.caja.saldo + monto,
          loading: false
        }
      }))

      // Actualizar dashboard
      await get().fetchDashboardKPIs()

    } catch (error: any) {
      set((state) => ({ 
        caja: { 
          ...state.caja, 
          loading: false, 
          error: error.message 
        } 
      }))
      throw error
    }
  },

  registrarEgreso: async (monto: number, concepto: string) => {
    set((state) => ({ caja: { ...state.caja, loading: true, error: null } }))
    
    try {
      const currentUser = get().auth.user
      if (!currentUser) throw new Error('Usuario no autenticado')

      // Validar saldo suficiente
      const saldoActual = get().caja.saldo
      if (saldoActual < monto) {
        throw new Error(`Saldo insuficiente. Disponible: $${saldoActual.toFixed(2)}`)
      }

      const { data, error } = await supabase
        .from('caja_movimientos')
        .insert([{
          tipo: 'egreso',
          monto,
          concepto,
          empleado_id: currentUser.id,
          fecha: new Date().toISOString(),
        }])
        .select()
        .single()

      if (error) throw error

      // Actualizar estado local
      const newMovimiento = {
        ...data,
        empleado: currentUser
      }

      set((state) => ({
        caja: {
          ...state.caja,
          movimientos: [newMovimiento, ...state.caja.movimientos],
          saldo: state.caja.saldo - monto,
          loading: false
        }
      }))

      // Actualizar dashboard
      await get().fetchDashboardKPIs()

    } catch (error: any) {
      set((state) => ({ 
        caja: { 
          ...state.caja, 
          loading: false, 
          error: error.message 
        } 
      }))
      throw error
    }
  },

  // Arqueo de caja - acción compuesta
  arqueoCaja: async (saldoEsperado: number, observaciones?: string) => {
    set((state) => ({ caja: { ...state.caja, loading: true, error: null } }))
    
    try {
      const currentUser = get().auth.user
      if (!currentUser) throw new Error('Usuario no autenticado')

      const saldoActual = get().caja.saldo
      const diferencia = saldoActual - saldoEsperado

      // Registrar arqueo como movimiento especial
      const concepto = `Arqueo de caja - Saldo esperado: $${saldoEsperado.toFixed(2)} - Diferencia: $${diferencia.toFixed(2)}${observaciones ? ` - ${observaciones}` : ''}`

      const { data, error } = await supabase
        .from('caja_movimientos')
        .insert([{
          tipo: diferencia >= 0 ? 'ingreso' : 'egreso',
          monto: Math.abs(diferencia),
          concepto,
          empleado_id: currentUser.id,
          fecha: new Date().toISOString(),
        }])
        .select()
        .single()

      if (error) throw error

      // Actualizar estado local
      const newMovimiento = {
        ...data,
        empleado: currentUser
      }

      set((state) => ({
        caja: {
          ...state.caja,
          movimientos: [newMovimiento, ...state.caja.movimientos],
          saldo: saldoEsperado, // El saldo después del arqueo es el esperado
          loading: false
        }
      }))

      // Actualizar dashboard
      await get().fetchDashboardKPIs()

      return {
        saldoAnterior: saldoActual,
        saldoEsperado,
        saldoActual: saldoEsperado,
        diferencia,
        movimiento: newMovimiento
      }

    } catch (error: any) {
      set((state) => ({ 
        caja: { 
          ...state.caja, 
          loading: false, 
          error: error.message 
        } 
      }))
      throw error
    }
  },

  // Obtener movimientos por período
  fetchMovimientosPorPeriodo: async (fechaInicio: string, fechaFin: string) => {
    set((state) => ({ caja: { ...state.caja, loading: true, error: null } }))
    
    try {
      const { data, error } = await supabase.rpc('obtener_movimientos_caja_por_periodo', {
        fecha_inicio: fechaInicio,
        fecha_fin: fechaFin
      })
      
      if (error) throw error

      set((state) => ({ 
        caja: { 
          ...state.caja, 
          loading: false 
        } 
      }))

      return data

    } catch (error: any) {
      set((state) => ({ 
        caja: { 
          ...state.caja, 
          loading: false, 
          error: error.message 
        } 
      }))
      throw error
    }
  },
})
