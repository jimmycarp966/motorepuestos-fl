import React from 'react'
import { cn } from '../../lib/utils'

// Props base para todos los iconos
interface IconProps {
  className?: string
  size?: number
  color?: string
}

// Icono de Motor/Engine
export const MotorIcon: React.FC<IconProps> = ({ className, size = 24, color = 'currentColor' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={cn("transition-all duration-200", className)}
  >
    <path
      d="M4 8h2v8H4V8zm4-2h2v12H8V6zm4-2h2v12h-2V4zm4 2h2v8h-2V6z"
      fill={color}
      fillOpacity="0.3"
    />
    <path
      d="M3 7h18v10H3V7zm2 2v6h14V9H5z"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="8" cy="12" r="1.5" fill={color} />
    <circle cx="16" cy="12" r="1.5" fill={color} />
  </svg>
)

// Icono de Frenos
export const BrakesIcon: React.FC<IconProps> = ({ className, size = 24, color = 'currentColor' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={cn("transition-all duration-200", className)}
  >
    <circle
      cx="12"
      cy="12"
      r="8"
      stroke={color}
      strokeWidth="2"
      fill="none"
    />
    <circle
      cx="12"
      cy="12"
      r="4"
      stroke={color}
      strokeWidth="1.5"
      fill={color}
      fillOpacity="0.2"
    />
    <path
      d="M12 4v4m0 8v4m8-8h-4m-8 0H4"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
)

// Icono de Transmisión
export const TransmissionIcon: React.FC<IconProps> = ({ className, size = 24, color = 'currentColor' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={cn("transition-all duration-200", className)}
  >
    <path
      d="M4 8h16v8H4V8z"
      stroke={color}
      strokeWidth="1.5"
      fill={color}
      fillOpacity="0.1"
    />
    <path
      d="M8 10v4m4-4v4m4-4v4"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M2 12h20"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
)

// Icono de Sistema Eléctrico
export const ElectricIcon: React.FC<IconProps> = ({ className, size = 24, color = 'currentColor' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={cn("transition-all duration-200", className)}
  >
    <path
      d="M13 2L3 14h7l-1 8 10-12h-7l1-8z"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill={color}
      fillOpacity="0.2"
    />
  </svg>
)

// Icono de Neumáticos
export const TireIcon: React.FC<IconProps> = ({ className, size = 24, color = 'currentColor' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={cn("transition-all duration-200", className)}
  >
    <circle
      cx="12"
      cy="12"
      r="8"
      stroke={color}
      strokeWidth="2"
      fill="none"
    />
    <circle
      cx="12"
      cy="12"
      r="3"
      stroke={color}
      strokeWidth="2"
      fill={color}
      fillOpacity="0.1"
    />
    <path
      d="M12 4v2m0 12v2m8-8h-2m-12 0H4"
      stroke={color}
      strokeWidth="1"
      strokeLinecap="round"
    />
    <path
      d="M18.36 5.64l-1.41 1.41m-9.9 9.9l-1.41 1.41m12.72 0l-1.41-1.41m-9.9-9.9L5.64 5.64"
      stroke={color}
      strokeWidth="1"
      strokeLinecap="round"
    />
  </svg>
)

// Icono de Aceite/Lubricantes
export const OilIcon: React.FC<IconProps> = ({ className, size = 24, color = 'currentColor' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={cn("transition-all duration-200", className)}
  >
    <path
      d="M6 2h12v6l-2 14H8L6 8V2z"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill={color}
      fillOpacity="0.1"
    />
    <path
      d="M8 6h8"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <circle cx="12" cy="14" r="2" fill={color} fillOpacity="0.5" />
  </svg>
)

// Icono de Herramientas
export const ToolsIcon: React.FC<IconProps> = ({ className, size = 24, color = 'currentColor' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={cn("transition-all duration-200", className)}
  >
    <path
      d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.77 3.77z"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill={color}
      fillOpacity="0.1"
    />
  </svg>
)

// Icono de Batería
export const BatteryIcon: React.FC<IconProps> = ({ className, size = 24, color = 'currentColor' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={cn("transition-all duration-200", className)}
  >
    <rect
      x="2"
      y="7"
      width="16"
      height="10"
      rx="2"
      stroke={color}
      strokeWidth="1.5"
      fill={color}
      fillOpacity="0.1"
    />
    <rect
      x="18"
      y="10"
      width="2"
      height="4"
      rx="1"
      fill={color}
    />
    <rect
      x="4"
      y="9"
      width="3"
      height="6"
      rx="1"
      fill={color}
      fillOpacity="0.6"
    />
    <rect
      x="8"
      y="9"
      width="3"
      height="6"
      rx="1"
      fill={color}
      fillOpacity="0.4"
    />
    <rect
      x="12"
      y="9"
      width="3"
      height="6"
      rx="1"
      fill={color}
      fillOpacity="0.2"
    />
  </svg>
)

// Icono de Velocímetro/Dashboard
export const SpeedometerIcon: React.FC<IconProps> = ({ className, size = 24, color = 'currentColor' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={cn("transition-all duration-200", className)}
  >
    <path
      d="M12 2a10 10 0 0 1 7.07 17.07L12 12V2z"
      fill={color}
      fillOpacity="0.2"
    />
    <circle
      cx="12"
      cy="12"
      r="10"
      stroke={color}
      strokeWidth="1.5"
      fill="none"
    />
    <path
      d="M12 6v6l4 2"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
    <circle cx="12" cy="12" r="1" fill={color} />
  </svg>
)

// Mapeo de categorías a iconos
export const categoriaIcons = {
  'Motores': MotorIcon,
  'Frenos': BrakesIcon,
  'Transmisión': TransmissionIcon,
  'Eléctrico': ElectricIcon,
  'Neumáticos': TireIcon,
  'Lubricantes': OilIcon,
  'Herramientas': ToolsIcon,
  'Batería': BatteryIcon,
  'Carrocería': ToolsIcon, // Reutilizar por ahora
  'Accesorios': ToolsIcon,
  'Combustible': OilIcon,
  'Iluminación': ElectricIcon,
  'Audio': ElectricIcon,
  'Seguridad': ToolsIcon,
  'Otros': ToolsIcon,
  'Dashboard': SpeedometerIcon,
} as const

// Función helper para obtener icono por categoría
export const getCategoriaIcon = (categoria: string) => {
  return categoriaIcons[categoria as keyof typeof categoriaIcons] || ToolsIcon
}

// Componente genérico para mostrar icono de categoría
export const CategoriaIcon: React.FC<{
  categoria: string
  className?: string
  size?: number
  color?: string
}> = ({ categoria, ...props }) => {
  const IconComponent = getCategoriaIcon(categoria)
  return <IconComponent {...props} />
}

// Componente con micro-interacciones
export const InteractiveIcon: React.FC<IconProps & {
  categoria?: string
  hover?: boolean
  pulse?: boolean
  spin?: boolean
}> = ({ 
  categoria, 
  className, 
  hover = true, 
  pulse = false, 
  spin = false, 
  ...props 
}) => {
  const IconComponent = categoria ? getCategoriaIcon(categoria) : MotorIcon
  
  return (
    <div className={cn(
      "inline-flex items-center justify-center",
      hover && "hover:scale-110 hover:rotate-3",
      pulse && "animate-pulse",
      spin && "animate-spin",
      "transition-all duration-300 ease-in-out",
      className
    )}>
      <IconComponent {...props} />
    </div>
  )
}
