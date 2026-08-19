'use client'

import { useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { 
  CheckCircle2, 
  XCircle, 
  Search, 
  ScanLine, 
  Loader2, 
  AlertTriangle,
  User,
  Calendar,
  X,
  CreditCard
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { UseFormReturn } from 'react-hook-form'
import { CheckInInput } from '../schemas'

interface PanelCheckInProps {
  form: UseFormReturn<CheckInInput>
  onSubmit: (data: CheckInInput) => void
  isPending: boolean
  lastResult: {
    status: 'success' | 'error' | 'idle'
    message: string
    code?: string
    data?: any
  } | null
  clearLastResult: () => void
  inputRef: React.MutableRefObject<HTMLInputElement | null>
}

export function PanelCheckIn({
  form,
  onSubmit,
  isPending,
  lastResult,
  clearLastResult,
  inputRef,
}: PanelCheckInProps) {
  const { register, handleSubmit, formState: { errors } } = form

  // Autofocus al cargar el componente
  useEffect(() => {
    inputRef.current?.focus()
  }, [inputRef])

  // Atajo de teclado: Escape limpia la pantalla de resultado inmediatamente
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && lastResult) {
        clearLastResult()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [lastResult, clearLastResult])

  // Desestructurar registro de react-hook-form para fusionar refs y eventos
  const { ref: registerRef, onChange: formOnChange, ...restRegister } = register('numero_documento')

  // Calcular días restantes de la membresía activa
  const getDaysLeft = (fechaFinStr: string) => {
    try {
      const fechaFin = new Date(fechaFinStr + 'T00:00:00')
      const hoy = new Date()
      // Establecer a medianoche para comparar días enteros
      hoy.setHours(0, 0, 0, 0)
      fechaFin.setHours(0, 0, 0, 0)
      
      const diffTime = fechaFin.getTime() - hoy.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      
      if (diffDays < 0) return 'Vencida'
      if (diffDays === 0) return 'Vence hoy'
      if (diffDays === 1) return 'Queda 1 día'
      return `Quedan ${diffDays} días`
    } catch {
      return ''
    }
  }

  return (
    <Card className="w-full border border-border bg-card shadow-sm hover:shadow-ambient transition-all duration-300">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-brand-primary/10 text-brand-primary border border-brand-primary/20">
            <ScanLine className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-lg font-black font-heading text-foreground">Control de Acceso y Validación</h3>
            <CardDescription className="text-xs text-muted-foreground">
              Digita o escanea el documento de identidad del cliente
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Formulario de Entrada */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
          <div className="space-y-1.5">
            <Label htmlFor="numero_documento" className="text-xs font-bold text-foreground">
              Cédula / Documento de Identidad
            </Label>
            <div className="relative flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4.5 w-4.5 text-muted-foreground" />
                <Input
                  id="numero_documento"
                  type="text"
                  placeholder="Ej. 1020304050"
                  className={cn(
                    "pl-10 h-11 border-input focus:border-ring focus:ring-ring text-base font-mono tracking-wider shadow-xs bg-surface-container-lowest",
                    errors.numero_documento && "border-brand-error focus:ring-brand-error"
                  )}
                  disabled={isPending}
                  {...restRegister}
                  onChange={(e) => {
                    if (lastResult) clearLastResult()
                    formOnChange(e)
                  }}
                  ref={(e) => {
                    registerRef(e)
                    inputRef.current = e
                  }}
                />
              </div>
              <Button 
                type="submit" 
                disabled={isPending}
                className="bg-brand-primary text-white hover:bg-brand-primary/90 h-11 px-5 text-sm font-bold shadow-sm shrink-0"
              >
                {isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Validar'
                )}
              </Button>
            </div>
            {errors.numero_documento && (
              <p className="text-xs font-semibold text-brand-error animate-fade-in mt-1">
                {errors.numero_documento.message}
              </p>
            )}
          </div>
        </form>

        {/* Visualización del Resultado de Check-In */}
        {lastResult && (
          <div className="relative animate-fade-in">
            {/* Botón de limpiar */}
            <button
              onClick={clearLastResult}
              className="absolute right-3 top-3 p-1.5 rounded-full bg-black/10 hover:bg-black/20 text-foreground transition-colors z-10"
              title="Limpiar pantalla (Esc)"
              aria-label="Cerrar resultado de validación"
            >
              <X className="h-4 w-4" />
            </button>

            {lastResult.status === 'success' ? (
              /* ESTADO: ACCESO AUTORIZADO (VERDE) */
              <div className="border border-emerald-300 dark:border-emerald-800/40 rounded-2xl bg-emerald-500/15 dark:bg-emerald-950/30 p-5 md:p-6 flex flex-col items-center text-center space-y-4 shadow-xs">
                <div className="h-16 w-16 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/40 animate-pulse">
                  <CheckCircle2 className="h-10 w-10 stroke-[2.5]" />
                </div>
                
                <div className="space-y-1">
                  <span className="text-[11px] tracking-widest font-black uppercase text-emerald-800 dark:text-emerald-400">
                    Ingreso Registrado
                  </span>
                  <h3 className="font-heading font-black text-2xl text-emerald-800 dark:text-emerald-300 leading-tight">
                    {lastResult.message}
                  </h3>
                </div>

                <div className="w-full bg-card rounded-xl border border-emerald-200 dark:border-emerald-800/30 p-4 space-y-3 text-left shadow-xs">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 flex items-center justify-center font-black text-base border border-emerald-500/30">
                      {lastResult.data.profile.nombre_completo.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-foreground truncate">
                        {lastResult.data.profile.nombre_completo}
                      </p>
                      <p className="text-xs text-muted-foreground font-mono">
                        {lastResult.data.profile.tipo_documento || 'CC'}: {lastResult.data.profile.numero_documento}
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-border pt-2.5 flex flex-col gap-2 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground font-medium flex items-center gap-1">
                        <CreditCard className="h-3.5 w-3.5 text-emerald-700" /> Plan Adquirido:
                      </span>
                      <span className="font-bold text-foreground">
                        {lastResult.data.membresiaActiva.planes?.nombre}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground font-medium flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 text-emerald-700" /> Fecha Vencimiento:
                      </span>
                      <span className="font-bold text-foreground">
                        {new Date(lastResult.data.membresiaActiva.fecha_fin + 'T00:00:00').toLocaleDateString('es-CO')}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mt-1 pt-1.5 border-t border-dashed border-border">
                      <span className="text-muted-foreground text-xs uppercase font-bold tracking-wider">Vigencia:</span>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 uppercase tracking-wide">
                        {getDaysLeft(lastResult.data.membresiaActiva.fecha_fin)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* ESTADO: ACCESO DENEGADO (ROJO) */
              <div className="border border-red-300 dark:border-red-900/40 rounded-2xl bg-red-500/15 dark:bg-red-950/30 p-5 md:p-6 flex flex-col items-center text-center space-y-4 shadow-xs animate-shake">
                <div className="h-16 w-16 rounded-full bg-red-500/20 text-red-700 dark:text-red-400 flex items-center justify-center border border-red-500/40">
                  <XCircle className="h-10 w-10 stroke-[2.5]" />
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] tracking-widest font-black uppercase text-red-800 dark:text-red-400">
                    Ingreso Bloqueado
                  </span>
                  <h3 className="font-heading font-black text-2xl text-red-700 dark:text-red-300 leading-tight">
                    Acceso Denegado
                  </h3>
                </div>

                {lastResult.code === 'CLIENT_NOT_FOUND' ? (
                  <div className="w-full bg-card rounded-xl border border-red-200 dark:border-red-900/30 p-4 text-center">
                    <AlertTriangle className="h-6 w-6 text-red-600 mx-auto mb-2" />
                    <p className="text-xs font-bold text-foreground">Cliente No Encontrado</p>
                    <p className="text-xs text-muted-foreground mt-1 max-w-[260px] mx-auto font-medium">
                      El número de documento ingresado no coincide con ningún cliente registrado. Realiza la afiliación en Clientes primero.
                    </p>
                  </div>
                ) : (
                  <div className="w-full bg-card rounded-xl border border-red-200 dark:border-red-900/30 p-4 space-y-3 text-left shadow-xs">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-red-500/20 text-red-700 dark:text-red-400 flex items-center justify-center font-black text-base border border-red-500/30">
                        {lastResult.data.profile.nombre_completo.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-foreground truncate">
                          {lastResult.data.profile.nombre_completo}
                        </p>
                        <p className="text-xs text-muted-foreground font-mono">
                          {lastResult.data.profile.tipo_documento || 'CC'}: {lastResult.data.profile.numero_documento}
                        </p>
                      </div>
                    </div>

                    <div className="border-t border-border pt-2.5 flex flex-col gap-1 text-xs">
                      <p className="text-red-700 dark:text-red-400 font-bold flex items-center gap-1.5">
                        <AlertTriangle className="h-4 w-4 shrink-0" />
                        {lastResult.message}
                      </p>
                      {lastResult.data.ultimaMembresia ? (
                        <div className="mt-1 pt-1 border-t border-dashed border-border text-xs text-muted-foreground">
                          <p>Último plan: <strong className="text-foreground">{lastResult.data.ultimaMembresia.planes?.nombre}</strong></p>
                          <p>Expiró el: {new Date(lastResult.data.ultimaMembresia.fecha_fin + 'T00:00:00').toLocaleDateString('es-CO')}</p>
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground italic mt-1 font-medium">Este cliente no registra membresías anteriores.</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {/* Nota de auto-limpieza */}
            <p className="text-xs text-center text-muted-foreground mt-2 font-medium">
              Pulsa <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border text-[10px] font-mono font-bold">Esc</kbd> o escribe para despachar al siguiente.
            </p>
          </div>
        )}

        {/* Estado inicial */}
        {!lastResult && !isPending && (
          <div className="flex flex-col items-center justify-center p-8 text-center border-2 border-dashed border-border rounded-2xl bg-muted/20 min-h-[180px]">
            <User className="h-10 w-10 text-muted-foreground stroke-1 mb-2 animate-pulse" />
            <h3 className="text-xs font-bold text-foreground">Mostrador listo para recibir</h3>
            <p className="text-xs text-muted-foreground max-w-xs mt-1 font-medium">
              Coloca el foco en el campo de texto superior y escanea el código de barras o ingresa el documento del miembro.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
