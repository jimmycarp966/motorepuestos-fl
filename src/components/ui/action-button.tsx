import React, { useState } from 'react'
import { cn } from '../../lib/utils'
import { Button, ButtonProps } from './button'
import { Loader2, CheckCircle, AlertTriangle } from 'lucide-react'
import { cva, type VariantProps } from 'class-variance-authority'

// Variantes para ActionButton
const actionButtonVariants = cva(
  "transition-all duration-200 relative overflow-hidden",
  {
    variants: {
      variant: {
        default: "bg-white border-gray-300 text-gray-700 hover:bg-gray-50",
        primary: "bg-moto-blue text-white hover:bg-moto-darkBlue",
        secondary: "bg-moto-steel text-white hover:bg-moto-iron", 
        danger: "bg-red-500 text-white hover:bg-red-600",
        success: "bg-green-500 text-white hover:bg-green-600",
        warning: "bg-yellow-500 text-white hover:bg-yellow-600",
        motor: "bg-gradient-moto text-white hover:shadow-lg",
        steel: "bg-gradient-moto-steel text-white hover:shadow-md",
        ghost: "bg-transparent hover:bg-moto-chrome border-0",
      },
      size: {
        sm: "px-3 py-2 text-sm min-h-[36px]",
        default: "px-4 py-2 min-h-[40px]", 
        lg: "px-6 py-3 text-lg min-h-[44px]",
        xl: "px-8 py-4 text-xl min-h-[48px]"
      },
      state: {
        normal: "",
        loading: "cursor-not-allowed",
        success: "bg-green-500 border-green-500",
        error: "bg-red-500 border-red-500"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default", 
      state: "normal"
    }
  }
)

// Hook para feedback de acciones
export const useActionFeedback = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const executeWithFeedback = async (action: () => Promise<void>) => {
    setIsLoading(true)
    setError(null)
    
    try {
      await action()
      setSuccess(true)
      setTimeout(() => setSuccess(false), 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
      setTimeout(() => setError(null), 3000)
    } finally {
      setIsLoading(false)
    }
  }
  
  const reset = () => {
    setIsLoading(false)
    setSuccess(false)
    setError(null)
  }
  
  return { isLoading, success, error, executeWithFeedback, reset }
}

// Props extendidas
export interface ActionButtonProps 
  extends Omit<ButtonProps, 'className' | 'onClick'>,
    VariantProps<typeof actionButtonVariants> {
  className?: string
  onClick?: () => Promise<void> | void
  autoFeedback?: boolean
  loadingText?: string
  successText?: string
  confirmAction?: boolean
  confirmMessage?: string
  hapticFeedback?: boolean
}

// Componente ActionButton mejorado
export const ActionButton = React.forwardRef<HTMLButtonElement, ActionButtonProps>(
  ({ 
    className, 
    variant, 
    size, 
    onClick, 
    autoFeedback = false,
    loadingText,
    successText,
    confirmAction = false,
    confirmMessage = "¿Estás seguro?",
    hapticFeedback = false,
    children, 
    ...props 
  }, ref) => {
    const { isLoading, success, error, executeWithFeedback } = useActionFeedback()
    
    // Determinar estado actual
    const currentState = error ? 'error' : success ? 'success' : isLoading ? 'loading' : 'normal'
    
    const handleClick = async () => {
      if (!onClick) return
      
      // Confirmación si es requerida
      if (confirmAction && !window.confirm(confirmMessage)) {
        return
      }
      
      // Feedback háptico en dispositivos móviles
      if (hapticFeedback && 'vibrate' in navigator) {
        navigator.vibrate(50)
      }
      
      if (autoFeedback) {
        await executeWithFeedback(onClick)
      } else {
        await onClick()
      }
    }
    
    // Contenido del botón basado en estado
    const getButtonContent = () => {
      if (isLoading) {
        return (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            {loadingText || 'Procesando...'}
          </>
        )
      }
      
      if (success) {
        return (
          <>
            <CheckCircle className="w-4 h-4 mr-2" />
            {successText || '¡Éxito!'}
          </>
        )
      }
      
      if (error) {
        return (
          <>
            <AlertTriangle className="w-4 h-4 mr-2" />
            Error
          </>
        )
      }
      
      return children
    }
    
    return (
      <Button
        ref={ref}
        onClick={handleClick}
        disabled={isLoading || props.disabled}
        className={cn(
          actionButtonVariants({ variant, size, state: currentState }),
          isLoading && "scale-95",
          success && "scale-105",
          "active:scale-95 touch-manipulation",
          className
        )}
        title={error || undefined}
        {...props}
      >
        {getButtonContent()}
        
        {/* Efecto de ondas para feedback visual */}
        {(success || error) && (
          <div className={cn(
            "absolute inset-0 rounded-inherit",
            "animate-ping opacity-30",
            success ? "bg-green-400" : "bg-red-400"
          )} />
        )}
      </Button>
    )
  }
)

ActionButton.displayName = "ActionButton"

export { actionButtonVariants }
