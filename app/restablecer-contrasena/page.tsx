import { Metadata } from 'next'
import { ResetPasswordForm } from '@/modules/auth/components/reset-password-form'

export const metadata: Metadata = {
  title: 'Restablecer Contraseña | GESBOX',
  description: 'Restablece tu clave de acceso al sistema de control de gimnasio GESBOX.',
}

export default function RestablecerContrasenaPage() {
  return <ResetPasswordForm />
}
