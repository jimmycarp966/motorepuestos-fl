import { useCallback, useRef, useState, useEffect } from 'react'

// Tipos para gestos
export interface TouchPoint {
  x: number
  y: number
  timestamp: number
}

export interface SwipeData {
  direction: 'left' | 'right' | 'up' | 'down'
  distance: number
  velocity: number
  duration: number
}

export interface PinchData {
  scale: number
  center: TouchPoint
}

export interface GestureCallbacks {
  onSwipe?: (data: SwipeData) => void
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onSwipeUp?: () => void
  onSwipeDown?: () => void
  onTap?: (point: TouchPoint) => void
  onDoubleTap?: (point: TouchPoint) => void
  onLongPress?: (point: TouchPoint) => void
  onPinch?: (data: PinchData) => void
  onPinchStart?: () => void
  onPinchEnd?: () => void
}

export interface GestureOptions {
  swipeThreshold?: number
  velocityThreshold?: number
  longPressDelay?: number
  doubleTapDelay?: number
  preventScroll?: boolean
  enableHapticFeedback?: boolean
}

// Hook principal para gestos táctiles
export const useGestures = (
  callbacks: GestureCallbacks = {},
  options: GestureOptions = {}
) => {
  const {
    swipeThreshold = 50,
    velocityThreshold = 0.3,
    longPressDelay = 500,
    doubleTapDelay = 300,
    preventScroll = false,
    enableHapticFeedback = true
  } = options

  const touchStartRef = useRef<TouchPoint | null>(null)
  const touchEndRef = useRef<TouchPoint | null>(null)
  const lastTapRef = useRef<TouchPoint | null>(null)
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null)
  const isPinchingRef = useRef(false)
  const initialPinchDistanceRef = useRef(0)

  // Feedback háptico
  const hapticFeedback = useCallback((type: 'light' | 'medium' | 'heavy' = 'light') => {
    if (!enableHapticFeedback || !('vibrate' in navigator)) return
    
    const patterns = {
      light: [10],
      medium: [20],
      heavy: [30]
    }
    
    navigator.vibrate(patterns[type])
  }, [enableHapticFeedback])

  // Calcular distancia entre dos puntos
  const getDistance = useCallback((point1: TouchPoint, point2: TouchPoint): number => {
    const dx = point2.x - point1.x
    const dy = point2.y - point1.y
    return Math.sqrt(dx * dx + dy * dy)
  }, [])

  // Calcular dirección del swipe
  const getSwipeDirection = useCallback((start: TouchPoint, end: TouchPoint): SwipeData['direction'] => {
    const dx = end.x - start.x
    const dy = end.y - start.y
    
    if (Math.abs(dx) > Math.abs(dy)) {
      return dx > 0 ? 'right' : 'left'
    } else {
      return dy > 0 ? 'down' : 'up'
    }
  }, [])

  // Calcular punto medio entre dos touches (para pinch)
  const getMidpoint = useCallback((touch1: Touch, touch2: Touch): TouchPoint => {
    return {
      x: (touch1.clientX + touch2.clientX) / 2,
      y: (touch1.clientY + touch2.clientY) / 2,
      timestamp: Date.now()
    }
  }, [])

  // Calcular distancia entre dos touches
  const getTouchDistance = useCallback((touch1: Touch, touch2: Touch): number => {
    const dx = touch2.clientX - touch1.clientX
    const dy = touch2.clientY - touch1.clientY
    return Math.sqrt(dx * dx + dy * dy)
  }, [])

  // Manejar inicio de touch
  const handleTouchStart = useCallback((event: TouchEvent) => {
    const touch = event.touches[0]
    const now = Date.now()

    // Limpiar timer de long press anterior
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current)
    }

    // Multi-touch (pinch)
    if (event.touches.length === 2) {
      isPinchingRef.current = true
      initialPinchDistanceRef.current = getTouchDistance(event.touches[0], event.touches[1])
      callbacks.onPinchStart?.()
      return
    }

    // Single touch
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      timestamp: now
    }

    // Configurar long press
    longPressTimerRef.current = setTimeout(() => {
      if (touchStartRef.current) {
        hapticFeedback('medium')
        callbacks.onLongPress?.(touchStartRef.current)
      }
    }, longPressDelay)

    if (preventScroll) {
      event.preventDefault()
    }
  }, [callbacks, longPressDelay, preventScroll, hapticFeedback, getTouchDistance])

  // Manejar movimiento de touch
  const handleTouchMove = useCallback((event: TouchEvent) => {
    // Pinch gesture
    if (event.touches.length === 2 && isPinchingRef.current) {
      const currentDistance = getTouchDistance(event.touches[0], event.touches[1])
      const scale = currentDistance / initialPinchDistanceRef.current
      const center = getMidpoint(event.touches[0], event.touches[1])

      callbacks.onPinch?.({ scale, center })
      
      if (preventScroll) {
        event.preventDefault()
      }
      return
    }

    // Cancelar long press si hay movimiento significativo
    if (touchStartRef.current && longPressTimerRef.current) {
      const touch = event.touches[0]
      const currentPoint = { x: touch.clientX, y: touch.clientY, timestamp: Date.now() }
      const distance = getDistance(touchStartRef.current, currentPoint)
      
      if (distance > 10) { // 10px threshold
        clearTimeout(longPressTimerRef.current)
        longPressTimerRef.current = null
      }
    }

    if (preventScroll) {
      event.preventDefault()
    }
  }, [callbacks, preventScroll, getTouchDistance, getMidpoint, getDistance])

  // Manejar fin de touch
  const handleTouchEnd = useCallback((event: TouchEvent) => {
    // Limpiar timer de long press
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current)
      longPressTimerRef.current = null
    }

    // Fin de pinch
    if (isPinchingRef.current) {
      isPinchingRef.current = false
      callbacks.onPinchEnd?.()
      return
    }

    const touch = event.changedTouches[0]
    const now = Date.now()

    touchEndRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      timestamp: now
    }

    if (!touchStartRef.current || !touchEndRef.current) return

    const distance = getDistance(touchStartRef.current, touchEndRef.current)
    const duration = touchEndRef.current.timestamp - touchStartRef.current.timestamp
    const velocity = distance / duration

    // Detectar swipe
    if (distance > swipeThreshold && velocity > velocityThreshold) {
      const direction = getSwipeDirection(touchStartRef.current, touchEndRef.current)
      
      hapticFeedback('light')
      
      const swipeData: SwipeData = {
        direction,
        distance,
        velocity,
        duration
      }

      callbacks.onSwipe?.(swipeData)
      
      // Callbacks específicos por dirección
      switch (direction) {
        case 'left':
          callbacks.onSwipeLeft?.()
          break
        case 'right':
          callbacks.onSwipeRight?.()
          break
        case 'up':
          callbacks.onSwipeUp?.()
          break
        case 'down':
          callbacks.onSwipeDown?.()
          break
      }
    } 
    // Detectar tap o double tap
    else if (distance < 10 && duration < 200) {
      // Verificar double tap
      if (lastTapRef.current && 
          (now - lastTapRef.current.timestamp) < doubleTapDelay &&
          getDistance(lastTapRef.current, touchEndRef.current) < 20) {
        
        hapticFeedback('medium')
        callbacks.onDoubleTap?.(touchEndRef.current)
        lastTapRef.current = null // Reset para evitar triple tap
      } else {
        // Single tap
        hapticFeedback('light')
        callbacks.onTap?.(touchEndRef.current)
        lastTapRef.current = touchEndRef.current
      }
    }

    // Reset
    touchStartRef.current = null
    touchEndRef.current = null
  }, [callbacks, swipeThreshold, velocityThreshold, doubleTapDelay, getDistance, getSwipeDirection, hapticFeedback])

  // Objeto con los event handlers para asignar al elemento
  const gestureHandlers = {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
    // Prevenir context menu en long press si está habilitado
    onContextMenu: preventScroll ? (e: Event) => e.preventDefault() : undefined
  }

  return gestureHandlers
}

