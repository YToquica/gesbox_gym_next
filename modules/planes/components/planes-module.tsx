'use client'

import { useState } from 'react'
import { usePlanes } from '../hooks/use-planes'
import { PlanForm } from './plan-form'
import { type PlanInput } from '../schemas'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Layers, 
  Calendar, 
  DollarSign, 
  AlertCircle, 
  Loader2,
  Lock
} from 'lucide-react'

interface PlanesModuleProps {
  profile: {
    rol: string
  }
}

export function PlanesModule({ profile }: PlanesModuleProps) {
  const isAdmin = profile.rol === 'admin'
  const {
    planes,
    isLoading,
    error,
    createPlan,
    updatePlan,
    deletePlan,
  } = usePlanes()

  // Estados para modales
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingPlan, setEditingPlan] = useState<any | null>(null)
  const [deletingPlan, setDeletingPlan] = useState<any | null>(null)

  // Estados de carga internos
  const [formPending, setFormPending] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [deletePending, setDeletePending] = useState(false)

  // Abrir modal de creación
  const handleNewPlan = () => {
    setEditingPlan(null)
    setFormError(null)
    setIsFormOpen(true)
  }

  // Abrir modal de edición
  const handleEditPlan = (plan: any) => {
    setEditingPlan(plan)
    setFormError(null)
    setIsFormOpen(true)
  }

  // Enviar formulario (Crear / Editar)
  const handleFormSubmit = async (data: PlanInput) => {
    setFormPending(true)
    setFormError(null)
    try {
      if (editingPlan) {
        const res = await updatePlan({ id: editingPlan.id, data })
        if (!res.success) {
          setFormError(res.error)
        } else {
          setIsFormOpen(false)
        }
      } else {
        const res = await createPlan(data)
        if (!res.success) {
          setFormError(res.error)
        } else {
          setIsFormOpen(false)
        }
      }
    } catch (err: any) {
      setFormError(err.message || 'Error de comunicación con el servidor.')
    } finally {
      setFormPending(false)
    }
  }

  // Confirmar eliminación
  const handleDeleteConfirm = async () => {
    if (!deletingPlan) return
    setDeletePending(true)
    try {
      const res = await deletePlan(deletingPlan.id)
      if (!res.success) {
        alert(res.error) // Mostrar error si el plan está en uso
      } else {
        setDeletingPlan(null)
      }
    } catch (err: any) {
      alert(err.message || 'Error al eliminar el plan.')
    } finally {
      setDeletePending(false)
    }
  }

  // Formateador COP
  const formatCOP = (num: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(num)
  }

  return (
    <div className="space-y-6">
      {/* Cabecera del Módulo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Administra las tarifas y duraciones de las membresías ofrecidas en el gimnasio.</p>
        </div>
        <div>
          {isAdmin ? (
            <Button
              onClick={handleNewPlan}
              className="bg-brand-primary text-white hover:bg-brand-primary/95 text-xs font-semibold h-9 gap-1.5 shadow-sm rounded-lg w-full sm:w-auto"
            >
              <Plus className="h-4 w-4" />
              Nuevo Plan
            </Button>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-dashed border-border bg-muted/30 text-xs text-muted-foreground">
              <Lock className="h-3.5 w-3.5" />
              Acceso de Solo Lectura
            </div>
          )}
        </div>
      </div>

      {/* Alerta de Error del Listado */}
      {error && (
        <div className="flex items-start gap-2 p-4 text-sm rounded-xl border border-brand-error/25 bg-brand-error/10 text-brand-error animate-fade-in">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <div>
            <p className="font-semibold">Error al cargar planes</p>
            <p className="text-xs mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Estado Cargando */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse border-border">
              <div className="h-28 bg-muted rounded-t-xl" />
              <div className="p-4 space-y-3">
                <div className="h-4 bg-muted rounded w-2/3" />
                <div className="h-3 bg-muted rounded w-1/2" />
                <div className="h-8 bg-muted rounded w-full pt-2" />
              </div>
            </Card>
          ))}
        </div>
      ) : planes.length > 0 ? (
        /* Grid de Planes */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {planes.map((plan: any) => (
            <Card 
              key={plan.id} 
              className="group border border-border bg-card hover:shadow-ambient hover:-translate-y-0.5 transition-all duration-300 rounded-xl overflow-hidden flex flex-col justify-between"
            >
              {/* Encabezado del Plan */}
              <CardHeader className="p-5 pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="p-2 rounded-lg bg-brand-primary/10 text-brand-primary">
                    <Layers className="h-4.5 w-4.5" />
                  </div>
                  
                  {/* Botones de acción solo para Admin */}
                  {isAdmin && (
                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleEditPlan(plan)}
                        className="h-8 w-8 hover:bg-muted text-muted-foreground hover:text-foreground rounded-lg"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => setDeletingPlan(plan)}
                        className="h-8 w-8 hover:bg-destructive/10 text-muted-foreground hover:text-destructive rounded-lg"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  )}
                </div>
                
                <CardTitle className="font-heading text-lg font-bold text-foreground mt-3 group-hover:text-brand-primary transition-colors">
                  {plan.nombre}
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground mt-0.5">
                  ID: #{plan.id}
                </CardDescription>
              </CardHeader>

              {/* Contenido / Tarifas */}
              <CardContent className="p-5 pt-0 space-y-4">
                <div className="flex items-baseline gap-1 py-2 border-y border-border">
                  <span className="text-3xl font-black font-heading text-foreground">
                    {formatCOP(Number(plan.precio))}
                  </span>
                  <span className="text-xs text-muted-foreground font-medium">COP</span>
                </div>

                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 text-brand-primary" />
                    <span>{plan.duracion_dias} días de duración</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-border rounded-2xl bg-card min-h-[300px]">
          <Layers className="h-12 w-12 text-muted-foreground stroke-1 mb-4" />
          <h3 className="text-base font-bold text-foreground">No hay planes creados</h3>
          <p className="text-xs text-muted-foreground max-w-sm mt-1">
            Los planes definen la oferta comercial del gimnasio. Crea tu primer plan ahora.
          </p>
          {isAdmin && (
            <Button
              onClick={handleNewPlan}
              className="mt-4 bg-brand-primary text-white hover:bg-brand-primary/95 text-xs font-semibold h-9 rounded-lg"
            >
              Crear Primer Plan
            </Button>
          )}
        </div>
      )}

      {/* Modal / Overlay del Formulario (Creación y Edición) */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity animate-fade-in">
          <div className="w-full max-w-md p-6 bg-card border border-border rounded-xl shadow-ambient relative animate-scale-up">
            <h3 className="text-lg font-bold font-heading text-foreground mb-4">
              {editingPlan ? 'Editar Plan de Membresía' : 'Nuevo Plan de Membresía'}
            </h3>
            <PlanForm
              initialData={editingPlan ? {
                nombre: editingPlan.nombre,
                precio: Number(editingPlan.precio),
                duracion_dias: Number(editingPlan.duracion_dias),
              } : null}
              onSubmit={handleFormSubmit}
              onCancel={() => setIsFormOpen(false)}
              isPending={formPending}
              error={formError}
            />
          </div>
        </div>
      )}

      {/* Modal / Overlay de Confirmación de Eliminación */}
      {deletingPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity animate-fade-in">
          <div className="w-full max-w-sm p-6 bg-card border border-border rounded-xl shadow-ambient animate-scale-up">
            <h3 className="text-base font-bold font-heading text-foreground mb-2">
              ¿Eliminar plan de membresía?
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed mb-6">
              Esta acción eliminará de forma permanente el plan <strong className="text-foreground">"{deletingPlan.nombre}"</strong>. Esta acción no se puede deshacer si el plan no tiene dependencias.
            </p>
            
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
              <Button
                variant="outline"
                onClick={() => setDeletingPlan(null)}
                disabled={deletePending}
                className="border-border text-xs"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleDeleteConfirm}
                disabled={deletePending}
                className="bg-destructive text-white hover:bg-destructive/95 text-xs font-semibold flex items-center gap-1"
              >
                {deletePending ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Eliminando...
                  </>
                ) : (
                  'Sí, Eliminar'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
