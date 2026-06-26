import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { RecepcionDashboard } from '@/modules/asistencias/components/recepcion-dashboard'

export const revalidate = 0 // Desactivar cache para datos frescos

export default async function RecepcionPage() {
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

  if (!profile || (profile.rol !== 'admin' && profile.rol !== 'recepcionista')) {
    redirect('/dashboard')
  }

  return (
    <RecepcionDashboard />
  )
}
