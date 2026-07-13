import { redirect } from 'next/navigation'
import { getClienteDashboardDataAction } from '@/modules/cliente/actions'
import { ClienteDashboard } from '@/modules/cliente/components/cliente-dashboard'
import { ForceLightMode } from '@/components/shared/theme-forcer'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function MiPerfilPage() {
  const result = await getClienteDashboardDataAction()

  if (!result.success || !result.data) {
    redirect('/login')
  }

  // Verificar rol (por si acaso accede alguien con rol distinto a cliente, aunque podría servir igual para ver sus datos)
  if (result.data.profile.rol !== 'cliente') {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-background">
      <ForceLightMode />
      <header className="sticky top-0 z-50 w-full border-b border-border/80 bg-background/95 backdrop-blur-md h-16 flex items-center px-6">
        <div className="flex items-center gap-2">
          <span className="font-heading text-xl font-black tracking-tight">
            GES<span className="text-brand-primary">BOX</span> <span className="text-muted-foreground font-normal ml-2">Portal del Cliente</span>
          </span>
        </div>
      </header>

      <main className="p-4 md:p-8">
        <ClienteDashboard initialData={result.data} />
      </main>
    </div>
  )
}
