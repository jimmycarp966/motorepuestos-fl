import { useState, useEffect, useCallback } from 'react'

// Tipos para breakpoints y dispositivos
export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
export type DeviceType = 'mobile' | 'tablet' | 'desktop'
export type Orientation = 'portrait' | 'landscape'

// Configuración de breakpoints (siguiendo Tailwind)
export const BREAKPOINTS = {
  xs: 475,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536
} as const

// Interface para el estado responsive
export interface ResponsiveState {
  width: number
  height: number
  breakpoint: Breakpoint
  deviceType: DeviceType
  orientation: Orientation
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  isPortrait: boolean
  isLandscape: boolean
  hasTouch: boolean
  pixelRatio: number
}

// Hook principal para manejo responsive
export const useResponsive = (): ResponsiveState => {
  const [state, setState] = useState<ResponsiveState>(() => {
    if (typeof window === 'undefined') {
      // SSR fallback
      return {
        width: 1024,
        height: 768,
        breakpoint: 'lg',
        deviceType: 'desktop',
        orientation: 'landscape',
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        isPortrait: false,
        isLandscape: true,
        hasTouch: false,
        pixelRatio: 1
      }
    }

    return getResponsiveState()
  })

  const updateState = useCallback(() => {
    setState(getResponsiveState())
  }, [])

  useEffect(() => {
    // Actualizar en resize con debounce
    let timeoutId: NodeJS.Timeout
    const debouncedUpdate = () => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(updateState, 100)
    }

    window.addEventListener('resize', debouncedUpdate)
    window.addEventListener('orientationchange', debouncedUpdate)

    return () => {
      window.removeEventListener('resize', debouncedUpdate)
      window.removeEventListener('orientationchange', debouncedUpdate)
      clearTimeout(timeoutId)
    }
  }, [updateState])

  return state
}

// Función para calcular el estado responsive actual
function getResponsiveState(): ResponsiveState {
  const width = window.innerWidth
  const height = window.innerHeight
  
  // Determinar breakpoint
  const breakpoint = getBreakpoint(width)
  
  // Determinar tipo de dispositivo
  const deviceType = getDeviceType(width)
  
  // Determinar orientación
  const orientation: Orientation = width > height ? 'landscape' : 'portrait'
  
  // Capacidades del dispositivo
  const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0
  const pixelRatio = window.devicePixelRatio || 1

  return {
    width,
    height,
    breakpoint,
    deviceType,
    orientation,
    isMobile: deviceType === 'mobile',
    isTablet: deviceType === 'tablet',
    isDesktop: deviceType === 'desktop',
    isPortrait: orientation === 'portrait',
    isLandscape: orientation === 'landscape',
    hasTouch,
    pixelRatio
  }
}

// Función para determinar breakpoint
function getBreakpoint(width: number): Breakpoint {
  if (width >= BREAKPOINTS['2xl']) return '2xl'
  if (width >= BREAKPOINTS.xl) return 'xl'
  if (width >= BREAKPOINTS.lg) return 'lg'
  if (width >= BREAKPOINTS.md) return 'md'
  if (width >= BREAKPOINTS.sm) return 'sm'
  return 'xs'
}

// Función para determinar tipo de dispositivo
function getDeviceType(width: number): DeviceType {
  if (width < BREAKPOINTS.md) return 'mobile'
  if (width < BREAKPOINTS.xl) return 'tablet'
  return 'desktop'
}

// Hook para detectar breakpoint específico
export const useBreakpoint = (breakpoint: Breakpoint): boolean => {
  const { width } = useResponsive()
  return width >= BREAKPOINTS[breakpoint]
}

// Hook para detectar si es móvil
export const useIsMobile = (): boolean => {
  const { isMobile } = useResponsive()
  return isMobile
}

// Hook para detectar capacidades touch
export const useTouch = (): boolean => {
  const { hasTouch } = useResponsive()
  return hasTouch
}

// Hook para media queries programáticas
export const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const mediaQuery = window.matchMedia(query)
    setMatches(mediaQuery.matches)

    const handler = (event: MediaQueryListEvent) => {
      setMatches(event.matches)
    }

    mediaQuery.addListener(handler)
    return () => mediaQuery.removeListener(handler)
  }, [query])

  return matches
}

// Hook para detectar orientación específica
export const useOrientation = (): Orientation => {
  const { orientation } = useResponsive()
  return orientation
}

// Hook para detectar cambios de orientación
export const useOrientationChange = (callback: (orientation: Orientation) => void) => {
  const orientation = useOrientation()
  const prevOrientation = usePrevious(orientation)

  useEffect(() => {
    if (prevOrientation && prevOrientation !== orientation) {
      callback(orientation)
    }
  }, [orientation, prevOrientation, callback])
}

// Hook helper para valor anterior
function usePrevious<T>(value: T): T | undefined {
  const ref = React.useRef<T>()
  useEffect(() => {
    ref.current = value
  })
  return ref.current
}

// Hook para dimensiones específicas de viewport
export const useViewportSize = () => {
  const { width, height } = useResponsive()
  
  return {
    width,
    height,
    // Dimensiones útiles
    isSmallHeight: height < 600,
    isTallScreen: height > 900,
    aspectRatio: width / height,
    // Helpers para layout
    availableHeight: height - 60, // Descontando header típico
    contentWidth: Math.min(width - 32, 1200), // Máximo con padding
  }
}

// Hook para detectar dispositivos específicos
export const useDeviceDetection = () => {
  const { hasTouch, pixelRatio, width } = useResponsive()
  
  return {
    // Tipos de dispositivo
    isPhone: width < 480,
    isTablet: width >= 480 && width < 1024,
    isDesktop: width >= 1024,
    
    // Capacidades
    hasTouch,
    isHighDPI: pixelRatio > 1.5,
    isRetina: pixelRatio >= 2,
    
    // iOS/Android detection (básico)
    isIOS: /iPad|iPhone|iPod/.test(navigator.userAgent),
    isAndroid: /Android/.test(navigator.userAgent),
    
    // Capacidades específicas
    supportsHover: window.matchMedia('(hover: hover)').matches,
    prefersReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  }
}

export default useResponsive
