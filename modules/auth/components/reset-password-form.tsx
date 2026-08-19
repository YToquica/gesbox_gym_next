'use client'

import * as React from 'react'
import Link from 'next/link'
import { Dumbbell, Eye, EyeOff, Loader2, Lock, AlertCircle, CheckCircle, ArrowLeft, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useResetPassword } from '../hooks/use-reset-password'
import { cn } from '@/lib/utils'

export function ResetPasswordForm() {
  const {
    form,
    onSubmit,
    isPending,
    error,
    message,
    isSuccess,
    calculatePasswordStrength,
  } = useResetPassword()

  const [showPassword, setShowPassword] = React.useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false)

  const {
    register,
    watch,
    formState: { errors },
  } = form

  const currentPassword = watch('password') || ''
  const strengthScore = calculatePasswordStrength(currentPassword)

  // Calificación y color del indicador de fortaleza
  const getStrengthMeta = (score: number) => {
    if (!currentPassword) return { label: 'Ingresa una contraseña', color: 'bg-muted', text: 'text-muted-foreground' }
    if (score <= 1) return { label: 'Débil', color: 'bg-red-500', text: 'text-red-500' }
    if (score === 2 || score === 3) return { label: 'Moderada', color: 'bg-amber-500', text: 'text-amber-500' }
    return { label: 'Excelente y segura', color: 'bg-emerald-500', text: 'text-emerald-500' }
  }

  const strengthMeta = getStrengthMeta(strengthScore)

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-4 bg-surface-container-low dark:bg-black">
      <Card className="w-full max-w-4xl overflow-hidden border-border bg-card shadow-ambient rounded-xl md:grid md:grid-cols-2 md:p-0">
        
        {/* Panel izquierdo decorativo (Oculto en móvil) */}
        <div className="relative hidden md:flex flex-col justify-between p-10 bg-gradient-to-br from-zinc-950 via-zinc-900 to-brand-primary-container text-white">
          <Link href="/" className="flex items-center gap-2 w-fit hover:opacity-90 transition-opacity">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-primary text-white shadow-md">
              <Dumbbell className="h-6 w-6" />
            </div>
            <span className="font-heading text-2xl font-black tracking-tight text-white">
              GES<span className="text-brand-primary">BOX</span>
            </span>
          </Link>

          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-primary/20 text-brand-primary text-xs font-semibold">
              <ShieldCheck className="h-4 w-4" />
              <span>Seguridad de la Cuenta</span>
            </div>
            <h2 className="font-heading text-3xl font-extrabold leading-tight">
              Protege el acceso a tu gimnasio.
            </h2>
            <p className="text-sm text-zinc-300">
              Crea una contraseña segura con al menos 6 caracteres para acceder a tus membresías, asistencias o panel administrativo.
            </p>
          </div>

          <div className="text-xs text-zinc-400">
            GESBOX &copy; {new Date().getFullYear()} - Gestión y Control de Gimnasios.
          </div>

          {/* Efectos decorativos de fondo */}
          <div className="absolute top-1/4 right-0 w-32 h-32 bg-brand-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 left-10 w-48 h-48 bg-brand-primary-container/10 rounded-full blur-3xl" />
        </div>

        {/* Panel derecho: Formulario */}
        <div className="flex flex-col justify-between p-6 sm:p-8 md:p-10">
          <div>
            {/* Botón Volver al login */}
            <div className="flex items-center justify-between mb-4">
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors group"
              >
                <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
                <span>Ir al inicio de sesión</span>
              </Link>
            </div>

            {/* Logo para móviles */}
            <div className="flex items-center gap-2 md:hidden mb-6">
              <Link href="/" className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-primary text-white">
                  <Dumbbell className="h-5 w-5" />
                </div>
                <span className="font-heading text-xl font-black tracking-tight">
                  GES<span className="text-brand-primary">BOX</span>
                </span>
              </Link>
            </div>

            <CardHeader className="p-0 mb-6">
              <h1 className="font-heading text-2xl font-black tracking-tight text-foreground flex items-center gap-2">
                <Lock className="h-6 w-6 text-brand-primary" />
                Actualizar Contraseña
              </h1>
              <CardDescription className="text-sm text-muted-foreground mt-1">
                Ingresa tu nueva clave de acceso para restablecer tu cuenta.
              </CardDescription>
            </CardHeader>

            {isSuccess ? (
              <div className="text-center space-y-4 py-6 animate-[fadeIn_0.2s_ease-out]">
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400">
                  <CheckCircle className="h-8 w-8" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="font-heading text-xl font-bold text-foreground">
                    ¡Contraseña actualizada!
                  </h3>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                    {message || 'Tu contraseña ha sido modificada correctamente. Te estamos redirigiendo...'}
                  </p>
                </div>

                <div className="pt-2">
                  <Link href="/login">
                    <Button className="w-full bg-brand-primary text-white hover:bg-brand-primary/95 font-medium">
                      Iniciar Sesión Ahora
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="space-y-4">
                {/* Alerta de Error */}
                {error && (
                  <div className="flex items-start gap-2 p-3 text-xs rounded-lg border border-brand-error/20 bg-brand-error/10 text-brand-error animate-[fadeIn_0.2s_ease-out]">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    <p className="font-medium">{error}</p>
                  </div>
                )}

                {/* Campo: Nueva Contraseña */}
                <div className="space-y-1.5">
                  <Label htmlFor="password" className="text-xs font-semibold text-foreground">
                    Nueva Contraseña
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      className="pl-9 pr-10 h-9 border-input focus:border-ring focus:ring-ring bg-surface-container-lowest"
                      disabled={isPending}
                      {...register('password')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground transition-colors"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-[11px] font-medium text-brand-error animate-[fadeIn_0.2s_ease-out]">
                      {errors.password.message}
                    </p>
                  )}

                  {/* Indicador de Fortaleza */}
                  {currentPassword.length > 0 && (
                    <div className="pt-1 space-y-1 animate-[fadeIn_0.2s_ease-out]">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-muted-foreground font-medium">Seguridad:</span>
                        <span className={cn("font-bold", strengthMeta.text)}>{strengthMeta.label}</span>
                      </div>
                      <div className="grid grid-cols-4 gap-1 h-1.5 rounded-full bg-muted overflow-hidden">
                        <div className={cn("h-full transition-colors", strengthScore >= 1 ? strengthMeta.color : "bg-transparent")} />
                        <div className={cn("h-full transition-colors", strengthScore >= 2 ? strengthMeta.color : "bg-transparent")} />
                        <div className={cn("h-full transition-colors", strengthScore >= 3 ? strengthMeta.color : "bg-transparent")} />
                        <div className={cn("h-full transition-colors", strengthScore >= 4 ? strengthMeta.color : "bg-transparent")} />
                      </div>
                    </div>
                  )}
                </div>

                {/* Campo: Confirmar Contraseña */}
                <div className="space-y-1.5">
                  <Label htmlFor="confirmPassword" className="text-xs font-semibold text-foreground">
                    Confirmar Nueva Contraseña
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      className="pl-9 pr-10 h-9 border-input focus:border-ring focus:ring-ring bg-surface-container-lowest"
                      disabled={isPending}
                      {...register('confirmPassword')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground transition-colors"
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-[11px] font-medium text-brand-error animate-[fadeIn_0.2s_ease-out]">
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </div>

                {/* Botón de Enviar */}
                <Button
                  type="submit"
                  className="w-full h-10 mt-3 bg-brand-primary text-white hover:bg-brand-primary/95 transition-all flex items-center justify-center gap-2 font-medium"
                  disabled={isPending}
                >
                  {isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Guardando nueva contraseña...
                    </>
                  ) : (
                    'Guardar y Actualizar Contraseña'
                  )}
                </Button>
              </form>
            )}
          </div>

          <CardFooter className="p-0 mt-6 text-center text-xs text-muted-foreground justify-center md:hidden">
            GESBOX &copy; {new Date().getFullYear()} - Control de gimnasio.
          </CardFooter>
        </div>
      </Card>
    </div>
  )
}
