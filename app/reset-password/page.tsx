import { Metadata } from 'next'
import { ResetPasswordForm } from '@/modules/auth/components/reset-password-form'

export const metadata: Metadata = {
  title: 'Reset Password | GESBOX',
  description: 'Restablece tu clave de acceso al sistema de control de gimnasio GESBOX.',
}

export default function ResetPasswordPage() {
  return <ResetPasswordForm />
}
