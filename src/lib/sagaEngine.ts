// ================================
// MOTOR DE SAGAS PARA ACCIONES COMPUESTAS
// ================================

import { supabase } from './supabase'
import { AppStore } from '../store/types'

// ================================
// TIPOS PARA EL MOTOR DE SAGAS
// ================================

export interface SagaStep {
  id: string
  name: string
  execute: (context: SagaContext, payload: any) => Promise<any>
  compensate: (context: SagaContext, payload: any, result?: any) => Promise<void>
  retryable: boolean
  timeout?: number
  dependencies?: string[] // IDs de pasos que deben completarse antes
}

export interface SagaContext {
  sagaId: string
  store: AppStore
  results: Map<string, any>
  metadata: Record<string, any>
  startTime: Date
  currentStep?: string
  completed: Set<string>
  failed: Set<string>
  compensated: Set<string>
}

export interface SagaDefinition {
  id: string
  name: string
  description: string
  steps: SagaStep[]
  timeout?: number
  rollbackOnFailure: boolean
  persistProgress: boolean
}

export interface SagaExecution {
  sagaId: string
  definitionId: string
  status: 'pending' | 'running' | 'completed' | 'failed' | 'compensating' | 'compensated'
  context: SagaContext
  startTime: Date
  endTime?: Date
  error?: string
  progress: {
    total: number
    completed: number
    failed: number
    current?: string
  }
}

export type SagaEventType = 
  | 'saga_started'
  | 'step_started'
  | 'step_completed'
  | 'step_failed'
  | 'step_retrying'
  | 'saga_completed'
  | 'saga_failed'
  | 'compensation_started'
  | 'compensation_completed'

export interface SagaEvent {
  type: SagaEventType
  sagaId: string
  stepId?: string
  timestamp: Date
  data?: any
  error?: string
}

// ================================
// MOTOR PRINCIPAL DE SAGAS
// ================================

export class SagaEngine {
  private executions = new Map<string, SagaExecution>()
  private definitions = new Map<string, SagaDefinition>()
  private eventListeners = new Map<string, Array<(event: SagaEvent) => void>>()
  private persistentStorage: boolean

  constructor(persistentStorage = true) {
    this.persistentStorage = persistentStorage
  }

  // ================================
  // REGISTRO DE DEFINICIONES
  // ================================

  registerSaga(definition: SagaDefinition): void {
    this.definitions.set(definition.id, definition)
    console.log(`📝 [Saga] Registrada saga: ${definition.name}`)
  }

  // ================================
  // EJECUCIÓN DE SAGAS
  // ================================

