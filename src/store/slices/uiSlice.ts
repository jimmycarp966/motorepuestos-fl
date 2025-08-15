import type { StateCreator } from 'zustand'
import type { AppStore, UIState } from '../index'

const initialState: UIState = {
  theme: 'light',
  sidebarOpen: false,
}

export const uiSlice: StateCreator<AppStore, [], [], AppStore> = (set) => ({
  ui: initialState,

  setTheme: (theme: 'light' | 'dark') => {
    set((state) => ({
      ui: { ...state.ui, theme }
    }))
  },

  setSidebarOpen: (open: boolean) => {
    set((state) => ({
      ui: { ...state.ui, sidebarOpen: open }
    }))
  },
})
