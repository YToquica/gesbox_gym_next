import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { LoginForm } from '@/modules/auth/components/login-form'

export default async function LoginPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Si el usuario ya está autenticado, redirigir al panel principal
  if (user) {
    redirect('/')
  }

  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-surface-container-low dark:bg-black" />}>
      <LoginForm />
    </Suspense>
  )
}