  async executeSaga(
    definitionId: string, 
    payload: any, 
    store: AppStore,
    metadata: Record<string, any> = {}
  ): Promise<string> {
    const definition = this.definitions.get(definitionId)
    if (!definition) {
      throw new Error(`❌ Definición de saga no encontrada: ${definitionId}`)
    }

    const sagaId = `saga_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    const context: SagaContext = {
      sagaId,
      store,
      results: new Map(),
      metadata,
      startTime: new Date(),
      completed: new Set(),
      failed: new Set(),
      compensated: new Set()
    }

    const execution: SagaExecution = {
      sagaId,
      definitionId,
      status: 'pending',
      context,
      startTime: new Date(),
      progress: {
        total: definition.steps.length,
        completed: 0,
        failed: 0
      }
    }

    this.executions.set(sagaId, execution)

    // Emitir evento de inicio
    this.emitEvent({
      type: 'saga_started',
      sagaId,
      timestamp: new Date(),
      data: { definitionId, payload, metadata }
    })

    // Persistir si está habilitado
    if (this.persistentStorage) {
      await this.persistExecution(execution)
    }

    // Ejecutar saga en background
    this.runSaga(execution, definition, payload).catch(error => {
      console.error(`❌ [Saga] Error no capturado en saga ${sagaId}:`, error)
    })

    return sagaId
  }

  // ================================
  // EJECUCIÓN INTERNA DE SAGA
  // ================================

  private async runSaga(
    execution: SagaExecution,
    definition: SagaDefinition,
    payload: any
  ): Promise<void> {
    const { sagaId, context } = execution

    try {
      execution.status = 'running'
      console.log(`🚀 [Saga] Iniciando saga: ${definition.name} (${sagaId})`)

      // Ordenar pasos según dependencias
      const orderedSteps = this.resolveDependencies(definition.steps)

      // Ejecutar pasos en orden
      for (const step of orderedSteps) {
        await this.executeStep(execution, step, payload)
        
        // Verificar si la saga fue cancelada
        if (execution.status === 'failed') {
          break
        }
      }

      // Completar saga si todos los pasos fueron exitosos
      if (execution.status === 'running') {
        execution.status = 'completed'
        execution.endTime = new Date()
        
        this.emitEvent({
          type: 'saga_completed',
          sagaId,
          timestamp: new Date(),
          data: { results: Array.from(context.results.entries()) }
        })

        console.log(`✅ [Saga] Completada saga: ${definition.name} (${sagaId})`)
      }

    } catch (error: any) {
      console.error(`❌ [Saga] Error en saga ${sagaId}:`, error)
      
      execution.status = 'failed'
      execution.endTime = new Date()
      execution.error = error.message

      this.emitEvent({
        type: 'saga_failed',
        sagaId,
        timestamp: new Date(),
        error: error.message
      })

      // Ejecutar compensación si está habilitada
      if (definition.rollbackOnFailure) {
        await this.compensateSaga(execution, definition)
      }
    } finally {
      // Persistir estado final
      if (this.persistentStorage) {
        await this.persistExecution(execution)
      }
    }
  }

  // ================================
  // EJECUCIÓN DE PASOS INDIVIDUALES
  // ================================

  private async executeStep(
    execution: SagaExecution,
    step: SagaStep,
    payload: any
  ): Promise<void> {
    const { sagaId, context } = execution

    context.currentStep = step.id
    execution.progress.current = step.name

    this.emitEvent({
      type: 'step_started',
      sagaId,
      stepId: step.id,
      timestamp: new Date(),
      data: { stepName: step.name }
    })

    console.log(`🔄 [Saga] Ejecutando paso: ${step.name} (${step.id})`)

    let attempts = 0
    const maxAttempts = step.retryable ? 3 : 1

    while (attempts < maxAttempts) {
      try {
        // Configurar timeout si está especificado
        const executePromise = step.execute(context, payload)
        const timeoutPromise = step.timeout 
          ? new Promise((_, reject) => 
              setTimeout(() => reject(new Error(`Timeout en paso ${step.name}`)), step.timeout)
            )
          : null

        const result = timeoutPromise 
          ? await Promise.race([executePromise, timeoutPromise])
          : await executePromise

        // Guardar resultado
        context.results.set(step.id, result)
        context.completed.add(step.id)
        execution.progress.completed++

        this.emitEvent({
          type: 'step_completed',
          sagaId,
          stepId: step.id,
          timestamp: new Date(),
          data: { result }
        })

        console.log(`✅ [Saga] Completado paso: ${step.name}`)
        return

      } catch (error: any) {
        attempts++
        
        if (attempts < maxAttempts && step.retryable) {
          console.warn(`⚠️ [Saga] Reintentando paso ${step.name} (intento ${attempts}/${maxAttempts})`)
          
          this.emitEvent({
            type: 'step_retrying',
            sagaId,
            stepId: step.id,
            timestamp: new Date(),
            data: { attempt: attempts, maxAttempts }
          })

          // Esperar antes del siguiente intento (backoff exponencial)
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempts) * 1000))
        } else {
          context.failed.add(step.id)
          execution.progress.failed++
          
          this.emitEvent({
            type: 'step_failed',
            sagaId,
            stepId: step.id,
            timestamp: new Date(),
            error: error.message
          })

          throw new Error(`Falló paso ${step.name}: ${error.message}`)
        }
      }
    }
  }

  // ================================
  // COMPENSACIÓN (ROLLBACK)
  // ================================

  private async compensateSaga(
    execution: SagaExecution,
    definition: SagaDefinition
  ): Promise<void> {
    const { sagaId, context } = execution

    execution.status = 'compensating'
    
    this.emitEvent({
      type: 'compensation_started',
      sagaId,
      timestamp: new Date()
    })

    console.log(`🔄 [Saga] Iniciando compensación para saga: ${sagaId}`)

    // Compensar pasos en orden inverso
    const completedSteps = definition.steps.filter(step => context.completed.has(step.id))
    
    for (const step of completedSteps.reverse()) {
      try {
        const result = context.results.get(step.id)
        await step.compensate(context, result)
        context.compensated.add(step.id)
        
        console.log(`↩️ [Saga] Compensado paso: ${step.name}`)
        
      } catch (error: any) {
        console.error(`❌ [Saga] Error en compensación del paso ${step.name}:`, error)
        // Continuar con otros pasos de compensación
      }
    }

    execution.status = 'compensated'
    
    this.emitEvent({
      type: 'compensation_completed',
      sagaId,
      timestamp: new Date(),
      data: { compensatedSteps: Array.from(context.compensated) }
    })

    console.log(`✅ [Saga] Compensación completada para saga: ${sagaId}`)
  }

  // ================================
  // RESOLUCIÓN DE DEPENDENCIAS
  // ================================

  private resolveDependencies(steps: SagaStep[]): SagaStep[] {
    const resolved: SagaStep[] = []
    const remaining = [...steps]
    const resolvedIds = new Set<string>()

    while (remaining.length > 0) {
      let foundNext = false

      for (let i = 0; i < remaining.length; i++) {
        const step = remaining[i]
        const dependencies = step.dependencies || []
        
        // Verificar si todas las dependencias están resueltas
        if (dependencies.every(depId => resolvedIds.has(depId))) {
          resolved.push(step)
          resolvedIds.add(step.id)
          remaining.splice(i, 1)
          foundNext = true
          break
        }
      }

      if (!foundNext) {
        throw new Error('❌ Dependencias circulares detectadas en los pasos de la saga')
      }
    }

    return resolved
  }

  // ================================
  // GESTIÓN DE EVENTOS
  // ================================

  addEventListener(eventType: SagaEventType, listener: (event: SagaEvent) => void): void {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, [])
    }
    this.eventListeners.get(eventType)!.push(listener)
  }

  removeEventListener(eventType: SagaEventType, listener: (event: SagaEvent) => void): void {
    const listeners = this.eventListeners.get(eventType)
    if (listeners) {
      const index = listeners.indexOf(listener)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }

  private emitEvent(event: SagaEvent): void {
    const listeners = this.eventListeners.get(event.type) || []
    listeners.forEach(listener => {
      try {
        listener(event)
      } catch (error) {
        console.error(`❌ [Saga] Error en listener de evento ${event.type}:`, error)
      }
    })
  }

  // ================================
  // PERSISTENCIA
  // ================================

  private async persistExecution(execution: SagaExecution): Promise<void> {
    if (!this.persistentStorage) return

    try {
      // En un caso real, esto se guardaría en Supabase
      // Por ahora, usamos localStorage para demo
      const key = `saga_execution_${execution.sagaId}`
      const data = {
        ...execution,
        context: {
          ...execution.context,
          results: Array.from(execution.context.results.entries()),
          completed: Array.from(execution.context.completed),
          failed: Array.from(execution.context.failed),
          compensated: Array.from(execution.context.compensated)
        }
      }
      localStorage.setItem(key, JSON.stringify(data))
    } catch (error) {
      console.warn('⚠️ [Saga] Error al persistir ejecución:', error)
    }
  }

  // ================================
  // CONSULTAS Y ESTADO
  // ================================

  getSagaExecution(sagaId: string): SagaExecution | undefined {
    return this.executions.get(sagaId)
  }

  getAllExecutions(): SagaExecution[] {
    return Array.from(this.executions.values())
  }

  getRunningExecutions(): SagaExecution[] {
    return this.getAllExecutions().filter(exec => 
      exec.status === 'running' || exec.status === 'compensating'
    )
  }

  cancelSaga(sagaId: string): boolean {
    const execution = this.executions.get(sagaId)
    if (execution && execution.status === 'running') {
      execution.status = 'failed'
      execution.error = 'Cancelado por el usuario'
      execution.endTime = new Date()
      return true
    }
    return false
  }

  // ================================
  // LIMPIEZA
  // ================================

  cleanup(): void {
    // Limpiar ejecuciones completadas y antiguas
    const now = new Date()
    const maxAge = 24 * 60 * 60 * 1000 // 24 horas

    for (const [sagaId, execution] of this.executions.entries()) {
      const age = now.getTime() - execution.startTime.getTime()
      
      if (age > maxAge && ['completed', 'failed', 'compensated'].includes(execution.status)) {
        this.executions.delete(sagaId)
        
        // Limpiar de localStorage también
        if (this.persistentStorage) {
          try {
            localStorage.removeItem(`saga_execution_${sagaId}`)
          } catch (error) {
            console.warn('⚠️ [Saga] Error al limpiar persistencia:', error)
          }
        }
      }
    }
  }
}

// ================================
// INSTANCIA GLOBAL
// ================================

export const sagaEngine = new SagaEngine()

// Limpiar automáticamente cada hora
setInterval(() => {
  sagaEngine.cleanup()
}, 60 * 60 * 1000)

export default sagaEngine
