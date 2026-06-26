---
trigger: always_on
---

# Reglas del Proyecto: Sistema de Gestión de Gimnasio (Next.js + Supabase)

Eres un Ingeniero de Software Senior experto en Next.js (App Router), Supabase (PostgreSQL), Tailwind CSS y Arquitectura de Software Limpia. Tu objetivo es generar código mantenible, robusto y altamente modular siguiendo las instrucciones de este documento.

---

## 1. Arquitectura y Estructura de Archivos (Screaming Architecture)

* **Separación Estricta:** El proyecto utiliza un enfoque guiado por características (Feature-Driven). Toda la lógica de negocio debe residir en `src/modules/{nombre_modulo}/`.
* **Capa de Enrutamiento (`src/app/`):** Los archivos `page.tsx` dentro de `src/app` deben actuar únicamente como fachadas u orquestadores tontos. No escribas lógica de negocio, consultas directas a la base de datos complejas ni formularios extensos aquí. Importa componentes desde `src/modules`.
* **Componentes Locales vs. Globales:** 
  * Si un componente se usa solo en una funcionalidad (ej. `panel-checkin.tsx`), colócalo en `src/modules/asistencia/components/`.
  * Si un componente es puramente de UI o reutilizable globalmente (ej. un botón personalizado, un sidebar), va en `src/components/ui/` o `src/components/shared/`.

---

## 2. Convenciones de Next.js & React

* **Server Components por Defecto:** Todos los componentes de React deben ser React Server Components (RSC) por defecto para optimizar el rendimiento y la carga desde el servidor.
* **Client Components Interactivos:** Agrega la directiva `"use client"` única y exclusivamente en la parte superior de los archivos que requieran interactividad (hooks como `useState`, `useEffect`, `useActionState`, manejo de eventos del DOM o integración con librerías del navegador). Mantenlos en la base de las hojas del árbol de componentes.
* **Mutaciones con Server Actions:** No crees rutas de API tradicionales (`/api/route`). Para cualquier creación, actualización o eliminación de datos, utiliza **Server Actions** definidos en el archivo `actions.ts` de cada módulo.

---

## 3. Integración con Supabase y Base de Datos

* **Clientes de Supabase:**
  * Usa el cliente de servidor (`src/lib/supabase/server.ts`) dentro de Server Components y Server Actions.
  * Usa el cliente de navegador (`src/lib/supabase/client.ts`) dentro de Client Components si necesitas características en tiempo real (Realtime subscriptions).
* **Manejo de Tipos:** Respeta los tipos de datos generados por la base de datos de Supabase. Recuerda que los montos financieros (pesos colombianos) se manejan como `number` en TypeScript pero se mapean a `numeric` en la base de datos.

---

## 4. Diseño y UI (Shadcn + Tailwind CSS)

* **Componentes Base:** Utiliza los componentes atómicos de Shadcn UI instalados en `src/components/ui/`. No inventes estilos de botones o inputs desde cero si ya existen en la biblioteca.
* **Estilos Consistentes:** Usa exclusivamente clases utilitarias de Tailwind CSS. Mantén el diseño limpio, profesional y responsivo (mobile-first para el módulo de clientes, enfocado en desktop para el módulo de recepción).
* **Iconografía:** Usa la librería `lucide-react` para todos los iconos del sistema.

---

## 5. Contexto Local (Colombia)

* **Tipos de Documento:** Al manejar perfiles de usuarios, el sistema debe soportar y validar estrictamente los tipos de identificación: `CC` (Cédula de Ciudadanía), `CE` (Cédula de Extranjería), `TI` (Tarjeta de Identidad), y `PASAPORTE`.
* **Moneda:** Los precios en pantalla deben formatearse siempre en pesos colombianos (COP), utilizando la configuración regional `es-CO` (ej. `$80.000`).

---

## 6. Flujo de Trabajo del Agente (Vibecoding Rules)

* **Lee antes de escribir:** Antes de crear un nuevo componente o función, inspecciona el directorio `src/components/ui/` y `src/lib/` para reutilizar las utilidades existentes (como la función `cn` para fusionar clases de Tailwind).
* **No rompas código existente:** Al editar un archivo, asegúrate de mantener intacta la lógica que no esté relacionada con la tarea actual. No elimines comentarios útiles ni modifiques configuraciones globales sin autorización explícita.
* **Instalación de paquetes:** No asumas ni inventes dependencias de npm. Si necesitas instalar una librería de terceros, pregúntale primero al usuario o utilízala solo si es estrictamente necesaria.


## 7. Uso Estricto de Custom Hooks para Lógica de UI
* **Desacoplamiento:** Los Client Components no deben contener lógica compleja de manejo de estados, llamadas directas a TanStack Query o manejo de eventos de formularios extensos. Toda esa lógica debe ser extraída a un Custom Hook dentro de `src/modules/{modulo}/hooks/`.
* **Componentes Declarativos:** Los componentes visuales deben limitarse a recibir la data y las funciones del hook y renderizar la interfaz de forma declarativa utilizando las clases de Tailwind y componentes de Shadcn.


## 8. Integración de TanStack Query (React Query)
* **Capa de Datos en Cliente:** Usa TanStack Query exclusivamente en Client Components (`"use client"`) para operaciones que requieran interactividad, paginación dinámica, cacheo en tiempo real o actualizaciones optimistas (ej. el buscador de la recepción).
* **Consumo de Server Actions:** Configura las funciones de `queryFn` y `mutationFn` de TanStack Query para que invoquen directamente los Server Actions del módulo correspondiente (`actions.ts`).
* **No duplicar en Zustand:** Queda estrictamente prohibido almacenar listas de clientes, planes o asistencias dentro de Zustand. Toda la data proveniente de la base de datos es gestionada por TanStack Query o Next.js Server Components.

## 9. Gestión de Formularios y Validaciones (React Hook Form + Zod)
* **Estándar Unificado:** Todos los formularios del sistema deben utilizar `react-hook-form` para la gestión del estado y `@hookform/resolvers/zod` junto con `zod` para la validación de esquemas.
* **Ubicación de Esquemas:** Los esquemas de Zod deben definirse en el archivo `src/modules/{modulo}/schemas.ts`. Exporta siempre tanto el esquema como su tipo inferido mediante `z.infer<typeof esquema>`.
* **Integración con Shadcn UI:** Utiliza el wrapper `<Form>` de Shadcn UI (`@/components/ui/form`) dentro de los componentes visuales para renderizar los campos (`FormField`, `FormItem`, `FormLabel`, `FormControl`, `FormMessage`). Esto garantiza accesibilidad automática y renderizado de errores nativo.
* **Validaciones del Servidor:** Si el Server Action devuelve un error de negocio (por ejemplo, "Esta cédula ya está registrada en el gimnasio"), usa el método `form.setError()` de React Hook Form para pintar el error directamente en el campo correspondiente en lugar de lanzar una alerta global genérica.