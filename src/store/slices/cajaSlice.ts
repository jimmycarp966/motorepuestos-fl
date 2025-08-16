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

      // Cargar también las cajas diarias para verificar si hay una abierta
      await get().fetchCajasDiarias()
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

      // Refrescar datos para sincronización
      await get().fetchMovimientos()

      get().addNotification({
        id: Date.now().toString(),
        type: 'success',
        title: 'Ingreso registrado',
        message: `Ingreso de $${monto.toFixed(2)} registrado exitosamente`,
      })

    } catch (error: any) {
      get().addNotification({
        id: Date.now().toString(),
        type: 'error',
        title: 'Error al registrar ingreso',
        message: error.message,
      })
    }
  },

  registrarEgreso: async (monto: number, concepto: string, metodo_pago: 'efectivo' | 'transferencia' | 'debito' | 'credito' | 'cuenta_corriente' = 'efectivo') => {
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
          metodo_pago,
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

      // Refrescar datos para sincronización
      await get().fetchMovimientos()

      get().addNotification({
        id: Date.now().toString(),
        type: 'success',
        title: 'Egreso registrado',
        message: `Egreso de $${monto.toFixed(2)} (${metodo_pago}) registrado exitosamente`,
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

  // Nuevas funciones para caja diaria y arqueo
  abrirCaja: async (saldoInicial: number) => {
    try {
      const currentUser = get().auth.user
      if (!currentUser) throw new Error('Usuario no autenticado')

      const fechaHoy = new Date().toISOString().split('T')[0]

      // Verificar si ya existe una caja abierta para hoy
      const { data: cajaExistente } = await supabase
        .from('cajas_diarias')
        .select('*')
        .eq('fecha', fechaHoy)
        .eq('estado', 'abierta')
        .single()

      if (cajaExistente) {
        throw new Error('Ya existe una caja abierta para hoy')
      }

      const { data, error } = await supabase
        .from('cajas_diarias')
        .insert([{
          fecha: fechaHoy,
          empleado_id: currentUser.id,
          estado: 'abierta',
          saldo_inicial: saldoInicial,
          created_at: new Date().toISOString(),
        }])
        .select(`
          *,
          empleado:empleados(*)
        `)
        .single()

      if (error) throw error

      // Actualizar estado local
      set((state) => ({ 
        caja: { 
          ...state.caja, 
          cajaActual: data,
          cajasDiarias: [data, ...state.caja.cajasDiarias],
          cajaAbierta: true,
          saldo: saldoInicial,
        } 
      }))

      get().addNotification({
        id: Date.now().toString(),
        type: 'success',
        title: 'Caja abierta',
        message: `Caja abierta con saldo inicial de $${saldoInicial}`,
      })

    } catch (error: any) {
      get().addNotification({
        id: Date.now().toString(),
        type: 'error',
        title: 'Error al abrir caja',
        message: error.message,
      })
    }
  },

  cerrarCaja: async (saldoFinal: number) => {
    try {
      const currentUser = get().auth.user
      if (!currentUser) throw new Error('Usuario no autenticado')

      const cajaActual = get().caja.cajaActual
      if (!cajaActual) {
        throw new Error('No hay caja abierta para cerrar')
      }

      const { data, error } = await supabase
        .from('cajas_diarias')
        .update({
          estado: 'cerrada',
          saldo_final: saldoFinal,
          updated_at: new Date().toISOString(),
        })
        .eq('id', cajaActual.id)
        .select(`
          *,
          empleado:empleados(*)
        `)
        .single()

      if (error) throw error

      // Actualizar estado local
      set((state) => ({ 
        caja: { 
          ...state.caja, 
          cajaActual: null,
          cajaAbierta: false,
          cajasDiarias: state.caja.cajasDiarias.map(c => c.id === cajaActual.id ? data : c),
        } 
      }))

      get().addNotification({
        id: Date.now().toString(),
        type: 'success',
        title: 'Caja cerrada',
        message: `Caja cerrada con saldo final de $${saldoFinal}`,
      })

    } catch (error: any) {
      get().addNotification({
        id: Date.now().toString(),
        type: 'error',
        title: 'Error al cerrar caja',
        message: error.message,
      })
    }
  },

  realizarArqueo: async (arqueoData: {
    efectivo_real: number
    transferencia_real: number
    debito_real: number
    credito_real: number
    cuenta_corriente_real: number
    observaciones?: string
  }) => {
    try {
      const currentUser = get().auth.user
      if (!currentUser) throw new Error('Usuario no autenticado')

      const cajaActual = get().caja.cajaActual
      if (!cajaActual) {
        throw new Error('No hay caja abierta para realizar arqueo')
      }

      // Calcular totales del sistema
      const movimientos = get().caja.movimientos
      const efectivo_sistema = movimientos
        .filter(m => m.metodo_pago === 'efectivo')
        .reduce((sum, m) => sum + (m.tipo === 'ingreso' ? m.monto : -m.monto), 0)
      
      const transferencia_sistema = movimientos
        .filter(m => m.metodo_pago === 'transferencia')
        .reduce((sum, m) => sum + (m.tipo === 'ingreso' ? m.monto : -m.monto), 0)
      
      const debito_sistema = movimientos
        .filter(m => m.metodo_pago === 'debito')
        .reduce((sum, m) => sum + (m.tipo === 'ingreso' ? m.monto : -m.monto), 0)
      
      const credito_sistema = movimientos
        .filter(m => m.metodo_pago === 'credito')
        .reduce((sum, m) => sum + (m.tipo === 'ingreso' ? m.monto : -m.monto), 0)
      
      const cuenta_corriente_sistema = movimientos
        .filter(m => m.metodo_pago === 'cuenta_corriente')
        .reduce((sum, m) => sum + (m.tipo === 'ingreso' ? m.monto : -m.monto), 0)

      // Calcular diferencias
      const diferencia_efectivo = arqueoData.efectivo_real - efectivo_sistema
      const diferencia_transferencia = arqueoData.transferencia_real - transferencia_sistema
      const diferencia_debito = arqueoData.debito_real - debito_sistema
      const diferencia_credito = arqueoData.credito_real - credito_sistema
      const diferencia_cuenta_corriente = arqueoData.cuenta_corriente_real - cuenta_corriente_sistema
      
      const diferencia_total = diferencia_efectivo + diferencia_transferencia + diferencia_debito + diferencia_credito + diferencia_cuenta_corriente

      const { data, error } = await supabase
        .from('arqueos_caja')
        .insert([{
          fecha: new Date().toISOString(),
          empleado_id: currentUser.id,
          efectivo_real: arqueoData.efectivo_real,
          efectivo_sistema,
          transferencia_real: arqueoData.transferencia_real,
          transferencia_sistema,
          debito_real: arqueoData.debito_real,
          debito_sistema,
          credito_real: arqueoData.credito_real,
          credito_sistema,
          cuenta_corriente_real: arqueoData.cuenta_corriente_real,
          cuenta_corriente_sistema,
          diferencia_total,
          observaciones: arqueoData.observaciones,
          estado: 'cerrado',
          created_at: new Date().toISOString(),
        }])
        .select(`
          *,
          empleado:empleados(*)
        `)
        .single()

      if (error) throw error

      // Actualizar estado local
      set((state) => ({ 
        caja: { 
          ...state.caja, 
          arqueos: [data, ...state.caja.arqueos],
        } 
      }))

      get().addNotification({
        id: Date.now().toString(),
        type: 'success',
        title: 'Arqueo realizado',
        message: `Arqueo completado. Diferencia total: $${diferencia_total}`,
      })

    } catch (error: any) {
      get().addNotification({
        id: Date.now().toString(),
        type: 'error',
        title: 'Error al realizar arqueo',
        message: error.message,
      })
    }
  },

  fetchCajasDiarias: async () => {
    try {
      const { data, error } = await supabase
        .from('cajas_diarias')
        .select(`
          *,
          empleado:empleados(*)
        `)
        .order('fecha', { ascending: false })
      
      if (error) throw error
      
      set((state) => ({ 
        caja: { 
          ...state.caja, 
          cajasDiarias: data || [], 
        } 
      }))

      // Buscar caja actual (abierta para hoy)
      const fechaHoy = new Date().toISOString().split('T')[0]
      const cajaActual = data?.find(c => c.fecha === fechaHoy && c.estado === 'abierta')
      
      if (cajaActual) {
        set((state) => ({ 
          caja: { 
            ...state.caja, 
            cajaActual,
            cajaAbierta: true
          } 
        }))
      } else {
        set((state) => ({ 
          caja: { 
            ...state.caja, 
            cajaActual: null,
            cajaAbierta: false
          } 
        }))
      }

    } catch (error: any) {
      console.error('Error al cargar cajas diarias:', error)
    }
  },

  fetchArqueos: async () => {
    try {
      const { data, error } = await supabase
        .from('arqueos_caja')
        .select(`
          *,
          empleado:empleados(*)
        `)
        .order('fecha', { ascending: false })
      
      if (error) throw error
      
      set((state) => ({ 
        caja: { 
          ...state.caja, 
          arqueos: data || [], 
        } 
      }))

    } catch (error: any) {
      console.error('Error al cargar arqueos:', error)
    }
  },
})
