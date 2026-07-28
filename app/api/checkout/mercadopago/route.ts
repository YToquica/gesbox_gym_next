import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { MercadoPagoConfig, Preference } from 'mercadopago'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const { planId } = await request.json()

    if (!planId) {
      return NextResponse.json({ error: 'ID de plan requerido' }, { status: 400 })
    }

    // Obtener los datos del plan desde Supabase
    const { data: plan, error: planError } = await supabase
      .from('planes')
      .select('*')
      .eq('id', planId)
      .single()

    if (planError || !plan) {
      return NextResponse.json({ error: 'Plan no encontrado' }, { status: 404 })
    }

    // Inicializar MercadoPago
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN
    if (!accessToken) {
      console.error('MERCADOPAGO_ACCESS_TOKEN no está definido')
      return NextResponse.json({ error: 'Error de configuración del servidor' }, { status: 500 })
    }

    const client = new MercadoPagoConfig({ accessToken, options: { timeout: 5000 } })
    const preference = new Preference(client)

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    // Crear la preferencia
    const result = await preference.create({
      body: {
        items: [
          {
            id: plan.id.toString(),
            title: `Membresía - ${plan.nombre}`,
            quantity: 1,
            unit_price: Number(plan.precio),
            currency_id: 'COP',
            description: `Acceso al gimnasio por ${plan.duracion_dias} días`
          }
        ],
        payer: {
          email: user.email,
        },
        back_urls: {
          success: `${appUrl}/mi-perfil/pago-exitoso`,
          failure: `${appUrl}/mi-perfil/pago-fallido`,
          pending: `${appUrl}/mi-perfil/pago-pendiente`
        },
        auto_return: 'approved',
        external_reference: JSON.stringify({
          userId: user.id,
          planId: plan.id,
          duracion_dias: plan.duracion_dias,
          precio: plan.precio
        }),
        notification_url: `${appUrl}/api/webhooks/mercadopago`,
      }
    })

    return NextResponse.json({ init_point: result.init_point })

  } catch (error: any) {
    console.error('Error al crear preferencia de MercadoPago:', error)
    return NextResponse.json(
      { error: 'Error interno al procesar el pago' },
      { status: 500 }
    )
  }
}
