'use client'

import { useCallback, useEffect, useState } from 'react'

declare global {
  interface Window {
    grecaptcha?: {
      ready: (callback: () => void) => void
      execute: (siteKey: string, options: { action: string }) => Promise<string>
    }
  }
}

let scriptLoadPromise: Promise<void> | null = null

function loadRecaptchaScript(siteKey: string): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve()

  if (window.grecaptcha) {
    return Promise.resolve()
  }

  if (scriptLoadPromise) {
    return scriptLoadPromise
  }

  scriptLoadPromise = new Promise<void>((resolve, reject) => {
    // Verificar si el script ya existe en el DOM
    const existingScript = document.querySelector<HTMLScriptElement>(
      `script[src*="google.com/recaptcha/api.js"]`
    )

    if (existingScript) {
      if (window.grecaptcha) {
        resolve()
      } else {
        existingScript.addEventListener('load', () => resolve())
        existingScript.addEventListener('error', (e) => reject(e))
      }
      return
    }

    const script = document.createElement('script')
    script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`
    script.async = true
    script.defer = true
    script.onload = () => {
      if (window.grecaptcha) {
        window.grecaptcha.ready(() => resolve())
      } else {
        resolve()
      }
    }
    script.onerror = (err) => {
      console.error('[reCAPTCHA] Error al cargar el script de Google reCAPTCHA:', err)
      scriptLoadPromise = null
      reject(err)
    }

    document.head.appendChild(script)
  })

  return scriptLoadPromise
}

export function useRecaptcha() {
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    if (!siteKey) return

    loadRecaptchaScript(siteKey)
      .then(() => setIsLoaded(true))
      .catch((err) => {
        console.warn('[reCAPTCHA] No se pudo cargar el script de reCAPTCHA:', err)
      })
  }, [siteKey])

  const executeRecaptcha = useCallback(
    async (action: string): Promise<string | null> => {
      if (!siteKey) {
        if (process.env.NODE_ENV === 'development') {
          console.warn(
            `[reCAPTCHA] NEXT_PUBLIC_RECAPTCHA_SITE_KEY no está configurada. Omitiendo token para acción '${action}'.`
          )
        }
        return null
      }

      try {
        await loadRecaptchaScript(siteKey)

        if (!window.grecaptcha) {
          console.error('[reCAPTCHA] grecaptcha no está disponible en window.')
          return null
        }

        return await new Promise<string>((resolve, reject) => {
          window.grecaptcha!.ready(async () => {
            try {
              const token = await window.grecaptcha!.execute(siteKey, { action })
              resolve(token)
            } catch (error) {
              reject(error)
            }
          })
        })
      } catch (err) {
        console.error(`[reCAPTCHA] Error al ejecutar reCAPTCHA para la acción '${action}':`, err)
        return null
      }
    },
    [siteKey]
  )

  return {
    executeRecaptcha,
    isLoaded,
    siteKey,
  }
}
