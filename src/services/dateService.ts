import { format, parseISO, startOfDay, endOfDay, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns'
import { es } from 'date-fns/locale'

/**
 * Utilidades para manejo de fechas en el sistema
 * Proporciona funciones para formateo, rangos y cálculos de fechas
 */

export interface DateRange {
  start: Date
  end: Date
}

export interface FormattedDate {
  short: string
  long: string
  time: string
  full: string
}

/**
 * Formatea una fecha en múltiples formatos
 */
export const formatDate = (date: Date | string): FormattedDate => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  
  return {
    short: format(dateObj, 'dd/MM/yyyy', { locale: es }),
    long: format(dateObj, 'EEEE, d \'de\' MMMM \'de\' yyyy', { locale: es }),
    time: format(dateObj, 'HH:mm', { locale: es }),
    full: format(dateObj, 'dd/MM/yyyy HH:mm', { locale: es })
  }
}

/**
 * Obtiene el rango de fechas para hoy
 */
export const getTodayRange = (): DateRange => {
  const today = new Date()
  return {
    start: startOfDay(today),
    end: endOfDay(today)
  }
}

/**
 * Obtiene el rango de fechas para ayer
 */
export const getYesterdayRange = (): DateRange => {
  const yesterday = subDays(new Date(), 1)
  return {
    start: startOfDay(yesterday),
    end: endOfDay(yesterday)
  }
}

/**
 * Obtiene el rango de fechas para esta semana
 */
export const getThisWeekRange = (): DateRange => {
  const today = new Date()
  return {
    start: startOfWeek(today, { locale: es }),
    end: endOfWeek(today, { locale: es })
  }
}

/**
 * Obtiene el rango de fechas para este mes
 */
export const getThisMonthRange = (): DateRange => {
  const today = new Date()
  return {
    start: startOfMonth(today),
    end: endOfMonth(today)
  }
}

/**
 * Obtiene el rango de fechas para los últimos N días
 */
export const getLastDaysRange = (days: number): DateRange => {
  const end = new Date()
  const start = subDays(end, days - 1)
  return {
    start: startOfDay(start),
    end: endOfDay(end)
  }
}

/**
 * Convierte un rango de fechas a formato ISO para consultas
 */
export const rangeToISO = (range: DateRange): { start: string; end: string } => {
  return {
    start: range.start.toISOString(),
    end: range.end.toISOString()
  }
}

/**
 * Verifica si una fecha está dentro de un rango
 */
export const isDateInRange = (date: Date | string, range: DateRange): boolean => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  return dateObj >= range.start && dateObj <= range.end
}

/**
 * Obtiene el nombre del mes en español
 */
export const getMonthName = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  return format(dateObj, 'MMMM', { locale: es })
}

/**
 * Obtiene el nombre del día de la semana en español
 */
export const getDayName = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  return format(dateObj, 'EEEE', { locale: es })
}

/**
 * Calcula la diferencia en días entre dos fechas
 */
export const getDaysDifference = (date1: Date | string, date2: Date | string): number => {
  const d1 = typeof date1 === 'string' ? parseISO(date1) : date1
  const d2 = typeof date2 === 'string' ? parseISO(date2) : date2
  const diffTime = Math.abs(d2.getTime() - d1.getTime())
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

/**
 * Formatea una cantidad de dinero
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 2
  }).format(amount)
}

/**
 * Formatea un número con separadores de miles
 */
export const formatNumber = (number: number): string => {
  return new Intl.NumberFormat('es-AR').format(number)
} 