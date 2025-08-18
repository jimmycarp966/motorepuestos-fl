import React from 'react'
import { cn } from '../../lib/utils'
import { Loader2, Package, DollarSign, Users, ShoppingCart } from 'lucide-react'
import { MotorCard } from './motor-card'

// Skeleton genérico
export const Skeleton: React.FC<{
  className?: string
  pulse?: boolean
}> = ({ className, pulse = true }) => (
  <div className={cn(
    "bg-gray-200 rounded",
    pulse && "animate-pulse",
    className
  )} />
)

// Loading para tarjetas KPI
export const KPICardSkeleton: React.FC = () => (
  <MotorCard className="p-6">
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <Skeleton className="h-4 w-24 mb-3" />
        <Skeleton className="h-8 w-20 mb-2" />
        <Skeleton className="h-3 w-16" />
      </div>
      <Skeleton className="w-12 h-12 rounded-xl" />
    </div>
  </MotorCard>
)

// Loading para tablas
export const TableSkeleton: React.FC<{
  rows?: number
  columns?: number
}> = ({ rows = 5, columns = 4 }) => (
  <div className="space-y-3">
    {/* Header */}
    <div className="grid grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton key={i} className="h-4" />
      ))}
    </div>
    
    {/* Rows */}
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div key={rowIndex} className="grid grid-cols-4 gap-4 p-4 border rounded-lg">
        {Array.from({ length: columns }).map((_, colIndex) => (
          <Skeleton key={colIndex} className="h-4" />
        ))}
      </div>
    ))}
  </div>
)

// Loading spinner con contexto
export const ContextualLoader: React.FC<{
  type: 'ventas' | 'productos' | 'clientes' | 'caja' | 'general'
  message?: string
  size?: 'sm' | 'md' | 'lg'
}> = ({ type, message, size = 'md' }) => {
  const icons = {
    ventas: ShoppingCart,
    productos: Package,
    clientes: Users,
    caja: DollarSign,
    general: Loader2
  }
  
  const messages = {
    ventas: 'Cargando ventas...',
    productos: 'Cargando inventario...',
    clientes: 'Cargando clientes...',
    caja: 'Procesando movimientos...',
    general: 'Cargando...'
  }
  
  const sizes = {
    sm: { spinner: 'w-4 h-4', text: 'text-sm' },
    md: { spinner: 'w-6 h-6', text: 'text-base' },
    lg: { spinner: 'w-8 h-8', text: 'text-lg' }
  }
  
  const Icon = icons[type]
  const displayMessage = message || messages[type]
  const sizeClasses = sizes[size]
  
  return (
    <div className="flex flex-col items-center justify-center p-8 text-moto-steel">
      <div className="relative mb-4">
        <Icon className={cn(sizeClasses.spinner, "animate-spin")} />
        {type !== 'general' && (
          <div className="absolute inset-0 rounded-full border-2 border-moto-blue/20 animate-ping" />
        )}
      </div>
      <p className={cn(sizeClasses.text, "font-medium")}>
        {displayMessage}
      </p>
    </div>
  )
}

// Estado vacío contextual
export const EmptyState: React.FC<{
  type: 'ventas' | 'productos' | 'clientes' | 'caja' | 'general'
  title?: string
  description?: string
  action?: React.ReactNode
  icon?: React.ComponentType<any>
}> = ({ type, title, description, action, icon: CustomIcon }) => {
  const defaultIcons = {
    ventas: ShoppingCart,
    productos: Package,
    clientes: Users,
    caja: DollarSign,
    general: Package
  }
  
  const defaultTitles = {
    ventas: 'No hay ventas registradas',
    productos: 'No hay productos en el inventario',
    clientes: 'No hay clientes registrados',
    caja: 'No hay movimientos de caja',
    general: 'No hay datos disponibles'
  }
  
  const defaultDescriptions = {
    ventas: 'Comienza registrando tu primera venta',
    productos: 'Agrega productos a tu inventario para comenzar',
    clientes: 'Registra clientes para un mejor seguimiento',
    caja: 'Los movimientos aparecerán aquí una vez registrados',
    general: 'Los datos aparecerán aquí cuando estén disponibles'
  }
  
  const Icon = CustomIcon || defaultIcons[type]
  const displayTitle = title || defaultTitles[type]
  const displayDescription = description || defaultDescriptions[type]
  
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center">
      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-gray-400" />
      </div>
      
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {displayTitle}
      </h3>
      
      <p className="text-gray-500 mb-6 max-w-sm">
        {displayDescription}
      </p>
      
      {action && (
        <div className="flex justify-center">
          {action}
        </div>
      )}
    </div>
  )
}

// Loading overlay para modales y formularios
export const LoadingOverlay: React.FC<{
  isLoading: boolean
  message?: string
  children: React.ReactNode
}> = ({ isLoading, message = 'Procesando...', children }) => (
  <div className="relative">
    {children}
    
    {isLoading && (
      <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50 rounded-lg">
        <div className="flex flex-col items-center">
          <Loader2 className="w-8 h-8 animate-spin text-moto-blue mb-3" />
          <p className="text-sm font-medium text-gray-700">{message}</p>
        </div>
      </div>
    )}
  </div>
)

// Progress bar para operaciones largas
export const ProgressBar: React.FC<{
  progress: number
  message?: string
  color?: string
  showPercentage?: boolean
}> = ({ 
  progress, 
  message = 'Procesando...', 
  color = '#0ea5e9',
  showPercentage = true 
}) => {
  const clampedProgress = Math.min(Math.max(progress, 0), 100)
  
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-700">
          {message}
        </span>
        {showPercentage && (
          <span className="text-sm text-gray-500">
            {clampedProgress.toFixed(0)}%
          </span>
        )}
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <div 
          className="h-2 rounded-full transition-all duration-300 ease-out relative"
          style={{ 
            width: `${clampedProgress}%`,
            backgroundColor: color 
          }}
        >
          {/* Efecto de brillo animado */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
        </div>
      </div>
    </div>
  )
}

// Hook para manejar estados de carga
export const useLoadingState = (initialState = false) => {
  const [isLoading, setIsLoading] = React.useState(initialState)
  const [error, setError] = React.useState<string | null>(null)
  const [success, setSuccess] = React.useState(false)
  
  const withLoading = React.useCallback(async <T>(
    operation: () => Promise<T>
  ): Promise<T | null> => {
    setIsLoading(true)
    setError(null)
    setSuccess(false)
    
    try {
      const result = await operation()
      setSuccess(true)
      setTimeout(() => setSuccess(false), 2000)
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      setError(errorMessage)
      setTimeout(() => setError(null), 5000)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])
  
  const reset = React.useCallback(() => {
    setIsLoading(false)
    setError(null)
    setSuccess(false)
  }, [])
  
  return {
    isLoading,
    error,
    success,
    withLoading,
    reset
  }
}
