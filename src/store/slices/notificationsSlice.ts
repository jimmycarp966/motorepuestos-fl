import type { StateCreator } from 'zustand'
import type { AppStore, NotificationsState, Notification } from '../index'

const initialState: NotificationsState = {
  notifications: [],
}

export const notificationsSlice: StateCreator<AppStore, [], [], Pick<AppStore, 'notifications' | 'addNotification' | 'removeNotification' | 'clearNotifications'>> = (set) => ({
  notifications: initialState,

  addNotification: (notification: Notification) => {
    set((state) => ({
      notifications: {
        notifications: [...state.notifications.notifications, notification]
      }
    }))

    // Auto-remove notification after duration
    if (notification.duration !== 0) {
      setTimeout(() => {
        set((state) => ({
          notifications: {
            notifications: state.notifications.notifications.filter(n => n.id !== notification.id)
          }
        }))
      }, notification.duration || 5000)
    }
  },

  removeNotification: (id: string) => {
    set((state) => ({
      notifications: {
        notifications: state.notifications.notifications.filter(n => n.id !== id)
      }
    }))
  },

  clearNotifications: () => {
    set(() => ({
      notifications: { notifications: [] }
    }))
  },
})
