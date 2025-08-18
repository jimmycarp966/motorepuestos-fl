import type { StateCreator } from 'zustand'
import { supabase } from '../../lib/supabase'
import type { AppStore } from '../index'
import type { CajaState, MovimientoCaja, CajaDiaria, ArqueoCaja } from '../types'

const initialState: CajaState = {
  movimientos: [],
  arqueos: [],
  cajasDiarias: [],
  cajaActual: null,
  cajaAbierta: false,
  saldo: 0,
  loading: false,
  error: null,
}

export const cajaSlice: StateCreator<AppStore, [], [], Pick<AppStore, 'caja' | 'fetchMovimientos' | 'registrarIngreso' | 'registrarEgreso' | 'abrirCaja' | 'cerrarCaja' | 'realizarArqueo' | 'fetchCajasDiarias' | 'fetchArqueos'>> = (set, get) => ({
  caja: initialState,

  fetchMovimientos: async () => {
    set((state) => ({ caja: { ...state.caja, loading: true, error: null } }))
    try {
      const { data, error } = await supabase
        .from('movimientos_caja')
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

      // Determinar si la caja está abierta (si hay movimientos hoy)
      const fechaHoy = new Date().toISOString().split('T')[0]
      const movimientosHoy = data?.filter(m => {
        const movimientoFecha = typeof m.fecha === 'string' ? m.fecha.split('T')[0] : m.fecha
        return movimientoFecha === fechaHoy
      }) || []

      const cajaAbierta = movimientosHoy.length > 0

      set((state) => ({ 
        caja: { 
          ...state.caja, 
          movimientos: data || [], 
          saldo,
          cajaAbierta,
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
    const currentUser = get().auth.user
    if (!currentUser) throw new Error('Usuario no autenticado')

    try {
      const { data, error } = await supabase
        .from('movimientos_caja')
        .insert([{
          tipo: 'ingreso',
          monto,
          concepto,
          empleado_id: currentUser.id,
          fecha: new Date().toISOString()
        }])
        .select()
        .single()

      if (error) throw error

      // Actualizar estado local
      const nuevoMovimiento = {
        ...data,
        empleado: currentUser
      }

      set((state) => ({
        caja: {
          ...state.caja,
          movimientos: [nuevoMovimiento, ...state.caja.movimientos],
          saldo: state.caja.saldo + monto,
          cajaAbierta: true // Al registrar un ingreso, la caja se considera abierta
        }
      }))

      return data
    } catch (error: any) {
      throw new Error(`Error al registrar ingreso: ${error.message}`)
    }
  },

  registrarEgreso: async (monto: number, concepto: string) => {
    const currentUser = get().auth.user
    if (!currentUser) throw new Error('Usuario no autenticado')

    try {
      const { data, error } = await supabase
        .from('movimientos_caja')
        .insert([{
          tipo: 'egreso',
          monto,
          concepto,
          empleado_id: currentUser.id,
          fecha: new Date().toISOString()
        }])
        .select()
        .single()

      if (error) throw error

      // Actualizar estado local
      const nuevoMovimiento = {
        ...data,
        empleado: currentUser
      }

      set((state) => ({
        caja: {
          ...state.caja,
          movimientos: [nuevoMovimiento, ...state.caja.movimientos],
          saldo: state.caja.saldo - monto,
          cajaAbierta: true // Al registrar un egreso, la caja se considera abierta
        }
      }))

      return data
    } catch (error: any) {
      throw new Error(`Error al registrar egreso: ${error.message}`)
    }
  },

  abrirCaja: async (montoInicial: number) => {
    const currentUser = get().auth.user
    if (!currentUser) throw new Error('Usuario no autenticado')

    try {
      // Registrar apertura como ingreso
      await get().registrarIngreso(montoInicial, 'Apertura de caja')

      set((state) => ({
        caja: {
          ...state.caja,
          cajaAbierta: true,
          cajaActual: {
            id: Date.now().toString(),
            montoInicial,
            empleado_id: currentUser.id,
            fechaApertura: new Date().toISOString(),
            estado: 'abierta'
          }
        }
      }))
    } catch (error: any) {
      throw new Error(`Error al abrir caja: ${error.message}`)
    }
  },

  cerrarCaja: async () => {
    try {
      set((state) => ({
        caja: {
          ...state.caja,
          cajaAbierta: false,
          cajaActual: null
        }
      }))
    } catch (error: any) {
      throw new Error(`Error al cerrar caja: ${error.message}`)
    }
  },

  realizarArqueo: async (montoEsperado: number, observaciones?: string) => {
    const currentUser = get().auth.user
    if (!currentUser) throw new Error('Usuario no autenticado')

    try {
      const saldoActual = get().caja.saldo
      const diferencia = saldoActual - montoEsperado

      const arqueo: ArqueoCaja = {
        id: Date.now().toString(),
        fecha: new Date().toISOString(),
        montoEsperado,
        montoReal: saldoActual,
        diferencia,
        empleado_id: currentUser.id,
        observaciones: observaciones || '',
        estado: diferencia === 0 ? 'correcto' : 'incorrecto'
      }

      set((state) => ({
        caja: {
          ...state.caja,
          arqueos: [arqueo, ...state.caja.arqueos]
        }
      }))

      return arqueo
    } catch (error: any) {
      throw new Error(`Error al realizar arqueo: ${error.message}`)
    }
  },

  fetchCajasDiarias: async () => {
    set((state) => ({ caja: { ...state.caja, loading: true, error: null } }))
    try {
      // Implementar lógica para obtener cajas diarias
      set((state) => ({ 
        caja: { 
          ...state.caja, 
          cajasDiarias: [],
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

  fetchArqueos: async () => {
    set((state) => ({ caja: { ...state.caja, loading: true, error: null } }))
    try {
      // Implementar lógica para obtener arqueos
      set((state) => ({ 
        caja: { 
          ...state.caja, 
          arqueos: [],
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
  }
})
