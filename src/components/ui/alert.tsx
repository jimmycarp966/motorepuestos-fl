import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../../lib/utils"

const alertVariants = cva(
  "relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 transition-all duration-200",
  {
    variants: {
      variant: {
        default: "bg-dark-bg-secondary border-dark-border text-dark-text-primary [&>svg]:text-primary-500",
        destructive:
          "border-danger-500/50 text-danger-500 bg-danger-500/10 border-danger-500 [&>svg]:text-danger-500",
        success:
          "border-success-500/50 text-success-500 bg-success-500/10 border-success-500 [&>svg]:text-success-500",
        warning:
          "border-warning-500/50 text-warning-500 bg-warning-500/10 border-warning-500 [&>svg]:text-warning-500",
        info:
          "border-primary-500/50 text-primary-500 bg-primary-500/10 border-primary-500 [&>svg]:text-primary-500",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>
>(({ className, variant, ...props }, ref) => (
  <div
    ref={ref}
    role="alert"
    className={cn(alertVariants({ variant }), className)}
    {...props}
  />
))
Alert.displayName = "Alert"

const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn("mb-1 font-medium leading-none tracking-tight text-dark-text-primary", className)}
    {...props}
  />
))
AlertTitle.displayName = "AlertTitle"

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm [&_p]:leading-relaxed text-dark-text-secondary", className)}
    {...props}
  />
))
AlertDescription.displayName = "AlertDescription"

export { Alert, AlertTitle, AlertDescription }
