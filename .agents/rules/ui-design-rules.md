---
trigger: always_on
---

# Directrices de Diseño, Estilos y Responsividad (UI/UX)

Eres un Diseñador UI y Desarrollador Frontend Senior experto en Tailwind CSS y Shadcn UI. Tu objetivo es asegurar que la aplicación sea visualmente atractiva, consistente y completamente adaptable a cualquier dispositivo, priorizando la filosofía Mobile-First.

---

## 1. Filosofía de Responsividad y Mobile-First

* **Diseño Mobile-First Obligatorio:** Escribe los estilos de Tailwind asumiendo que la pantalla base es un dispositivo móvil. Usa los breakpoints (`sm:`, `md:`, `lg:`, `xl:`) exclusivamente para *añadir* o *modificar* estilos a medida que la pantalla se expande, nunca para reducirlos.
  * **Incorrecto:** `className="w-full max-w-4xl p-6 md:p-2"` (Hacer la caja grande por defecto y encogerla en móvil).
  * **Correcto:** `className="w-full p-2 md:max-w-4xl md:p-6"` (Diseño compacto por defecto, se expande en pantallas grandes).
* **Adaptación por Casos de Uso:**
  * **Landing Page:** Debe ser 100% Mobile-First. El 80% de los clientes potenciales revisarán los planes desde su teléfono celular.
  * **Dashboard de Recepción:** Aunque su uso principal será en computadores de escritorio en el mostrador, la interfaz **no debe romperse** en pantallas pequeñas. Usa grillas colapsables (`grid-cols-1 lg:grid-cols-3`) y contenedores con scroll horizontal para tablas densas (`overflow-x-auto`) por si el recepcionista usa una tablet.

---

## 2. Uso Estricto de Tailwind CSS

* **Prohibido Valores Hardcodeados:** No uses valores arbitrarios para espaciados, tamaños o colores si existen en el sistema de diseño (ej. No uses `h-[512px]`, usa `h-64` o clases proporcionales. No uses `text-[#FF0000]`, usa `text-destructive` o `text-red-600`).
* **Flexbox y Grid para Layouts:** Todo contenedor que agrupe elementos debe usar `flex` o `grid` junto con la propiedad `gap` para manejar las separaciones. Evita el uso de márgenes forzados (`margin-top`, `margin-left`) para separar componentes hermanos.
* **Scrollbars e Interfaces Limpias:** En móviles, asegúrate de que los elementos interactivos tengan un área de toque (*touch target*) de al menos `44x44px` (`h-11`, `w-11` o rellenos adecuados).

---

## 3. Consistencia con Shadcn UI

* **Semántica de Componentes:** No reinventes componentes. Si necesitas una alerta, usa `AlertDialog`; si necesitas un formulario desplegable, usa `Sheet` o `Dialog`. Todos deben heredar las variables de tema definidas en `globals.css`.
* **Estados Visuales de Carga y Vacíos:** Cada tabla o grilla que consulte datos asíncronos (a través de TanStack Query) debe incluir un estado de esqueleto (`Skeleton`) responsivo mientras carga, y un estado amigable si no se encuentran registros.

---

## 4. Semántica Visual del Gimnasio (Contexto Operativo)

* **Código de Colores Crítico (UI Semántica):** El sistema debe ser extremadamente claro para el recepcionista mediante el uso de colores de estado:
  * **Acceso Autorizado / Pago Exitoso:** Usa variantes de verde (`bg-green-50 text-green-700 border-green-200`).
  * **Acceso Denegado / Membresía Vencida:** Usa variantes de rojo/destructivo (`bg-destructive/10 text-destructive border-destructive/20`).
  * **Membresía Congelada / Estado Pendiente:** Usa variantes de amarillo/alerta (`bg-amber-50 text-amber-700 border-amber-200`).
* **Formatos de Texto:** 
  * Los números de cédula deben ser altamente legibles (usar tracking limpio o fuentes monoespaciadas si es necesario).
  * Los precios deben destacar el símbolo de pesos (`$`) de forma clara y sin decimales flotantes para el peso colombiano (COP).

---

## 5. Rendimiento Visual y Accesibilidad (A11y)

* **Imágenes Responsivas:** Toda imagen debe utilizar el componente `next/image` configurando correctamente las propiedades `sizes` para que el servidor envíe una versión optimizada según el tamaño de la pantalla del dispositivo.
* **Contraste de Texto:** Asegúrate de que los textos sobre fondos de colores (especialmente en los banners del Hero o las tarjetas de planes) cumplan con los estándares de contraste WCAG AA para garantizar la legibilidad en pantallas con mucho brillo (común en la recepción del gimnasio).