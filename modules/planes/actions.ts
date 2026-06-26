'use server'

import { createClient } from '@/lib/supabase/server'
import { planSchema, type PlanInput } from './schemas'

// Helper para verificar si el usuario logueado es Administrador
async function checkAdminRole() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Usuario no autenticado.')
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('rol')
    .eq('id', user.id)
    .single()

  if (error || !profile || profile.rol !== 'admin') {
    throw new Error('No tienes permisos de administrador para realizar esta acción.')
  }

  return user.id
}

// 1. Obtener todos los planes
export async function getPlanesAction() {
  const supabase = await createClient()
  
  try {
    const { data: planes, error } = await supabase
      .from('planes')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      return { success: false, error: 'Error al obtener los planes: ' + error.message }
    }

    return { success: true, data: planes }
  } catch (err) {
    return { success: false, error: 'Error de servidor al obtener planes.' }
  }
}

// 2. Crear un nuevo plan
export async function createPlanAction(data: PlanInput) {
  try {
    // Verificar permisos
    await checkAdminRole()

    // Validar esquema Zod
    const validation = planSchema.safeParse(data)
    if (!validation.success) {
      return {
        success: false,
        error: 'Datos del plan no válidos.',
        errors: validation.error.flatten().fieldErrors,
      }
    }

    const supabase = await createClient()
    const { data: newPlan, error } = await supabase
      .from('planes')
      .insert({
        nombre: validation.data.nombre,
        precio: validation.data.precio,
        duracion_dias: validation.data.duracion_dias,
      })
      .select()
      .single()

    if (error) {
      return { success: false, error: 'Error al crear el plan: ' + error.message }
    }

    return { success: true, data: newPlan }
  } catch (err: any) {
    return { success: false, error: err.message || 'Error inesperado al crear el plan.' }
  }
}

// 3. Actualizar un plan existente
export async function updatePlanAction(id: number, data: PlanInput) {
  try {
    // Verificar permisos
    await checkAdminRole()

    // Validar esquema Zod
    const validation = planSchema.safeParse(data)
    if (!validation.success) {
      return {
        success: false,
        error: 'Datos del plan no válidos.',
        errors: validation.error.flatten().fieldErrors,
      }
    }

    const supabase = await createClient()
    const { data: updatedPlan, error } = await supabase
      .from('planes')
      .update({
        nombre: validation.data.nombre,
        precio: validation.data.precio,
        duracion_dias: validation.data.duracion_dias,
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return { success: false, error: 'Error al actualizar el plan: ' + error.message }
    }

    return { success: true, data: updatedPlan }
  } catch (err: any) {
    return { success: false, error: err.message || 'Error inesperado al actualizar el plan.' }
  }
}

// 4. Eliminar un plan
export async function deletePlanAction(id: number) {
  try {
    // Verificar permisos
    await checkAdminRole()

    const supabase = await createClient()
    const { error } = await supabase
      .from('planes')
      .delete()
      .eq('id', id)

    if (error) {
      // Manejar error si el plan está en uso por alguna membresía (RESTRICT)
      if (error.code === '23503') {
        return {
          success: false,
          error: 'No se puede eliminar este plan porque está asignado a membresías activas o vencidas.',
        }
      }
      return { success: false, error: 'Error al eliminar el plan: ' + error.message }
    }

    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message || 'Error inesperado al eliminar el plan.' }
  }
}
