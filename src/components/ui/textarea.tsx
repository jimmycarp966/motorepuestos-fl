import * as React from "react"

import { cn } from "../../lib/utils"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  variant?: 'default' | 'error' | 'success' | 'warning'
  helperText?: string
  showIcon?: boolean
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, variant = 'default', helperText, showIcon, ...props }, ref) => {
    const getVariantStyles = () => {
      switch (variant) {
        case 'error':
          return "border-danger-500 bg-danger-500/10 focus-visible:ring-danger-500 focus-visible:border-danger-500 hover:border-danger-400"
        case 'success':
          return "border-success-500 bg-success-500/10 focus-visible:ring-success-500 focus-visible:border-success-500 hover:border-success-400"
        case 'warning':
          return "border-warning-500 bg-warning-500/10 focus-visible:ring-warning-500 focus-visible:border-warning-500 hover:border-warning-400"
        default:
          return "border-dark-border bg-dark-bg-secondary focus-visible:ring-primary-500 focus-visible:border-primary-500 hover:border-dark-border-light"
      }
    }

    const getIconColor = () => {
      switch (variant) {
        case 'error':
          return "text-danger-500"
        case 'success':
          return "text-success-500"
        case 'warning':
          return "text-warning-500"
        default:
          return "text-primary-500"
      }
    }

    return (
      <div className="w-full">
        <div className="relative">
          <textarea
            className={cn(
              "flex min-h-[100px] w-full rounded-moto border-2 px-4 py-3 text-base text-dark-text-primary placeholder-dark-text-secondary shadow-dark-sm transition-all duration-200 resize-vertical focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-offset-black disabled:cursor-not-allowed disabled:opacity-60 disabled:bg-dark-bg-primary",
              getVariantStyles(),
              className
            )}
            ref={ref}
            {...props}
          />
          {showIcon && (
            <div className={cn("absolute right-3 top-3", getIconColor())}>
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
            variant === 'error' && "text-danger-500",
            variant === 'success' && "text-success-500", 
            variant === 'warning' && "text-warning-500",
            variant === 'default' && "text-dark-text-secondary"
          )}>
            {helperText}
          </p>
        )}
      </div>
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
