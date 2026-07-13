import { createClient } from '@/lib/supabase/server'
import { RecepcionDashboard } from '@/modules/asistencias/components/recepcion-dashboard'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function RecepcionPage() {
  // La autenticación y autorización ya están garantizadas por el layout de /dashboard
  return (
    <RecepcionDashboard />
  )
}
