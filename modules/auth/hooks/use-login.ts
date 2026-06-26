import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema, type LoginInput } from '../schemas'
import { loginAction } from '../actions'

export function useLogin() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema as any),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const onSubmit = async (data: LoginInput) => {
    setError(null)
    
    startTransition(async () => {
      const result = await loginAction(data)

      if (!result.success) {
        setError(result.error || 'Ocurrió un error al iniciar sesión.')
        
        // Si hay errores de validación específicos del servidor
        if (result.errors) {
          Object.entries(result.errors).forEach(([field, messages]) => {
            form.setError(field as keyof LoginInput, {
              type: 'server',
              message: (messages as string[])[0],
            })
          })
        }
        return
      }

      // Redirigir al inicio o dashboard tras inicio de sesión exitoso
      router.push('/')
      router.refresh()
    })
  }

  return {
    form,
    onSubmit: form.handleSubmit(onSubmit),
    isPending,
    error,
  }
}
