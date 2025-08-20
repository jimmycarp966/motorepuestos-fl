import type { StateCreator } from 'zustand'
import { supabase } from '../../lib/supabase'
import { DateUtils } from '../../lib/dateUtils'
import { AuditLogger } from '../../lib/auditLogger'
import { BusinessRules } from '../../lib/businessRules'
import { ErrorHandler } from '../../lib/errorHandler'
import { createBusinessError, ERROR_CODES } from '../../lib/auditLogger'
import type { AppStore } from '../index'
import type { VentasState, CreateVentaData } from '../types'

const initialState: VentasState = {
  ventas: [],
  loading: false,
  error: null,
}

export const ventasSlice: StateCreator<AppStore, [], [], Pick<AppStore, 'ventas' | 'ventasLoading' | 'ventasError' | 'fetchVentas' | 'registrarVenta' | 'updateVenta'>> = (set, get) => {
  
  return {
    ventas: initialState.ventas,
    loading: initialState.loading,
    error: initialState.error,

         fetchVentas: async (page = 1, pageSize = 50) => {
       set((state) => ({ loading: true, error: null }))
       
       try {
         const from = (page - 1) * pageSize
         const to = from + pageSize - 1
         
         // Optimización: Una sola consulta con joins y paginación inteligente
         const { data, error, count } = await supabase
           .from('ventas')
           .select(`
             *,
             cliente:clientes(id, nombre, email, telefono),
             empleado:empleados(id, nombre, email, rol),
             items:venta_items(
               id,
               cantidad,
               precio_unitario,
               subtotal,
               tipo_precio,
               producto:productos(id, nombre, codigo_sku, categoria)
             )
           `, { count: 'exact' })
           .order('created_at', { ascending: false })
           .range(from, to)
         
         if (error) {
           throw error
         }
         
         // Si es la primera página, reemplazar datos. Si no, agregar para infinite scroll
         set((state) => ({ 
           ventas: page === 1 ? (data || []) : [...state.ventas, ...(data || [])],
           loading: false,
           error: null,
           totalCount: count || 0,
           hasMore: (data?.length || 0) === pageSize
         }))
         
       } catch (error: any) {
         console.error('❌ [VentasSlice] Error en fetchVentas:', error)
         set((state) => ({ 
           ventas: [], 
           loading: false, 
           error: error.message || 'Error desconocido al cargar ventas',
           totalCount: 0,
           hasMore: false
         }))
       }
     },

         // Acción compuesta mejorada: Registrar venta completa con atomicidad
     registrarVenta: AuditLogger.withLogging(
       'registrarVenta',
       'ventas',
       async (ventaData: CreateVentaData) => {
         const startTime = Date.now()
         set((state) => ({ loading: true, error: null }))
         
         return ErrorHandler.withErrorHandling(
           async () => {
             // 1. VALIDACIONES PREVIAS
             const fechaHoy = DateUtils.getCurrentDate()
             const empleadoId = get().auth.session?.user?.id || get().auth.user?.id
             
             if (!empleadoId) {
               throw createBusinessError(ERROR_CODES.USUARIO_NO_AUTENTICADO)
             }

             // Validar reglas de negocio
             const validation = await BusinessRules.validateVenta(ventaData)
             if (!validation.isValid) {
               throw createBusinessError(
                 ERROR_CODES.VENTA_SIN_PRODUCTOS,
                 validation.errors.join(', ')
               )
             }

             // Mostrar warnings si existen
             if (validation.warnings.length > 0) {
               validation.warnings.forEach(warning => {
                 get().addNotification({
                   id: Date.now().toString(),
                   type: 'warning',
                   title: 'Advertencia',
                   message: warning,
                 })
               })
             }

             // Verificar arqueo completado
             const { data: arqueoHoy } = await supabase
               .from('arqueos_caja')
               .select('completado')
               .eq('fecha', fechaHoy)
               .eq('empleado_id', empleadoId)
               .single()

             if (arqueoHoy?.completado) {
               throw createBusinessError(ERROR_CODES.ARQUEO_COMPLETADO)
             }

             // 2. PREPARAR DATOS
             const total = ventaData.items.reduce((sum, item) => sum + item.subtotal, 0)
             console.log('🔍 Debug - Items:', ventaData.items)
             console.log('🔍 Debug - Total calculado:', total)
             console.log('🔍 Debug - Tipo de total:', typeof total)
             
             const ventaCompleta = {
               cliente_id: ventaData.cliente_id,
               tipo_precio: ventaData.tipo_precio,
               metodo_pago: ventaData.metodo_pago,
               total: Number(total), // Asegurar que sea número
               fecha: fechaHoy,
               estado: 'completada',
               empleado_id: empleadoId,
             }
             
             console.log('🔍 Debug - Venta completa:', ventaCompleta)

             // 3. TRANSACCIÓN ATÓMICA (simulada con compensación)
             let ventaCreada: any = null
             let stockActualizado: string[] = []
             let cajaRegistrada = false

             try {
               // Crear venta
               const { data: venta, error: errorVenta } = await supabase
                 .from('ventas')
                 .insert([ventaCompleta])
                 .select()
                 .single()

               if (errorVenta) throw errorVenta
               ventaCreada = venta

               // Crear items de venta
               const itemsConVentaId = ventaData.items.map(item => ({
                 ...item,
                 venta_id: venta.id,
               }))

               const { error: errorItems } = await supabase
                 .from('venta_items')
                 .insert(itemsConVentaId)

               if (errorItems) throw errorItems

               // Actualizar stock de productos (con compensación)
               for (const item of ventaData.items) {
                 try {
                   const { error: errorStock } = await supabase.rpc('decrement_stock', {
                     product_id: item.producto_id,
                     quantity: item.cantidad
                   })

                   if (errorStock) {
                     console.warn(`⚠️ Stock no actualizado para producto ${item.producto_id}:`, errorStock)
                     // Continuar - el stock negativo se permite
                   } else {
                     stockActualizado.push(item.producto_id)
                   }
                 } catch (stockError) {
                   console.warn(`⚠️ Error actualizando stock:`, stockError)
                 }
               }

               // Registrar ingreso en caja SOLO si NO es cuenta corriente
               if (ventaData.metodo_pago !== 'cuenta_corriente') {
                 // Generar concepto descriptivo con productos vendidos
                 const productosVendidos = ventaData.items.map(item => {
                   // Buscar el nombre del producto en los items
                   const producto = get().productos.find(p => p.id === item.producto_id)
                   const nombreProducto = producto?.nombre || 'Producto desconocido'
                   return `${nombreProducto} x${item.cantidad}`
                 })
                 
                 let concepto = ''
                 if (productosVendidos.length === 1) {
                   concepto = productosVendidos[0]
                 } else if (productosVendidos.length <= 3) {
                   concepto = productosVendidos.join(', ')
                 } else {
                   const primerProducto = productosVendidos[0]
                   concepto = `${primerProducto} +${productosVendidos.length - 1} más`
                 }
                 
                 try {
                   const { error: errorCaja } = await supabase
                     .from('movimientos_caja')
                     .insert([{
                       tipo: 'ingreso',
                       monto: total,
                       concepto,
                       empleado_id: empleadoId,
                       fecha: fechaHoy,
                       metodo_pago: ventaData.metodo_pago
                     }])

                   if (errorCaja) {
                     console.warn(`⚠️ Movimiento de caja no registrado:`, errorCaja)
                   } else {
                     cajaRegistrada = true
                   }
                 } catch (cajaError) {
                   console.warn(`⚠️ Error registrando en caja:`, cajaError)
                 }
               } else {
                 // Si es cuenta corriente, actualizar saldo del cliente
                 if (ventaData.cliente_id) {
                   try {
                     const { error: errorCliente } = await supabase
                       .from('clientes')
                       .update({
                         saldo_cuenta_corriente: supabase.sql`saldo_cuenta_corriente + ${total}`,
                         updated_at: DateUtils.getCurrentLocalDateTime()
                       })
                       .eq('id', ventaData.cliente_id)

                     if (errorCliente) {
                       console.warn(`⚠️ Error actualizando saldo del cliente:`, errorCliente)
                     } else {
                       console.log(`✅ Saldo del cliente actualizado: +$${total}`)
                     }
                   } catch (clienteError) {
                     console.warn(`⚠️ Error actualizando cliente:`, clienteError)
                   }
                 }
               }

               // 4. ACTUALIZAR ESTADO LOCAL
               set((state) => ({
                 ventas: [venta, ...state.ventas],
                 loading: false,
                 error: null
               }))

               // 5. REFRESCAR DATOS RELACIONADOS
               get().fetchMovimientos?.()
               get().fetchProductos?.()

               // 6. NOTIFICAR ÉXITO
               get().addNotification({
                 id: Date.now().toString(),
                 type: 'success',
                 title: 'Venta registrada',
                 message: `Venta #${venta.id} por $${total.toLocaleString()} registrada exitosamente`,
               })

               // Log de éxito con detalles
               await AuditLogger.logSuccess('registrarVenta', 'ventas', {
                 ventaId: venta.id,
                 total,
                 items: ventaData.items.length,
                 metodoPago: ventaData.metodo_pago,
                 stockActualizado: stockActualizado.length,
                 cajaRegistrada
               }, Date.now() - startTime)

               return venta

             } catch (transactionError) {
               // COMPENSACIÓN: Rollback manual
               console.error('❌ Error en transacción de venta, iniciando rollback:', transactionError)

               if (ventaCreada) {
                 try {
                   // Eliminar venta e items creados
                   await supabase.from('venta_items').delete().eq('venta_id', ventaCreada.id)
                   await supabase.from('ventas').delete().eq('id', ventaCreada.id)
                   console.log('✅ Rollback: Venta eliminada')
                 } catch (rollbackError) {
                   console.error('❌ Error en rollback de venta:', rollbackError)
                 }
               }

               throw transactionError
             }
           },
           {
             action: 'registrarVenta',
             module: 'ventas',
             data: { items: ventaData.items.length, total: ventaData.items.reduce((s, i) => s + i.subtotal, 0) }
           },
           {
             retryable: false, // Ventas no son retriables automáticamente
             severity: 'high'
           }
         )
       }
     ),

     updateVenta: async (ventaId: string, ventaActualizada: any) => {
       set((state) => ({ loading: true, error: null }))
       
       try {
         // Actualizar la venta principal
         const { error: errorVenta } = await supabase
           .from('ventas')
           .update({
             total: ventaActualizada.total,
             updated_at: DateUtils.getCurrentLocalDateTime()
           })
           .eq('id', ventaId)

         if (errorVenta) throw errorVenta

         // Eliminar items existentes
         const { error: errorDeleteItems } = await supabase
           .from('venta_items')
           .delete()
           .eq('venta_id', ventaId)

         if (errorDeleteItems) throw errorDeleteItems

         // Insertar nuevos items
         if (ventaActualizada.items && ventaActualizada.items.length > 0) {
           const itemsToInsert = ventaActualizada.items.map((item: any) => ({
             venta_id: ventaId,
             producto_id: item.producto.id,
             cantidad: item.cantidad,
             precio_unitario: item.precio_unitario,
             subtotal: item.subtotal,
             tipo_precio: item.tipo_precio
           }))

           const { error: errorInsertItems } = await supabase
             .from('venta_items')
             .insert(itemsToInsert)

           if (errorInsertItems) throw errorInsertItems
         }

         // Actualizar estado local
         set((state) => ({
           ventas: state.ventas.map(v => 
             v.id === ventaId 
               ? { ...v, ...ventaActualizada }
               : v
           ),
           loading: false,
           error: null
         }))

         // Actualizar movimiento de caja relacionado
         get().fetchMovimientos?.()

         return true
       } catch (error: any) {
         console.error('❌ [VentasSlice] Error en updateVenta:', error)
         set((state) => ({ 
           loading: false, 
           error: error.message || 'Error desconocido al actualizar venta'
         }))
         throw error
       }
     }
  }
}
