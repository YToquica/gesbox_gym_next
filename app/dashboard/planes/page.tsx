import { createClient } from '@/lib/supabase/server'
import { PlanesModule } from '@/modules/planes/components/planes-module'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function PlanesPage() {
  // La autenticación y autorización ya están garantizadas por el layout de /dashboard
  // Solo obtenemos el rol para pasarlo al módulo como prop, sin redirigir
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let profile: { rol: string } = { rol: 'admin' }
  if (user) {
    const { data: profileData } = await supabase
      .from('profiles')
      .select('rol')
      .eq('id', user.id)
      .single()
    if (profileData) profile = profileData
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-border">
        <div>
          <h2 className="text-2xl font-black font-heading tracking-tight text-foreground">Planes de Membresía</h2>
        </div>
      </div>
      
      <PlanesModule profile={profile} />
    </div>
  )
}
