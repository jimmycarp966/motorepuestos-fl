import { useState, useCallback } from 'react'
import { useAppStore } from '../store'
import { config } from '../lib/config'

// Tipos genéricos para operaciones CRUD
export interface CRUDOperations<T, CreateData, UpdateData> {
  items: T[]
  loading: boolean
  error: string | null
  create: (data: CreateData) => Promise<void>
  update: (id: string, data: UpdateData) => Promise<void>
  delete: (id: string) => Promise<void>
  fetch: () => Promise<void>
}

// Estados comunes de tabla
export interface TableState {
  showForm: boolean
  editingItem: any | null
  searchTerm: string
  currentPage: number
  selectedItems: string[]
}

// Hook para lógica común de tablas
export function useTableLogic<T = any>() {
  const addNotification = useAppStore((state) => state.addNotification)
  
  // Estados locales comunes
  const [tableState, setTableState] = useState<TableState>({
    showForm: false,
    editingItem: null,
    searchTerm: '',
    currentPage: 0,
    selectedItems: []
  })

  // Handlers comunes
  const handlers = {
    // Mostrar formulario para crear
    openCreateForm: useCallback(() => {
      setTableState(prev => ({
        ...prev,
        showForm: true,
        editingItem: null
      }))
    }, []),

    // Mostrar formulario para editar
    openEditForm: useCallback((item: T) => {
      setTableState(prev => ({
        ...prev,
        showForm: true,
        editingItem: item
      }))
    }, []),

    // Cerrar formulario
    closeForm: useCallback(() => {
      setTableState(prev => ({
        ...prev,
        showForm: false,
        editingItem: null
      }))
    }, []),

    // Búsqueda
    setSearchTerm: useCallback((searchTerm: string) => {
      setTableState(prev => ({
        ...prev,
        searchTerm,
        currentPage: 0 // Reset página al buscar
      }))
    }, []),

    // Paginación
    setCurrentPage: useCallback((currentPage: number) => {
      setTableState(prev => ({
        ...prev,
        currentPage
      }))
    }, []),

    // Selección múltiple
    toggleSelection: useCallback((id: string) => {
      setTableState(prev => ({
        ...prev,
        selectedItems: prev.selectedItems.includes(id)
          ? prev.selectedItems.filter(item => item !== id)
          : [...prev.selectedItems, id]
      }))
    }, []),

    // Seleccionar todos
    toggleSelectAll: useCallback((allIds: string[]) => {
      setTableState(prev => ({
        ...prev,
        selectedItems: prev.selectedItems.length === allIds.length ? [] : allIds
      }))
    }, []),

    // Limpiar selección
    clearSelection: useCallback(() => {
      setTableState(prev => ({
        ...prev,
        selectedItems: []
      }))
    }, [])
  }

  // Helper para notificaciones de éxito
  const notifySuccess = useCallback((title: string, message: string) => {
    addNotification({
      id: Date.now().toString(),
      type: 'success',
      title,
      message,
      duration: config.notificationDuration
    })
  }, [addNotification])

  // Helper para notificaciones de error
  const notifyError = useCallback((title: string, message: string) => {
    addNotification({
      id: Date.now().toString(),
      type: 'error',
      title,
      message,
      duration: config.notificationDuration
    })
  }, [addNotification])

  // Helper para notificaciones de warning
  const notifyWarning = useCallback((title: string, message: string) => {
    addNotification({
      id: Date.now().toString(),
      type: 'warning',
      title,
      message,
      duration: config.notificationDuration
    })
  }, [addNotification])

  // Helper para confirmación de eliminación
  const confirmDelete = useCallback((itemName: string): boolean => {
    return window.confirm(`¿Estás seguro de que quieres eliminar "${itemName}"?`)
  }, [])

  // Helper para confirmación de eliminación múltiple
  const confirmBulkDelete = useCallback((count: number): boolean => {
    return window.confirm(`¿Estás seguro de que quieres eliminar ${count} elementos?`)
  }, [])

  return {
    tableState,
    handlers,
    notifications: {
      notifySuccess,
      notifyError,
      notifyWarning
    },
    confirmations: {
      confirmDelete,
      confirmBulkDelete
    }
  }
}

