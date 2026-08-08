'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema, type LoginInput } from '../schemas'
import { loginAction } from '../actions'
import { useRecaptcha } from './use-recaptcha'

export function useLogin() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const { executeRecaptcha } = useRecaptcha()

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const onSubmit = async (data: LoginInput) => {
    setError(null)

    startTransition(async () => {
      // 1. Obtener token de seguridad Google reCAPTCHA v3
      const recaptchaToken = await executeRecaptcha('login')

      // 2. Ejecutar loginAction en el servidor validando reCAPTCHA y autenticación
      const result = await loginAction({
        email: data.email,
        password: data.password,
        recaptchaToken: recaptchaToken || undefined,
      })

      if (!result.success) {
        setError(result.error || 'Error al iniciar sesión. Por favor, intenta de nuevo.')
        return
      }

      // 3. Sincronizar el estado SSR con la sesión recién creada
      router.refresh()

      // 4. Redirigir según el rol del usuario
      const rol = result.rol || 'cliente'
      if (rol === 'admin' || rol === 'recepcionista') {
        window.location.href = '/dashboard'
      } else {
        window.location.href = '/'
      }
    })
  }

  return {
    form,
    onSubmit: form.handleSubmit(onSubmit),
    isPending,
    error,
  }
}
