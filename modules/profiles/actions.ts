'use server'

import { createClient } from '@/lib/supabase/server'

// 1. Obtener listado de clientes con filtro de búsqueda
export async function getClientesAction(searchQuery?: string) {
  const supabase = await createClient()

  try {
    let query = supabase
      .from('profiles')
      .select('*')
      .eq('rol', 'cliente')

    if (searchQuery && searchQuery.trim() !== '') {
      const cleanSearch = searchQuery.trim()
      // Buscar por nombre o número de documento
      query = query.or(`nombre_completo.ilike.%${cleanSearch}%,numero_documento.ilike.%${cleanSearch}%`)
    }

    const { data: clientes, error } = await query.order('nombre_completo', { ascending: true })

    if (error) {
      return { success: false, error: 'Error al buscar clientes: ' + error.message }
    }

    return { success: true, data: clientes }
  } catch (err) {
    return { success: false, error: 'Error de servidor al buscar clientes.' }
  }
}

// 2. Obtener detalles completos de un cliente
export async function getClienteDetallesAction(profileId: string) {
  const supabase = await createClient()

  try {
    // A. Obtener el perfil
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', profileId)
      .single()

    if (profileError || !profile) {
      return { success: false, error: 'No se encontró el perfil del cliente.' }
    }

    // B. Obtener historial de membresías con la información del plan
    const { data: membresias = [], error: memError } = await supabase
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
      .eq('perfil_id', profileId)
      .order('created_at', { ascending: false })

    // C. Obtener asistencias
    const { data: asistencias = [], error: astError } = await supabase
      .from('asistencias')
      .select('*')
      .eq('perfil_id', profileId)
      .order('fecha_ingreso', { ascending: false })
      .limit(10)

    // D. Obtener pagos asociados a las membresías del cliente
    let pagos: any[] = []
    if (membresias && membresias.length > 0) {
      const membresiaIds = membresias.map((m) => m.id)
      const { data: pagosData, error: pagosError } = await supabase
        .from('pagos')
        .select(`
          id,
          monto,
          metodo_pago,
          fecha_pago,
          membresia_id,
          comprobante_url
        `)
        .in('membresia_id', membresiaIds)
        .order('fecha_pago', { ascending: false })

      if (!pagosError && pagosData) {
        // Enlazar los pagos con el nombre del plan para mostrarlo en la UI
        pagos = pagosData.map((p) => {
          const memb = membresias.find((m) => m.id === p.membresia_id)
          return {
            ...p,
            nombre_plan: memb?.planes?.nombre || 'Plan Desconocido',
          }
        })
      }
    }

    return {
      success: true,
      data: {
        profile,
        membresias,
        asistencias,
        pagos,
      },
    }
  } catch (err) {
    return { success: false, error: 'Error de servidor al obtener detalles del cliente.' }
  }
}

// 3. Eliminar cliente (solo administrador)
export async function deleteClienteAction(profileId: string) {
  const supabase = await createClient()

  try {
    // A. Obtener sesión actual
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: 'No autenticado.' }
    }

    // B. Verificar que el usuario actual es administrador
    const { data: currentUserProfile, error: profileError } = await supabase
      .from('profiles')
      .select('rol')
      .eq('id', user.id)
      .single()

    if (profileError || !currentUserProfile) {
      return { success: false, error: 'No se pudo verificar el rol del usuario.' }
    }

    if (currentUserProfile.rol !== 'admin') {
      return { success: false, error: 'Acceso denegado. Solo los administradores pueden eliminar usuarios.' }
    }

    // C. Eliminar el perfil objetivo (asumiendo eliminación en cascada de sus dependencias en la DB)
    const { error: deleteError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', profileId)

    if (deleteError) {
      return { success: false, error: 'Error al eliminar el cliente de la base de datos.' }
    }

    return { success: true }
  } catch (err) {
    return { success: false, error: 'Error de servidor al eliminar el cliente.' }
  }
}
