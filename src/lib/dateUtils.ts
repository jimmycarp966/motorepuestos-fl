/**
 * Utilidades de fecha para el sistema
 * Maneja fechas de forma consistente sin depender de la zona horaria del cliente
 */

export class DateUtils {
  /**
   * Obtiene la fecha actual en formato YYYY-MM-DD
   * Usa la zona horaria local (no UTC)
   */
  static getCurrentDate(): string {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  /**
   * Obtiene la fecha y hora actual en formato ISO
   */
  static getCurrentDateTime(): string {
    return new Date().toISOString()
  }

  /**
   * Formatea una fecha para mostrar en la UI
   */
  static formatDate(date: string | Date, format: 'short' | 'long' | 'time' = 'short'): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    
    switch (format) {
      case 'short':
        return dateObj.toLocaleDateString('es-ES', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        })
      case 'long':
        return dateObj.toLocaleDateString('es-ES', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      case 'time':
        return dateObj.toLocaleString('es-ES', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        })
      default:
        return dateObj.toLocaleDateString('es-ES')
    }
  }

  /**
   * Obtiene el rango de fechas para una semana específica
   */
  static getWeekRange(date: string | Date): { start: string; end: string } {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    const dayOfWeek = dateObj.getDay()
    const startOfWeek = new Date(dateObj)
    startOfWeek.setDate(dateObj.getDate() - dayOfWeek)
    
    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 6)
    
    return {
      start: startOfWeek.toISOString().split('T')[0],
      end: endOfWeek.toISOString().split('T')[0]
    }
  }

  /**
   * Obtiene el rango de fechas para un mes específico
   */
  static getMonthRange(date: string | Date): { start: string; end: string } {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    const year = dateObj.getFullYear()
    const month = dateObj.getMonth()
    
    const startOfMonth = new Date(year, month, 1)
    const endOfMonth = new Date(year, month + 1, 0)
    
    return {
      start: startOfMonth.toISOString().split('T')[0],
      end: endOfMonth.toISOString().split('T')[0]
    }
  }

  /**
   * Verifica si una fecha es hoy
   */
  static isToday(date: string | Date): boolean {
    const today = this.getCurrentDate()
    let dateStr: string
    
    if (typeof date === 'string') {
      // Si es string, extraer solo la parte de fecha
      dateStr = date.split('T')[0]
    } else {
      // Si es Date, usar zona horaria local
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      dateStr = `${year}-${month}-${day}`
    }
    
    return dateStr === today
  }

  /**
   * Verifica si una fecha es ayer
   */
  static isYesterday(date: string | Date): boolean {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().split('T')[0]
    const dateStr = typeof date === 'string' ? date : date.toISOString().split('T')[0]
    return dateStr === yesterdayStr
  }

  /**
   * Obtiene el nombre del día de la semana
   */
  static getDayName(date: string | Date): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    return dateObj.toLocaleDateString('es-ES', { weekday: 'long' })
  }

  /**
   * Obtiene el nombre del mes
   */
  static getMonthName(date: string | Date): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    return dateObj.toLocaleDateString('es-ES', { month: 'long' })
  }

  /**
   * Calcula la diferencia en días entre dos fechas
   */
  static daysDifference(date1: string | Date, date2: string | Date): number {
    const d1 = typeof date1 === 'string' ? new Date(date1) : date1
    const d2 = typeof date2 === 'string' ? new Date(date2) : date2
    const diffTime = Math.abs(d2.getTime() - d1.getTime())
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  /**
   * Agrega días a una fecha
   */
  static addDays(date: string | Date, days: number): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    dateObj.setDate(dateObj.getDate() + days)
    return dateObj.toISOString().split('T')[0]
  }

  /**
   * Resta días a una fecha
   */
  static subtractDays(date: string | Date, days: number): string {
    return this.addDays(date, -days)
  }

  /**
   * Obtiene el primer día del mes
   */
  static getFirstDayOfMonth(date: string | Date): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    const year = dateObj.getFullYear()
    const month = dateObj.getMonth()
    return new Date(year, month, 1).toISOString().split('T')[0]
  }

  /**
   * Obtiene el último día del mes
   */
  static getLastDayOfMonth(date: string | Date): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    const year = dateObj.getFullYear()
    const month = dateObj.getMonth()
    return new Date(year, month + 1, 0).toISOString().split('T')[0]
  }

  /**
   * Valida si una fecha es válida
   */
  static isValidDate(date: string): boolean {
    const dateObj = new Date(date)
    return dateObj instanceof Date && !isNaN(dateObj.getTime())
  }

  /**
   * Obtiene la hora actual en formato HH:MM
   */
  static getCurrentTime(): string {
    const now = new Date()
    return now.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  /**
   * Convierte una fecha a timestamp
   */
  static toTimestamp(date: string | Date): number {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    return dateObj.getTime()
  }

  /**
   * Convierte un timestamp a fecha
   */
  static fromTimestamp(timestamp: number): string {
    return new Date(timestamp).toISOString().split('T')[0]
  }
}
