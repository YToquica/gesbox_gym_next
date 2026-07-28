import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { XCircle } from 'lucide-react'
import { ForceLightMode } from '@/components/shared/theme-forcer'

export default function PagoFallidoPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <ForceLightMode />
      <div className="max-w-md w-full bg-card border border-brand-error/20 rounded-2xl p-8 text-center shadow-lg animate-in zoom-in-95 duration-500">
        <div className="mx-auto w-16 h-16 bg-brand-error/10 rounded-full flex items-center justify-center mb-6">
          <XCircle className="w-10 h-10 text-brand-error" />
        </div>
        
        <h1 className="text-2xl font-black font-heading mb-2 text-foreground">Pago Rechazado</h1>
        <p className="text-muted-foreground mb-8 text-sm">
          Tuvimos un problema procesando tu pago. Por favor, intenta nuevamente o utiliza otro método de pago.
        </p>
        
        <Button asChild className="w-full h-12 font-bold text-base bg-brand-error hover:bg-brand-error/90">
          <Link href="/mi-perfil">
            Volver a intentar
          </Link>
        </Button>
      </div>
    </div>
  )
}
