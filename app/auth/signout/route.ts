import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  
  // Cerrar sesión en Supabase (limpia las cookies locales)
  await supabase.auth.signOut()

  const requestUrl = new URL(request.url)
  return NextResponse.redirect(new URL('/login', requestUrl.origin), {
    status: 302,
  })
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  
  await supabase.auth.signOut()

  const requestUrl = new URL(request.url)
  return NextResponse.redirect(new URL('/login', requestUrl.origin), {
    status: 302,
  })
}
