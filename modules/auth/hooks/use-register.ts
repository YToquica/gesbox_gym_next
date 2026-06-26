import { useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { registerSchema, type RegisterInput } from '../schemas'
import { registerAction, loginAction } from '../actions'
import { useRouter } from 'next/navigation'

interface UseRegisterProps {
  onSuccess: () => void
}

export function useRegister({ onSuccess }: UseRegisterProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)

  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema as any),
    defaultValues: {
      nombre_completo: '',
      tipo_documento: 'CC',
      numero_documento: '',
      telefono: '',
      email: '',
      password: '',
    },
  })

  const onSubmit = async (data: RegisterInput) => {
    setError(null)
    setIsSuccess(false)
    
    startTransition(async () => {
      const result = await registerAction(data)

      if (!result.success) {
        setError(result.error || 'Ocurrió un error al crear la cuenta.')
        
        // Si hay errores de validación específicos del servidor
        if (result.errors) {
          Object.entries(result.errors).forEach(([field, messages]) => {
            form.setError(field as keyof RegisterInput, {
              type: 'server',
              message: (messages as string[])[0],
            })
          })
        }
        return
      }

      setIsSuccess(true)
      
      // Intentar iniciar sesión automáticamente tras el registro
      const loginResult = await loginAction({
        email: data.email,
        password: data.password,
      })

      if (loginResult.success) {
        router.push('/')
        router.refresh()
      }
      // Si requiere confirmación de email o no se pudo iniciar sesión de inmediato,
      // no llamamos a onSuccess() para que el usuario pueda ver la pantalla de éxito.
      // El usuario puede cambiar a la pestaña de login manualmente con el botón.
    })
  }

  return {
    form,
    onSubmit: form.handleSubmit(onSubmit),
    isPending,
    error,
    isSuccess,
  }
}
