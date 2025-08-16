import type { StateCreator } from 'zustand'
import type { AppStore, UIState } from '../index'

export interface DebugLog {
  id: string
  timestamp: string
  level: 'info' | 'warning' | 'error' | 'success'
  message: string
  data?: any
  source: string
}

const initialState: UIState = {
  theme: 'light',
  sidebarOpen: false,
  currentModule: 'dashboard',
  debugPanel: {
    isOpen: false,
    logs: [],
    maxLogs: 100
  }
}

export const uiSlice: StateCreator<AppStore, [], [], Pick<AppStore, 'ui' | 'setTheme' | 'setSidebarOpen' | 'setCurrentModule' | 'toggleDebugPanel' | 'addDebugLog' | 'clearDebugLogs'>> = (set, get) => ({
  ui: initialState,

  setTheme: (theme: 'light' | 'dark') => {
    set((state) => ({ 
      ui: { 
        ...state.ui, 
        theme 
      } 
    }))
  },

  setSidebarOpen: (open: boolean) => {
    set((state) => ({ 
      ui: { 
        ...state.ui, 
        sidebarOpen: open 
      } 
    }))
  },

  setCurrentModule: (module: string) => {
    set((state) => ({ 
      ui: { 
        ...state.ui, 
        currentModule: module 
      } 
    }))
  },

  toggleDebugPanel: () => {
    set((state) => ({ 
      ui: { 
        ...state.ui, 
        debugPanel: {
          ...state.ui.debugPanel,
          isOpen: !state.ui.debugPanel.isOpen
        }
      } 
    }))
  },

  addDebugLog: (log: Omit<DebugLog, 'id' | 'timestamp'>) => {
    set((state) => {
      const newLog: DebugLog = {
        ...log,
        id: Date.now().toString(),
        timestamp: new Date().toISOString()
      }

      const updatedLogs = [newLog, ...state.ui.debugPanel.logs].slice(0, state.ui.debugPanel.maxLogs)

      return {
        ui: {
          ...state.ui,
          debugPanel: {
            ...state.ui.debugPanel,
            logs: updatedLogs
          }
        }
      }
    })
  },

  clearDebugLogs: () => {
    set((state) => ({ 
      ui: { 
        ...state.ui, 
        debugPanel: {
          ...state.ui.debugPanel,
          logs: []
        }
      } 
    }))
  },
})
