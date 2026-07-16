'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle2, XCircle, Clock, Shield, LogOut, Check, ArrowRight } from 'lucide-react'
import { cancelarMembresiaAction, adquirirPlanAction } from '../actions'
import Link from 'next/link'

export function ClienteDashboard({ initialData }: { initialData: any }) {
  const [profile] = useState(initialData.profile)
  const [membresias, setMembresias] = useState(initialData.membresias)
  const [planes] = useState(initialData.planes)
  const [loadingAction, setLoadingAction] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  const formatCOP = (num: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(num)
  }

  const membresiaActiva = membresias.find((m: any) => m.estado === 'activo')

  const handleCancelar = async (membresiaId: string) => {
    if (!window.confirm('¿Estás seguro de que deseas cancelar tu membresía actual? Esta acción la marcará como vencida.')) return
    
    setErrorMsg('')
    setSuccessMsg('')
    setLoadingAction(true)
    const res = await cancelarMembresiaAction(membresiaId)
    setLoadingAction(false)

    if (res.success) {
      setSuccessMsg('Membresía cancelada correctamente.')
      // Actualizar vista local
      setMembresias(membresias.map((m: any) => m.id === membresiaId ? { ...m, estado: 'vencido' } : m))
    } else {
      setErrorMsg(res.error || 'Error al cancelar la membresía.')
    }
  }

  const handleAdquirir = async (planId: string) => {
    if (!window.confirm('¿Deseas adquirir este plan ahora mismo?')) return
    
    setErrorMsg('')
    setSuccessMsg('')
    setLoadingAction(true)
    const res = await adquirirPlanAction(planId)
    setLoadingAction(false)

    if (res.success) {
      setSuccessMsg('Plan adquirido correctamente. Refresca la página o contacta recepción si no se actualiza tu estado.')
      window.location.reload()
    } else {
      setErrorMsg(res.error || 'Error al adquirir el plan.')
    }
  }

  return (
    <div className="space-y-8 animate-fade-in max-w-5xl mx-auto pb-12">
      {/* Header Profile */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-brand-primary to-orange-600 text-white shadow-md">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-white/20 flex items-center justify-center font-bold text-2xl border-2 border-white/40 shrink-0">
            {profile.nombre_completo.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-2xl font-black font-heading mb-1">¡Hola, {profile.nombre_completo}!</h2>
            <p className="text-orange-100 text-sm">Gestiona tu membresía y planes desde tu portal personal.</p>
          </div>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button 
            variant="outline" 
            className="bg-white/10 text-white border-white/20 hover:bg-white/20"
            onClick={async () => {
              await fetch('/auth/signout', { method: 'POST' })
              window.location.href = '/login'
            }}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Cerrar Sesión
          </Button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-brand-error/10 text-brand-error border border-brand-error/20 text-sm font-semibold">
          {errorMsg}
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-xl bg-green-500/10 text-green-700 border border-green-500/20 text-sm font-semibold">
          {successMsg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Mi Membresía Actual */}
        <div className="lg:col-span-1 space-y-6">
          <h3 className="font-heading text-xl font-bold text-foreground">Mi Membresía</h3>
          
          {membresiaActiva ? (
            <Card className="border-green-500 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 p-3 bg-green-500 text-white rounded-bl-xl font-bold text-xs uppercase flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4" /> Activa
              </div>
              <CardHeader className="pt-8">
                <CardTitle className="text-xl font-black">{membresiaActiva.planes?.nombre}</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">Tu plan actual</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm border-t border-border pt-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Inicio:</span>
                    <span className="font-semibold">{new Date(membresiaActiva.fecha_inicio).toLocaleDateString('es-CO')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Vencimiento:</span>
                    <span className="font-bold text-foreground">{new Date(membresiaActiva.fecha_fin).toLocaleDateString('es-CO')}</span>
                  </div>
                </div>

                <div className="pt-4">
                  <Button 
                    variant="destructive" 
                    className="w-full text-xs font-semibold h-10"
                    disabled={loadingAction}
                    onClick={() => handleCancelar(membresiaActiva.id)}
                  >
                    {loadingAction ? 'Procesando...' : 'Cancelar Membresía'}
                  </Button>
                  <p className="text-[10px] text-muted-foreground text-center mt-2">
                    Si cancelas, perderás el acceso inmediatamente.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-dashed border-2 border-border shadow-none bg-surface-container-lowest">
              <CardContent className="flex flex-col items-center justify-center p-8 text-center h-48">
                <XCircle className="h-10 w-10 text-muted-foreground mb-3 stroke-1" />
                <h4 className="font-bold text-foreground">Sin membresía activa</h4>
                <p className="text-xs text-muted-foreground mt-1">Adquiere un plan para poder entrenar.</p>
              </CardContent>
            </Card>
          )}

          {/* Historial básico */}
          {membresias.length > 0 && !membresiaActiva && (
             <div className="mt-6">
               <h4 className="font-semibold text-sm mb-3">Historial</h4>
               <div className="space-y-2">
                 {membresias.slice(0, 3).map((m: any) => (
                   <div key={m.id} className="p-3 rounded-lg border border-border bg-card flex justify-between items-center text-xs">
                     <div>
                       <p className="font-bold">{m.planes?.nombre}</p>
                       <p className="text-muted-foreground">Venció el {new Date(m.fecha_fin).toLocaleDateString('es-CO')}</p>
                     </div>
                     <span className="px-2 py-1 bg-muted rounded text-[10px] uppercase font-bold text-muted-foreground">{m.estado}</span>
                   </div>
                 ))}
               </div>
             </div>
          )}
        </div>

        {/* Planes Disponibles */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="font-heading text-xl font-bold text-foreground">Planes Disponibles</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {planes.map((plan: any) => {
              const features = [
                'Acceso a zonas de pesas y cardio',
                'Uso de vestidores',
                'Asesoría básica'
              ]

              return (
                <Card key={plan.id} className="hover:shadow-md transition-shadow hover:border-brand-primary/50 relative overflow-hidden">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg font-bold text-foreground">{plan.nombre}</CardTitle>
                    <p className="text-xs text-muted-foreground">{plan.duracion_dias} días de acceso continuo</p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-black text-brand-primary">{formatCOP(plan.precio)}</span>
                    </div>

                    <ul className="space-y-2 text-xs text-muted-foreground mt-4">
                      {features.map((f, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <Check className="h-3 w-3 text-brand-primary shrink-0" /> {f}
                        </li>
                      ))}
                    </ul>

                    <Button 
                      className="w-full mt-4 group"
                      disabled={loadingAction || !!membresiaActiva}
                      onClick={() => handleAdquirir(plan.id)}
                    >
                      {loadingAction ? 'Procesando...' : membresiaActiva ? 'Ya tienes un plan' : 'Adquirir Plan'}
                      {!membresiaActiva && <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />}
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
