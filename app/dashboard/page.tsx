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
  ArrowUpRight 
} from 'lucide-react'

export const revalidate = 0 // Desactivar cache para que siempre muestre estadísticas actuales

export default async function DashboardPage() {
  const supabase = await createClient()

  // 1. Obtener conteo de clientes
  const { count: totalClientes } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('rol', 'cliente')

  // 2. Obtener conteo de planes
  const { count: totalPlanes } = await supabase
    .from('planes')
    .select('*', { count: 'exact', head: true })

  // 3. Obtener membresías activas
  const { count: membresiasActivas } = await supabase
    .from('membresias')
    .select('*', { count: 'exact', head: true })
    .eq('estado', 'activo')

  // 4. Obtener las últimas asistencias para dar interactividad visual
  const { data: ultimasAsistencias } = await supabase
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
    .limit(5)

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Sección de bienvenida */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-brand-primary to-orange-600 text-white shadow-md">
        <div>
          <h2 className="text-2xl font-black font-heading mb-1">¡Bienvenido al Panel de Control!</h2>
          <p className="text-orange-100 text-sm">Gestiona planes de membresía, previsualiza y busca clientes registrados de forma ágil.</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button asChild variant="outline" className="bg-white/10 text-white border-white/20 hover:bg-white/20">
            <Link href="/dashboard/clientes">
              Ver Clientes
            </Link>
          </Button>
          <Button asChild className="bg-white text-brand-primary hover:bg-white/90">
            <Link href="/dashboard/planes" className="flex items-center gap-1">
              <Plus className="h-4 w-4" />
              Nuevo Plan
            </Link>
          </Button>
        </div>
      </div>

      {/* Grid de Tarjetas Estadísticas (Kpis) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-l-4 border-l-brand-primary hover:shadow-ambient transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Clientes Registrados</CardTitle>
            <div className="p-2 rounded-lg bg-brand-primary/10 text-brand-primary">
              <Users className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black font-heading text-foreground">{totalClientes ?? 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Registrados en la base de datos</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500 hover:shadow-ambient transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Membresías Activas</CardTitle>
            <div className="p-2 rounded-lg bg-green-500/10 text-green-600">
              <Activity className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black font-heading text-foreground">{membresiasActivas ?? 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Usuarios autorizados para entrenar</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500 hover:shadow-ambient transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Planes Creados</CardTitle>
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-600">
              <Layers className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black font-heading text-foreground">{totalPlanes ?? 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Ofertas comerciales vigentes</p>
          </CardContent>
        </Card>
      </div>

      {/* Grid de Contenido Principal del Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Registro de accesos / asistencias recientes */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg font-bold font-heading">Últimos Ingresos (Check-Ins)</CardTitle>
            <CardDescription>Registro en tiempo real de accesos al gimnasio</CardDescription>
          </CardHeader>
          <CardContent>
            {ultimasAsistencias && ultimasAsistencias.length > 0 ? (
              <div className="divide-y divide-border">
                {ultimasAsistencias.map((asistencia: any) => (
                  <div key={asistencia.id} className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-foreground font-semibold text-xs">
                        <Dumbbell className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          {asistencia.profiles?.nombre_completo ?? 'Cliente Desconocido'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          C.C. {asistencia.profiles?.numero_documento ?? 'N/A'}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground font-medium">
                      {new Date(asistencia.fecha_ingreso).toLocaleTimeString('es-CO', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                <Activity className="h-8 w-8 mb-2 stroke-1" />
                <p className="text-sm">No se han registrado ingresos hoy.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Accesos directos rápidos */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-bold font-heading">Accesos Rápidos</CardTitle>
            <CardDescription>Accesos directos a la gestión operativa</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button asChild variant="outline" className="w-full justify-between h-11 text-sm border-border hover:bg-muted font-medium">
              <Link href="/dashboard/clientes">
                <span className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-brand-primary" />
                  Buscar Clientes
                </span>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-between h-11 text-sm border-border hover:bg-muted font-medium">
              <Link href="/dashboard/planes">
                <span className="flex items-center gap-2">
                  <Layers className="h-4 w-4 text-brand-primary" />
                  Administrar Planes
                </span>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </Link>
            </Button>
            <div className="p-4 rounded-xl border border-dashed border-border bg-muted/30 mt-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-foreground uppercase tracking-wider">Caja Mostrador</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">Control de pagos manuales</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center">
                <TrendingUp className="h-4 w-4" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