// Hook simplificado para swipe
export const useSwipe = (
  onSwipeLeft?: () => void,
  onSwipeRight?: () => void,
  onSwipeUp?: () => void,
  onSwipeDown?: () => void,
  options?: GestureOptions
) => {
  return useGestures({
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown
  }, options)
}

// Hook para drag & drop táctil
export const useTouchDrag = (
  onDragStart?: (point: TouchPoint) => void,
  onDrag?: (point: TouchPoint, delta: { x: number, y: number }) => void,
  onDragEnd?: (point: TouchPoint) => void
) => {
  const isDraggingRef = useRef(false)
  const startPointRef = useRef<TouchPoint | null>(null)
  const lastPointRef = useRef<TouchPoint | null>(null)

  const handleTouchStart = useCallback((event: TouchEvent) => {
    const touch = event.touches[0]
    const point = {
      x: touch.clientX,
      y: touch.clientY,
      timestamp: Date.now()
    }

    startPointRef.current = point
    lastPointRef.current = point
    isDraggingRef.current = true
    
    onDragStart?.(point)
  }, [onDragStart])

  const handleTouchMove = useCallback((event: TouchEvent) => {
    if (!isDraggingRef.current || !lastPointRef.current) return

    const touch = event.touches[0]
    const currentPoint = {
      x: touch.clientX,
      y: touch.clientY,
      timestamp: Date.now()
    }

    const delta = {
      x: currentPoint.x - lastPointRef.current.x,
      y: currentPoint.y - lastPointRef.current.y
    }

    lastPointRef.current = currentPoint
    onDrag?.(currentPoint, delta)
    
    event.preventDefault()
  }, [onDrag])

  const handleTouchEnd = useCallback((event: TouchEvent) => {
    if (!isDraggingRef.current) return

    const touch = event.changedTouches[0]
    const point = {
      x: touch.clientX,
      y: touch.clientY,
      timestamp: Date.now()
    }

    isDraggingRef.current = false
    startPointRef.current = null
    lastPointRef.current = null
    
    onDragEnd?.(point)
  }, [onDragEnd])

  return {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd
  }
}

export default useGestures
