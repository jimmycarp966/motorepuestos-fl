import { supabase } from '../../lib/supabase.js'

export const createProductosSlice = (set, get) => ({
  productos: {
    productos: [],
    loading: false,
    error: null
  },

  // Acciones de productos
  fetchProductos: async () => {
    set((state) => ({ 
      productos: { ...state.productos, loading: true, error: null } 
    }))

    try {
      const { data, error } = await supabase
        .from('productos')
        .select('*')
        .eq('activo', true)
        .order('nombre')

      if (error) throw error

      set((state) => ({
        productos: {
          ...state.productos,
          productos: data || [],
          loading: false
        }
      }))
    } catch (error) {
      set((state) => ({
        productos: {
          ...state.productos,
          loading: false,
          error: error.message
        }
      }))
    }
  },

  createProducto: async (productoData) => {
    try {
      const { data, error } = await supabase
        .from('productos')
        .insert([{
          ...productoData,
          activo: true,
          created_at: new Date().toISOString()
        }])
        .select()

      if (error) throw error

      // Actualizar estado local
      const currentProductos = get().productos.productos
      set((state) => ({
        productos: {
          ...state.productos,
          productos: [...currentProductos, data[0]]
        }
      }))

      return { success: true, data: data[0] }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  updateProducto: async (id, updates) => {
    try {
      const { data, error } = await supabase
        .from('productos')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()

      if (error) throw error

      // Actualizar estado local
      const currentProductos = get().productos.productos
      const updatedProductos = currentProductos.map(p => 
        p.id === id ? data[0] : p
      )

      set((state) => ({
        productos: {
          ...state.productos,
          productos: updatedProductos
        }
      }))

      return { success: true, data: data[0] }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  deleteProducto: async (id) => {
    try {
      // Soft delete - marcar como inactivo
      const { error } = await supabase
        .from('productos')
        .update({ 
          activo: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)

      if (error) throw error

      // Actualizar estado local
      const currentProductos = get().productos.productos
      const updatedProductos = currentProductos.filter(p => p.id !== id)

      set((state) => ({
        productos: {
          ...state.productos,
          productos: updatedProductos
        }
      }))

      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  // Categorías específicas de motorepuestos
  getCategorias: () => [
    'Motores',
    'Frenos',
    'Suspensión',
    'Eléctrico',
    'Combustible',
    'Transmisión',
    'Carrocería',
    'Accesorios',
    'Lubricantes',
    'Herramientas',
    'Neumáticos',
    'Iluminación',
    'Audio',
    'Seguridad',
    'Otros'
  ],

  // Unidades de medida para motorepuestos
  getUnidadesMedida: () => [
    'pcs',
    'kg',
    'lt',
    'm',
    'par',
    'set',
    'kit',
    'rollo',
    'caja',
    'botella'
  ],

  // Buscar productos
  searchProductos: (query) => {
    const productos = get().productos.productos
    if (!query) return productos

    return productos.filter(producto =>
      producto.nombre.toLowerCase().includes(query.toLowerCase()) ||
      producto.categoria.toLowerCase().includes(query.toLowerCase()) ||
      producto.descripcion?.toLowerCase().includes(query.toLowerCase())
    )
  },

  // Obtener productos por categoría
  getProductosByCategoria: (categoria) => {
    const productos = get().productos.productos
    return productos.filter(p => p.categoria === categoria)
  },

  // Obtener productos con stock bajo
  getProductosStockBajo: (minStock = 10) => {
    const productos = get().productos.productos
    return productos.filter(p => p.stock <= minStock)
  }
})
