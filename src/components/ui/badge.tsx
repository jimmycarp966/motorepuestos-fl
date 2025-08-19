import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../../lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-black",
  {
    variants: {
      variant: {
        default:
          "border-primary-500 bg-primary-500/20 text-primary-500 hover:bg-primary-500/30",
        secondary:
          "border-secondary-500 bg-secondary-500/20 text-secondary-500 hover:bg-secondary-500/30",
        destructive:
          "border-danger-500 bg-danger-500/20 text-danger-500 hover:bg-danger-500/30",
        success:
          "border-success-500 bg-success-500/20 text-success-500 hover:bg-success-500/30",
        warning:
          "border-warning-500 bg-warning-500/20 text-warning-500 hover:bg-warning-500/30",
        outline: "border-dark-border bg-dark-bg-tertiary text-dark-text-primary hover:bg-dark-bg-secondary",
        gray: "border-dark-border bg-dark-bg-secondary text-dark-text-secondary hover:bg-dark-bg-tertiary",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
