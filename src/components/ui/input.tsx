import * as React from "react"
import { cn } from "../../lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  // Extends HTML input attributes
  variant?: 'default' | 'error' | 'success' | 'warning'
  helperText?: string
  showIcon?: boolean
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, variant = 'default', helperText, showIcon, ...props }, ref) => {
    const getVariantStyles = () => {
      switch (variant) {
        case 'error':
          return "border-red-500 bg-red-50 focus-visible:ring-red-500 focus-visible:border-red-500 hover:border-red-600"
        case 'success':
          return "border-green-500 bg-green-50 focus-visible:ring-green-500 focus-visible:border-green-500 hover:border-green-600"
        case 'warning':
          return "border-yellow-500 bg-yellow-50 focus-visible:ring-yellow-500 focus-visible:border-yellow-500 hover:border-yellow-600"
        default:
          return "border-slate-300 bg-white focus-visible:ring-moto-blue focus-visible:border-moto-blue hover:border-slate-400"
      }
    }

    const getIconColor = () => {
      switch (variant) {
        case 'error':
          return "text-red-500"
        case 'success':
          return "text-green-500"
        case 'warning':
          return "text-yellow-500"
        default:
          return "text-moto-blue"
      }
    }

    return (
      <div className="w-full">
        <div className="relative">
          <input
            type={type}
            className={cn(
              "flex h-11 w-full rounded-moto border-2 px-4 py-3 text-base text-slate-800 placeholder-slate-500 shadow-sm transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-60 disabled:bg-slate-50",
              getVariantStyles(),
              className
            )}
            ref={ref}
            {...props}
          />
          {showIcon && (
            <div className={cn("absolute right-3 top-1/2 transform -translate-y-1/2", getIconColor())}>
              {variant === 'error' && (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              )}
              {variant === 'success' && (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              )}
              {variant === 'warning' && (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              )}
            </div>
          )}
        </div>
        {helperText && (
          <p className={cn(
            "text-sm mt-2 flex items-center gap-1.5",
            variant === 'error' && "text-red-600",
            variant === 'success' && "text-green-600", 
            variant === 'warning' && "text-yellow-600",
            variant === 'default' && "text-slate-500"
          )}>
            {helperText}
          </p>
        )}
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input }
