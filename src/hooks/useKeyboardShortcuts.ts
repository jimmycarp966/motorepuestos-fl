import { useEffect, useCallback } from 'react'
import { useAppStore } from '../store'

// Tipos para los shortcuts
export interface KeyboardShortcut {
  key: string
  ctrlKey?: boolean
  altKey?: boolean
  shiftKey?: boolean
  action: () => void
  description: string
  category?: string
}

export interface ShortcutConfig {
  shortcuts: KeyboardShortcut[]
  enabled?: boolean
  preventDefault?: boolean
}

// Hook principal para atajos de teclado
export const useKeyboardShortcuts = (config: ShortcutConfig) => {
  const { shortcuts, enabled = true, preventDefault = true } = config

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return

    // Ignorar si estamos en un input, textarea o elemento editable
    const target = event.target as HTMLElement
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.contentEditable === 'true' ||
      target.isContentEditable
    ) {
      return
    }

    // Buscar shortcut coincidente
    const matchingShortcut = shortcuts.find(shortcut => {
      const keyMatch = shortcut.key.toLowerCase() === event.key.toLowerCase()
      const ctrlMatch = Boolean(shortcut.ctrlKey) === event.ctrlKey
      const altMatch = Boolean(shortcut.altKey) === event.altKey
      const shiftMatch = Boolean(shortcut.shiftKey) === event.shiftKey

      return keyMatch && ctrlMatch && altMatch && shiftMatch
    })

    if (matchingShortcut) {
      if (preventDefault) {
        event.preventDefault()
        event.stopPropagation()
      }
      
      // Ejecutar acción del shortcut
      try {
        matchingShortcut.action()
      } catch (error) {
        console.error('Error ejecutando shortcut:', error)
      }
    }
  }, [shortcuts, enabled, preventDefault])

  useEffect(() => {
    if (enabled) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleKeyDown, enabled])

  return { shortcuts }
}

// Hook específico para navegación global (F1-F12)
export const useGlobalNavigation = () => {
  const setCurrentModule = useAppStore((state) => state.setCurrentModule)
  const addNotification = useAppStore((state) => state.addNotification)

  const showShortcutNotification = (module: string, key: string) => {
    addNotification({
      id: `nav-${Date.now()}`,
      type: 'info',
      title: 'Navegación Rápida',
      message: `Navegando a ${module} (${key})`,
      duration: 2000
    })
  }

  const navigationShortcuts: KeyboardShortcut[] = [
    {
      key: 'F1',
      action: () => {
        setCurrentModule('dashboard')
        showShortcutNotification('Dashboard', 'F1')
      },
      description: 'Ir a Dashboard',
      category: 'Navegación'
    },
    {
      key: 'F2',
      action: () => {
        setCurrentModule('ventas')
        showShortcutNotification('Ventas', 'F2')
      },
      description: 'Ir a Ventas',
      category: 'Navegación'
    },
    {
      key: 'F3',
      action: () => {
        setCurrentModule('productos')
        showShortcutNotification('Productos', 'F3')
      },
      description: 'Ir a Productos',
      category: 'Navegación'
    },
    {
      key: 'F4',
      action: () => {
        setCurrentModule('clientes')
        showShortcutNotification('Clientes', 'F4')
      },
      description: 'Ir a Clientes',
      category: 'Navegación'
    },
    {
      key: 'F5',
      action: () => {
        setCurrentModule('empleados')
        showShortcutNotification('Empleados', 'F5')
      },
      description: 'Ir a Empleados',
      category: 'Navegación'
    },
    {
      key: 'F6',
      action: () => {
        setCurrentModule('caja')
        showShortcutNotification('Caja', 'F6')
      },
      description: 'Ir a Caja',
      category: 'Navegación'
    },
    {
      key: 'F7',
      action: () => {
        setCurrentModule('reportes')
        showShortcutNotification('Reportes', 'F7')
      },
      description: 'Ir a Reportes',
      category: 'Navegación'
    },
    {
      key: 'F9',
      action: () => {
        // Refrescar datos globales
        window.location.reload()
      },
      description: 'Refrescar Aplicación',
      category: 'Sistema'
    },
    {
      key: 'F12',
      action: () => {
        // Disparar evento para abrir ayuda de shortcuts
        window.dispatchEvent(new CustomEvent('openShortcutsHelp'))
      },
      description: 'Mostrar Ayuda',
      category: 'Sistema'
    }
  ]

  useKeyboardShortcuts({
    shortcuts: navigationShortcuts,
    enabled: true
  })

  return { navigationShortcuts }
}

// Hook para shortcuts específicos de componentes
export const useComponentShortcuts = (componentShortcuts: KeyboardShortcut[]) => {
  return useKeyboardShortcuts({
    shortcuts: componentShortcuts,
    enabled: true
  })
}

// Función helper para crear shortcuts comunes
export const createShortcut = (
  key: string,
  action: () => void,
  description: string,
  modifiers?: {
    ctrlKey?: boolean
    altKey?: boolean
    shiftKey?: boolean
  }
): KeyboardShortcut => ({
  key,
  action,
  description,
  ctrlKey: modifiers?.ctrlKey || false,
  altKey: modifiers?.altKey || false,
  shiftKey: modifiers?.shiftKey || false
})

// Lista de todos los shortcuts disponibles (para mostrar ayuda)
export const getAllShortcuts = (): KeyboardShortcut[] => [
  // Navegación Global
  createShortcut('F1', () => {}, 'Dashboard'),
  createShortcut('F2', () => {}, 'Ventas'),
  createShortcut('F3', () => {}, 'Productos'),
  createShortcut('F4', () => {}, 'Clientes'),
  createShortcut('F5', () => {}, 'Empleados'),
  createShortcut('F6', () => {}, 'Caja'),
  createShortcut('F7', () => {}, 'Reportes'),
  createShortcut('F9', () => {}, 'Refrescar'),
  
  // Shortcuts Específicos
  createShortcut('F10', () => {}, 'Buscador (en Ventas)'),
  createShortcut('F11', () => {}, 'Finalizar Venta'),
  
  // Shortcuts con modificadores
  createShortcut('Escape', () => {}, 'Cerrar Modal/Cancelar'),
  createShortcut('Enter', () => {}, 'Confirmar Acción'),
  createShortcut('n', () => {}, 'Nuevo Elemento', { ctrlKey: true }),
  createShortcut('s', () => {}, 'Guardar', { ctrlKey: true }),
]
