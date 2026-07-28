import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { MercadoPagoConfig, Payment } from 'mercadopago'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    console.log('Webhook de MercadoPago recibido:', body)

    // MercadoPago a veces envía validaciones iniciales
    if (body.action !== 'payment.created' && body.type !== 'payment') {
      return NextResponse.json({ received: true })
    }

    const paymentId = body.data?.id
    if (!paymentId) {
      return NextResponse.json({ error: 'Falta data.id' }, { status: 400 })
    }

    // 1. Obtener detalles del pago desde MercadoPago para verificar
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN
    if (!accessToken) {
      console.error('MERCADOPAGO_ACCESS_TOKEN no está definido')
      return NextResponse.json({ error: 'Config error' }, { status: 500 })
    }

    const client = new MercadoPagoConfig({ accessToken, options: { timeout: 5000 } })
    const paymentClient = new Payment(client)

    const paymentInfo = await paymentClient.get({ id: paymentId })

    if (paymentInfo.status !== 'approved') {
      console.log(`Pago ${paymentId} no está aprobado. Estado: ${paymentInfo.status}`)
      return NextResponse.json({ received: true, status: paymentInfo.status })
    }

    // 2. Extraer los metadatos que enviamos en external_reference
    if (!paymentInfo.external_reference) {
      return NextResponse.json({ error: 'Falta external_reference' }, { status: 400 })
    }

    const { userId, planId, duracion_dias, precio } = JSON.parse(paymentInfo.external_reference)

    // 3. Crear cliente Supabase Admin para evadir el RLS y poder crear la membresía
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Faltan credenciales de Supabase Admin')
      return NextResponse.json({ error: 'Supabase Admin config error' }, { status: 500 })
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

    // 4. Calcular fechas
    const fechaInicio = new Date()
    const fechaFin = new Date()
    fechaFin.setDate(fechaFin.getDate() + duracion_dias)

    // 5. Crear la membresía
    const { data: newMembresia, error: insertError } = await supabaseAdmin
      .from('membresias')
      .insert({
        perfil_id: userId,
        plan_id: planId,
        fecha_inicio: fechaInicio.toISOString().split('T')[0],
        fecha_fin: fechaFin.toISOString().split('T')[0],
        estado: 'activo'
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error al insertar membresía:', insertError)
      return NextResponse.json({ error: 'Error BD membresia' }, { status: 500 })
    }

    // 6. Crear el registro de pago asociado a la membresía
    const { error: pagoError } = await supabaseAdmin.from('pagos').insert({
      membresia_id: newMembresia.id,
      monto: precio,
      metodo_pago: 'Tarjeta', // En un caso real se mapea según paymentInfo.payment_method_id
      fecha_pago: new Date().toISOString()
    })

    if (pagoError) {
      console.error('Error al registrar el pago:', pagoError)
      // Aunque falle el registro del pago, la membresía ya se creó.
      // Se podría manejar con transacciones o dejar así.
    }

    return NextResponse.json({ success: true, membresiaId: newMembresia.id })
  } catch (error: any) {
    console.error('Error en webhook de MP:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
