import type { StateCreator } from 'zustand'
import { supabase } from '../../lib/supabase'
import type { AppStore } from '../index'
import type { ProductosState, CreateProductoData, UpdateProductoData } from '../types'

const initialState: ProductosState = {
  productos: [],
  loading: false,
  error: null,
}

export const productosSlice: StateCreator<AppStore, [], [], Pick<AppStore, 'productos' | 'fetchProductos' | 'createProducto' | 'updateProducto' | 'deleteProducto'>> = (set, get) => ({
  productos: initialState,

  fetchProductos: async () => {
    set((state) => ({ productos: { ...state.productos, loading: true, error: null } }))
    try {
      const { data, error } = await supabase.from('productos').select('*').order('created_at', { ascending: false })
      if (error) throw error
      set((state) => ({ productos: { ...state.productos, productos: data || [], loading: false } }))
    } catch (error: any) {
      set((state) => ({ productos: { ...state.productos, loading: false, error: error.message } }))
    }
  },

  createProducto: async (productoData: CreateProductoData) => {
    set((state) => ({ productos: { ...state.productos, loading: true, error: null } }))
    try {
      // Validar que el SKU sea único
      const { data: existingProduct } = await supabase
        .from('productos')
        .select('id')
        .eq('codigo_sku', productoData.codigo_sku)
        .single()

      if (existingProduct) {
        throw new Error('El código SKU ya existe')
      }

      const { data, error } = await supabase.from('productos').insert([productoData]).select().single()
      if (error) throw error
      
      // Actualizar estado local
      set((state) => ({ productos: { ...state.productos, productos: [data, ...state.productos.productos], loading: false } }))
      
      // Notificar éxito
      get().addNotification({
        id: Date.now().toString(),
        type: 'success',
        title: 'Producto creado',
        message: `Producto ${productoData.nombre} (SKU: ${productoData.codigo_sku}) creado exitosamente`,
      })
      
    } catch (error: any) {
      set((state) => ({ productos: { ...state.productos, loading: false, error: error.message } }))
      
      // Notificar error
      get().addNotification({
        id: Date.now().toString(),
        type: 'error',
        title: 'Error al crear producto',
        message: error.message,
      })
    }
  },

  updateProducto: async (id: string, productoData: UpdateProductoData) => {
    set((state) => ({ productos: { ...state.productos, loading: true, error: null } }))
    try {
      const { data, error } = await supabase.from('productos').update(productoData).eq('id', id).select().single()
      if (error) throw error
      set((state) => ({ productos: { ...state.productos, productos: state.productos.productos.map(p => p.id === id ? data : p), loading: false } }))
    } catch (error: any) {
      set((state) => ({ productos: { ...state.productos, loading: false, error: error.message } }))
    }
  },

  deleteProducto: async (id: string) => {
    set((state) => ({ productos: { ...state.productos, loading: true, error: null } }))
    try {
      const { error } = await supabase.from('productos').update({ activo: false }).eq('id', id)
      if (error) throw error
      set((state) => ({ productos: { ...state.productos, productos: state.productos.productos.map(p => p.id === id ? { ...p, activo: false } : p), loading: false } }))
    } catch (error: any) {
      set((state) => ({ productos: { ...state.productos, loading: false, error: error.message } }))
    }
  },
})
