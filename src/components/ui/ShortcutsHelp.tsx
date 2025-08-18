import React, { useState } from 'react'
import { Keyboard, X, HelpCircle } from 'lucide-react'
import { getAllShortcuts } from '../../hooks/useKeyboardShortcuts'

export const ShortcutsHelp: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const shortcuts = getAllShortcuts()

  // Escuchar evento F12 para abrir ayuda
  React.useEffect(() => {
    const handleOpenShortcuts = () => setIsOpen(true)
    window.addEventListener('openShortcutsHelp', handleOpenShortcuts)
    return () => window.removeEventListener('openShortcutsHelp', handleOpenShortcuts)
  }, [])

  // Agrupar shortcuts por categoría
  const groupedShortcuts = shortcuts.reduce((acc, shortcut) => {
    const category = shortcut.category || 'General'
    if (!acc[category]) acc[category] = []
    acc[category].push(shortcut)
    return acc
  }, {} as Record<string, typeof shortcuts>)

  const formatShortcut = (shortcut: any) => {
    const parts = []
    if (shortcut.ctrlKey) parts.push('Ctrl')
    if (shortcut.altKey) parts.push('Alt')
    if (shortcut.shiftKey) parts.push('Shift')
    parts.push(shortcut.key)
    return parts.join(' + ')
  }

  return (
    <>
      {/* Botón flotante de ayuda */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-40 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-105"
        title="Atajos de Teclado (F12)"
      >
        <Keyboard size={20} />
      </button>

      {/* Modal de ayuda */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
              <div className="flex items-center gap-2">
                <Keyboard size={20} />
                <h2 className="text-lg font-semibold">Atajos de Teclado</h2>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 overflow-y-auto max-h-[60vh]">
              <div className="space-y-6">
                {/* Navegación Global */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <HelpCircle size={16} className="mr-2 text-blue-600" />
                    Navegación Global
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm text-gray-700">Dashboard</span>
                      <kbd className="px-2 py-1 bg-gray-200 rounded text-xs font-mono">F1</kbd>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm text-gray-700">Ventas</span>
                      <kbd className="px-2 py-1 bg-gray-200 rounded text-xs font-mono">F2</kbd>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm text-gray-700">Productos</span>
                      <kbd className="px-2 py-1 bg-gray-200 rounded text-xs font-mono">F3</kbd>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm text-gray-700">Clientes</span>
                      <kbd className="px-2 py-1 bg-gray-200 rounded text-xs font-mono">F4</kbd>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm text-gray-700">Empleados</span>
                      <kbd className="px-2 py-1 bg-gray-200 rounded text-xs font-mono">F5</kbd>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm text-gray-700">Caja</span>
                      <kbd className="px-2 py-1 bg-gray-200 rounded text-xs font-mono">F6</kbd>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm text-gray-700">Reportes</span>
                      <kbd className="px-2 py-1 bg-gray-200 rounded text-xs font-mono">F7</kbd>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm text-gray-700">Refrescar App</span>
                      <kbd className="px-2 py-1 bg-gray-200 rounded text-xs font-mono">F9</kbd>
                    </div>
                  </div>
                </div>

                {/* Ventas Específicos */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <HelpCircle size={16} className="mr-2 text-green-600" />
                    Módulo de Ventas
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                      <span className="text-sm text-gray-700">Buscar Producto</span>
                      <kbd className="px-2 py-1 bg-green-200 rounded text-xs font-mono">F10</kbd>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                      <span className="text-sm text-gray-700">Finalizar Venta</span>
                      <kbd className="px-2 py-1 bg-green-200 rounded text-xs font-mono">F11</kbd>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                      <span className="text-sm text-gray-700">Cancelar/Limpiar</span>
                      <kbd className="px-2 py-1 bg-green-200 rounded text-xs font-mono">Esc</kbd>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                      <span className="text-sm text-gray-700">Seleccionar Producto</span>
                      <kbd className="px-2 py-1 bg-green-200 rounded text-xs font-mono">Enter</kbd>
                    </div>
                  </div>
                </div>

                {/* Acciones Generales */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <HelpCircle size={16} className="mr-2 text-purple-600" />
                    Acciones Comunes
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div className="flex items-center justify-between p-2 bg-purple-50 rounded">
                      <span className="text-sm text-gray-700">Nuevo Elemento</span>
                      <kbd className="px-2 py-1 bg-purple-200 rounded text-xs font-mono">Ctrl + N</kbd>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-purple-50 rounded">
                      <span className="text-sm text-gray-700">Guardar</span>
                      <kbd className="px-2 py-1 bg-purple-200 rounded text-xs font-mono">Ctrl + S</kbd>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-purple-50 rounded">
                      <span className="text-sm text-gray-700">Refrescar</span>
                      <kbd className="px-2 py-1 bg-purple-200 rounded text-xs font-mono">Ctrl + R</kbd>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-purple-50 rounded">
                      <span className="text-sm text-gray-700">Cambiar Filtros</span>
                      <kbd className="px-2 py-1 bg-purple-200 rounded text-xs font-mono">Ctrl + F</kbd>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  💡 <strong>Tip:</strong> Los atajos funcionan en toda la aplicación
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
                >
                  Entendido
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
