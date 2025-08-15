import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Slices
import { createAuthSlice } from './slices/authSlice'
import { createProductosSlice } from './slices/productosSlice'
import { createVentasSlice } from './slices/ventasSlice'
import { createCajaSlice } from './slices/cajaSlice'
import { createClientesSlice } from './slices/clientesSlice'
import { createEmpleadosSlice } from './slices/empleadosSlice'
import { createUISlice } from './slices/uiSlice'
import { createNotificationsSlice } from './slices/notificationsSlice'

// Store principal
export const useAppStore = create(
  persist(
    (...a) => ({
      // Auth
      ...createAuthSlice(...a),
      
      // Business logic
      ...createProductosSlice(...a),
      ...createVentasSlice(...a),
      ...createCajaSlice(...a),
      ...createClientesSlice(...a),
      ...createEmpleadosSlice(...a),
      
      // UI & Notifications
      ...createUISlice(...a),
      ...createNotificationsSlice(...a),
    }),
    {
      name: 'motorepuestos-store',
      partialize: (state) => ({
        auth: { session: state.auth.session },
        ui: { theme: state.ui.theme, sidebarOpen: state.ui.sidebarOpen }
      })
    }
  )
)

// Selectores útiles
export const useAuth = () => useAppStore((state) => state.auth)
export const useProductos = () => useAppStore((state) => state.productos)
export const useVentas = () => useAppStore((state) => state.ventas)
export const useCaja = () => useAppStore((state) => state.caja)
export const useClientes = () => useAppStore((state) => state.clientes)
export const useEmpleados = () => useAppStore((state) => state.empleados)
export const useUI = () => useAppStore((state) => state.ui)
export const useNotifications = () => useAppStore((state) => state.notifications)
