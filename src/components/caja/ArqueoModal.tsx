import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAppStore } from '../../store'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Separator } from '../ui/separator'
import { Alert, AlertDescription } from '../ui/alert'
import { Loader2, DollarSign, AlertTriangle, CheckCircle, XCircle } from 'lucide-react'

// Schema de validación para el formulario de arqueo
const arqueoSchema = z.object({
  efectivo_real: z.number().min(0, 'El monto debe ser mayor o igual a 0'),
  tarjeta_real: z.number().min(0, 'El monto debe ser mayor o igual a 0'),
  transferencia_real: z.number().min(0, 'El monto debe ser mayor o igual a 0'),
  observaciones: z.string().optional(),
})

type ArqueoFormData = z.infer<typeof arqueoSchema>

export function ArqueoModal() {
  const {
    arqueoActual,
    modalArqueoAbierto,
    loading,
    error,
    cerrarModalArqueo,
    finalizarArqueo,
  } = useAppStore()

  const [diferencias, setDiferencias] = useState({
    efectivo: 0,
    tarjeta: 0,
    transferencia: 0,
    total: 0,
  })

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid },
  } = useForm<ArqueoFormData>({
    resolver: zodResolver(arqueoSchema),
    defaultValues: {
      efectivo_real: 0,
      tarjeta_real: 0,
      transferencia_real: 0,
      observaciones: '',
    },
  })

  const watchedValues = watch(['efectivo_real', 'tarjeta_real', 'transferencia_real'])

  // Calcular diferencias cuando cambian los valores
  useEffect(() => {
    if (arqueoActual) {
      const [efectivoReal, tarjetaReal, transferenciaReal] = watchedValues
      
      const efectivoDiff = efectivoReal - arqueoActual.efectivo_esperado
      const tarjetaDiff = tarjetaReal - arqueoActual.tarjeta_esperado
      const transferenciaDiff = transferenciaReal - arqueoActual.transferencia_esperado
      const totalDiff = efectivoDiff + tarjetaDiff + transferenciaDiff

      setDiferencias({
        efectivo: efectivoDiff,
        tarjeta: tarjetaDiff,
        transferencia: transferenciaDiff,
        total: totalDiff,
      })
    }
  }, [watchedValues, arqueoActual])

  // Establecer valores iniciales cuando se abre el modal
  useEffect(() => {
    if (arqueoActual && modalArqueoAbierto) {
      setValue('efectivo_real', arqueoActual.efectivo_real)
      setValue('tarjeta_real', arqueoActual.tarjeta_real)
      setValue('transferencia_real', arqueoActual.transferencia_real)
      setValue('observaciones', arqueoActual.observaciones || '')
    }
  }, [arqueoActual, modalArqueoAbierto, setValue])

  const onSubmit = async (data: ArqueoFormData) => {
    if (!arqueoActual) return

    const arqueoData = {
      ...arqueoActual,
      ...data,
    }

    await finalizarArqueo(arqueoData)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
    }).format(amount)
  }

  const getDiferenciaColor = (diferencia: number) => {
    if (diferencia === 0) return 'bg-green-100 text-green-800'
    if (diferencia > 0) return 'bg-blue-100 text-blue-800'
    return 'bg-red-100 text-red-800'
  }

  const getDiferenciaIcon = (diferencia: number) => {
    if (diferencia === 0) return <CheckCircle className="h-4 w-4" />
    if (diferencia > 0) return <AlertTriangle className="h-4 w-4" />
    return <XCircle className="h-4 w-4" />
  }

  if (!modalArqueoAbierto || !arqueoActual) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-dark-bg-secondary rounded-lg shadow-dark-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-dark-text-primary">Arqueo de Caja</h2>
              <p className="text-dark-text-secondary">Fecha: {arqueoActual.fecha}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={cerrarModalArqueo}
              disabled={loading}
            >
              ✕
            </Button>
          </div>

          {error && (
            <Alert className="mb-6">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Resumen de montos esperados */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Montos Esperados
                </CardTitle>
                <CardDescription>
                  Montos calculados según las ventas del día
                </CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <Label className="text-sm font-medium text-dark-text-secondary">Efectivo</Label>
                  <p className="text-lg font-semibold text-green-600">
                    {formatCurrency(arqueoActual.efectivo_esperado)}
                  </p>
                </div>
                <div className="text-center">
                  <Label className="text-sm font-medium text-dark-text-secondary">Tarjeta</Label>
                  <p className="text-lg font-semibold text-blue-600">
                    {formatCurrency(arqueoActual.tarjeta_esperado)}
                  </p>
                </div>
                <div className="text-center">
                  <Label className="text-sm font-medium text-dark-text-secondary">Transferencia</Label>
                  <p className="text-lg font-semibold text-purple-600">
                    {formatCurrency(arqueoActual.transferencia_esperado)}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Separator />

            {/* Formulario de montos reales */}
            <Card>
              <CardHeader>
                <CardTitle>Montos Reales</CardTitle>
                <CardDescription>
                  Ingrese los montos reales contados en caja
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="efectivo_real">Efectivo Real</Label>
                    <Input
                      id="efectivo_real"
                      type="number"
                      step="0.01"
                      {...register('efectivo_real', { valueAsNumber: true })}
                      className={errors.efectivo_real ? 'border-red-500' : ''}
                    />
                    {errors.efectivo_real && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.efectivo_real.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="tarjeta_real">Tarjeta Real</Label>
                    <Input
                      id="tarjeta_real"
                      type="number"
                      step="0.01"
                      {...register('tarjeta_real', { valueAsNumber: true })}
                      className={errors.tarjeta_real ? 'border-red-500' : ''}
                    />
                    {errors.tarjeta_real && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.tarjeta_real.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="transferencia_real">Transferencia Real</Label>
                    <Input
                      id="transferencia_real"
                      type="number"
                      step="0.01"
                      {...register('transferencia_real', { valueAsNumber: true })}
                      className={errors.transferencia_real ? 'border-red-500' : ''}
                    />
                    {errors.transferencia_real && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.transferencia_real.message}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="observaciones">Observaciones</Label>
                  <Textarea
                    id="observaciones"
                    {...register('observaciones')}
                    placeholder="Observaciones sobre el arqueo..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            <Separator />

            {/* Resumen de diferencias */}
            <Card>
              <CardHeader>
                <CardTitle>Diferencias</CardTitle>
                <CardDescription>
                  Comparación entre montos esperados y reales
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <Label className="text-sm font-medium text-dark-text-secondary">Efectivo</Label>
                    <Badge className={`mt-1 ${getDiferenciaColor(diferencias.efectivo)}`}>
                      {getDiferenciaIcon(diferencias.efectivo)}
                      <span className="ml-1">{formatCurrency(diferencias.efectivo)}</span>
                    </Badge>
                  </div>
                  <div className="text-center">
                    <Label className="text-sm font-medium text-dark-text-secondary">Tarjeta</Label>
                    <Badge className={`mt-1 ${getDiferenciaColor(diferencias.tarjeta)}`}>
                      {getDiferenciaIcon(diferencias.tarjeta)}
                      <span className="ml-1">{formatCurrency(diferencias.tarjeta)}</span>
                    </Badge>
                  </div>
                  <div className="text-center">
                    <Label className="text-sm font-medium text-dark-text-secondary">Transferencia</Label>
                    <Badge className={`mt-1 ${getDiferenciaColor(diferencias.transferencia)}`}>
                      {getDiferenciaIcon(diferencias.transferencia)}
                      <span className="ml-1">{formatCurrency(diferencias.transferencia)}</span>
                    </Badge>
                  </div>
                  <div className="text-center">
                    <Label className="text-sm font-medium text-dark-text-secondary">Total</Label>
                    <Badge className={`mt-1 ${getDiferenciaColor(diferencias.total)}`}>
                      {getDiferenciaIcon(diferencias.total)}
                      <span className="ml-1">{formatCurrency(diferencias.total)}</span>
                    </Badge>
                  </div>
                </div>

                {diferencias.total !== 0 && (
                  <Alert className="mt-4">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      {diferencias.total > 0 
                        ? `Hay un sobrante de ${formatCurrency(diferencias.total)}`
                        : `Hay un faltante de ${formatCurrency(Math.abs(diferencias.total))}`
                      }
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* Botones de acción */}
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={cerrarModalArqueo}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={loading || !isValid}
                className="min-w-[120px]"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Finalizando...
                  </>
                ) : (
                  'Finalizar Arqueo'
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
