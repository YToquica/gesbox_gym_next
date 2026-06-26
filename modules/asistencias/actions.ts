'use server'

import { createClient } from '@/lib/supabase/server'

// 1. Registrar ingreso / validar cliente por número de documento
export async function checkInClienteAction(numeroDocumento: string) {
  const supabase = await createClient()

  try {
    const cleanDoc = numeroDocumento.trim()
    if (!cleanDoc) {
      return { success: false, error: 'Por favor, ingrese un número de documento válido.', code: 'INVALID_INPUT' }
    }

    // A. Buscar el perfil del cliente
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, nombre_completo, numero_documento, tipo_documento, telefono')
      .eq('numero_documento', cleanDoc)
      .eq('rol', 'cliente')
      .maybeSingle()

    if (profileError) {
      return { success: false, error: 'Error al buscar el cliente en la base de datos.', code: 'DB_ERROR' }
    }

    if (!profile) {
      return { success: false, error: 'Cliente no registrado en el sistema.', code: 'CLIENT_NOT_FOUND' }
    }

    // B. Obtener todas las membresías del cliente, ordenadas por fecha_fin desc
    const { data: membresias, error: memError } = await supabase
      .from('membresias')
      .select(`
        id,
        estado,
        fecha_inicio,
        fecha_fin,
        planes (
          id,
          nombre,
          precio,
          duracion_dias
        )
      `)
      .eq('perfil_id', profile.id)
      .order('fecha_fin', { ascending: false })

    if (memError) {
      return { success: false, error: 'Error al consultar las membresías.', code: 'DB_ERROR' }
    }

    // C. Determinar si cuenta con una membresía activa hoy en Colombia (GMT-5)
    const hoyBogota = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Bogota',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(new Date()) // Retorna 'YYYY-MM-DD'

    // Buscamos si existe al menos una membresía activa y no vencida
    const membresiaActiva = membresias?.find(
      (m: any) => m.estado === 'activo' && m.fecha_fin >= hoyBogota
    )

    if (!membresiaActiva) {
      const ultimaMembresia = membresias && membresias.length > 0 ? membresias[0] : null
      
      // Si la membresía está expirada en fechas pero marcada como activa,
      // o si está vencida en estado, damos detalles de por qué se deniega el acceso
      let reason = 'El cliente no tiene ninguna membresía activa.'
      if (ultimaMembresia) {
        if (ultimaMembresia.estado === 'congelado') {
          reason = 'La membresía del cliente está congelada.'
        } else if (ultimaMembresia.fecha_fin < hoyBogota) {
          reason = `Membresía vencida el ${new Date(ultimaMembresia.fecha_fin + 'T00:00:00').toLocaleDateString('es-CO')}.`
        } else {
          reason = 'Membresía inactiva.'
        }
      }

      return {
        success: false,
        code: 'INACTIVE_MEMBERSHIP',
        error: reason,
        data: {
          profile,
          ultimaMembresia
        }
      }
    }

    // D. Si es válido (membresía activa), insertamos el ingreso en la tabla asistencias
    const { data: asistencia, error: astError } = await supabase
      .from('asistencias')
      .insert({
        perfil_id: profile.id
      })
      .select('*')
      .single()

    if (astError) {
      return { success: false, error: 'Error al registrar la asistencia del cliente.', code: 'DB_ERROR' }
    }

    return {
      success: true,
      data: {
        profile,
        membresiaActiva,
        asistencia
      }
    }
  } catch (err: any) {
    return { success: false, error: 'Error de servidor: ' + (err.message || err), code: 'SERVER_ERROR' }
  }
}

// 2. Obtener los ingresos más recientes
export async function getRecentAsistenciasAction() {
  const supabase = await createClient()

  try {
    const { data: asistencias, error } = await supabase
      .from('asistencias')
      .select(`
        id,
        fecha_ingreso,
        profiles (
          id,
          nombre_completo,
          numero_documento,
          tipo_documento
        )
      `)
      .order('fecha_ingreso', { ascending: false })
      .limit(15)

    if (error) {
      return { success: false, error: 'Error al obtener ingresos recientes: ' + error.message, code: 'DB_ERROR' }
    }

    return { success: true, data: asistencias }
  } catch (err: any) {
    return { success: false, error: 'Error de servidor: ' + (err.message || err), code: 'SERVER_ERROR' }
  }
}
