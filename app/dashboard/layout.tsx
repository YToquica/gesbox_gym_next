import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import DashboardShell from '@/components/shared/dashboard-shell'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  // 1. Obtener la sesión del usuario
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // 2. Obtener el perfil asociado y su rol
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('nombre_completo, rol')
    .eq('id', user.id)
    .single()

  if (error || !profile) {
    redirect('/login')
  }

  // 3. Verificar roles autorizados (admin o recepcionista)
  if (profile.rol !== 'admin' && profile.rol !== 'recepcionista') {
    redirect('/')
  }

  return (
    <DashboardShell profile={profile}>
      {children}
    </DashboardShell>
  )
}
