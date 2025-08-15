import type { StateCreator } from 'zustand'
import { supabase } from '../../lib/supabase'
import type { AppStore, CajaState } from '../index'

const initialState: CajaState = {
  movimientos: [],
  saldo: 0,
  loading: false,
  error: null,
}

export const cajaSlice: StateCreator<AppStore, [], [], Pick<AppStore, 'caja' | 'fetchMovimientos' | 'registrarIngreso' | 'registrarEgreso'>> = (set, get) => ({
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
        .order('created_at', { ascending: false })
      if (error) throw error

      // Calcular saldo
      const saldo = data?.reduce((acc, mov) => {
        return mov.tipo === 'ingreso' ? acc + mov.monto : acc - mov.monto
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
      set((state) => ({ caja: { ...state.caja, loading: false, error: error.message } }))
    }
  },

  registrarIngreso: async (monto: number, concepto: string) => {
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
      set((state) => ({
        caja: {
          ...state.caja,
          movimientos: [data, ...state.caja.movimientos],
          saldo: state.caja.saldo + monto,
        }
      }))

    } catch (error: any) {
      get().addNotification({
        id: Date.now().toString(),
        type: 'error',
        title: 'Error al registrar ingreso',
        message: error.message,
      })
    }
  },

  registrarEgreso: async (monto: number, concepto: string) => {
    try {
      const currentUser = get().auth.user
      if (!currentUser) throw new Error('Usuario no autenticado')

      // Verificar saldo suficiente
      if (get().caja.saldo < monto) {
        throw new Error('Saldo insuficiente para realizar el egreso')
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
      set((state) => ({
        caja: {
          ...state.caja,
          movimientos: [data, ...state.caja.movimientos],
          saldo: state.caja.saldo - monto,
        }
      }))

      get().addNotification({
        id: Date.now().toString(),
        type: 'success',
        title: 'Egreso registrado',
        message: `Egreso de $${monto.toFixed(2)} registrado exitosamente`,
      })

    } catch (error: any) {
      get().addNotification({
        id: Date.now().toString(),
        type: 'error',
        title: 'Error al registrar egreso',
        message: error.message,
      })
    }
  },
})
