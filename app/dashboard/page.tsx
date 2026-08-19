import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Users, 
  Layers, 
  Activity, 
  ChevronRight, 
  Plus, 
  TrendingUp, 
  Dumbbell, 
  UserCheck,
  ArrowRight
} from 'lucide-react'

export const revalidate = 0 // Desactivar cache para que siempre muestre estadísticas actuales

export default async function DashboardPage() {
  const supabase = await createClient()

  // Ejecución concurrente en paralelo de las 4 consultas para máxima velocidad
  const [
    { count: totalClientes },
    { count: totalPlanes },
    { count: membresiasActivas },
    { data: ultimasAsistencias }
  ] = await Promise.all([
    supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('rol', 'cliente'),
    supabase
      .from('planes')
      .select('*', { count: 'exact', head: true }),
    supabase
      .from('membresias')
      .select('*', { count: 'exact', head: true })
      .eq('estado', 'activo'),
    supabase
      .from('asistencias')
      .select(`
        id,
        fecha_ingreso,
        profiles (
          nombre_completo,
          numero_documento
        )
      `)
      .order('fecha_ingreso', { ascending: false })
      .limit(6)
  ])

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Sección de bienvenida enérgica */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 md:p-8 rounded-2xl bg-gradient-to-r from-orange-600 via-brand-primary to-amber-600 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 space-y-1">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/20 text-white text-xs font-bold uppercase tracking-wider backdrop-blur-xs">
            <Activity className="h-3.5 w-3.5 text-amber-300" />
            Operación en Tiempo Real
          </span>
          <h2 className="text-2xl md:text-3xl font-black font-heading tracking-tight text-white drop-shadow-xs">
            ¡Bienvenido al Panel de Control!
          </h2>
          <p className="text-orange-50 text-sm max-w-xl font-medium leading-relaxed">
            Control de asistencia por cédula, gestión de planes y administración de miembros en un solo flujo continuo.
          </p>
        </div>
        
        <div className="flex flex-wrap gap-3 shrink-0 relative z-10">
          <Button asChild className="bg-white text-orange-700 hover:bg-orange-50 font-bold shadow-md h-11 px-5">
            <Link href="/dashboard/recepcion" prefetch={true} className="flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-orange-600" />
              Abrir Recepción
            </Link>
          </Button>
          <Button asChild className="bg-white/20 hover:bg-white text-white hover:text-orange-700 border border-white/60 hover:border-white font-bold backdrop-blur-xs transition-all duration-200 h-11 px-5 shadow-xs">
            <Link href="/dashboard/clientes" prefetch={true} className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Ver Clientes
            </Link>
          </Button>
        </div>

        {/* Efecto visual de fondo */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* Grid de Tarjetas Estadísticas (Kpis) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* KPI: Clientes Registrados */}
        <Card className="hover:shadow-ambient transition-all duration-300 border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Clientes Registrados</h3>
            <div className="p-2.5 rounded-xl bg-brand-primary/10 text-brand-primary border border-brand-primary/20">
              <Users className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl md:text-4xl font-black font-heading text-foreground tracking-tight">{totalClientes ?? 0}</div>
            <p className="text-xs font-medium text-muted-foreground mt-1">Registrados en la base de datos</p>
          </CardContent>
        </Card>

        {/* KPI: Membresías Activas */}
        <Card className="hover:shadow-ambient transition-all duration-300 border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Membresías Activas</h3>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-700 border border-emerald-500/20">
              <Activity className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl md:text-4xl font-black font-heading text-foreground tracking-tight">{membresiasActivas ?? 0}</div>
            <p className="text-xs font-medium text-muted-foreground mt-1">Usuarios autorizados para entrenar</p>
          </CardContent>
        </Card>

        {/* KPI: Planes Creados */}
        <Card className="hover:shadow-ambient transition-all duration-300 border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Planes Creados</h3>
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-700 border border-purple-500/20">
              <Layers className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl md:text-4xl font-black font-heading text-foreground tracking-tight">{totalPlanes ?? 0}</div>
            <p className="text-xs font-medium text-muted-foreground mt-1">Ofertas comerciales vigentes</p>
          </CardContent>
        </Card>
      </div>

      {/* Grid de Contenido Principal del Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Registro de accesos / asistencias recientes */}
        <Card className="lg:col-span-2 border-border bg-card shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between border-b border-border pb-4">
            <div>
              <h3 className="text-lg font-black font-heading text-foreground">Últimos Ingresos (Check-Ins)</h3>
              <CardDescription className="text-xs text-muted-foreground mt-0.5">Registro en tiempo real de accesos al gimnasio</CardDescription>
            </div>
            <Button asChild variant="ghost" size="sm" className="text-xs font-semibold text-brand-primary hover:text-brand-primary hover:bg-brand-primary/10 gap-1">
              <Link href="/dashboard/recepcion" prefetch={true}>
                Ir a mostrador
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="pt-4">
            {ultimasAsistencias && ultimasAsistencias.length > 0 ? (
              <div className="divide-y divide-border/60">
                {ultimasAsistencias.map((asistencia: any) => (
                  <div key={asistencia.id} className="flex items-center justify-between py-3 hover:bg-muted/30 px-2 rounded-lg transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center font-semibold text-xs border border-brand-primary/20 shrink-0">
                        <Dumbbell className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground leading-tight">
                          {asistencia.profiles?.nombre_completo ?? 'Cliente Desconocido'}
                        </p>
                        <p className="text-xs text-muted-foreground font-mono mt-0.5">
                          C.C. {asistencia.profiles?.numero_documento ?? 'N/A'}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-muted-foreground bg-muted/60 border border-border px-2.5 py-1 rounded-md">
                      {new Date(asistencia.fecha_ingreso).toLocaleTimeString('es-CO', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground border border-dashed border-border rounded-xl bg-muted/20">
                <Activity className="h-8 w-8 mb-2 text-muted-foreground stroke-1" />
                <p className="text-xs font-semibold text-foreground">No se han registrado ingresos hoy.</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">Los check-ins del mostrador aparecerán listados aquí.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Accesos directos rápidos */}
        <Card className="border-border bg-card shadow-xs">
          <CardHeader className="border-b border-border pb-4">
            <h3 className="text-lg font-black font-heading text-foreground">Accesos Rápidos</h3>
            <CardDescription className="text-xs text-muted-foreground mt-0.5">Accesos directos a la gestión operativa</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 pt-4">
            <Button asChild variant="outline" className="w-full justify-between h-11 text-sm border-border hover:bg-muted hover:text-foreground font-semibold">
              <Link href="/dashboard/recepcion" prefetch={true}>
                <span className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-md bg-emerald-500/10 text-emerald-700">
                    <UserCheck className="h-4 w-4" />
                  </div>
                  Mostrador de Check-In
                </span>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </Link>
            </Button>
            
            <Button asChild variant="outline" className="w-full justify-between h-11 text-sm border-border hover:bg-muted hover:text-foreground font-semibold">
              <Link href="/dashboard/clientes" prefetch={true}>
                <span className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-md bg-brand-primary/10 text-brand-primary">
                    <Users className="h-4 w-4" />
                  </div>
                  Directorio de Clientes
                </span>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </Link>
            </Button>
            
            <Button asChild variant="outline" className="w-full justify-between h-11 text-sm border-border hover:bg-muted hover:text-foreground font-semibold">
              <Link href="/dashboard/planes" prefetch={true}>
                <span className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-md bg-purple-500/10 text-purple-700">
                    <Layers className="h-4 w-4" />
                  </div>
                  Administrar Tarifas / Planes
                </span>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </Link>
            </Button>

            <div className="p-4 rounded-xl border border-dashed border-border bg-muted/40 mt-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-foreground uppercase tracking-wider">Caja Mostrador</p>
                <p className="text-xs text-muted-foreground mt-0.5">Control y registro de pagos</p>
              </div>
              <div className="h-9 w-9 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center border border-brand-primary/20">
                <TrendingUp className="h-4.5 w-4.5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
