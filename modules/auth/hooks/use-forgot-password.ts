'use client'

import { useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { forgotPasswordSchema, type ForgotPasswordInput } from '../schemas'
import { forgotPasswordAction } from '../actions'
import { useRecaptcha } from './use-recaptcha'

export function useForgotPassword() {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)
  const { executeRecaptcha } = useRecaptcha()

  const form = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  })

  const onSubmit = async (data: ForgotPasswordInput) => {
    setError(null)
    setMessage(null)
    setIsSuccess(false)

    startTransition(async () => {
      // 1. Obtener token de seguridad Google reCAPTCHA v3
      const recaptchaToken = await executeRecaptcha('forgot_password')

      // 2. Ejecutar forgotPasswordAction en el servidor
      const result = await forgotPasswordAction({
        email: data.email,
        recaptchaToken: recaptchaToken || undefined,
      })

      if (!result.success) {
        setError(result.error || 'Error al enviar la solicitud de recuperación.')
        return
      }

      setIsSuccess(true)
      setMessage(
        result.message ||
          'Si el correo ingresado está registrado en GESBOX, recibirás un enlace de recuperación en los próximos minutos.'
      )
    })
  }

  const resetState = () => {
    setError(null)
    setMessage(null)
    setIsSuccess(false)
    form.reset()
  }

  return {
    form,
    onSubmit: form.handleSubmit(onSubmit),
    isPending,
    error,
    message,
    isSuccess,
    resetState,
  }
}