// Hook específico para operaciones CRUD
export function useCRUDOperations<T, CreateData, UpdateData>(
  fetchFn: () => Promise<void>,
  createFn: (data: CreateData) => Promise<void>,
  updateFn: (id: string, data: UpdateData) => Promise<void>,
  deleteFn: (id: string) => Promise<void>,
  entityName: string
) {
  const { notifications, confirmations } = useTableLogic<T>()

  // Wrapper para crear con notificaciones
  const handleCreate = useCallback(async (data: CreateData) => {
    try {
      await createFn(data)
      notifications.notifySuccess(
        `${entityName} creado`,
        `${entityName} creado exitosamente`
      )
    } catch (error) {
      notifications.notifyError(
        'Error al crear',
        `No se pudo crear el ${entityName.toLowerCase()}`
      )
      throw error
    }
  }, [createFn, entityName, notifications])

  // Wrapper para actualizar con notificaciones
  const handleUpdate = useCallback(async (id: string, data: UpdateData) => {
    try {
      await updateFn(id, data)
      notifications.notifySuccess(
        `${entityName} actualizado`,
        `${entityName} actualizado exitosamente`
      )
    } catch (error) {
      notifications.notifyError(
        'Error al actualizar',
        `No se pudo actualizar el ${entityName.toLowerCase()}`
      )
      throw error
    }
  }, [updateFn, entityName, notifications])

  // Wrapper para eliminar con confirmación y notificaciones
  const handleDelete = useCallback(async (id: string, itemName: string) => {
    if (!confirmations.confirmDelete(itemName)) {
      return false
    }

    try {
      await deleteFn(id)
      notifications.notifySuccess(
        `${entityName} eliminado`,
        `${entityName} eliminado exitosamente`
      )
      return true
    } catch (error) {
      notifications.notifyError(
        'Error al eliminar',
        `No se pudo eliminar el ${entityName.toLowerCase()}`
      )
      return false
    }
  }, [deleteFn, entityName, notifications, confirmations])

  // Wrapper para refresh con loading
  const handleRefresh = useCallback(async () => {
    try {
      await fetchFn()
      notifications.notifySuccess(
        'Datos actualizados',
        'La información se ha actualizado correctamente'
      )
    } catch (error) {
      notifications.notifyError(
        'Error al actualizar',
        'No se pudieron actualizar los datos'
      )
    }
  }, [fetchFn, notifications])

  return {
    handleCreate,
    handleUpdate,
    handleDelete,
    handleRefresh
  }
}

// Hook para filtros comunes
export function useCommonFilters<T>(
  items: T[],
  searchTerm: string,
  searchFields: (keyof T)[]
) {
  const filteredItems = useState(() => {
    if (!searchTerm) return items
    
    const term = searchTerm.toLowerCase()
    return items.filter(item => {
      return searchFields.some(field => {
        const value = item[field]
        if (typeof value === 'string') {
          return value.toLowerCase().includes(term)
        }
        if (typeof value === 'number') {
          return value.toString().includes(term)
        }
        return false
      })
    })
  })[0]

  return filteredItems
}

// Hook para paginación
export function usePagination<T>(items: T[], pageSize: number = config.itemsPerPage) {
  const [currentPage, setCurrentPage] = useState(0)
  
  const totalPages = Math.ceil(items.length / pageSize)
  const startIndex = currentPage * pageSize
  const endIndex = startIndex + pageSize
  const currentItems = items.slice(startIndex, endIndex)
  
  const goToPage = useCallback((page: number) => {
    setCurrentPage(Math.max(0, Math.min(page, totalPages - 1)))
  }, [totalPages])

  const nextPage = useCallback(() => {
    goToPage(currentPage + 1)
  }, [currentPage, goToPage])

  const prevPage = useCallback(() => {
    goToPage(currentPage - 1)
  }, [currentPage, goToPage])

  const resetPage = useCallback(() => {
    setCurrentPage(0)
  }, [])

  return {
    currentItems,
    currentPage,
    totalPages,
    pageSize,
    totalItems: items.length,
    hasNext: currentPage < totalPages - 1,
    hasPrev: currentPage > 0,
    goToPage,
    nextPage,
    prevPage,
    resetPage,
    pageInfo: {
      start: startIndex + 1,
      end: Math.min(endIndex, items.length),
      total: items.length
    }
  }
}

export default useTableLogic
