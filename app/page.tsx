import Link from 'next/link'
import { Dumbbell, LogIn, LogOut, Shield, User, Wallet, CheckCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'

export default async function Home() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let profile = null
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    profile = data
  }

  return (
    <div className="flex flex-col min-h-screen bg-surface dark:bg-black font-sans selection:bg-brand-primary/20">
      {/* Navbar principal */}
      <header className="sticky top-0 z-50 w-full border-b border-border/80 bg-background/95 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-primary text-white">
              <Dumbbell className="h-5 w-5" />
            </div>
            <span className="font-heading text-xl font-black tracking-tight">
              GES<span className="text-brand-primary">BOX</span>
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Características</a>
            <a href="#pricing" className="hover:text-foreground transition-colors">Planes</a>
            <a href="#about" className="hover:text-foreground transition-colors">Nosotros</a>
          </nav>

          <div className="flex items-center gap-3">
            {profile ? (
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex flex-col items-end text-xs">
                  <span className="font-semibold text-foreground">{profile.nombre_completo}</span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-brand-primary/10 text-brand-primary mt-0.5">
                    {profile.rol === 'admin' ? 'Administrador' : profile.rol === 'recepcionista' ? 'Recepcionista' : 'Cliente'}
                  </span>
                </div>
                
                <Button asChild variant="outline" size="sm" className="h-9 gap-1.5 border-border hover:bg-muted text-xs">
                  <Link href="/auth/signout">
                    <LogOut className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Cerrar Sesión</span>
                  </Link>
                </Button>
              </div>
            ) : (
              <Button asChild size="sm" className="h-9 gap-1.5 bg-brand-primary text-white hover:bg-brand-primary/95 text-xs font-semibold">
                <Link href="/login">
                  <LogIn className="h-3.5 w-3.5" />
                  Acceso Recepción
                </Link>
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="relative overflow-hidden py-20 lg:py-32 bg-gradient-to-b from-surface-container-lowest to-surface-container-low dark:from-zinc-950 dark:to-zinc-900">
          <div className="container mx-auto px-4 sm:px-6 text-center max-w-4xl relative z-10">
            {profile && (
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-primary/10 text-brand-primary text-xs font-semibold mb-6 animate-pulse">
                <Shield className="h-3.5 w-3.5" />
                Sesión Iniciada como {profile.rol === 'admin' ? 'Administrador' : profile.rol === 'recepcionista' ? 'Recepcionista' : 'Cliente'}
              </div>
            )}
            
            <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-foreground leading-[1.15] mb-6">
              El control absoluto de tu gimnasio en <span className="bg-gradient-to-r from-brand-primary to-orange-500 bg-clip-text text-transparent">un solo lugar</span>
            </h1>
            
            <p className="text-body-lg text-muted-foreground max-w-2xl mx-auto mb-10">
              GESBOX te ayuda a gestionar ingresos en tiempo real, erradicar la suplantación de clientes morosos y registrar flujos de caja con total transparencia.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              {profile ? (
                <Button asChild size="lg" className="w-full sm:w-auto h-12 px-8 bg-brand-primary text-white hover:bg-brand-primary/95 text-sm font-semibold rounded-lg shadow-md hover:shadow-lg transition-all">
                  <Link href="/dashboard">Ir al Mostrador</Link>
                </Button>
              ) : (
                <Button asChild size="lg" className="w-full sm:w-auto h-12 px-8 bg-brand-primary text-white hover:bg-brand-primary/95 text-sm font-semibold rounded-lg shadow-md hover:shadow-lg transition-all">
                  <Link href="/login">Ingresar al Sistema</Link>
                </Button>
              )}
              <Button variant="outline" size="lg" className="w-full sm:w-auto h-12 px-8 border-border hover:bg-muted text-sm font-semibold rounded-lg">
                Ver Demostración
              </Button>
            </div>
          </div>

          {/* Decoraciones abstractas */}
          <div className="absolute top-1/2 left-0 w-72 h-72 bg-brand-primary/10 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2 pointer-events-none" />
          <div className="absolute top-1/3 right-0 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 bg-background">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Diseñado para la operación del día a día
              </h2>
              <p className="text-body-md text-muted-foreground mt-4">
                La herramienta perfecta para recepcionistas y dueños de gimnasios que buscan agilidad en mostrador.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Tarjeta 1 */}
              <div className="p-8 rounded-xl border border-border bg-card shadow-sm hover:shadow-md transition-shadow">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-brand-primary/10 text-brand-primary mb-6">
                  <User className="h-6 w-6" />
                </div>
                <h3 className="font-heading text-lg font-bold text-foreground mb-3">Control de Acceso por Cédula</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Digita el documento del cliente en mostrador para verificar al instante si su membresía está activa o vencida.
                </p>
              </div>

              {/* Tarjeta 2 */}
              <div className="p-8 rounded-xl border border-border bg-card shadow-sm hover:shadow-md transition-shadow">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-brand-primary/10 text-brand-primary mb-6">
                  <Wallet className="h-6 w-6" />
                </div>
                <h3 className="font-heading text-lg font-bold text-foreground mb-3">Caja y Pagos Manuales</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Registra pagos en efectivo, transferencias Nequi/Daviplata y sube el soporte de pago para cuadres de caja exactos.
                </p>
              </div>

              {/* Tarjeta 3 */}
              <div className="p-8 rounded-xl border border-border bg-card shadow-sm hover:shadow-md transition-shadow">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-brand-primary/10 text-brand-primary mb-6">
                  <CheckCircle className="h-6 w-6" />
                </div>
                <h3 className="font-heading text-lg font-bold text-foreground mb-3">Administración de Planes</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  El administrador puede definir la oferta de planes, tarifas y duraciones fácilmente desde su propio panel de control.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-surface-container-low py-8">
        <div className="container mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Dumbbell className="h-4 w-4 text-brand-primary" />
            <span className="font-bold">GESBOX Gym Manager</span>
          </div>
          <p>&copy; {new Date().getFullYear()} GESBOX. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  )
}
