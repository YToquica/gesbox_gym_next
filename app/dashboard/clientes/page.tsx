import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ClientesModule } from '@/modules/profiles/components/clientes-module'

export const revalidate = 0 // Desactivar cache para datos en tiempo real

export default async function ClientesPage() {
  const supabase = await createClient()

  // 1. Obtener sesión
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // 2. Obtener perfil
  const { data: profile } = await supabase
    .from('profiles')
    .select('rol')
    .eq('id', user.id)
    .single()

  if (!profile) {
    redirect('/login')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-border">
        <div>
          <h2 className="text-2xl font-black font-heading tracking-tight text-foreground">Listado de Clientes</h2>
        </div>
      </div>
      
      <ClientesModule />
    </div>
  )
}
