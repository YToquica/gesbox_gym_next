# Implementation Plan: Google reCAPTCHA v3 en Registro e Inicio de Sesión

Integración de Google reCAPTCHA v3 en los flujos de autenticación de GesBox utilizando Next.js App Router y Server Actions.

## Phase 1: Configuración del Entorno y Verificación en el Servidor [checkpoint: 93f07ae]

Infraestructura de variables de entorno y utilidad de verificación del lado del servidor para validar tokens con Google.

- [x] Task: Configurar variables de entorno en `.env.example` y schemas de validación (5bdf8f7)
    - [x] Documentar `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` y `RECAPTCHA_SECRET_KEY` en `.env.example`
    - [x] Actualizar schemas de `LoginInput` y `RegisterInput` en `modules/auth/schemas.ts` para aceptar `recaptchaToken` opcional
- [x] Task: Crear servicio/utilidad de verificación del servidor `verifyRecaptchaToken` (bae15f9)
    - [x] Crear `lib/recaptcha/verify.ts` que realice la petición `POST` a `https://www.google.com/recaptcha/api/siteverify`
    - [x] Validar `success === true`, `action` esperada y `score >= 0.5`
    - [x] Implementar bypass seguro en modo desarrollo con warning informativo si las variables no están configuradas
- [x] Task: Integrar verificación en `loginAction` y `registerAction` (93f07ae)
    - [x] Llamar a `verifyRecaptchaToken` al inicio de `loginAction` con `action: 'login'`
    - [x] Llamar a `verifyRecaptchaToken` al inicio de `registerAction` con `action: 'register'`
    - [x] Retornar mensaje de error amigable si la verificación de reCAPTCHA falla
- [x] Task: Phase Verification & Checkpoint (Refer to workflow.md)

## Phase 2: Frontend y Hooks de reCAPTCHA v3 [checkpoint: 1e97c16]

Integración en cliente para cargar el script de Google y ejecutar la generación de tokens en el envío de formularios.

- [x] Task: Crear componente de Script o Hook `useRecaptcha` (8d1be45)
    - [x] Crear `modules/auth/hooks/use-recaptcha.ts` para cargar el script de Google reCAPTCHA v3 de forma asíncrona y segura
    - [x] Implementar función helper `executeRecaptcha(action: string): Promise<string | null>`
- [x] Task: Conectar `useRecaptcha` con `useLogin` y `useRegister` (26eb90d)
    - [x] Modificar `useLogin` para solicitar el token con `action: 'login'` antes de enviar los datos a `loginAction`
    - [x] Modificar `useRegister` para solicitar el token con `action: 'register'` antes de enviar los datos a `registerAction`
    - [x] Gestionar estados de carga e informar posibles errores al usuario
- [x] Task: Actualizar formulario `LoginForm` y vista de autenticación (1e97c16)
    - [x] Asegurar la carga adecuada del script en `/login`
    - [x] Mantener feedback de estados de carga en los botones de envío
- [x] Task: Phase Verification & Checkpoint (Refer to workflow.md)

## Phase 3: Validación Final y Entrega

Verificación integral del flujo de login y registro con reCAPTCHA v3.

- [x] Task: Verificación de compilación, tipos y pruebas manuales (2c0ec42)
    - [x] Ejecutar comprobación de TypeScript y linting (`npm run lint` / `npx tsc --noEmit`)
    - [x] Validar envío con token y respuesta del servidor
    - [x] Validar experiencia visual y responsividad
- [ ] Task: Phase Verification & Checkpoint (Refer to workflow.md)
