'use client'

import { useState } from 'react'
import { 
  X, 
  User, 
  Calendar, 
  Phone, 
  CreditCard, 
  Activity, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  Clock,
  FileText
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { deleteClienteAction } from '../actions'

interface ClientePreviewProps {
  detalles: {
    profile: {
      id: string
      nombre_completo: string
      tipo_documento: string
      numero_documento: string
      telefono?: string
      fecha_nacimiento?: string
      created_at: string
    }
    membresias: any[] | null
    asistencias: any[] | null
    pagos: any[] | null
  } | null
  onClose: () => void
  isLoading: boolean
  error: string | null
  userRole?: string
  onDeleteSuccess?: () => void
}

export function ClientePreview({ detalles, onClose, isLoading, error, userRole, onDeleteSuccess }: ClientePreviewProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  // Formatear COP
  const formatCOP = (num: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(num)
  }

  // Formatear fecha legible
  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'N/A'
    return new Date(dateStr).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center h-full">
        <Activity className="h-8 w-8 text-brand-primary animate-spin mb-4" />
        <p className="text-sm text-muted-foreground">Cargando ficha del cliente...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <AlertCircle className="h-8 w-8 text-brand-error mx-auto mb-2" />
        <p className="text-sm font-semibold text-foreground">Error al cargar detalles</p>
        <p className="text-xs text-muted-foreground mt-1">{error}</p>
        <Button variant="outline" size="sm" onClick={onClose} className="mt-4 border-border">
          Cerrar
        </Button>
      </div>
    )
  }

  if (!detalles) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center h-full border border-dashed border-border rounded-xl bg-card/50">
        <User className="h-12 w-12 text-muted-foreground stroke-1 mb-3" />
        <h3 className="text-sm font-bold text-foreground">Ficha del Cliente</h3>
        <p className="text-xs text-muted-foreground max-w-[240px] mt-1">
          Selecciona un cliente de la lista para ver su membresía, historial de pagos e ingresos en mostrador.
        </p>
      </div>
    )
  }

  const { profile, membresias: rawMembresias, asistencias: rawAsistencias, pagos: rawPagos } = detalles
  const membresias = rawMembresias || []
  const asistencias = rawAsistencias || []
  const pagos = rawPagos || []

  // Encontrar la membresía más reciente
  const membresiaActiva = membresias.find((m: any) => m.estado === 'activo')
  const ultimaMembresia = membresias[0]

  // Determinar estado de membresía para colores semánticos
  let statusBadge = {
    text: 'Sin membresía',
    colorClass: 'bg-muted text-muted-foreground border-border',
    icon: XCircle,
  }

  if (membresiaActiva) {
    statusBadge = {
      text: 'Activo',
      colorClass: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20',
      icon: CheckCircle2,
    }
  } else if (ultimaMembresia) {
    if (ultimaMembresia.estado === 'vencido') {
      statusBadge = {
        text: 'Vencido',
        colorClass: 'bg-destructive/10 text-destructive border-destructive/20',
        icon: XCircle,
      }
    } else if (ultimaMembresia.estado === 'congelado') {
      statusBadge = {
        text: 'Congelado',
        colorClass: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20',
        icon: Clock,
      }
    }
  }

  const StatusIcon = statusBadge.icon

  return (
    <Card className="h-full border border-border bg-card shadow-sm flex flex-col overflow-hidden">
      {/* Cabecera / Avatar */}
      <CardHeader className="p-5 border-b border-border bg-muted/20 relative">
        <div className="absolute right-4 top-4 flex items-center gap-2">
          {userRole === 'admin' && (
            <Button
              variant="destructive"
              size="sm"
              disabled={isDeleting}
              onClick={async () => {
                if (window.confirm('¿Estás seguro de que deseas eliminar este cliente? Esta acción no se puede deshacer.')) {
                  setIsDeleting(true)
                  const res = await deleteClienteAction(profile.id)
                  setIsDeleting(false)
                  if (res.success) {
                    onDeleteSuccess?.()
                  } else {
                    alert(res.error || 'Error al eliminar el cliente.')
                  }
                }
              }}
              className="h-7 text-xs px-2"
            >
              {isDeleting ? 'Eliminando...' : 'Eliminar'}
            </Button>
          )}
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        <div className="flex items-center gap-4 pt-2">
          <div className="h-14 w-14 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center font-bold text-lg border-2 border-brand-primary/20 shrink-0">
            {profile.nombre_completo.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <h3 className="font-heading text-base font-bold text-foreground truncate">
              {profile.nombre_completo}
            </h3>
            <p className="text-xs text-muted-foreground font-mono mt-0.5">
              {profile.tipo_documento}: {profile.numero_documento}
            </p>
          </div>
        </div>
      </CardHeader>

      {/* Cuerpo Desplazable */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        
        {/* Datos de Contacto */}
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div className="space-y-1">
            <span className="text-muted-foreground font-medium flex items-center gap-1">
              <Phone className="h-3 w-3 text-brand-primary" /> Teléfono
            </span>
            <p className="text-foreground font-semibold truncate">
              {profile.telefono || 'No registrado'}
            </p>
          </div>
          <div className="space-y-1">
            <span className="text-muted-foreground font-medium flex items-center gap-1">
              <Calendar className="h-3 w-3 text-brand-primary" /> Cumpleaños
            </span>
            <p className="text-foreground font-semibold">
              {profile.fecha_nacimiento ? formatDate(profile.fecha_nacimiento) : 'No registrado'}
            </p>
          </div>
        </div>

        {/* Estado de Membresía */}
        <div className="p-4 rounded-xl border border-border bg-muted/10 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-foreground uppercase tracking-wider">Membresía</span>
            <span className={`inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border ${statusBadge.colorClass}`}>
              <StatusIcon className="h-3 w-3" />
              {statusBadge.text}
            </span>
          </div>

          {membresiaActiva ? (
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Plan Actual:</span>
                <span className="font-bold text-brand-primary">{membresiaActiva.planes?.nombre}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Vigencia:</span>
                <span className="font-semibold text-foreground">
                  {new Date(membresiaActiva.fecha_inicio).toLocaleDateString('es-CO')} al {new Date(membresiaActiva.fecha_fin).toLocaleDateString('es-CO')}
                </span>
              </div>
            </div>
          ) : ultimaMembresia ? (
            <div className="space-y-2 text-xs">
              <p className="text-muted-foreground">Último plan: <strong className="text-foreground">{ultimaMembresia.planes?.nombre}</strong></p>
              <p className="text-[11px] text-muted-foreground italic">Venció el {new Date(ultimaMembresia.fecha_fin).toLocaleDateString('es-CO')}</p>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground italic">Este usuario no tiene membresías registradas.</p>
          )}
        </div>

        {/* Historial de Pagos */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
            <CreditCard className="h-3.5 w-3.5 text-brand-primary" />
            Historial de Pagos
          </h4>
          
          {pagos && pagos.length > 0 ? (
            <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
              {pagos.map((pago) => (
                <div key={pago.id} className="flex justify-between items-center p-2 rounded-lg bg-muted/40 border border-border/50 text-xs">
                  <div>
                    <p className="font-bold text-foreground">{formatCOP(pago.monto)}</p>
                    <p className="text-[10px] text-muted-foreground truncate max-w-[140px]">{pago.nombre_plan} ({pago.metodo_pago})</p>
                  </div>
                  <span className="text-[10px] text-muted-foreground">
                    {new Date(pago.fecha_pago).toLocaleDateString('es-CO')}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground italic">No hay pagos registrados para este cliente.</p>
          )}
        </div>

        {/* Historial de Asistencias */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Activity className="h-3.5 w-3.5 text-brand-primary" />
            Últimos Ingresos
          </h4>

          {asistencias && asistencias.length > 0 ? (
            <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
              {asistencias.map((ast) => (
                <div key={ast.id} className="flex justify-between items-center p-2 rounded-lg bg-muted/40 border border-border/50 text-xs">
                  <span className="text-muted-foreground">Entrada registrada</span>
                  <span className="font-medium text-foreground">
                    {new Date(ast.fecha_ingreso).toLocaleString('es-CO', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground italic">No se registran asistencias en el sistema.</p>
          )}
        </div>

      </div>
    </Card>
  )
}
