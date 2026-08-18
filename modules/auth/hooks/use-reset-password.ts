'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { resetPasswordSchema, type ResetPasswordInput } from '../schemas'
import { updatePasswordAction, getRolAction } from '../actions'
import { createClient } from '@/lib/supabase/client'

export function useResetPassword() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)

  const form = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
    mode: 'onChange',
  })

  const onSubmit = async (data: ResetPasswordInput) => {
    setError(null)
    setMessage(null)

    startTransition(async () => {
      // 1. Intentar actualizar vía Server Action (flujo PKCE SSR con cookies)
      const result = await updatePasswordAction({
        password: data.password,
        confirmPassword: data.confirmPassword,
      })

      if (result.success) {
        setIsSuccess(true)
        setMessage(result.message || 'Tu contraseña ha sido actualizada con éxito.')
        setTimeout(() => {
          const rol = result.rol || 'cliente'
          if (rol === 'admin' || rol === 'recepcionista') {
            window.location.href = '/dashboard'
          } else {
            window.location.href = '/'
          }
        }, 2000)
        return
      }

      // 2. Fallback de cliente: Si la sesión vino por Hash fragment (#access_token=)
      try {
        const supabase = createClient()
        const { data: updateData, error: clientUpdateError } = await supabase.auth.updateUser({
          password: data.password,
        })

        if (!clientUpdateError && updateData?.user) {
          setIsSuccess(true)
          setMessage('Tu contraseña ha sido actualizada con éxito.')
          const { rol } = await getRolAction(updateData.user.id)
          setTimeout(() => {
            if (rol === 'admin' || rol === 'recepcionista') {
              window.location.href = '/dashboard'
            } else {
              window.location.href = '/'
            }
          }, 2000)
          return
        }

        if (clientUpdateError) {
          setError(clientUpdateError.message || result.error || 'No se pudo actualizar la contraseña.')
          return
        }
      } catch (clientErr) {
        console.error('Error en fallback de cliente:', clientErr)
      }

      setError(result.error || 'No se pudo actualizar la contraseña. Por favor, solicita un nuevo enlace.')
    })
  }

  // Medidor de fortaleza de contraseña (0 a 4)
  const calculatePasswordStrength = (pwd: string) => {
    if (!pwd) return 0
    let score = 0
    if (pwd.length >= 8) score += 1
    if (/[A-Z]/.test(pwd)) score += 1
    if (/[0-9]/.test(pwd)) score += 1
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1
    return score
  }

  return {
    form,
    onSubmit: form.handleSubmit(onSubmit),
    isPending,
    error,
    message,
    isSuccess,
    calculatePasswordStrength,
  }
}
