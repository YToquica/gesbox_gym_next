'use client'

import * as React from 'react'
import { Dumbbell, Eye, EyeOff, Loader2, Lock, Mail, AlertCircle, User, CheckCircle, Smartphone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useLogin } from '../hooks/use-login'
import { useRegister } from '../hooks/use-register'
import { cn } from '@/lib/utils'

export function LoginForm() {
  const [mode, setMode] = React.useState<'login' | 'register'>('login')
  
  // Login Hook
  const { form: loginForm, onSubmit: onLoginSubmit, isPending: isLoginPending, error: loginError } = useLogin()
  const [showPassword, setShowPassword] = React.useState(false)

  // Registration Hook
  const { 
    form: registerForm, 
    onSubmit: onRegisterSubmit, 
    isPending: isRegisterPending, 
    error: registerError,
    isSuccess: isRegisterSuccess
  } = useRegister({
    onSuccess: () => {
      // Si el registro fue exitoso pero no inició sesión automáticamente (ej. verificación de correo)
      // pasamos a la vista de login y mostramos una notificación
      setMode('login')
    }
  })
  const [showRegisterPassword, setShowRegisterPassword] = React.useState(false)

  const {
    register: loginRegister,
    formState: { errors: loginErrors },
  } = loginForm

  const {
    register: registerRegister,
    formState: { errors: registerErrors },
  } = registerForm

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-4 bg-surface-container-low dark:bg-black">
      <Card className="w-full max-w-4xl overflow-hidden border-border bg-card shadow-ambient rounded-xl md:grid md:grid-cols-2 md:p-0">
        
        {/* Panel izquierdo decorativo (Oculto en móvil) */}
        <div className="relative hidden md:flex flex-col justify-between p-10 bg-gradient-to-br from-zinc-950 via-zinc-900 to-brand-primary-container text-white">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-primary text-white shadow-md">
              <Dumbbell className="h-6 w-6" />
            </div>
            <span className="font-heading text-2xl font-black tracking-tight text-white">
              GES<span className="text-brand-primary">BOX</span>
            </span>
          </div>

          <div className="space-y-4">
            <h2 className="font-heading text-3xl font-extrabold leading-tight">
              Control total en el mostrador de tu gimnasio.
            </h2>
            <p className="text-sm text-zinc-300">
              Registra pagos manuales, valida ingresos al instante mediante número de cédula y evita el acceso de clientes morosos.
            </p>
          </div>

          <div className="text-xs text-zinc-400">
            GESBOX v1.0.0 &copy; {new Date().getFullYear()} - Gestión de Gimnasios en Colombia.
          </div>

          {/* Efectos decorativos de fondo */}
          <div className="absolute top-1/4 right-0 w-32 h-32 bg-brand-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 left-10 w-48 h-48 bg-brand-primary-container/10 rounded-full blur-3xl" />
        </div>

        {/* Panel derecho: Formulario */}
        <div className="flex flex-col justify-between p-6 sm:p-8 md:p-10">
          <div>
            {/* Logo para móviles */}
            <div className="flex items-center gap-2 md:hidden mb-6">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-primary text-white">
                <Dumbbell className="h-5 w-5" />
              </div>
              <span className="font-heading text-xl font-black tracking-tight">
                GES<span className="text-brand-primary">BOX</span>
              </span>
            </div>

            {/* Selector de Modo (Tabs) */}
            <div className="grid grid-cols-2 gap-1 p-1 bg-muted rounded-lg mb-6">
              <button
                type="button"
                onClick={() => setMode('login')}
                className={cn(
                  "py-1.5 text-xs font-semibold rounded-md transition-all duration-200",
                  mode === 'login'
                    ? "bg-background text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Iniciar Sesión
              </button>
              <button
                type="button"
                onClick={() => setMode('register')}
                className={cn(
                  "py-1.5 text-xs font-semibold rounded-md transition-all duration-200",
                  mode === 'register'
                    ? "bg-background text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Registrar Cliente
              </button>
            </div>

            {mode === 'login' ? (
              /* ================== FORMULARIO DE INICIO DE SESIÓN ================== */
              <div>
                <CardHeader className="p-0 mb-6">
                  <CardTitle className="font-heading text-2xl font-bold tracking-tight text-foreground">
                    ¡Bienvenido de nuevo!
                  </CardTitle>
                  <CardDescription className="text-sm text-muted-foreground mt-1">
                    Ingresa tus credenciales de Recepcionista o Administrador para acceder.
                  </CardDescription>
                </CardHeader>

                <form onSubmit={onLoginSubmit} className="space-y-4">
                  {/* Alerta de Error General */}
                  {loginError && (
                    <div className="flex items-start gap-2 p-3 text-xs rounded-lg border border-brand-error/20 bg-brand-error/10 text-brand-error animate-[fadeIn_0.2s_ease-out]">
                      <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                      <p className="font-medium">{loginError}</p>
                    </div>
                  )}

                  {/* Campo: Correo Electrónico */}
                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-xs font-semibold text-foreground">
                      Correo Electrónico
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="nombre@gimnasio.com"
                        className="pl-9 pr-4 h-9 border-input focus:border-ring focus:ring-ring bg-surface-container-lowest"
                        disabled={isLoginPending}
                        {...loginRegister('email')}
                      />
                    </div>
                    {loginErrors.email && (
                      <p className="text-[11px] font-medium text-brand-error animate-[fadeIn_0.2s_ease-out]">
                        {loginErrors.email.message}
                      </p>
                    )}
                  </div>

                  {/* Campo: Contraseña */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password" className="text-xs font-semibold text-foreground">
                        Contraseña
                      </Label>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        className="pl-9 pr-10 h-9 border-input focus:border-ring focus:ring-ring bg-surface-container-lowest"
                        disabled={isLoginPending}
                        {...loginRegister('password')}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground transition-colors"
                        tabIndex={-1}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    {loginErrors.password && (
                      <p className="text-[11px] font-medium text-brand-error animate-[fadeIn_0.2s_ease-out]">
                        {loginErrors.password.message}
                      </p>
                    )}
                  </div>

                  {/* Botón de Enviar */}
                  <Button
                    type="submit"
                    className="w-full h-10 mt-2 bg-brand-primary text-white hover:bg-brand-primary/95 transition-all flex items-center justify-center gap-2 font-medium"
                    disabled={isLoginPending}
                  >
                    {isLoginPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Iniciando sesión...
                      </>
                    ) : (
                      'Ingresar al Sistema'
                    )}
                  </Button>
                </form>
              </div>
            ) : (
              /* ================== FORMULARIO DE REGISTRO DE CLIENTE ================== */
              <div>
                <CardHeader className="p-0 mb-6">
                  <CardTitle className="font-heading text-2xl font-bold tracking-tight text-foreground">
                    Registro de Nuevo Cliente
                  </CardTitle>
                  <CardDescription className="text-sm text-muted-foreground mt-1">
                    Crea tu cuenta de cliente para poder ser validado en mostrador.
                  </CardDescription>
                </CardHeader>

                {isRegisterSuccess ? (
                  <div className="text-center space-y-4 py-8 animate-[fadeIn_0.2s_ease-out]">
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10 text-green-600 dark:bg-green-950/30 dark:text-green-400">
                      <CheckCircle className="h-6 w-6" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-heading text-lg font-bold">¡Registro Exitoso!</h3>
                      <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                        El cliente ha sido registrado correctamente en la base de datos de Supabase.
                      </p>
                      <p className="text-[11px] text-muted-foreground/80 max-w-xs mx-auto mt-2">
                        Por favor revisa el correo de verificación si es requerido para activar la cuenta, luego puedes iniciar sesión.
                      </p>
                    </div>
                    <Button 
                      onClick={() => {
                        setMode('login')
                        registerForm.reset()
                      }} 
                      className="w-full mt-2 bg-brand-primary text-white hover:bg-brand-primary/95"
                    >
                      Ir a Iniciar Sesión
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={onRegisterSubmit} className="space-y-3">
                    {/* Alerta de Error General */}
                    {registerError && (
                      <div className="flex items-start gap-2 p-3 text-xs rounded-lg border border-brand-error/20 bg-brand-error/10 text-brand-error animate-[fadeIn_0.2s_ease-out]">
                        <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                        <p className="font-medium">{registerError}</p>
                      </div>
                    )}

                    {/* Campo: Nombre Completo */}
                    <div className="space-y-1">
                      <Label htmlFor="nombre_completo" className="text-xs font-semibold text-foreground">
                        Nombre Completo
                      </Label>
                      <div className="relative">
                        <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="nombre_completo"
                          type="text"
                          placeholder="Nombre y Apellido"
                          className="pl-9 pr-4 h-9 border-input focus:border-ring focus:ring-ring bg-surface-container-lowest"
                          disabled={isRegisterPending}
                          {...registerRegister('nombre_completo')}
                        />
                      </div>
                      {registerErrors.nombre_completo && (
                        <p className="text-[10px] font-medium text-brand-error mt-0.5">
                          {registerErrors.nombre_completo.message}
                        </p>
                      )}
                    </div>

                    {/* Grupo de Identificación */}
                    <div className="grid grid-cols-3 gap-2">
                      <div className="col-span-1 space-y-1">
                        <Label htmlFor="tipo_documento" className="text-xs font-semibold text-foreground">
                          Tipo Doc.
                        </Label>
                        <select
                          id="tipo_documento"
                          className="w-full px-2 h-9 text-sm rounded-md border border-input focus:border-ring focus:ring-ring bg-surface-container-lowest text-foreground"
                          disabled={isRegisterPending}
                          {...registerRegister('tipo_documento')}
                        >
                          <option value="CC">C.C.</option>
                          <option value="CE">C.E.</option>
                          <option value="TI">T.I.</option>
                          <option value="PASAPORTE">PAS</option>
                        </select>
                        {registerErrors.tipo_documento && (
                          <p className="text-[10px] font-medium text-brand-error mt-0.5">
                            {registerErrors.tipo_documento.message}
                          </p>
                        )}
                      </div>

                      <div className="col-span-2 space-y-1">
                        <Label htmlFor="numero_documento" className="text-xs font-semibold text-foreground">
                          Número Documento
                        </Label>
                        <Input
                          id="numero_documento"
                          type="text"
                          placeholder="Ej. 10203040"
                          className="h-9 border-input focus:border-ring focus:ring-ring bg-surface-container-lowest font-mono"
                          disabled={isRegisterPending}
                          {...registerRegister('numero_documento')}
                        />
                        {registerErrors.numero_documento && (
                          <p className="text-[10px] font-medium text-brand-error mt-0.5">
                            {registerErrors.numero_documento.message}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Campo: Teléfono */}
                    <div className="space-y-1">
                      <Label htmlFor="telefono" className="text-xs font-semibold text-foreground">
                        Teléfono Móvil
                      </Label>
                      <div className="relative">
                        <Smartphone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="telefono"
                          type="text"
                          placeholder="Ej. 3001234567"
                          className="pl-9 pr-4 h-9 border-input focus:border-ring focus:ring-ring bg-surface-container-lowest font-mono"
                          disabled={isRegisterPending}
                          {...registerRegister('telefono')}
                        />
                      </div>
                      {registerErrors.telefono && (
                        <p className="text-[10px] font-medium text-brand-error mt-0.5">
                          {registerErrors.telefono.message}
                        </p>
                      )}
                    </div>

                    {/* Campo: Correo Electrónico */}
                    <div className="space-y-1">
                      <Label htmlFor="reg_email" className="text-xs font-semibold text-foreground">
                        Correo Electrónico
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="reg_email"
                          type="email"
                          placeholder="nombre@correo.com"
                          className="pl-9 pr-4 h-9 border-input focus:border-ring focus:ring-ring bg-surface-container-lowest"
                          disabled={isRegisterPending}
                          {...registerRegister('email')}
                        />
                      </div>
                      {registerErrors.email && (
                        <p className="text-[10px] font-medium text-brand-error mt-0.5">
                          {registerErrors.email.message}
                        </p>
                      )}
                    </div>

                    {/* Campo: Contraseña */}
                    <div className="space-y-1">
                      <Label htmlFor="reg_password" className="text-xs font-semibold text-foreground">
                        Contraseña
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="reg_password"
                          type={showRegisterPassword ? 'text' : 'password'}
                          placeholder="Mínimo 6 caracteres"
                          className="pl-9 pr-10 h-9 border-input focus:border-ring focus:ring-ring bg-surface-container-lowest"
                          disabled={isRegisterPending}
                          {...registerRegister('password')}
                        />
                        <button
                          type="button"
                          onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                          className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground transition-colors"
                          tabIndex={-1}
                        >
                          {showRegisterPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                      {registerErrors.password && (
                        <p className="text-[10px] font-medium text-brand-error mt-0.5">
                          {registerErrors.password.message}
                        </p>
                      )}
                    </div>

                    {/* Botón de Registro */}
                    <Button
                      type="submit"
                      className="w-full h-10 mt-3 bg-brand-primary text-white hover:bg-brand-primary/95 transition-all flex items-center justify-center gap-2 font-medium"
                      disabled={isRegisterPending}
                    >
                      {isRegisterPending ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Registrando cliente...
                        </>
                      ) : (
                        'Registrar e Iniciar Sesión'
                      )}
                    </Button>
                  </form>
                )}
              </div>
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
