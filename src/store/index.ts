import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authSlice } from './slices/authSlice'
import { productosSlice } from './slices/productosSlice'
import { ventasSlice } from './slices/ventasSlice'
import { clientesSlice } from './slices/clientesSlice'
import { empleadosSlice } from './slices/empleadosSlice'
import { cajaSlice } from './slices/cajaSlice'
import { reportesSlice } from './slices/reportesSlice'
import { arqueoSlice } from './slices/arqueoSlice'
import { uiSlice } from './slices/uiSlice'
import { notificationsSlice } from './slices/notificationsSlice'
import { ErrorHandler } from '../lib/errorHandler'
import { AuditLogger } from '../lib/auditLogger'
import type { AppStore } from './types'

export const useAppStore = create<AppStore>()(
  persist(
    (...a) => {
      const store = {
        ...authSlice(...a),
        ...productosSlice(...a),
        ...ventasSlice(...a),
        ...clientesSlice(...a),
        ...empleadosSlice(...a),
        ...cajaSlice(...a),
        ...reportesSlice(...a),
        ...arqueoSlice(...a),
        ...uiSlice(...a),
        ...notificationsSlice(...a),
      }

      // Configurar ErrorHandler con el callback de notificaciones
      ErrorHandler.setNotificationHandler(store.addNotification)
      
      // Generar nueva sesión de auditoría
      AuditLogger.newSession()

      return store
    },
    {
      name: 'motorepuestos-store',
      partialize: (state) => ({
        auth: {
          user: state.auth.user,
          // NO persistir session por seguridad
        },
        ui: {
          theme: state.ui.theme,
          sidebarOpen: state.ui.sidebarOpen,
          // NO persistir currentModule
        },
      }),
    }
  )
)
