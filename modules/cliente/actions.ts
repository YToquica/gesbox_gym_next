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

// Adquirir un plan (Simulación)
export async function adquirirPlanAction(planId: string) {
  const supabase = await createClient()

  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'No autenticado' }

    // 1. Obtener detalles del plan
    const { data: plan } = await supabase.from('planes').select('*').eq('id', planId).single()
    if (!plan) return { success: false, error: 'Plan no encontrado' }

    // 2. Calcular fechas
    const fechaInicio = new Date()
    const fechaFin = new Date()
    fechaFin.setDate(fechaFin.getDate() + plan.duracion_dias)

    // 3. Crear la membresía
    const { data: newMembresia, error: insertError } = await supabase
      .from('membresias')
      .insert({
        perfil_id: user.id,
        plan_id: plan.id,
        fecha_inicio: fechaInicio.toISOString().split('T')[0],
        fecha_fin: fechaFin.toISOString().split('T')[0],
        estado: 'activo'
      })
      .select()
      .single()

    if (insertError) {
      return { success: false, error: 'No tienes permisos en base de datos para adquirir membresías directamente. Por favor, realiza el pago en recepción.' }
    }

    // 4. Crear registro de pago simulado
    if (newMembresia) {
      await supabase.from('pagos').insert({
        membresia_id: newMembresia.id,
        monto: plan.precio,
        metodo_pago: 'Plataforma Online',
        fecha_pago: new Date().toISOString()
      })
    }

    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}
