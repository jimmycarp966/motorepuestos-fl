export const createNotificationsSlice = (set, get) => ({
  notifications: {
    notifications: [],
    maxNotifications: 5
  },

  // Acciones de notificaciones
  addNotification: (notification) => {
    const id = Date.now().toString()
    const newNotification = {
      id,
      timestamp: new Date().toISOString(),
      ...notification
    }

    set((state) => {
      const currentNotifications = state.notifications.notifications
      const updatedNotifications = [newNotification, ...currentNotifications]
        .slice(0, state.notifications.maxNotifications)

      return {
        notifications: {
          ...state.notifications,
          notifications: updatedNotifications
        }
      }
    })

    // Auto-remover notificación después de 5 segundos
    setTimeout(() => {
      get().removeNotification(id)
    }, 5000)

    return id
  },

  removeNotification: (id) => {
    set((state) => ({
      notifications: {
        ...state.notifications,
        notifications: state.notifications.notifications.filter(n => n.id !== id)
      }
    }))
  },

  clearNotifications: () => {
    set((state) => ({
      notifications: {
        ...state.notifications,
        notifications: []
      }
    }))
  },

  // Helpers para tipos de notificación
  showSuccess: (title, message) => {
    return get().addNotification({
      type: 'success',
      title,
      message
    })
  },

  showError: (title, message) => {
    return get().addNotification({
      type: 'error',
      title,
      message
    })
  },

  showWarning: (title, message) => {
    return get().addNotification({
      type: 'warning',
      title,
      message
    })
  },

  showInfo: (title, message) => {
    return get().addNotification({
      type: 'info',
      title,
      message
    })
  },

  // Notificaciones específicas del negocio
  showVentaRegistrada: (ventaId) => {
    return get().showSuccess(
      'Venta Registrada',
      `La venta #${ventaId.slice(0, 8)} se registró correctamente`
    )
  },

  showProductoAgregado: (nombre) => {
    return get().showSuccess(
      'Producto Agregado',
      `El producto "${nombre}" se agregó al inventario`
    )
  },

  showClienteRegistrado: (nombre) => {
    return get().showSuccess(
      'Cliente Registrado',
      `El cliente "${nombre}" se registró correctamente`
    )
  },

  showStockBajo: (producto) => {
    return get().showWarning(
      'Stock Bajo',
      `El producto "${producto.nombre}" tiene stock bajo (${producto.stock} ${producto.unidad_medida})`
    )
  },

  showErrorConexion: () => {
    return get().showError(
      'Error de Conexión',
      'No se pudo conectar con el servidor. Verifica tu conexión a internet.'
    )
  }
})
