'use server'

import { createClient } from '@/lib/supabase/server'

// Obtener datos del cliente para su dashboard
export async function getClienteDashboardDataAction() {
  const supabase = await createClient()

  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'No autenticado' }

    // Perfil
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError) return { success: false, error: 'Error obteniendo perfil' }

    // Membresías activas o recientes
    const { data: membresias, error: memError } = await supabase
      .from('membresias')
      .select(`
        *,
        planes (
          id,
          nombre,
          precio,
          duracion_dias
        )
      `)
      .eq('perfil_id', user.id)
      .order('created_at', { ascending: false })

    // Todos los planes disponibles
    const { data: planes, error: planesError } = await supabase
      .from('planes')
      .select('*')
      .order('precio', { ascending: true })

    return {
      success: true,
      data: {
        profile,
        membresias: membresias || [],
        planes: planes || []
      }
    }
  } catch (err: any) {
    return { success: false, error: err.message || 'Error de servidor' }
  }
}

// Cancelar membresía activa
export async function cancelarMembresiaAction(membresiaId: string) {
  const supabase = await createClient()

  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'No autenticado' }

    // Verificar que la membresía sea de este usuario
    const { data: membresiaCheck } = await supabase
      .from('membresias')
      .select('perfil_id')
      .eq('id', membresiaId)
      .single()

    if (membresiaCheck?.perfil_id !== user.id) {
      return { success: false, error: 'No autorizado para cancelar esta membresía' }
    }

    // Actualizar estado (Asumimos que el RLS lo permite o no hay RLS estricto para update del propietario)
    const { error } = await supabase
      .from('membresias')
      .update({ estado: 'vencido' })
      .eq('id', membresiaId)

    if (error) {
      return { success: false, error: 'No tienes permisos en base de datos para cancelar esta membresía. Por favor, comunícate con recepción.' }
    }

    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

