import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request,
  })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY! ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          const cookies = request.cookies.getAll()
          console.log('[DEBUG PROXY] getAll:', cookies)
          return cookies
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options: any }>) {
          console.log('[DEBUG PROXY] setAll:', cookiesToSet)
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) => {
            const cookieOptions = { ...options }
            // Desactivar Secure para que el navegador envíe cookies bajo HTTP (localhost)
            cookieOptions.secure = false
            cookieOptions.sameSite = 'lax'
            response.cookies.set(name, value, cookieOptions as any)
          })
        },
      }
    }
  )

  // refresca la sesión si ha expirado
  const { data: { user }, error } = await supabase.auth.getUser()
  console.log('[DEBUG PROXY] Auth user:', user ? user.id : null, 'Error:', error)

  return response
}
