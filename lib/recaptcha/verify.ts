interface RecaptchaVerifyResponse {
  success: boolean
  score?: number
  action?: string
  challenge_ts?: string
  hostname?: string
  'error-codes'?: string[]
}

export interface VerifyRecaptchaResult {
  success: boolean
  score?: number
  error?: string
}

const MINIMUM_SCORE_THRESHOLD = 0.5

/**
 * Valida un token de Google reCAPTCHA v3 en el servidor.
 * 
 * @param token - Token generado en el cliente por grecaptcha.execute
 * @param expectedAction - Acción esperada (ej. 'login', 'register')
 * @returns Resultado de la verificación
 */
export async function verifyRecaptchaToken(
  token: string | undefined | null,
  expectedAction: string
): Promise<VerifyRecaptchaResult> {
  const secretKey = process.env.RECAPTCHA_SECRET_KEY

  // Fallback en entorno de desarrollo si no está configurada la clave secreta
  if (!secretKey) {
    if (process.env.NODE_ENV === 'development') {
      console.warn(
        `[reCAPTCHA] Advertencia: RECAPTCHA_SECRET_KEY no está configurada en .env.local. Bypass concedido en desarrollo para la acción '${expectedAction}'.`
      )
      return { success: true, score: 1.0 }
    }
    return {
      success: false,
      error: 'La clave de seguridad reCAPTCHA no está configurada en el servidor.',
    }
  }

  if (!token) {
    return {
      success: false,
      error: 'Token de seguridad reCAPTCHA no proporcionado o inválido.',
    }
  }

  try {
    const params = new URLSearchParams({
      secret: secretKey,
      response: token,
    })

    const res = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
      cache: 'no-store',
    })

    if (!res.ok) {
      return {
        success: false,
        error: `Error al contactar el servicio de validación de Google (${res.status}).`,
      }
    }

    const data: RecaptchaVerifyResponse = await res.json()

    if (!data.success) {
      const errorCodes = data['error-codes']?.join(', ') || 'Desconocido'
      console.error(`[reCAPTCHA] Verificación fallida de Google. Códigos: ${errorCodes}`)
      return {
        success: false,
        error: 'Verificación de seguridad fallida. Intenta nuevamente.',
      }
    }

    // Validar acción esperada si Google la reporta
    if (data.action && data.action !== expectedAction) {
      console.warn(
        `[reCAPTCHA] Discrepancia de acción: recibida '${data.action}', esperada '${expectedAction}'`
      )
      return {
        success: false,
        error: 'Acción de seguridad no coincide con la solicitud actual.',
      }
    }

    // Validar score de bot / humano (reCAPTCHA v3 va de 0.0 a 1.0)
    const score = typeof data.score === 'number' ? data.score : 0
    if (score < MINIMUM_SCORE_THRESHOLD) {
      console.warn(`[reCAPTCHA] Puntuación de seguridad baja (${score} < ${MINIMUM_SCORE_THRESHOLD})`)
      return {
        success: false,
        score,
        error: 'Actividad sospechosa detectada. Intenta nuevamente más tarde.',
      }
    }

    return {
      success: true,
      score,
    }
  } catch (err) {
    console.error('[reCAPTCHA] Error al procesar la verificación:', err)
    return {
      success: false,
      error: 'Error inesperado al validar la seguridad de la petición.',
    }
  }
}
