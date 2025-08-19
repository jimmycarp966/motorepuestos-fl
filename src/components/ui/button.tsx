import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../../lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-black disabled:pointer-events-none disabled:opacity-50 shadow-dark-sm hover:shadow-dark-md",
  {
    variants: {
      variant: {
        default: "bg-primary-500 text-white hover:bg-primary-600 shadow-glow-blue hover:shadow-glow-blue-lg",
        destructive:
          "bg-danger-500 text-white hover:bg-danger-600 border border-danger-500/30",
        outline:
          "border border-dark-border bg-dark-bg-secondary text-dark-text-primary hover:bg-dark-bg-tertiary hover:border-dark-border-light",
        secondary:
          "bg-dark-bg-secondary text-dark-text-primary hover:bg-dark-bg-tertiary border border-dark-border",
        ghost: "hover:bg-dark-bg-tertiary hover:text-white text-dark-text-secondary",
        link: "text-primary-500 underline-offset-4 hover:underline hover:text-primary-400",
        success: "bg-success-500 text-white hover:bg-success-600 border border-success-500/30",
        warning: "bg-warning-500 text-white hover:bg-warning-600 border border-warning-500/30",
        violet: "bg-secondary-500 text-white hover:bg-secondary-600 shadow-glow-violet hover:shadow-glow-violet-lg",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3 text-xs",
        lg: "h-11 rounded-md px-8 text-base",
        xl: "h-12 rounded-lg px-10 text-lg",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
