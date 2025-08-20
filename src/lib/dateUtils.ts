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
    return this.getCurrentLocalDate()
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
   * Maneja correctamente las zonas horarias y fechas en diferentes formatos
   */
  static isToday(date: string | Date): boolean {
    const today = this.getCurrentLocalDate()
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

  /**
   * Obtiene la fecha y hora actual en formato ISO respetando la zona horaria local
   * Esto evita problemas de zona horaria al crear fechas
   */
  static getCurrentLocalDateTime(): string {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    const hours = String(now.getHours()).padStart(2, '0')
    const minutes = String(now.getMinutes()).padStart(2, '0')
    const seconds = String(now.getSeconds()).padStart(2, '0')
    const milliseconds = String(now.getMilliseconds()).padStart(3, '0')
    
    // Crear fecha ISO con zona horaria local
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${milliseconds}`
  }

  /**
   * Obtiene la fecha actual en formato ISO respetando la zona horaria local
   */
  static getCurrentLocalDate(): string {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  /**
   * Formatea una fecha para mostrar en la UI de manera consistente
   * Maneja problemas de zona horaria correctamente
   */
  static formatDateTimeForDisplay(dateString: string): string {
    try {
      const date = new Date(dateString)
      
      // Verificar si la fecha es válida
      if (isNaN(date.getTime())) {
        return 'Fecha inválida'
      }

      // Formatear usando la zona horaria local
      return date.toLocaleString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      })
    } catch (error) {
      console.error('Error al formatear fecha:', error)
      return 'Error de fecha'
    }
  }

  /**
   * Formatea solo la hora para mostrar en la UI
   */
  static formatTimeForDisplay(dateString: string): string {
    try {
      const date = new Date(dateString)
      
      if (isNaN(date.getTime())) {
        return 'Hora inválida'
      }

      return date.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      })
    } catch (error) {
      console.error('Error al formatear hora:', error)
      return 'Error de hora'
    }
  }

  /**
   * Verifica si una fecha está en la zona horaria correcta
   * y la ajusta si es necesario
   */
  static ensureLocalTimezone(dateString: string): string {
    try {
      const date = new Date(dateString)
      
      if (isNaN(date.getTime())) {
        return dateString
      }

      // Si la fecha parece estar en UTC, convertirla a local
      const utcDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000))
      return utcDate.toISOString()
    } catch (error) {
      console.error('Error al ajustar zona horaria:', error)
      return dateString
    }
  }

  /**
   * Compara si una fecha es igual a la fecha actual (hoy)
   * Convierte la fecha UTC a zona horaria local antes de comparar
   */
  static isSameAsToday(dateString: string): boolean {
    try {
      // Convertir la fecha UTC a zona horaria local
      const fechaUTC = new Date(dateString)
      const fechaLocal = new Date(fechaUTC.getTime() - (fechaUTC.getTimezoneOffset() * 60000))
      
      // Extraer solo la parte de fecha (YYYY-MM-DD)
      const year = fechaLocal.getFullYear()
      const month = String(fechaLocal.getMonth() + 1).padStart(2, '0')
      const day = String(fechaLocal.getDate()).padStart(2, '0')
      const fechaParteLocal = `${year}-${month}-${day}`
      
      const hoyLocal = this.getCurrentLocalDate()
      
      return fechaParteLocal === hoyLocal
    } catch (error) {
      console.error('Error al comparar fecha con hoy:', error)
      return false
    }
  }

  /**
   * Obtiene la fecha de hoy en formato YYYY-MM-DD usando zona horaria local
   * Función centralizada para evitar inconsistencias
   */
  static getTodayLocal(): string {
    return this.getCurrentLocalDate()
  }

  /**
   * Formatea una fecha y hora para mostrar en formato DD/MM/YYYY HH:MM
   */
  static formatDateTime(date: string | Date): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    
    return dateObj.toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })
  }
}
