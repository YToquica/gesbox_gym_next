import { createClient } from '@/lib/supabase/server'
import { ClientesModule } from '@/modules/profiles/components/clientes-module'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function ClientesPage() {
  // La autenticación y autorización ya están garantizadas por el layout de /dashboard
  // Solo obtenemos el rol para pasarlo al módulo como prop, sin redirigir
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let userRole = 'admin'
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('rol')
      .eq('id', user.id)
      .single()
    if (profile) userRole = profile.rol
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-border">
        <div>
          <h2 className="text-2xl font-black font-heading tracking-tight text-foreground">Listado de Clientes</h2>
        </div>
      </div>
      
      <ClientesModule userRole={userRole} />
    </div>
  )
}
