import React from 'react'
import { cn } from '../../lib/utils'
import { Card, CardProps } from './card'
import { cva, type VariantProps } from 'class-variance-authority'

// Variantes para MotorCard
const motorCardVariants = cva(
  "transition-all duration-300 hover:shadow-lg relative overflow-hidden group",
  {
    variants: {
      variant: {
        default: "border border-gray-200 bg-white hover:shadow-md",
        featured: "border-2 border-moto-orange/20 bg-gradient-moto-card hover:shadow-xl hover:scale-[1.02]",
        danger: "border-red-200 bg-red-50 hover:bg-red-100",
        success: "border-green-200 bg-green-50 hover:bg-green-100", 
        warning: "border-yellow-200 bg-yellow-50 hover:bg-yellow-100",
        info: "border-blue-200 bg-blue-50 hover:bg-blue-100",
        steel: "border-moto-steel/20 bg-gradient-moto-steel text-white",
        glass: "border border-white/20 bg-white/10 backdrop-blur-md",
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
          glow && "shadow-lg hover:shadow-xl",
          animate && "hover:translate-y-[-2px]",
          className
        )}
        {...props}
      >
        {/* Overlay de hover para variants especiales */}
        {(variant === 'featured' || variant === 'steel') && (
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
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
