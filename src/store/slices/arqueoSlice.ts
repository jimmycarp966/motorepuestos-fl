import type { StateCreator } from 'zustand'
import { supabase } from '../../lib/supabase'
import { DateUtils } from '../../lib/dateUtils'
import type { AppStore } from '../index'
import type { ArqueoState, ArqueoCajaData } from '../types'

const initialState: ArqueoState = {
  arqueoActual: null,
  arqueos: [],
  loading: false,
  error: null,
  modalArqueoAbierto: false,
  arqueoCompletadoHoy: false,
}

export const arqueoSlice: StateCreator<AppStore, [], [], Pick<AppStore, 
  'arqueoActual' | 'arqueos' | 'loading' | 'error' | 'modalArqueoAbierto' | 'arqueoCompletadoHoy' |
  'iniciarArqueo' | 'finalizarArqueo' | 'verificarArqueoCompletado' | 'abrirModalArqueo' | 'cerrarModalArqueo' | 'fetchArqueos'
>> = (set, get) => ({
  arqueoActual: initialState.arqueoActual,
  arqueos: initialState.arqueos,
  loading: initialState.loading,
  error: initialState.error,
  modalArqueoAbierto: initialState.modalArqueoAbierto,
  arqueoCompletadoHoy: initialState.arqueoCompletadoHoy,

  iniciarArqueo: async () => {
    console.log('🔍 [arqueoSlice] Iniciando arqueo de caja...')
    set((state) => ({ loading: true, error: null }))
    
    try {
      const fechaHoy = DateUtils.getCurrentDate()
      const empleadoId = get().auth.session?.user?.id
      
      if (!empleadoId) {
        throw new Error('No hay sesión de empleado activa')
      }

      // Verificar si ya existe un arqueo para hoy
      const { data: arqueoExistente, error: errorVerificacion } = await supabase
        .from('arqueos_caja')
        .select('*')
        .eq('fecha', fechaHoy)
        .eq('empleado_id', empleadoId)
        .single()

      if (arqueoExistente) {
        throw new Error('Ya se realizó un arqueo para el día de hoy')
      }

      // Obtener ventas del día para calcular montos esperados
      const { data: ventasDelDia, error: errorVentas } = await supabase
        .from('ventas')
        .select(`
          *,
          venta_items (
            cantidad,
            precio_unitario,
            subtotal,
            tipo_precio
          )
        `)
        .eq('fecha', fechaHoy)
        .eq('estado', 'completada')

      if (errorVentas) {
        console.error('❌ [arqueoSlice] Error obteniendo ventas del día:', errorVentas)
        throw errorVentas
      }

      // Calcular montos esperados por método de pago
      let efectivoEsperado = 0
      let tarjetaEsperado = 0
      let transferenciaEsperado = 0

      ventasDelDia?.forEach(venta => {
        switch (venta.metodo_pago) {
          case 'efectivo':
            efectivoEsperado += venta.total
            break
          case 'tarjeta':
            tarjetaEsperado += venta.total
            break
          case 'transferencia':
            transferenciaEsperado += venta.total
            break
        }
      })

      const totalEsperado = efectivoEsperado + tarjetaEsperado + transferenciaEsperado

      // Crear arqueo inicial
      const arqueoInicial: ArqueoCajaData = {
        fecha: fechaHoy,
        efectivo_real: 0,
        tarjeta_real: 0,
        transferencia_real: 0,
        efectivo_esperado: efectivoEsperado,
        tarjeta_esperado: tarjetaEsperado,
        transferencia_esperado: transferenciaEsperado,
        efectivo_diferencia: -efectivoEsperado,
        tarjeta_diferencia: -tarjetaEsperado,
        transferencia_diferencia: -transferenciaEsperado,
        total_real: 0,
        total_esperado: totalEsperado,
        total_diferencia: -totalEsperado,
        observaciones: '',
        empleado_id: empleadoId,
        completado: false,
      }

      set((state) => ({ 
        arqueoActual: arqueoInicial,
        modalArqueoAbierto: true,
        loading: false 
      }))

      console.log('✅ [arqueoSlice] Arqueo iniciado correctamente:', arqueoInicial)
      
      get().addNotification({
        id: Date.now().toString(),
        type: 'success',
        title: 'Arqueo iniciado',
        message: 'Complete los montos reales para finalizar el arqueo',
      })

    } catch (error: any) {
      console.error('❌ [arqueoSlice] Error iniciando arqueo:', error)
      set((state) => ({ 
        loading: false, 
        error: error.message 
      }))
      
      get().addNotification({
        id: Date.now().toString(),
        type: 'error',
        title: 'Error al iniciar arqueo',
        message: error.message,
      })
    }
  },

  finalizarArqueo: async (arqueoData: Omit<ArqueoCajaData, 'id' | 'created_at'>) => {
    console.log('🔍 [arqueoSlice] Finalizando arqueo...')
    set((state) => ({ loading: true, error: null }))
    
    try {
      const empleadoId = get().auth.session?.user?.id
      
      if (!empleadoId) {
        throw new Error('No hay sesión de empleado activa')
      }

      // Calcular diferencias
      const efectivoDiferencia = arqueoData.efectivo_real - arqueoData.efectivo_esperado
      const tarjetaDiferencia = arqueoData.tarjeta_real - arqueoData.tarjeta_esperado
      const transferenciaDiferencia = arqueoData.transferencia_real - arqueoData.transferencia_esperado
      const totalReal = arqueoData.efectivo_real + arqueoData.tarjeta_real + arqueoData.transferencia_real
      const totalDiferencia = totalReal - arqueoData.total_esperado

      const arqueoCompleto: Omit<ArqueoCajaData, 'id' | 'created_at'> = {
        ...arqueoData,
        efectivo_diferencia: efectivoDiferencia,
        tarjeta_diferencia: tarjetaDiferencia,
        transferencia_diferencia: transferenciaDiferencia,
        total_real: totalReal,
        total_diferencia: totalDiferencia,
        completado: true,
      }

      // Guardar arqueo en base de datos
      const { data, error } = await supabase
        .from('arqueos_caja')
        .insert([arqueoCompleto])
        .select()
        .single()

      if (error) {
        console.error('❌ [arqueoSlice] Error guardando arqueo:', error)
        throw error
      }

      // Actualizar estado
      set((state) => ({ 
        arqueoActual: null,
        modalArqueoAbierto: false,
        arqueoCompletadoHoy: true,
        loading: false,
        arqueos: [data, ...state.arqueos]
      }))

      console.log('✅ [arqueoSlice] Arqueo finalizado correctamente:', data)

      // Notificar resultado
      const mensaje = totalDiferencia === 0 
        ? 'Arqueo completado sin diferencias' 
        : `Arqueo completado. Diferencia: $${totalDiferencia.toLocaleString()}`

      get().addNotification({
        id: Date.now().toString(),
        type: totalDiferencia === 0 ? 'success' : 'warning',
        title: 'Arqueo finalizado',
        message: mensaje,
      })

    } catch (error: any) {
      console.error('❌ [arqueoSlice] Error finalizando arqueo:', error)
      set((state) => ({ 
        loading: false, 
        error: error.message 
      }))
      
      get().addNotification({
        id: Date.now().toString(),
        type: 'error',
        title: 'Error al finalizar arqueo',
        message: error.message,
      })
    }
  },

  verificarArqueoCompletado: async () => {
    console.log('🔍 [arqueoSlice] Verificando arqueo del día...')
    
    try {
      const fechaHoy = DateUtils.getCurrentDate()
      const empleadoId = get().auth.session?.user?.id
      
      if (!empleadoId) return

      const { data: arqueoHoy, error } = await supabase
        .from('arqueos_caja')
        .select('*')
        .eq('fecha', fechaHoy)
        .eq('empleado_id', empleadoId)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('❌ [arqueoSlice] Error verificando arqueo:', error)
        return
      }

      const arqueoCompletado = arqueoHoy?.completado || false
      
      set((state) => {
        // No sobrescribir arqueoActual si el modal está abierto
        const shouldUpdateArqueoActual = !state.modalArqueoAbierto
        
        return { 
          arqueoCompletadoHoy: arqueoCompletado,
          arqueoActual: shouldUpdateArqueoActual ? (arqueoHoy || null) : state.arqueoActual
        }
      })

      console.log('✅ [arqueoSlice] Arqueo del día:', arqueoCompletado ? 'Completado' : 'Pendiente')

    } catch (error) {
      console.error('❌ [arqueoSlice] Error verificando arqueo:', error)
    }
  },

  abrirModalArqueo: () => {
    console.log('🔍 [arqueoSlice] Abriendo modal de arqueo...')
    set((state) => ({ modalArqueoAbierto: true }))
  },

  cerrarModalArqueo: () => {
    console.log('🔍 [arqueoSlice] Cerrando modal de arqueo...')
    set((state) => ({ 
      modalArqueoAbierto: false,
      arqueoActual: null 
    }))
  },

  fetchArqueos: async () => {
    console.log('🔍 [arqueoSlice] Obteniendo historial de arqueos...')
    set((state) => ({ loading: true, error: null }))
    
    try {
      const { data, error } = await supabase
        .from('arqueos_caja')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) {
        console.error('❌ [arqueoSlice] Error obteniendo arqueos:', error)
        throw error
      }

      set((state) => ({ 
        arqueos: data || [],
        loading: false 
      }))

      console.log('✅ [arqueoSlice] Arqueos obtenidos:', data?.length)

    } catch (error: any) {
      console.error('❌ [arqueoSlice] Error fetching arqueos:', error)
      set((state) => ({ 
        loading: false, 
        error: error.message 
      }))
    }
  },
})
