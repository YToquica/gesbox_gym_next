'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { planSchema, type PlanInput } from '../schemas'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, AlertCircle } from 'lucide-react'

interface PlanFormProps {
  initialData?: {
    nombre: string
    precio: number
    duracion_dias: number
  } | null
  onSubmit: (data: PlanInput) => void
  onCancel: () => void
  isPending: boolean
  error?: string | null
}

export function PlanForm({
  initialData,
  onSubmit,
  onCancel,
  isPending,
  error,
}: PlanFormProps) {
  const form = useForm<PlanInput>({
    resolver: zodResolver(planSchema as any),
    defaultValues: {
      nombre: '',
      precio: 0,
      duracion_dias: 30,
    },
  })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = form

  // Actualizar valores del formulario si cambian los datos iniciales (edición)
  useEffect(() => {
    if (initialData) {
      reset({
        nombre: initialData.nombre,
        precio: initialData.precio,
        duracion_dias: initialData.duracion_dias,
      })
    } else {
      reset({
        nombre: '',
        precio: 0,
        duracion_dias: 30,
      })
    }
  }, [initialData, reset])

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Alerta de Error del Servidor */}
      {error && (
        <div className="flex items-start gap-2 p-3 text-xs rounded-lg border border-brand-error/20 bg-brand-error/10 text-brand-error animate-fade-in">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <p className="font-medium">{error}</p>
        </div>
      )}

      {/* Nombre del Plan */}
      <div className="space-y-1.5">
        <Label htmlFor="nombre" className="text-xs font-semibold text-foreground">
          Nombre del Plan
        </Label>
        <Input
          id="nombre"
          type="text"
          placeholder="Ej. Mensualidad Premium, Trimestre"
          className="h-10 border-input focus:border-ring focus:ring-ring bg-surface-container-lowest"
          disabled={isPending}
          {...register('nombre')}
        />
        {errors.nombre && (
          <p className="text-[11px] font-medium text-brand-error animate-fade-in">
            {errors.nombre.message}
          </p>
        )}
      </div>

      {/* Precio (COP) */}
      <div className="space-y-1.5">
        <Label htmlFor="precio" className="text-xs font-semibold text-foreground">
          Precio (COP)
        </Label>
        <div className="relative">
          <span className="absolute left-3 top-2.5 text-sm font-semibold text-muted-foreground">$</span>
          <Input
            id="precio"
            type="number"
            placeholder="80000"
            className="pl-7 h-10 border-input focus:border-ring focus:ring-ring bg-surface-container-lowest"
            disabled={isPending}
            {...register('precio')}
          />
        </div>
        {errors.precio && (
          <p className="text-[11px] font-medium text-brand-error animate-fade-in">
            {errors.precio.message}
          </p>
        )}
      </div>

      {/* Duración (Días) */}
      <div className="space-y-1.5">
        <Label htmlFor="duracion_dias" className="text-xs font-semibold text-foreground">
          Duración (Días)
        </Label>
        <Input
          id="duracion_dias"
          type="number"
          placeholder="30"
          className="h-10 border-input focus:border-ring focus:ring-ring bg-surface-container-lowest"
          disabled={isPending}
          {...register('duracion_dias')}
        />
        {errors.duracion_dias && (
          <p className="text-[11px] font-medium text-brand-error animate-fade-in">
            {errors.duracion_dias.message}
          </p>
        )}
      </div>

      {/* Botones de Acción */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isPending}
          className="border-border text-xs"
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={isPending}
          className="bg-brand-primary text-white hover:bg-brand-primary/95 text-xs flex items-center gap-1.5 font-semibold"
        >
          {isPending ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Guardando...
            </>
          ) : (
            'Guardar Plan'
          )}
        </Button>
      </div>
    </form>
  )
}
