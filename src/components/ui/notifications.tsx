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
  success: 'bg-success-500/10 border-success-500/30 text-success-500 shadow-glow-green',
  error: 'bg-danger-500/10 border-danger-500/30 text-danger-500 shadow-glow-red',
  warning: 'bg-warning-500/10 border-warning-500/30 text-warning-500 shadow-glow-orange',
  info: 'bg-primary-500/10 border-primary-500/30 text-primary-500 shadow-glow-blue',
}

export const NotificationsContainer: React.FC = () => {
  const notifications = useAppStore((state) => state.notifications.notifications)
  const removeNotification = useAppStore((state) => state.removeNotification)

  if (notifications.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 max-w-sm">
      {notifications.map((notification, index) => {
        const Icon = notificationIcons[notification.type]
        return (
          <div
            key={notification.id}
            className={cn(
              'flex items-start p-4 rounded-xl border bg-dark-bg-secondary backdrop-blur-sm transition-all duration-500 ease-out transform',
              notificationStyles[notification.type],
              'animate-in slide-in-from-right-full fade-in-0',
              'hover:scale-[1.02] hover:shadow-lg'
            )}
            style={{
              animationDelay: `${index * 100}ms`,
              animationFillMode: 'both'
            }}
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-current/20 mr-3 flex-shrink-0">
              <Icon className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-sm text-dark-text-primary mb-1">
                {notification.title}
              </h4>
              <p className="text-sm text-dark-text-secondary leading-relaxed">
                {notification.message}
              </p>
            </div>
            <button
              onClick={() => removeNotification(notification.id)}
              className="ml-3 p-1 rounded-full hover:bg-dark-bg-tertiary transition-colors duration-200 text-dark-text-secondary hover:text-dark-text-primary"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )
      })}
    </div>
  )
}
