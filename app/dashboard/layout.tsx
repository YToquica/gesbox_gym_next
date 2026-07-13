import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import DashboardShell from '@/components/shared/dashboard-shell'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  // 1. Obtener la sesión del usuario
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  
  console.log('[DEBUG LAYOUT] Auth user:', user ? user.id : null, 'Auth error:', authError)

  if (!user) {
    console.log('[DEBUG LAYOUT] Redirecting to login because !user')
    redirect('/login')
  }

  // 2. Obtener el perfil asociado y su rol
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('nombre_completo, rol')
    .eq('id', user.id)
    .single()

  console.log('[DEBUG LAYOUT] Profile:', profile, 'Profile error:', error)

  if (error || !profile) {
    console.log('[DEBUG LAYOUT] Redirecting to login because error || !profile')
    redirect('/login')
  }

  // 3. Verificar roles autorizados
  if (profile.rol === 'cliente') {
    redirect('/mi-perfil')
  } else if (profile.rol !== 'admin' && profile.rol !== 'recepcionista') {
    redirect('/')
  }

  return (
    <DashboardShell profile={profile}>
      {children}
    </DashboardShell>
  )
}
