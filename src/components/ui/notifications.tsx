import React from 'react'
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react'
import { useAppStore } from '../../store'
import { cn } from '../../lib/utils'

const notificationIcons = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
}

const notificationStyles = {
  success: 'bg-success-500/20 border-success-500 text-success-500',
  error: 'bg-danger-500/20 border-danger-500 text-danger-500',
  warning: 'bg-warning-500/20 border-warning-500 text-warning-500',
  info: 'bg-primary-500/20 border-primary-500 text-primary-500',
}

export const NotificationsContainer: React.FC = () => {
  const notifications = useAppStore((state) => state.notifications.notifications)
  const removeNotification = useAppStore((state) => state.removeNotification)

  if (notifications.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {notifications.map((notification) => {
        const Icon = notificationIcons[notification.type]
        return (
          <div
            key={notification.id}
            className={cn(
              'flex items-start p-4 rounded-lg border shadow-lg transition-all duration-300',
              notificationStyles[notification.type]
            )}
          >
            <Icon className="w-5 h-5 mt-0.5 mr-3 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm">{notification.title}</h4>
              <p className="text-sm mt-1">{notification.message}</p>
            </div>
            <button
              onClick={() => removeNotification(notification.id)}
              className="ml-3 text-dark-text-secondary hover:text-dark-text-primary transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )
      })}
    </div>
  )
}
