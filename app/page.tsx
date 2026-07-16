import Link from 'next/link'
import Image from 'next/image'
import { Dumbbell, LogIn, LogOut, Shield, User, Wallet, CheckCircle, Clock, MapPin, Check, Phone, Calendar } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { getPlanesAction } from '@/modules/planes/actions'
import { cn } from '@/lib/utils'
import { ForceLightMode } from '@/components/shared/theme-forcer'

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

  const planesResult = await getPlanesAction()
  const dbPlanes = planesResult.success && planesResult.data ? planesResult.data : []

  const formatCOP = (num: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(num)
  }

  const formattedPlanes = dbPlanes.length > 0
    ? dbPlanes.map((plan) => {
      let features = [
        'Acceso ilimitado a zona de pesas y máquinas',
        'Registro de asistencias en recepción',
        'Soporte con entrenadores en sala'
      ]
      if (plan.duracion_dias >= 90) {
        features.push('Descuento especial incluido')
      }
      if (plan.duracion_dias >= 365) {
        features.push('Opción de congelación de membresía')
      }
      return {
        ...plan,
        features,
        popular: plan.duracion_dias === 90 || plan.nombre.toLowerCase().includes('trimestral')
      }
    })
    : [
      {
        id: 1,
        nombre: 'Plan Mensual',
        precio: 80000,
        duracion_dias: 30,
        features: [
          'Acceso ilimitado a zona de pesas',
          'Acceso a zona de cardio y funcional',
          'Registro de asistencia digital en recepción',
          'Soporte con entrenadores en sala'
        ]
      },
      {
        id: 2,
        nombre: 'Plan Trimestral',
        precio: 220000,
        duracion_dias: 90,
        features: [
          'Todos los beneficios del plan mensual',
          'Ahorro especial sobre tarifa mensual',
          'Seguimiento básico de progreso',
          'Acceso prioritario a zonas'
        ],
        popular: true
      },
      {
        id: 3,
        nombre: 'Plan Anual',
        precio: 750000,
        duracion_dias: 365,
        features: [
          'Acceso completo todo el año (365 días)',
          'Mejor tarifa diaria del gimnasio',
          '1 mes de congelación de membresía gratis',
          'Asesoría personalizada mensual'
        ]
      }
    ]

  return (
    <div className="flex flex-col min-h-screen bg-surface font-sans selection:bg-brand-primary/20">
      <ForceLightMode />
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

                <form action="/auth/signout" method="POST">
                  <Button 
                    type="submit"
                    variant="outline" 
                    size="sm" 
                    className="h-9 gap-1.5 border-border hover:bg-muted text-xs"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Cerrar Sesión</span>
                  </Button>
                </form>
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
        <section className="relative overflow-hidden py-20 lg:py-32 bg-gradient-to-b from-surface-container-lowest to-surface-container-low">
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

        {/* Planes Section */}
        <section id="pricing" className="py-20 bg-surface-container-lowest border-t border-border/50">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-primary/10 text-brand-primary text-xs font-semibold mb-4">
                <Wallet className="h-3.5 w-3.5" />
                Tarifas y Membresías
              </div>
              <h2 className="font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Planes simples, sin sorpresas
              </h2>
              <p className="text-body-md text-muted-foreground mt-4">
                Adquiere o renueva tu membresía directamente en la recepción del gimnasio. Aceptamos efectivo y transferencias.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch max-w-5xl mx-auto">
              {formattedPlanes.map((plan: any) => {
                const whatsappUrl = `https://wa.me/573000000000?text=${encodeURIComponent(
                  `Hola! Estoy interesado en adquirir el plan "${plan.nombre}" por ${formatCOP(plan.precio)} en el gimnasio.`
                )}`

                return (
                  <div
                    key={plan.id}
                    className={cn(
                      "flex flex-col justify-between p-8 rounded-2xl border bg-card transition-all relative",
                      plan.popular
                        ? "border-brand-primary shadow-md scale-100 md:scale-105 z-10"
                        : "border-border shadow-sm hover:shadow-md"
                    )}
                  >
                    {plan.popular && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-primary text-white text-[10px] font-bold tracking-wider px-3 py-1 rounded-full uppercase shadow">
                        Más Popular
                      </span>
                    )}

                    <div className="space-y-6">
                      <div>
                        <h3 className="font-heading text-lg font-bold text-foreground">{plan.nombre}</h3>
                        <p className="text-xs text-muted-foreground mt-1">Duración: {plan.duracion_dias} días</p>
                      </div>

                      <div className="flex items-baseline gap-1.5">
                        <span className="font-heading text-4xl font-black text-foreground">{formatCOP(plan.precio)}</span>
                        <span className="text-xs text-muted-foreground font-medium">COP</span>
                      </div>

                      <ul className="space-y-3.5 text-sm text-muted-foreground border-t border-border/80 pt-6">
                        {plan.features.map((feature: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-2.5">
                            <Check className="h-4 w-4 text-brand-primary shrink-0 mt-0.5" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="mt-8 space-y-3">
                      <Button
                        asChild
                        className={cn(
                          "w-full h-11 text-xs font-semibold rounded-lg transition-colors gap-1.5",
                          plan.popular
                            ? "bg-brand-primary text-white hover:bg-brand-primary/90"
                            : "bg-secondary/10 hover:bg-secondary/20 text-foreground border border-border"
                        )}
                      >
                        <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                          <Phone className="h-3.5 w-3.5" />
                          Adquirir Plan
                        </a>
                      </Button>

                      <div className="text-center">
                        <Link
                          href="/login"
                          className="text-[10px] font-semibold text-muted-foreground hover:text-brand-primary transition-colors underline underline-offset-2"
                        >
                          O iniciar trámite en recepción
                        </Link>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* Nosotros Section */}
        <section id="about" className="py-20 bg-surface-container-low border-t border-border/50">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start mb-16">
              {/* Información y Propuesta */}
              <div className="lg:col-span-7 space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-primary/10 text-brand-primary text-xs font-semibold">
                  <Dumbbell className="h-3 w-3" />
                  Más sobre Nosotros
                </div>
                <h2 className="font-heading text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
                  Más que un gimnasio, tu centro de alto rendimiento
                </h2>
                <p className="text-body-md text-muted-foreground leading-relaxed">
                  En GESBOX nos apasiona transformar vidas a través del ejercicio y la disciplina. Ofrecemos instalaciones de primer nivel equipadas con maquinaria moderna para cardio, musculación y entrenamiento funcional.
                </p>
                <p className="text-body-md text-muted-foreground leading-relaxed">
                  Nuestra misión es guiarte en cada paso de tu camino deportivo. Contamos con entrenadores calificados listos para estructurar tus rutinas, y un control de asistencia automatizado en mostrador para asegurar una experiencia ágil y transparente desde que cruzas la puerta.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-primary/10 text-brand-primary">
                      <Check className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-foreground">Entrenadores Expertos</h4>
                      <p className="text-xs text-muted-foreground">Asesoría profesional en sala de musculación.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-primary/10 text-brand-primary">
                      <Check className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-foreground">Ambiente Motivador</h4>
                      <p className="text-xs text-muted-foreground">Espacios amplios y música para potenciar tu entrenamiento.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Horarios */}
              <div className="lg:col-span-5 p-6 sm:p-8 rounded-2xl border border-border bg-card shadow-sm space-y-6">
                <div className="flex items-center gap-2.5 pb-4 border-b border-border">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-primary/10 text-brand-primary">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-heading text-lg font-bold text-foreground">Horarios de Atención</h3>
                    <p className="text-xs text-muted-foreground">Ajustados a tu ritmo de vida</p>
                  </div>
                </div>

                <div className="space-y-3.5">
                  <div className="flex items-center justify-between text-sm py-1 border-b border-dashed border-border/80">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4 text-brand-primary" />
                      <span>Lunes a Viernes</span>
                    </div>
                    <span className="font-semibold text-foreground">6:00 AM - 10:00 PM</span>
                  </div>
                  <div className="flex items-center justify-between text-sm py-1 border-b border-dashed border-border/80">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4 text-brand-primary" />
                      <span>Sábados</span>
                    </div>
                    <span className="font-semibold text-foreground">6:00 AM - 4:00 PM</span>
                  </div>
                  <div className="flex items-center justify-between text-sm py-1">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4 text-brand-primary" />
                      <span>Domingos y Festivos</span>
                    </div>
                    <span className="font-semibold text-foreground">8:00 AM - 1:00 PM</span>
                  </div>
                </div>

                <div className="bg-muted/40 p-4 rounded-xl flex items-start gap-3 border border-border/40 text-xs">
                  <MapPin className="h-5 w-5 text-brand-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-foreground">Dirección Principal</p>
                    <p className="text-muted-foreground mt-0.5">Cll 7 # 9-10 Provivienda, Garzón-Huila, Colombia</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Galería de Instalaciones */}
            <div className="space-y-6">
              <div className="text-center lg:text-left">
                <h3 className="font-heading text-xl font-bold text-foreground">Nuestras Instalaciones</h3>
                <p className="text-sm text-muted-foreground mt-1">Conoce las diferentes zonas de entrenamiento diseñadas para ti</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Zona 1 */}
                <div className="group overflow-hidden rounded-xl border border-border bg-card shadow-sm hover:shadow-md transition-all">
                  <div className="relative h-56 overflow-hidden">
                    <Image
                      src="/gym_cardio_zone.png"
                      alt="Zona de Cardio"
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
                    <span className="absolute bottom-4 left-4 bg-brand-primary text-white text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded">
                      Zona Cardio
                    </span>
                  </div>
                  <div className="p-5">
                    <h4 className="font-bold text-foreground text-sm">Resistencia & Trote</h4>
                    <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                      Equipada con caminadoras profesionales de última generación y elípticas de alto impacto.
                    </p>
                  </div>
                </div>

                {/* Zona 2 */}
                <div className="group overflow-hidden rounded-xl border border-border bg-card shadow-sm hover:shadow-md transition-all">
                  <div className="relative h-56 overflow-hidden">
                    <Image
                      src="/gym_weight_zone.png"
                      alt="Zona de Pesas Libres"
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
                    <span className="absolute bottom-4 left-4 bg-brand-primary text-white text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded">
                      Fuerza & Musculación
                    </span>
                  </div>
                  <div className="p-5">
                    <h4 className="font-bold text-foreground text-sm">Pesas Libres & Máquinas</h4>
                    <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                      Amplia variedad de mancuernas, barras olímpicas, racks de sentadillas y poleas ajustables.
                    </p>
                  </div>
                </div>

                {/* Zona 3 */}
                <div className="group overflow-hidden rounded-xl border border-border bg-card shadow-sm hover:shadow-md transition-all">
                  <div className="relative h-56 overflow-hidden">
                    <Image
                      src="/gym_studio_zone.png"
                      alt="Estudio de Clases"
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
                    <span className="absolute bottom-4 left-4 bg-brand-primary text-white text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded">
                      Salón Fitness
                    </span>
                  </div>
                  <div className="p-5">
                    <h4 className="font-bold text-foreground text-sm">Clases Grupales & Funcional</h4>
                    <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                      Espacio climatizado ideal para yoga, spinning, entrenamiento de core y estiramiento guiado.
                    </p>
                  </div>
                </div>
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
