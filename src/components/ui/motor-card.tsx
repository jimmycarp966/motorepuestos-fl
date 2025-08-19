import React from 'react'
import { cn } from '../../lib/utils'
import { Card, CardProps } from './card'
import { cva, type VariantProps } from 'class-variance-authority'

// Variantes para MotorCard
const motorCardVariants = cva(
  "transition-all duration-300 hover:shadow-dark-lg relative overflow-hidden group",
  {
    variants: {
      variant: {
        default: "border border-dark-border bg-dark-bg-secondary hover:shadow-dark-md hover:border-dark-border-light",
        featured: "border-2 border-primary-500/30 bg-gradient-to-br from-primary-500/10 to-secondary-500/10 hover:shadow-glow-blue hover:scale-[1.02]",
        danger: "border-danger-500/30 bg-danger-500/10 hover:bg-danger-500/20",
        success: "border-success-500/30 bg-success-500/10 hover:bg-success-500/20", 
        warning: "border-warning-500/30 bg-warning-500/10 hover:bg-warning-500/20",
        info: "border-primary-500/30 bg-primary-500/10 hover:bg-primary-500/20",
        steel: "border-secondary-500/30 bg-gradient-to-br from-secondary-500/20 to-primary-500/20 text-dark-text-primary",
        glass: "border border-white/20 bg-white/5 backdrop-blur-md",
      },
      size: {
        sm: "p-3",
        default: "p-6", 
        lg: "p-8",
        xl: "p-12"
      },
      rounded: {
        default: "rounded-lg",
        xl: "rounded-xl",
        "2xl": "rounded-2xl",
        "3xl": "rounded-3xl"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      rounded: "default"
    }
  }
)

// Props extendidas
export interface MotorCardProps 
  extends Omit<CardProps, 'className'>,
    VariantProps<typeof motorCardVariants> {
  className?: string
  glow?: boolean
  animate?: boolean
}

// Componente MotorCard mejorado
export const MotorCard = React.forwardRef<HTMLDivElement, MotorCardProps>(
  ({ className, variant, size, rounded, glow, animate, children, ...props }, ref) => {
    return (
      <Card
        ref={ref}
        className={cn(
          motorCardVariants({ variant, size, rounded }),
          glow && "shadow-glow-blue hover:shadow-glow-blue-lg",
          animate && "hover:translate-y-[-2px]",
          className
        )}
        {...props}
      >
        {/* Overlay de hover para variants especiales */}
        {(variant === 'featured' || variant === 'steel') && (
          <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 to-secondary-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        )}
        
        {/* Contenido */}
        <div className="relative z-10">
          {children}
        </div>
      </Card>
    )
  }
)

MotorCard.displayName = "MotorCard"

export { motorCardVariants }
