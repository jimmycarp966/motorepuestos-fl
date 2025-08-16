import type { StateCreator } from 'zustand'
import type { AppStore } from '../index'
import type { UIState } from '../types'

const initialState: UIState = {
  theme: 'light',
  sidebarOpen: true,
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
