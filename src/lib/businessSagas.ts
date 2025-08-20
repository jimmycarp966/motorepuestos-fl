// ================================
// DEFINICIONES DE SAGAS DE NEGOCIO PARA MOTOREPUESTOS FL
// ================================

import { SagaDefinition, SagaStep, SagaContext, sagaEngine } from './sagaEngine'
import { supabase } from './supabase'
import { v4 as uuidv4 } from 'uuid'

// ================================
// SAGA: REGISTRAR VENTA COMPLETA
// ================================

const registrarVentaSteps: SagaStep[] = [
  // Paso 1: Validar datos de entrada
  {
    id: 'validar_datos_venta',
    name: 'Validar datos de venta',
    retryable: false,
    execute: async (context: SagaContext, payload: any) => {
  
      
      const { items, cliente_id, empleado_id, descuento = 0 } = payload
      
      if (!items || items.length === 0) {
        throw new Error('La venta debe tener al menos un producto')
      }
      
      if (!empleado_id) {
        throw new Error('Se requiere un empleado para la venta')
      }

      // Calcular total
      const subtotal = items.reduce((sum: number, item: any) => 
        sum + (item.cantidad * item.precio_unitario), 0
      )
      const total = subtotal - descuento

      if (total <= 0) {
        throw new Error('El total de la venta debe ser mayor a cero')
      }

      return { subtotal, total, validado: true }
    },
    compensate: async () => {
      // No hay compensación para validación
    }
  },

  // Paso 2: Verificar stock disponible
  {
    id: 'verificar_stock',
    name: 'Verificar stock disponible',
    retryable: true,
    dependencies: ['validar_datos_venta'],
    execute: async (context: SagaContext, payload: any) => {
      console.log('📦 [Saga] Verificando stock...')
      
      const { items } = payload
      const stockVerificado = []

      for (const item of items) {
        const { data: producto, error } = await supabase
          .from('productos')
          .select('id, nombre, stock, stock_minimo')
          .eq('id', item.producto_id)
          .single()

        if (error) {
          throw new Error(`Error al verificar producto ${item.producto_id}: ${error.message}`)
        }

        if (producto.stock < item.cantidad) {
          throw new Error(`Stock insuficiente para ${producto.nombre}. Disponible: ${producto.stock}, Solicitado: ${item.cantidad}`)
        }

        stockVerificado.push({
          producto_id: item.producto_id,
          nombre: producto.nombre,
          stock_actual: producto.stock,
          cantidad_solicitada: item.cantidad,
          stock_restante: producto.stock - item.cantidad
        })
      }

      return { stockVerificado }
    },
    compensate: async () => {
      // No hay compensación para verificación
    }
  },

  // Paso 3: Crear registro de venta
  {
    id: 'crear_venta',
    name: 'Crear registro de venta',
    retryable: true,
    dependencies: ['verificar_stock'],
    execute: async (context: SagaContext, payload: any) => {
      console.log('💰 [Saga] Creando registro de venta...')
      
      const validacionResult = context.results.get('validar_datos_venta')
      const { cliente_id, empleado_id, descuento = 0, metodo_pago = 'efectivo' } = payload
      
      const venta = {
        id: uuidv4(),
        cliente_id,
        empleado_id,
        subtotal: validacionResult.subtotal,
        descuento,
        total: validacionResult.total,
        metodo_pago,
        created_at: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('ventas')
        .insert(venta)
        .select()
        .single()

      if (error) {
        throw new Error(`Error al crear venta: ${error.message}`)
      }

      return { venta: data }
    },
    compensate: async (context: SagaContext, payload: any, result: any) => {
      console.log('↩️ [Saga] Eliminando venta creada...')
      
      if (result?.venta?.id) {
        await supabase
          .from('ventas')
          .delete()
          .eq('id', result.venta.id)
      }
    }
  },

  // Paso 4: Crear items de venta
  {
    id: 'crear_items_venta',
    name: 'Crear items de venta',
    retryable: true,
    dependencies: ['crear_venta'],
    execute: async (context: SagaContext, payload: any) => {
      console.log('📋 [Saga] Creando items de venta...')
      
      const ventaResult = context.results.get('crear_venta')
      const { items } = payload
      
      const ventaItems = items.map((item: any) => ({
        id: uuidv4(),
        venta_id: ventaResult.venta.id,
        producto_id: item.producto_id,
        cantidad: item.cantidad,
        precio_unitario: item.precio_unitario,
        subtotal: item.cantidad * item.precio_unitario,
        tipo_precio: item.tipo_precio || 'minorista'
      }))

      const { data, error } = await supabase
        .from('venta_items')
        .insert(ventaItems)
        .select()

      if (error) {
        throw new Error(`Error al crear items de venta: ${error.message}`)
      }

      return { items: data }
    },
    compensate: async (context: SagaContext, payload: any, result: any) => {
      console.log('↩️ [Saga] Eliminando items de venta...')
      
      const ventaResult = context.results.get('crear_venta')
      if (ventaResult?.venta?.id) {
        await supabase
          .from('venta_items')
          .delete()
          .eq('venta_id', ventaResult.venta.id)
      }
    }
  },

  // Paso 5: Actualizar stock de productos
  {
    id: 'actualizar_stock',
    name: 'Actualizar stock de productos',
    retryable: true,
    dependencies: ['crear_items_venta'],
    execute: async (context: SagaContext, payload: any) => {
      console.log('📉 [Saga] Actualizando stock...')
      
      const stockResult = context.results.get('verificar_stock')
      const actualizaciones = []

      for (const item of stockResult.stockVerificado) {
        const { error } = await supabase
          .from('productos')
          .update({ stock: item.stock_restante })
          .eq('id', item.producto_id)

        if (error) {
          throw new Error(`Error al actualizar stock de ${item.nombre}: ${error.message}`)
        }

        actualizaciones.push({
          producto_id: item.producto_id,
          stock_anterior: item.stock_actual,
          stock_nuevo: item.stock_restante,
          cantidad_vendida: item.cantidad_solicitada
        })
      }

      return { actualizaciones }
    },
    compensate: async (context: SagaContext, payload: any, result: any) => {
      console.log('↩️ [Saga] Restaurando stock...')
      
      if (result?.actualizaciones) {
        for (const actualizacion of result.actualizaciones) {
          await supabase
            .from('productos')
            .update({ stock: actualizacion.stock_anterior })
            .eq('id', actualizacion.producto_id)
        }
      }
    }
  },

  // Paso 6: Registrar movimiento de caja
  {
    id: 'registrar_movimiento_caja',
    name: 'Registrar movimiento de caja',
    retryable: true,
    dependencies: ['crear_venta'],
    execute: async (context: SagaContext, payload: any) => {
      console.log('💳 [Saga] Registrando movimiento de caja...')
      
      const ventaResult = context.results.get('crear_venta')
      const { empleado_id } = payload
      
      const movimiento = {
        id: uuidv4(),
        tipo: 'ingreso',
        monto: ventaResult.venta.total,
        descripcion: `Venta #${ventaResult.venta.id.slice(-8)}`,
        empleado_id,
        referencia_id: ventaResult.venta.id,
        referencia_tipo: 'venta',
        created_at: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('movimientos_caja')
        .insert(movimiento)
        .select()
        .single()

      if (error) {
        throw new Error(`Error al registrar movimiento de caja: ${error.message}`)
      }

      return { movimiento: data }
    },
    compensate: async (context: SagaContext, payload: any, result: any) => {
      console.log('↩️ [Saga] Eliminando movimiento de caja...')
      
      if (result?.movimiento?.id) {
        await supabase
          .from('movimientos_caja')
          .delete()
          .eq('id', result.movimiento.id)
      }
    }
  },

  // Paso 7: Generar notificaciones
  {
    id: 'generar_notificaciones',
    name: 'Generar notificaciones',
    retryable: true,
    dependencies: ['actualizar_stock', 'registrar_movimiento_caja'],
    execute: async (context: SagaContext, payload: any) => {
      console.log('🔔 [Saga] Generando notificaciones...')
      
      const ventaResult = context.results.get('crear_venta')
      const stockResult = context.results.get('actualizar_stock')
      
      // Notificación de venta exitosa
      context.store.addNotification({
        message: `✅ Venta #${ventaResult.venta.id.slice(-8)} registrada exitosamente por $${ventaResult.venta.total}`,
        type: 'success',
        duration: 5000
      })

      // Verificar productos con stock bajo
      const productosStockBajo = stockResult.actualizaciones.filter(
        (act: any) => act.stock_nuevo <= 5 // Threshold configurable
      )

      if (productosStockBajo.length > 0) {
        context.store.addNotification({
          message: `⚠️ ${productosStockBajo.length} productos con stock bajo después de la venta`,
          type: 'warning',
          duration: 8000
        })
      }

      return { notificaciones_enviadas: productosStockBajo.length + 1 }
    },
    compensate: async () => {
      // Las notificaciones no se pueden compensar
    }
  }
]

// ================================
// SAGA: ARQUEO DE CAJA
// ================================

const arqueoCajaSteps: SagaStep[] = [
  // Paso 1: Validar estado de caja
  {
    id: 'validar_estado_caja',
    name: 'Validar estado de caja',
    retryable: false,
    execute: async (context: SagaContext, payload: any) => {
  
      
      // Verificar que haya una caja abierta
      const cajaState = context.store.caja
      if (!cajaState?.cajaAbierta) {
        throw new Error('No hay una caja abierta para realizar el arqueo')
      }

      const { monto_contado, empleado_id } = payload
      if (!monto_contado || monto_contado < 0) {
        throw new Error('El monto contado debe ser mayor o igual a cero')
      }

      if (!empleado_id) {
        throw new Error('Se requiere un empleado para realizar el arqueo')
      }

      return { validado: true, caja_id: cajaState.cajaActual?.id }
    },
    compensate: async () => {
      // No hay compensación para validación
    }
  },

  // Paso 2: Calcular movimientos del día
  {
    id: 'calcular_movimientos',
    name: 'Calcular movimientos del día',
    retryable: true,
    dependencies: ['validar_estado_caja'],
    execute: async (context: SagaContext, payload: any) => {
      console.log('🧮 [Saga] Calculando movimientos del día...')
      
      const validacionResult = context.results.get('validar_estado_caja')
      const hoy = new Date().toISOString().split('T')[0]

      // Obtener todos los movimientos del día
      const { data: movimientos, error } = await supabase
        .from('movimientos_caja')
        .select('*')
        .gte('created_at', `${hoy}T00:00:00`)
        .lte('created_at', `${hoy}T23:59:59`)
        .order('created_at', { ascending: true })

      if (error) {
        throw new Error(`Error al obtener movimientos: ${error.message}`)
      }

      const ingresos = movimientos
        .filter(m => m.tipo === 'ingreso')
        .reduce((sum, m) => sum + m.monto, 0)

      const egresos = movimientos
        .filter(m => m.tipo === 'egreso')
        .reduce((sum, m) => sum + m.monto, 0)

      const saldo_teorico = context.store.caja?.saldoInicial + ingresos - egresos

      return {
        movimientos,
        ingresos,
        egresos,
        saldo_teorico,
        cantidad_movimientos: movimientos.length
      }
    },
    compensate: async () => {
      // No hay compensación para cálculos
    }
  },

  // Paso 3: Registrar arqueo
  {
    id: 'registrar_arqueo',
    name: 'Registrar arqueo en base de datos',
    retryable: true,
    dependencies: ['calcular_movimientos'],
    execute: async (context: SagaContext, payload: any) => {
      console.log('💾 [Saga] Registrando arqueo...')
      
      const validacionResult = context.results.get('validar_estado_caja')
      const calculosResult = context.results.get('calcular_movimientos')
      const { monto_contado, empleado_id, observaciones = '' } = payload

      const diferencia = monto_contado - calculosResult.saldo_teorico

      const arqueo = {
        id: uuidv4(),
        empleado_id,
        fecha: new Date().toISOString().split('T')[0],
        saldo_inicial: context.store.caja?.saldoInicial || 0,
        total_ingresos: calculosResult.ingresos,
        total_egresos: calculosResult.egresos,
        saldo_teorico: calculosResult.saldo_teorico,
        monto_contado,
        diferencia,
        observaciones,
        estado: Math.abs(diferencia) <= 1 ? 'cuadrado' : 'diferencia', // Tolerancia de $1
        created_at: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('arqueos_caja')
        .insert(arqueo)
        .select()
        .single()

      if (error) {
        throw new Error(`Error al registrar arqueo: ${error.message}`)
      }

      return { arqueo: data }
    },
    compensate: async (context: SagaContext, payload: any, result: any) => {
      console.log('↩️ [Saga] Eliminando arqueo registrado...')
      
      if (result?.arqueo?.id) {
        await supabase
          .from('arqueos_caja')
          .delete()
          .eq('id', result.arqueo.id)
      }
    }
  },

  // Paso 4: Cerrar caja diaria
  {
    id: 'cerrar_caja',
    name: 'Cerrar caja diaria',
    retryable: true,
    dependencies: ['registrar_arqueo'],
    execute: async (context: SagaContext, payload: any) => {
      console.log('🔒 [Saga] Cerrando caja diaria...')
      
      const arqueoResult = context.results.get('registrar_arqueo')
      const calculosResult = context.results.get('calcular_movimientos')
      
      // Actualizar estado en el store
      context.store.cerrarCaja({
        saldo_final: arqueoResult.arqueo.monto_contado,
        total_ingresos: calculosResult.ingresos,
        total_egresos: calculosResult.egresos,
        diferencia: arqueoResult.arqueo.diferencia,
        arqueo_id: arqueoResult.arqueo.id
      })

      return { caja_cerrada: true }
    },
    compensate: async (context: SagaContext) => {
      console.log('↩️ [Saga] Reabriendo caja...')
      
      // Reabrir caja en el store
      context.store.abrirCaja({
        saldo_inicial: context.store.caja?.saldoInicial || 0,
        empleado_id: context.store.auth?.user?.id
      })
    }
  },

  // Paso 5: Generar reporte de cierre
  {
    id: 'generar_reporte_cierre',
    name: 'Generar reporte de cierre',
    retryable: true,
    dependencies: ['cerrar_caja'],
    execute: async (context: SagaContext, payload: any) => {
      console.log('📊 [Saga] Generando reporte de cierre...')
      
      const arqueoResult = context.results.get('registrar_arqueo')
      const calculosResult = context.results.get('calcular_movimientos')
      
      // En un caso real, esto generaría un PDF o reporte
      const reporte = {
        fecha: new Date().toISOString().split('T')[0],
        empleado: payload.empleado_id,
        resumen: {
          saldo_inicial: context.store.caja?.saldoInicial || 0,
          total_ingresos: calculosResult.ingresos,
          total_egresos: calculosResult.egresos,
          saldo_teorico: calculosResult.saldo_teorico,
          monto_contado: arqueoResult.arqueo.monto_contado,
          diferencia: arqueoResult.arqueo.diferencia,
          estado: arqueoResult.arqueo.estado
        },
        movimientos: calculosResult.movimientos
      }

      // Notificar éxito
      context.store.addNotification({
        message: `✅ Arqueo de caja completado. ${arqueoResult.arqueo.estado === 'cuadrado' ? 'Caja cuadrada' : `Diferencia: $${arqueoResult.arqueo.diferencia}`}`,
        type: arqueoResult.arqueo.estado === 'cuadrado' ? 'success' : 'warning',
        duration: 8000
      })

      return { reporte }
    },
    compensate: async () => {
      // Los reportes no se pueden compensar
    }
  }
]

// ================================
// REGISTRAR SAGAS EN EL MOTOR
// ================================

// Saga de venta completa
export const SAGA_REGISTRAR_VENTA: SagaDefinition = {
  id: 'registrar_venta_completa',
  name: 'Registrar Venta Completa',
  description: 'Proceso completo de registro de venta con validaciones, actualización de stock y movimientos de caja',
  steps: registrarVentaSteps,
  timeout: 60000, // 1 minuto
  rollbackOnFailure: true,
  persistProgress: true
}

// Saga de arqueo de caja
export const SAGA_ARQUEO_CAJA: SagaDefinition = {
  id: 'arqueo_caja_completo',
  name: 'Arqueo de Caja Completo',
  description: 'Proceso completo de arqueo y cierre de caja diaria con validaciones y reportes',
  steps: arqueoCajaSteps,
  timeout: 30000, // 30 segundos
  rollbackOnFailure: true,
  persistProgress: true
}

// Registrar las sagas
sagaEngine.registerSaga(SAGA_REGISTRAR_VENTA)
sagaEngine.registerSaga(SAGA_ARQUEO_CAJA)

// ================================
// FUNCIONES HELPER PARA USO EN COMPONENTES
// ================================

export const ejecutarVentaCompleta = async (
  ventaData: any, 
  store: any
): Promise<string> => {
  return await sagaEngine.executeSaga(
    'registrar_venta_completa',
    ventaData,
    store,
    { origen: 'ventas_component', timestamp: new Date() }
  )
}

export const ejecutarArqueoCaja = async (
  arqueoData: any,
  store: any
): Promise<string> => {
  return await sagaEngine.executeSaga(
    'arqueo_caja_completo',
    arqueoData,
    store,
    { origen: 'caja_component', timestamp: new Date() }
  )
}

export { sagaEngine }
