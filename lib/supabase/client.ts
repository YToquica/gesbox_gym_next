import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!

  return createBrowserClient(supabaseUrl, supabaseAnonKey, {
    cookieOptions: {
      // Importante en local o IPs HTTP: si es true, el navegador no guardará la cookie
      secure: false,
      sameSite: 'lax',
      path: '/',
    },
  })
}
