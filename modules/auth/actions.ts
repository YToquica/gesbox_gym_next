'use server'

import { createClient } from '@/lib/supabase/server'
import { loginSchema, registerSchema, type LoginInput, type RegisterInput } from './schemas'

export async function loginAction(data: LoginInput) {
  // 1. Validar datos en el servidor
  const validation = loginSchema.safeParse(data)
  if (!validation.success) {
    return {
      success: false,
      error: 'Datos de inicio de sesión no válidos.',
      errors: validation.error.flatten().fieldErrors,
    }
  }

  const { email, password } = validation.data
  const supabase = await createClient()

  try {
    // 2. Intentar iniciar sesión en Supabase Auth
    const { data: signInData, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      // Traducir mensajes de error comunes de Supabase Auth
      let errorMessage = 'Error al iniciar sesión. Por favor, intenta de nuevo.'
      
      if (error.status === 400 || error.message.toLowerCase().includes('invalid login credentials')) {
        errorMessage = 'Correo electrónico o contraseña incorrectos.'
      } else if (error.message.toLowerCase().includes('email not confirmed')) {
        errorMessage = 'El correo electrónico asociado no ha sido confirmado.'
      } else if (error.message.toLowerCase().includes('rate limit')) {
        errorMessage = 'Demasiados intentos fallidos. Por favor, espera un momento.'
      }

      return {
        success: false,
        error: errorMessage,
      }
    }

    const user = signInData.user
    let rol = 'cliente'
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('rol')
        .eq('id', user.id)
        .single()
      if (profile) rol = profile.rol
    }

    return {
      success: true,
      rol,
    }
  } catch (err) {
    return {
      success: false,
      error: 'Ha ocurrido un error inesperado de red o servidor.',
    }
  }
}

export async function registerAction(data: RegisterInput) {
  // 1. Validar datos en el servidor
  const validation = registerSchema.safeParse(data)
  if (!validation.success) {
    return {
      success: false,
      error: 'Datos de registro no válidos.',
      errors: validation.error.flatten().fieldErrors,
    }
  }

  const { email, password, nombre_completo, tipo_documento, numero_documento, telefono } = validation.data
  const supabase = await createClient()

  try {
    // 2. Verificar si el número de documento ya está registrado en la base de datos (vía RPC para evitar problemas de RLS en anónimo)
    const { data: documentExists, error: checkError } = await supabase
      .rpc('check_document_exists', { doc_num: numero_documento })

    if (checkError) {
      return {
        success: false,
        error: 'Error al verificar el número de documento en la base de datos.',
      }
    }

    if (documentExists) {
      return {
        success: false,
        errors: {
          numero_documento: ['Este número de documento ya está registrado en el gimnasio.'],
        },
      }
    }

    // 2.5 Verificar si el correo electrónico ya está registrado en la base de datos (vía RPC)
    const { data: emailExists, error: emailCheckError } = await supabase
      .rpc('check_email_exists', { email_to_check: email })

    if (emailCheckError) {
      return {
        success: false,
        error: 'Error al verificar el correo electrónico en la base de datos.',
      }
    }

    if (emailExists) {
      return {
        success: false,
        errors: {
          email: ['Este correo electrónico ya está registrado.'],
        },
      }
    }

    // 3. Registrar al usuario en Supabase Auth
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          nombre_completo,
          tipo_documento,
          numero_documento,
          telefono,
          rol: 'cliente',
        },
      },
    })

    if (signUpError) {
      let errorMessage = signUpError.message || 'Error al crear la cuenta en el servidor de autenticación.'
      
      if (signUpError.message.toLowerCase().includes('rate limit')) {
        errorMessage = 'Límite de solicitudes de correo excedido. Para solucionar esto en desarrollo, desactiva la opción "Confirm email" en tu panel de Supabase (Authentication -> Providers -> Email).'
      }

      return {
        success: false,
        error: errorMessage,
      }
    }

    return {
      success: true,
    }
  } catch (err: any) {
    return {
      success: false,
      error: 'Ha ocurrido un error inesperado de red o servidor: ' + (err.message || err),
    }
  }
}
/**
 * Obtiene el rol de un usuario a partir de su ID.
 * Se usa después del login en cliente para determinar la ruta de redirección
 * sin exponer la lógica de roles al browser.
 */
export async function getRolAction(userId: string): Promise<{ rol: string }> {
  const supabase = await createClient()
  const { data: profile } = await supabase
    .from('profiles')
    .select('rol')
    .eq('id', userId)
    .single()
  return { rol: profile?.rol ?? 'cliente' }
}
