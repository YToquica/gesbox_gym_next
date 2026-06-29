import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY! ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  const isLocalhost = request.nextUrl.hostname === 'localhost' || request.nextUrl.hostname === '127.0.0.1'
  const isSecure = process.env.NODE_ENV === 'production' && !isLocalhost

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options: any }>) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, {
              ...options,
              secure: isSecure,
            } as any)
          )
        },
      },
      cookieOptions: {
        secure: isSecure,
      }
    }
  )

  // refresca la sesión si ha expirado
  await supabase.auth.getUser()

  return response
}
