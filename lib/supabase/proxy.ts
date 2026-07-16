import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request,
  })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          const cookies = request.cookies.getAll()
          console.log(`[DEBUG PROXY] getAll() for ${request.nextUrl.pathname} - Found ${cookies.length} cookies`)
          return cookies
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options: any }>) {
          console.log(`[DEBUG PROXY] setAll() called with ${cookiesToSet.length} cookies`)
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) => {
            const cookieOptions = { ...options }
            cookieOptions.secure = false
            cookieOptions.sameSite = 'lax'
            response.cookies.set(name, value, cookieOptions as any)
          })
        },
      }
    }
  )

  // Refresca la sesión si ha expirado — IMPORTANTE: usar getUser(), no getSession()
  const { data: { user }, error } = await supabase.auth.getUser()
  console.log(`[DEBUG PROXY] Path: ${request.nextUrl.pathname} | User ID: ${user?.id} | Error:`, error?.message)

  const { pathname } = request.nextUrl

  // Las peticiones POST de Server Actions no deben ser redirigidas —
  // llevan el header 'next-action' y esperan una respuesta JSON, no un redirect.
  const isServerAction = request.method === 'POST' && request.headers.has('next-action')
  if (isServerAction) {
    return response
  }

  // Proteger rutas del dashboard: redirigir a /login si no hay sesión
  if (!user && pathname.startsWith('/dashboard')) {
    console.log(`[DEBUG PROXY] Redirecting to /login because !user for path ${pathname}`)
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/login'
    return NextResponse.redirect(loginUrl)
  }

  // Si hay sesión y va a /login, redirigir a home
  if (user && pathname === '/login') {
    console.log(`[DEBUG PROXY] Redirecting to / because user exists for path /login`)
    const homeUrl = request.nextUrl.clone()
    homeUrl.pathname = '/'
    return NextResponse.redirect(homeUrl)
  }

  return response
}

