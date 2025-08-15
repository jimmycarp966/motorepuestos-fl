import { supabase } from '../../lib/supabase'

export const createCajaSlice = (set, get) => ({
  caja: {
    movimientos: [],
    saldo: 0,
    loading: false,
    error: null
  },

  // Acciones de caja
  fetchMovimientos: async () => {
    set((state) => ({ 
      caja: { ...state.caja, loading: true, error: null } 
    }))

    try {
      const { data, error } = await supabase
        .from('movimientos_caja')
        .select(`
          *,
          empleado:empleados(*)
        `)
        .order('fecha', { ascending: false })

      if (error) throw error

      // Calcular saldo actual
      const saldo = data.reduce((total, mov) => {
        return mov.tipo === 'ingreso' ? total + mov.monto : total - mov.monto
      }, 0)

      set((state) => ({
        caja: {
          ...state.caja,
          movimientos: data || [],
          saldo,
          loading: false
        }
      }))
    } catch (error) {
      set((state) => ({
        caja: {
          ...state.caja,
          loading: false,
          error: error.message
        }
      }))
    }
  },

  registrarIngreso: async (monto, concepto) => {
    try {
      const { data, error } = await supabase
        .from('movimientos_caja')
        .insert([{
          tipo: 'ingreso',
          monto,
          concepto,
          empleado_id: get().auth.user?.id,
          fecha: new Date().toISOString()
        }])
        .select()

      if (error) throw error

      // Actualizar estado local
      const currentMovimientos = get().caja.movimientos
      const newSaldo = get().caja.saldo + monto

      set((state) => ({
        caja: {
          ...state.caja,
          movimientos: [data[0], ...currentMovimientos],
          saldo: newSaldo
        }
      }))

      return { success: true, data: data[0] }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  registrarEgreso: async (monto, concepto) => {
    try {
      // Verificar saldo suficiente
      const saldoActual = get().caja.saldo
      if (saldoActual < monto) {
        throw new Error('Saldo insuficiente para realizar el egreso')
      }

      const { data, error } = await supabase
        .from('movimientos_caja')
        .insert([{
          tipo: 'egreso',
          monto,
          concepto,
          empleado_id: get().auth.user?.id,
          fecha: new Date().toISOString()
        }])
        .select()

      if (error) throw error

      // Actualizar estado local
      const currentMovimientos = get().caja.movimientos
      const newSaldo = get().caja.saldo - monto

      set((state) => ({
        caja: {
          ...state.caja,
          movimientos: [data[0], ...currentMovimientos],
          saldo: newSaldo
        }
      }))

      return { success: true, data: data[0] }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  // Obtener movimientos por fecha
  getMovimientosByDate: (fecha) => {
    const movimientos = get().caja.movimientos
    const fechaInicio = new Date(fecha)
    fechaInicio.setHours(0, 0, 0, 0)
    const fechaFin = new Date(fecha)
    fechaFin.setHours(23, 59, 59, 999)

    return movimientos.filter(mov => {
      const movFecha = new Date(mov.fecha)
      return movFecha >= fechaInicio && movFecha <= fechaFin
    })
  },

  // Obtener movimientos por tipo
  getMovimientosByTipo: (tipo) => {
    const movimientos = get().caja.movimientos
    return movimientos.filter(mov => mov.tipo === tipo)
  },

  // Estadísticas de caja
  getEstadisticasCaja: () => {
    const movimientos = get().caja.movimientos
    const hoy = new Date().toDateString()
    
    const movimientosHoy = movimientos.filter(mov => 
      new Date(mov.fecha).toDateString() === hoy
    )

    const ingresosHoy = movimientosHoy
      .filter(mov => mov.tipo === 'ingreso')
      .reduce((sum, mov) => sum + mov.monto, 0)

    const egresosHoy = movimientosHoy
      .filter(mov => mov.tipo === 'egreso')
      .reduce((sum, mov) => sum + mov.monto, 0)

    const ingresosTotal = movimientos
      .filter(mov => mov.tipo === 'ingreso')
      .reduce((sum, mov) => sum + mov.monto, 0)

    const egresosTotal = movimientos
      .filter(mov => mov.tipo === 'egreso')
      .reduce((sum, mov) => sum + mov.monto, 0)

    return {
      saldoActual: get().caja.saldo,
      ingresosHoy,
      egresosHoy,
      balanceHoy: ingresosHoy - egresosHoy,
      ingresosTotal,
      egresosTotal,
      balanceTotal: ingresosTotal - egresosTotal,
      totalMovimientos: movimientos.length,
      movimientosHoy: movimientosHoy.length
    }
  },

  // Arqueo de caja
  realizarArqueo: async (montoReal) => {
    try {
      const saldoSistema = get().caja.saldo
      const diferencia = montoReal - saldoSistema

      if (Math.abs(diferencia) > 0.01) {
        // Registrar ajuste si hay diferencia
        const concepto = diferencia > 0 
          ? `Arqueo - Excedente: $${diferencia.toFixed(2)}`
          : `Arqueo - Faltante: $${Math.abs(diferencia).toFixed(2)}`

        if (diferencia > 0) {
          await get().registrarIngreso(diferencia, concepto)
        } else {
          await get().registrarEgreso(Math.abs(diferencia), concepto)
        }
      }

      return { 
        success: true, 
        saldoSistema, 
        montoReal, 
        diferencia 
      }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }
})
