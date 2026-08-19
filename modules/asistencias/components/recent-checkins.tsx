'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Dumbbell, Activity, Calendar } from 'lucide-react'

interface RecentCheckInsProps {
  asistencias: any[]
  isLoading: boolean
  error: string | null
}

export function RecentCheckIns({ asistencias, isLoading, error }: RecentCheckInsProps) {
  // Formatear hora de ingreso legible
  const formatTime = (fechaStr: string) => {
    try {
      const date = new Date(fechaStr)
      return date.toLocaleTimeString('es-CO', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      })
    } catch {
      return 'N/A'
    }
  }

  return (
    <Card className="w-full border border-border bg-card shadow-sm flex flex-col h-full max-h-[600px] overflow-hidden">
      <CardHeader className="pb-4 border-b border-border bg-muted/20 shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-700 border border-emerald-500/20">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-black font-heading text-foreground">Ingresos Recientes (Hoy)</h3>
            <CardDescription className="text-xs text-muted-foreground">
              Últimos accesos validados en mostrador
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {error && (
          <div className="p-3 text-xs rounded-lg border border-brand-error/25 bg-brand-error/10 text-brand-error font-medium">
            <p className="font-bold">Error al cargar asistencias</p>
            <p className="text-xs mt-0.5">{error}</p>
          </div>
        )}

        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-14 rounded-xl bg-card border border-border animate-pulse flex items-center justify-between px-3">
                <div className="flex items-center gap-2.5 w-2/3">
                  <div className="h-7 w-7 rounded-full bg-muted shrink-0" />
                  <div className="space-y-1.5 w-full">
                    <div className="h-3.5 bg-muted rounded w-3/4" />
                    <div className="h-2.5 bg-muted rounded w-1/2" />
                  </div>
                </div>
                <div className="h-3 bg-muted rounded w-16" />
              </div>
            ))}
          </div>
        ) : asistencias.length > 0 ? (
          <div className="space-y-2">
            {asistencias.map((asistencia) => {
              const profile = asistencia.profiles
              return (
                <div 
                  key={asistencia.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-muted/40 border border-border/70 hover:bg-muted/70 transition-all duration-200"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-8 w-8 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center font-bold text-xs shrink-0 border border-brand-primary/20">
                      <Dumbbell className="h-4.5 w-4.5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-foreground truncate">
                        {profile?.nombre_completo || 'Cliente Desconocido'}
                      </p>
                      <p className="text-xs text-muted-foreground font-mono mt-0.5 font-medium">
                        {profile?.tipo_documento || 'CC'}: {profile?.numero_documento || 'N/A'}
                      </p>
                    </div>
                  </div>
                  
                  <span className="text-xs font-bold text-muted-foreground bg-card border border-border px-2.5 py-1 rounded-md shrink-0">
                    {formatTime(asistencia.fecha_ingreso)}
                  </span>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground border border-dashed border-border rounded-xl bg-muted/15 h-full">
            <Calendar className="h-8 w-8 mb-2 stroke-1 text-muted-foreground" />
            <h3 className="text-xs font-bold text-foreground">Sin ingresos hoy</h3>
            <p className="text-xs text-muted-foreground max-w-[200px] mt-1 font-medium">
              Las asistencias validadas aparecerán listadas aquí en tiempo real.
            </p>
          </div>
        )}
      </div>
    </Card>
  )
}
