import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Clock } from 'lucide-react'
import { ForceLightMode } from '@/components/shared/theme-forcer'

export default function PagoPendientePage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <ForceLightMode />
      <div className="max-w-md w-full bg-card border border-border/80 rounded-2xl p-8 text-center shadow-lg animate-in zoom-in-95 duration-500">
        <div className="mx-auto w-16 h-16 bg-orange-500/10 rounded-full flex items-center justify-center mb-6">
          <Clock className="w-10 h-10 text-orange-500" />
        </div>
        
        <h1 className="text-2xl font-black font-heading mb-2 text-foreground">Pago Pendiente</h1>
        <p className="text-muted-foreground mb-8 text-sm">
          Tu pago está siendo procesado por la pasarela de pagos. Tu membresía se activará tan pronto como recibamos la confirmación.
        </p>
        
        <Button asChild className="w-full h-12 font-bold text-base bg-orange-500 hover:bg-orange-600 text-white">
          <Link href="/mi-perfil">
            Ir a mi portal
          </Link>
        </Button>
      </div>
    </div>
  )
}
