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
import type { AppStore } from './types'

export const useAppStore = create<AppStore>()(
  persist(
    (...a) => ({
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
    }),
    {
      name: 'motorepuestos-store',
      partialize: (state) => ({
        auth: state.auth,
        ui: state.ui,
      }),
    }
  )
)
