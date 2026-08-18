'use server'

import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import {
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  type LoginInput,
  type RegisterInput,
  type ForgotPasswordInput,
  type ResetPasswordInput,
} from './schemas'
import { verifyRecaptchaToken } from '@/lib/recaptcha/verify'

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

  // 2. Verificar token de seguridad Google reCAPTCHA v3
  const recaptcha = await verifyRecaptchaToken(validation.data.recaptchaToken, 'login')
  if (!recaptcha.success) {
    return {
      success: false,
      error: recaptcha.error || 'Error de validación de seguridad. Por favor, intenta nuevamente.',
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
  } catch {
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

  // 2. Verificar token de seguridad Google reCAPTCHA v3
  const recaptcha = await verifyRecaptchaToken(validation.data.recaptchaToken, 'register')
  if (!recaptcha.success) {
    return {
      success: false,
      error: recaptcha.error || 'Error de validación de seguridad. Por favor, intenta nuevamente.',
    }
  }

  const { email, password, nombre_completo, tipo_documento, numero_documento, telefono } = validation.data
  const supabase = await createClient()

  try {
    // 2. Registrar al usuario en Supabase Auth
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
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
      const errorMsg = signUpError.message.toLowerCase()
      
      // Control de errores de duplicados y límites de Supabase Auth
      if (errorMsg.includes('already registered') || errorMsg.includes('user already exists')) {
        return {
          success: false,
          errors: {
            email: ['Este correo electrónico ya está registrado en el sistema.'],
          },
        }
      }

      if (errorMsg.includes('profiles_numero_documento_key') || errorMsg.includes('duplicate key') || errorMsg.includes('database error')) {
        return {
          success: false,
          errors: {
            numero_documento: ['Este número de documento ya se encuentra registrado en el gimnasio.'],
          },
        }
      }

      if (errorMsg.includes('rate limit')) {
        return {
          success: false,
          error: 'Demasiados intentos seguidos. Por favor, espera un momento antes de volver a intentar.',
        }
      }

      return {
        success: false,
        error: signUpError.message || 'Error al crear la cuenta en el servidor de autenticación.',
      }
    }

    // Comprobación de seguridad: si Supabase retorna identidades vacías indica correo ya registrado
    if (signUpData?.user && signUpData.user.identities && signUpData.user.identities.length === 0) {
      return {
        success: false,
        errors: {
          email: ['Este correo electrónico ya está registrado en el sistema.'],
        },
      }
    }

    return {
      success: true,
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return {
      success: false,
      error: 'Ha ocurrido un error inesperado de red o servidor: ' + message,
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

/**
 * Solicita el restablecimiento de contraseña enviando un correo con enlace PKCE seguro.
 */
export async function forgotPasswordAction(data: ForgotPasswordInput) {
  // 1. Validar datos
  const validation = forgotPasswordSchema.safeParse(data)
  if (!validation.success) {
    return {
      success: false,
      error: 'Correo electrónico no válido.',
      errors: validation.error.flatten().fieldErrors,
    }
  }

  // 2. Verificar reCAPTCHA v3
  const recaptcha = await verifyRecaptchaToken(validation.data.recaptchaToken, 'forgot_password')
  if (!recaptcha.success) {
    return {
      success: false,
      error: recaptcha.error || 'Error de validación de seguridad. Por favor, intenta nuevamente.',
    }
  }

  const { email } = validation.data
  const supabase = await createClient()

  try {
    const headersList = await headers()
    const host = headersList.get('host')
    const proto = headersList.get('x-forwarded-proto') || (process.env.NODE_ENV === 'production' ? 'https' : 'http')
    const origin = host ? `${proto}://${host}` : (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000')
    const redirectTo = `${origin}/auth/callback?next=/actualizar-contrasena`

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    })

    if (error) {
      if (error.message.toLowerCase().includes('rate limit')) {
        return {
          success: false,
          error: 'Demasiados intentos seguidos. Por favor, espera unos minutos antes de solicitar otro enlace.',
        }
      }
      return {
        success: false,
        error: error.message || 'Error al procesar la solicitud de recuperación.',
      }
    }

    return {
      success: true,
      message: 'Si el correo ingresado se encuentra registrado en GESBOX, recibirás un enlace en tu bandeja de entrada en unos instantes.',
    }
  } catch {
    return {
      success: false,
      error: 'Ha ocurrido un error inesperado al procesar la solicitud.',
    }
  }
}

/**
 * Actualiza la contraseña del usuario cuando este cuenta con una sesión de recuperación activa.
 */
export async function updatePasswordAction(data: ResetPasswordInput) {
  // 1. Validar datos
  const validation = resetPasswordSchema.safeParse(data)
  if (!validation.success) {
    return {
      success: false,
      error: 'Datos de contraseña no válidos.',
      errors: validation.error.flatten().fieldErrors,
    }
  }

  const { password } = validation.data
  const supabase = await createClient()

  try {
    // 2. Verificar que exista un usuario en sesión
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return {
        success: false,
        error: 'Tu sesión de recuperación ha expirado o no es válida. Por favor, solicita un nuevo enlace.',
      }
    }

    // 3. Actualizar la contraseña en Supabase Auth
    const { error: updateError } = await supabase.auth.updateUser({
      password,
    })

    if (updateError) {
      let errorMsg = 'Error al actualizar la contraseña.'
      if (updateError.message.toLowerCase().includes('same_password')) {
        errorMsg = 'La nueva contraseña no puede ser igual a la anterior.'
      } else if (updateError.message.toLowerCase().includes('rate limit')) {
        errorMsg = 'Demasiados intentos. Espera unos momentos antes de volver a intentar.'
      }
      return {
        success: false,
        error: updateError.message || errorMsg,
      }
    }

    // 4. Consultar rol del usuario para redirección
    const { data: profile } = await supabase
      .from('profiles')
      .select('rol')
      .eq('id', user.id)
      .single()

    return {
      success: true,
      rol: profile?.rol || 'cliente',
      message: 'Tu contraseña ha sido actualizada con éxito.',
    }
  } catch {
    return {
      success: false,
      error: 'Ha ocurrido un error inesperado de red o servidor.',
    }
  }
}
