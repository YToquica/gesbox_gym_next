import { createServerClient } from '@supabase/ssr'
import { cookies, headers } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()
  const headersList = await headers()
  const host = headersList.get('host') || ''
  const isLocalhost = host.includes('localhost') || host.includes('127.0.0.1')
  const isSecure = process.env.NODE_ENV === 'production' && !isLocalhost

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY! ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  return createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, {
                ...options,
                secure: isSecure,
              })
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware/proxy refreshing user sessions.
          }
        },
      },
      cookieOptions: {
        secure: isSecure,
      },
    }
  )
}
