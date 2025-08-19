import React from 'react'
import { cn } from '../../lib/utils'
import { MotorCard } from './motor-card'
import { TrendingUp, TrendingDown, Minus, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { cva, type VariantProps } from 'class-variance-authority'

// Variantes para indicadores de tendencia
const trendVariants = cva(
  "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold",
  {
    variants: {
      trend: {
        up: "bg-success-500/20 text-success-500 border border-success-500/30",
        down: "bg-danger-500/20 text-danger-500 border border-danger-500/30", 
        neutral: "bg-dark-bg-tertiary text-dark-text-secondary border border-dark-border",
        positive: "bg-primary-500/20 text-primary-500 border border-primary-500/30"
      }
    },
    defaultVariants: {
      trend: "neutral"
    }
  }
)

// Interfaces
export interface TrendData {
  value: number
  label: string
  type?: 'percentage' | 'currency' | 'number'
}

export interface KPICardProps {
  title: string
  value: string | number
  subtitle?: string
  icon?: React.ComponentType<any>
  color?: string
  bgColor?: string
  trend?: TrendData
  target?: number
  className?: string
  onClick?: () => void
  loading?: boolean
  animate?: boolean
  size?: 'sm' | 'default' | 'lg'
  showProgress?: boolean
}

// Componente para indicador de tendencia
const TrendIndicator: React.FC<{ trend: TrendData }> = ({ trend }) => {
  const getTrendType = () => {
    if (trend.value > 0) return 'up'
    if (trend.value < 0) return 'down'
    return 'neutral'
  }
  
  const trendType = getTrendType()
  const TrendIcon = trendType === 'up' ? TrendingUp : 
                   trendType === 'down' ? TrendingDown : Minus
  
  const formatValue = () => {
    const absValue = Math.abs(trend.value)
    switch (trend.type) {
      case 'percentage':
        return `${absValue.toFixed(1)}%`
      case 'currency':
        return `$${absValue.toLocaleString()}`
      default:
        return absValue.toString()
    }
  }
  
  return (
    <div className={cn(trendVariants({ trend: trendType }))}>
      <TrendIcon className="w-3 h-3" />
      <span>{formatValue()}</span>
      <span className="text-dark-text-secondary ml-1">{trend.label}</span>
    </div>
  )
}

// Componente para barra de progreso hacia meta
const ProgressBar: React.FC<{ current: number; target: number; color: string }> = ({ 
  current, 
  target, 
  color 
}) => {
  const percentage = Math.min((current / target) * 100, 100)
  
  return (
    <div className="mt-3">
      <div className="flex justify-between text-xs text-dark-text-secondary mb-1">
        <span>Progreso</span>
        <span>{percentage.toFixed(0)}% de meta</span>
      </div>
      <div className="w-full bg-dark-bg-tertiary rounded-full h-2 border border-dark-border">
        <div 
          className="h-2 rounded-full transition-all duration-500 relative overflow-hidden"
          style={{ 
            width: `${percentage}%`,
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

// Componente KPICard principal
export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color = '#0ea5e9',
  bgColor,
  trend,
  target,
  className,
  onClick,
  loading = false,
  animate = true,
  size = 'default',
  showProgress = false
}) => {
  const isClickable = !!onClick
  
  const sizeClasses = {
    sm: 'p-4',
    default: 'p-6', 
    lg: 'p-8'
  }
  
  const iconSizes = {
    sm: 'w-6 h-6',
    default: 'w-8 h-8',
    lg: 'w-10 h-10'
  }
  
  return (
    <MotorCard
      variant="featured"
      className={cn(
        sizeClasses[size],
        isClickable && "cursor-pointer hover:scale-[1.02] active:scale-[0.98]",
        animate && "transition-all duration-300",
        loading && "animate-pulse",
        className
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        {/* Contenido principal */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-dark-text-secondary truncate">
              {title}
            </p>
            {trend && <TrendIndicator trend={trend} />}
          </div>
          
          {/* Valor principal */}
          <div className="mb-2">
            {loading ? (
              <div className="h-8 bg-dark-bg-tertiary rounded animate-pulse" />
            ) : (
              <p className="text-3xl font-bold text-dark-text-primary leading-tight">
                {typeof value === 'number' ? value.toLocaleString() : value}
              </p>
            )}
          </div>
          
          {/* Subtítulo */}
          {subtitle && (
            <p className="text-sm text-dark-text-secondary">
              {subtitle}
            </p>
          )}
          
          {/* Barra de progreso hacia meta */}
          {showProgress && target && typeof value === 'number' && (
            <ProgressBar current={value} target={target} color={color} />
          )}
        </div>
        
        {/* Icono decorativo */}
        {Icon && (
          <div 
            className={cn(
              "rounded-xl flex items-center justify-center flex-shrink-0 ml-4",
              "shadow-lg transition-all duration-300 group-hover:scale-110",
              size === 'sm' ? 'p-2' : size === 'lg' ? 'p-4' : 'p-3'
            )}
            style={{ 
              backgroundColor: bgColor || `${color}20`,
              color: color 
            }}
          >
            <Icon className={iconSizes[size]} />
          </div>
        )}
      </div>
      
      {/* Indicador de clic si es clickable */}
      {isClickable && (
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <ArrowUpRight className="w-4 h-4 text-dark-text-secondary" />
        </div>
      )}
    </MotorCard>
  )
}

export default KPICard
