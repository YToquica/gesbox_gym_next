# Specification: Implementación de Google reCAPTCHA v3 en Autenticación

## Overview
Implementar la validación invisible de seguridad con Google reCAPTCHA v3 en los flujos de autenticación (inicio de sesión y registro de usuarios) en GesBox (Next.js 16 App Router). Esto protegerá la plataforma contra ataques de fuerza bruta, spam y creación masiva automatizada de cuentas sin degradar la experiencia de usuario.

## Functional Requirements
1. **Frontend - Carga e Integración de Script:**
   - Cargar el script de Google reCAPTCHA v3 (`https://www.google.com/recaptcha/api.js?render=...`) de forma asíncrona y optimizada en las vistas de autenticación mediante un hook reutilizable `useRecaptcha`.
   - Utilizar la variable pública `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`.
   - Generar un token de reCAPTCHA v3 con la acción correspondiente (`login` para inicio de sesión y `register` para registro) al momento de enviar el formulario.

2. **Frontend - Hooks y Formularios:**
   - Actualizar `useLogin` y `useRegister` para solicitar el token antes de invocar los Server Actions correspondientes.
   - Pasar el `recaptchaToken` como parte de la carga útil del formulario a los Server Actions.

3. **Backend - Verificación de Token en Server Actions:**
   - Crear una utilidad en el servidor (`lib/recaptcha/verify.ts`) que valide el token contra la API de Google (`https://www.google.com/recaptcha/api/siteverify`) usando `RECAPTCHA_SECRET_KEY`.
   - Validar que la respuesta sea exitosa (`success: true`), que la acción coincida (`action: 'login'` / `action: 'register'`) y que el score sea superior o igual a 0.5.
   - En entorno de desarrollo (`NODE_ENV === 'development'`), si las variables de entorno de reCAPTCHA no están configuradas, permitir el bypass emitiendo un `console.warn` para no bloquear el flujo local.

4. **Manejo de Errores y Seguridad:**
   - Si la verificación falla o el score es menor a 0.5, rechazar la solicitud inmediatamente antes de interactuar con Supabase Auth.
   - Retornar un mensaje amigable: *"Error de validación de seguridad. Por favor, intenta nuevamente."*
   - Mantener las claves secretas (`RECAPTCHA_SECRET_KEY`) estrictamente en el entorno del servidor y actualizar `.env.example` con las nuevas variables.

## Non-Functional Requirements
- **Rendimiento:** Carga no bloqueante del script de Google.
- **Privacidad y Seguridad:** No exponer nunca la `RECAPTCHA_SECRET_KEY` en el cliente.
- **Tipado:** Tipado estricto en TypeScript para las respuestas de la API de reCAPTCHA y las entradas de los Server Actions.

## Acceptance Criteria
- [ ] El script de reCAPTCHA v3 carga correctamente en la página de login/registro (`/login`).
- [ ] Al iniciar sesión con credenciales válidas, se genera un token con acción `'login'`, el servidor lo valida exitosamente con Google y el usuario inicia sesión.
- [ ] Al registrarse con datos válidos, se genera un token con acción `'register'`, el servidor lo valida exitosamente con Google y se completa el registro en Supabase.
- [ ] Si un token es inválido o el score es inferior a 0.5, el Server Action retorna un error de seguridad y no se crea la sesión/cuenta.
- [ ] `.env.example` incluye `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` y `RECAPTCHA_SECRET_KEY`.

## Out of Scope
- Implementación de reCAPTCHA v2 (desafíos con checkboxes).
- Implementación de reCAPTCHA en formularios internos del dashboard (solo aplica a login y registro).
