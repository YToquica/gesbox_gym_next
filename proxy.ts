import { type NextRequest } from 'next/server'
import { updateSession } from './lib/supabase/proxy'

// En Next.js 16 con Turbopack, el archivo se llama proxy.ts
// y la función exportada DEBE llamarse 'proxy' (no 'middleware')
export async function proxy(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Ejecuta el proxy en todas las rutas excepto:
     * - _next/static (archivos estáticos)
     * - _next/image (imágenes optimizadas)
     * - favicon.ico
     * - archivos de imagen
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
