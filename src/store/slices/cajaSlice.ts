import type { StateCreator } from 'zustand'
import { supabase } from '../../lib/supabase'
import { DateUtils } from '../../lib/dateUtils'
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

export const cajaSlice: StateCreator<AppStore, [], [], Pick<AppStore, 'caja' | 'fetchMovimientos' | 'registrarIngreso' | 'registrarEgreso' | 'abrirCaja' | 'cerrarCaja' | 'realizarArqueo' | 'fetchCajasDiarias' | 'fetchArqueos' | 'editarMovimiento' | 'eliminarMovimiento'>> = (set, get) => ({
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

      // Calcular saldo (excluyendo movimientos eliminados)
      const saldo = data?.reduce((acc, mov) => {
        if (mov.estado === 'eliminada') return acc
        return mov.tipo === 'ingreso' ? acc + mov.monto : acc - mov.monto
      }, 0) || 0

      // Determinar si la caja está abierta (si hay movimientos hoy, excluyendo eliminados)
      const fechaHoy = DateUtils.getCurrentLocalDate()
      const movimientosHoy = data?.filter(m => {
        if (m.estado === 'eliminada') return false
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
          fecha: DateUtils.getCurrentLocalDateTime()
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
          fecha: DateUtils.getCurrentLocalDateTime()
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
            fechaApertura: DateUtils.getCurrentLocalDateTime(),
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
        fecha: DateUtils.getCurrentLocalDateTime(),
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
  },

  editarMovimiento: async (movimientoId: string, datosActualizados: Partial<MovimientoCaja>) => {
    const currentUser = get().auth.user
    if (!currentUser) throw new Error('Usuario no autenticado')
    
    // Verificar que el usuario sea administrador
    if (currentUser.rol !== 'Administrador') {
      throw new Error('Solo los administradores pueden editar movimientos')
    }

    try {
      // Obtener el movimiento actual antes de actualizarlo
      const movimientoActual = get().caja.movimientos.find(mov => mov.id === movimientoId)
      if (!movimientoActual) throw new Error('Movimiento no encontrado')

      const { data, error } = await supabase
        .from('movimientos_caja')
        .update(datosActualizados)
        .eq('id', movimientoId)
        .select()
        .single()

      if (error) throw error

      // Actualizar estado local
      set((state) => ({
        caja: {
          ...state.caja,
          movimientos: state.caja.movimientos.map(mov => 
            mov.id === movimientoId ? { ...mov, ...data } : mov
          )
        }
      }))

      // Si se cambió el método de pago, actualizar arqueos pendientes y ventas
      if (datosActualizados.metodo_pago && 
          datosActualizados.metodo_pago !== movimientoActual.metodo_pago) {
        
        // Obtener arqueo pendiente del día actual
        const fechaHoy = DateUtils.getCurrentLocalDate()
        const { data: arqueoPendiente } = await supabase
          .from('arqueos_caja')
          .select('*')
          .eq('fecha', fechaHoy)
          .eq('empleado_id', currentUser.id)
          .eq('completado', false)
          .single()

        if (arqueoPendiente) {
          // Calcular la diferencia en el monto
          const monto = movimientoActual.monto
          const metodoAnterior = movimientoActual.metodo_pago
          const metodoNuevo = datosActualizados.metodo_pago

          // Actualizar montos esperados del arqueo
          let efectivoEsperado = arqueoPendiente.efectivo_esperado
          let tarjetaEsperado = arqueoPendiente.tarjeta_esperado
          let transferenciaEsperado = arqueoPendiente.transferencia_esperado

          // Descontar del método anterior
          switch (metodoAnterior) {
            case 'efectivo':
              efectivoEsperado -= monto
              break
            case 'tarjeta':
              tarjetaEsperado -= monto
              break
            case 'transferencia':
              transferenciaEsperado -= monto
              break
          }

          // Sumar al método nuevo
          switch (metodoNuevo) {
            case 'efectivo':
              efectivoEsperado += monto
              break
            case 'tarjeta':
              tarjetaEsperado += monto
              break
            case 'transferencia':
              transferenciaEsperado += monto
              break
          }

          // Actualizar arqueo en base de datos
          await supabase
            .from('arqueos_caja')
            .update({
              efectivo_esperado: efectivoEsperado,
              tarjeta_esperado: tarjetaEsperado,
              transferencia_esperado: transferenciaEsperado,
              total_esperado: efectivoEsperado + tarjetaEsperado + transferenciaEsperado
            })
            .eq('id', arqueoPendiente.id)

          // Actualizar estado local del arqueo si está abierto
          const arqueoActual = get().arqueoActual
          if (arqueoActual && arqueoActual.fecha === fechaHoy) {
            set((state) => ({
              arqueoActual: {
                ...state.arqueoActual!,
                efectivo_esperado,
                tarjeta_esperado,
                transferencia_esperado,
                total_esperado: efectivoEsperado + tarjetaEsperado + transferenciaEsperado
              }
            }))
          }
        }

        // Actualizar ventas en el store y en la base de datos
        // Buscar la venta correspondiente al movimiento y actualizar su método de pago
        const ventas = get().ventas
        const ventaActualizada = ventas.find(v => {
          // Buscar por concepto que contenga el ID de la venta
          const concepto = movimientoActual.concepto.toLowerCase()
          if (concepto.includes('venta #') || concepto.includes('venta#')) {
            const ventaMatch = concepto.match(/venta\s*#?([a-f0-9-]+)/i)
            if (ventaMatch) {
              return v.id === ventaMatch[1]
            }
          }
          return false
        })

        if (ventaActualizada) {
          // Actualizar la venta en la base de datos
          const { error: errorVenta } = await supabase
            .from('ventas')
            .update({ metodo_pago: datosActualizados.metodo_pago })
            .eq('id', ventaActualizada.id)

          if (errorVenta) {
            console.warn('Error al actualizar venta en BD:', errorVenta)
          }

          // Actualizar la venta en el store
          set((state) => ({
            ventas: state.ventas.map(v => 
              v.id === ventaActualizada.id 
                ? { ...v, metodo_pago: datosActualizados.metodo_pago }
                : v
            )
          }))
        }
      }

      return data
    } catch (error: any) {
      throw new Error(`Error al editar movimiento: ${error.message}`)
    }
  },

  eliminarMovimiento: async (movimientoId: string) => {
    const currentUser = get().auth.user
    if (!currentUser) throw new Error('Usuario no autenticado')
    
    // Verificar que el usuario sea administrador
    if (currentUser.rol !== 'Administrador') {
      throw new Error('Solo los administradores pueden eliminar movimientos')
    }

    try {
      // Marcar como eliminado en lugar de borrar
      const { error } = await supabase
        .from('movimientos_caja')
        .update({
          estado: 'eliminada',
          updated_at: DateUtils.getCurrentLocalDateTime()
        })
        .eq('id', movimientoId)

      if (error) throw error

      // Actualizar estado local
      set((state) => ({
        caja: {
          ...state.caja,
          movimientos: state.caja.movimientos.map(mov => 
            mov.id === movimientoId 
              ? { ...mov, estado: 'eliminada' }
              : mov
          )
        }
      }))

      // Si es una venta, también marcar la venta como eliminada
      const movimiento = get().caja.movimientos.find(m => m.id === movimientoId)
      if (movimiento && movimiento.concepto.toLowerCase().includes('venta')) {
        const ventaMatch = movimiento.concepto.match(/venta\s*#?([a-f0-9-]+)/i)
        if (ventaMatch) {
          const ventaId = ventaMatch[1]
          try {
            await supabase
              .from('ventas')
              .update({
                estado: 'eliminada',
                updated_at: DateUtils.getCurrentLocalDateTime()
              })
              .eq('id', ventaId)
          } catch (ventaError) {
            console.warn('Error al marcar venta como eliminada:', ventaError)
          }
        }
      }

      return true
    } catch (error: any) {
      throw new Error(`Error al eliminar movimiento: ${error.message}`)
    }
  }
})
