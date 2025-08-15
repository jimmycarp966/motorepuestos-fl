import type { StateCreator } from 'zustand'
import type { AppStore, UIState } from '../index'

const initialState: UIState = {
  theme: 'light',
  sidebarOpen: false,
  currentModule: 'dashboard',
}

export const uiSlice: StateCreator<AppStore, [], [], Pick<AppStore, 'ui' | 'setTheme' | 'setSidebarOpen' | 'setCurrentModule'>> = (set) => ({
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

  setCurrentModule: (module: string) => {
    set((state) => ({
      ui: { ...state.ui, currentModule: module }
    }))
  },
})
