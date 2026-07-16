import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema, type LoginInput } from '../schemas'
import { createClient } from '@/lib/supabase/client'

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
      // 1. Login con el cliente browser — el SDK guarda las cookies
      //    de sesión automáticamente en el navegador.
      const supabase = createClient()
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      })

      if (signInError || !signInData.user) {
        let errorMessage = 'Error al iniciar sesión. Por favor, intenta de nuevo.'
        if (signInError?.status === 400 || signInError?.message?.toLowerCase().includes('invalid login credentials')) {
          errorMessage = 'Correo electrónico o contraseña incorrectos.'
        } else if (signInError?.message?.toLowerCase().includes('email not confirmed')) {
          errorMessage = 'El correo electrónico asociado no ha sido confirmado.'
        } else if (signInError?.message?.toLowerCase().includes('rate limit')) {
          errorMessage = 'Demasiados intentos fallidos. Por favor, espera un momento.'
        }
        setError(errorMessage)
        return
      }

      // 2. Consultar el rol usando el cliente browser (el usuario ya está autenticado).
      //    Se evita usar un Server Action aquí para prevenir que el middleware
      //    intercepte el POST y lo redirija incorrectamente.
      const { data: profile } = await supabase
        .from('profiles')
        .select('rol')
        .eq('id', signInData.user.id)
        .single()

      const rol = profile?.rol ?? 'cliente'

      // 3. Sincronizar el estado SSR con la sesión recién creada
      router.refresh()

      // 4. Redirigir según el rol
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

