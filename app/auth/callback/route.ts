import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { EmailOtpType } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const next = searchParams.get('next') || '/actualizar-contrasena'

  const supabase = await createClient()

  if (code) {
    // Intercambio de código PKCE por sesión
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // Redirigir a la ruta destino preservando el origen
      const forwardUrl = new URL(next, origin)
      return NextResponse.redirect(forwardUrl)
    }
  } else if (token_hash && type) {
    // Manejo alternativo de token hash para verificación de OTP/Recuperación
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    })
    if (!error) {
      const forwardUrl = new URL(next, origin)
      return NextResponse.redirect(forwardUrl)
    }
  }

  // Si ocurre un error o el enlace es inválido/expirado, redirigir al login con mensaje de error
  const errorUrl = new URL('/login?error=enlace_invalido_o_expirado', origin)
  return NextResponse.redirect(errorUrl)
}
