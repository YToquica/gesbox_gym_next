import { Metadata } from 'next'
import { ResetPasswordForm } from '@/modules/auth/components/reset-password-form'

export const metadata: Metadata = {
  title: 'Reestablecer Contraseña | GESBOX',
  description: 'Restablece tu clave de acceso al sistema de control de gimnasio GESBOX.',
}

export default function ReestablecerContrasenaPage() {
  return <ResetPasswordForm />
}
