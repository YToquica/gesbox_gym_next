---
trigger: always_on
---

# Contexto del Proyecto: GESBOX (MVP)

Este archivo proporciona el contexto de negocio, los objetivos y las limitaciones técnicas del proyecto para guiar a los agentes de IA en el desarrollo.

---

## 1. Visión del Producto
**GESBOX** es un software de gestión web (SaaS) diseñado para optimizar la operación diaria de gimnasios en Colombia. El objetivo principal es resolver el descontrol en el flujo de caja (pagos desorganizados) y evitar la suplantación o ingreso de usuarios morosos.

Para la fase actual (**MVP**), el sistema se enfocará de forma estricta en la administración interna desde el mostrador (Recepcionista y Administrador), posponiendo la aplicación del cliente final para fases posteriores.

---

## 2. Perfiles de Usuario (Actores del Sistema)

* **Administrador (Dueño del Gym):** * Tiene acceso total al sistema.
  * Define la oferta comercial (creación y modificación de planes y tarifas).
  * Revisa reportes financieros básicos.
* **Recepcionista (Operador en Mostrador):**
  * Es el usuario principal del día a día.
  * Registra nuevos clientes en el sistema.
  * Busca clientes por número de cédula para validar su acceso.
  * Registra los pagos manuales y activa/renueva membresías.
* **Cliente (Miembro del Gimnasio):**
  * En el MVP, el cliente no tiene una interfaz compleja. Solo se registra su información y asiste al gimnasio dictando su documento de identidad.

---

## 3. Limitaciones de Alcance y Reglas de Negocio (MVP)

Para mantener el desarrollo ágil y ultra-enfocado durante el vibecoding, los agentes deben ceñirse a las siguientes reglas:

* **Pagos 100% Manuales:** No se integrarán pasarelas de pago automáticas (API de Wompi/PayU) en esta fase. Todo pago es recibido por el recepcionista (en efectivo o mediante transferencia a cuentas del gimnasio como Nequi/Daviplata). El sistema solo registra el evento del pago, el método y guarda el soporte físico/digital.

* **Control de Acceso por Cédula:** El ingreso no requiere torniquetes automáticos ni lectores de huellas biométricos. Se simula un "Check-In" manual donde el recepcionista digita el documento, el sistema responde visualmente si está Activo/Vencido y registra la asistencia.

* **Cálculo de Fechas Automático:** Al registrar un pago para una membresía, el sistema debe calcular la `fecha_fin` sumando los `duracion_dias` del plan adquirido a la `fecha_inicio` (que por defecto es el día de hoy).

* **Landing Page Pública (Inbound Marketing):** El sistema contará con una página de inicio pública donde se mostrará la propuesta de valor del gimnasio, galería de instalaciones, horarios y la lista de planes disponibles (con sus precios en COP). 

* **Conversión:** En el MVP, los botones de "Comprar Plan" de la Landing Page redirigirán al usuario a la pantalla de Login/Registro o directamente a una línea de atención de WhatsApp del gimnasio para cerrar la venta manualmente, manteniendo el alcance del MVP simple.
---

## 4. Stack Tecnológico Estricto
* **Frontend/Backend:** Next.js (App Router, Server Components, Server Actions).
* **Base de Datos y Auth:** Supabase (PostgreSQL para datos relacionales, Supabase Auth para usuarios, Supabase Storage para fotos de comprobantes).
* **Estilos:** Tailwind CSS con componentes UI de Shadcn.

---