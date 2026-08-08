# Implementation Plan: Google reCAPTCHA v3 en Registro e Inicio de Sesión

Integración de Google reCAPTCHA v3 en los flujos de autenticación de GesBox utilizando Next.js App Router y Server Actions.

## Phase 1: Configuración del Entorno y Verificación en el Servidor

Infraestructura de variables de entorno y utilidad de verificación del lado del servidor para validar tokens con Google.

- [x] Task: Configurar variables de entorno en `.env.example` y schemas de validación (5bdf8f7)
    - [x] Documentar `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` y `RECAPTCHA_SECRET_KEY` en `.env.example`
    - [x] Actualizar schemas de `LoginInput` y `RegisterInput` en `modules/auth/schemas.ts` para aceptar `recaptchaToken` opcional
- [ ] Task: Crear servicio/utilidad de verificación del servidor `verifyRecaptchaToken`
    - [ ] Crear `lib/recaptcha/verify.ts` que realice la petición `POST` a `https://www.google.com/recaptcha/api/siteverify`
    - [ ] Validar `success === true`, `action` esperada y `score >= 0.5`
    - [ ] Implementar bypass seguro en modo desarrollo con warning informativo si las variables no están configuradas
- [ ] Task: Integrar verificación en `loginAction` y `registerAction`
    - [ ] Llamar a `verifyRecaptchaToken` al inicio de `loginAction` con `action: 'login'`
    - [ ] Llamar a `verifyRecaptchaToken` al inicio de `registerAction` con `action: 'register'`
    - [ ] Retornar mensaje de error amigable si la verificación de reCAPTCHA falla
- [ ] Task: Phase Verification & Checkpoint (Refer to workflow.md)

## Phase 2: Frontend y Hooks de reCAPTCHA v3

Integración en cliente para cargar el script de Google y ejecutar la generación de tokens en el envío de formularios.

- [ ] Task: Crear componente de Script o Hook `useRecaptcha`
    - [ ] Crear `modules/auth/hooks/use-recaptcha.ts` para cargar el script de Google reCAPTCHA v3 de forma asíncrona y segura
    - [ ] Implementar función helper `executeRecaptcha(action: string): Promise<string | null>`
- [ ] Task: Conectar `useRecaptcha` con `useLogin` y `useRegister`
    - [ ] Modificar `useLogin` para solicitar el token con `action: 'login'` antes de enviar los datos a `loginAction`
    - [ ] Modificar `useRegister` para solicitar el token con `action: 'register'` antes de enviar los datos a `registerAction`
    - [ ] Gestionar estados de carga e informar posibles errores al usuario
- [ ] Task: Actualizar formulario `LoginForm` y vista de autenticación
    - [ ] Asegurar la carga adecuada del script en `/login`
    - [ ] Mantener feedback de estados de carga en los botones de envío
- [ ] Task: Phase Verification & Checkpoint (Refer to workflow.md)

## Phase 3: Validación Final y Entrega

Verificación integral del flujo de login y registro con reCAPTCHA v3.

- [ ] Task: Verificación de compilación, tipos y pruebas manuales
    - [ ] Ejecutar comprobación de TypeScript y linting (`npm run lint` / `npx tsc --noEmit`)
    - [ ] Validar envío con token y respuesta del servidor
    - [ ] Validar experiencia visual y responsividad
- [ ] Task: Phase Verification & Checkpoint (Refer to workflow.md)
