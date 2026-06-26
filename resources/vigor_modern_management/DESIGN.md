---
name: Vigor Modern Management
colors:
  surface: '#131315'
  surface-dim: '#131315'
  surface-bright: '#39393b'
  surface-container-lowest: '#0e0e10'
  surface-container-low: '#1c1b1d'
  surface-container: '#201f22'
  surface-container-high: '#2a2a2c'
  surface-container-highest: '#353437'
  on-surface: '#e5e1e4'
  on-surface-variant: '#bbcabf'
  inverse-surface: '#e5e1e4'
  inverse-on-surface: '#313032'
  outline: '#86948a'
  outline-variant: '#3c4a42'
  surface-tint: '#4edea3'
  primary: '#4edea3'
  on-primary: '#003824'
  primary-container: '#10b981'
  on-primary-container: '#00422b'
  inverse-primary: '#006c49'
  secondary: '#c0c1ff'
  on-secondary: '#1000a9'
  secondary-container: '#3131c0'
  on-secondary-container: '#b0b2ff'
  tertiary: '#ffb4ab'
  on-tertiary: '#690005'
  tertiary-container: '#ff7a6e'
  on-tertiary-container: '#790007'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#6ffbbe'
  primary-fixed-dim: '#4edea3'
  on-primary-fixed: '#002113'
  on-primary-fixed-variant: '#005236'
  secondary-fixed: '#e1e0ff'
  secondary-fixed-dim: '#c0c1ff'
  on-secondary-fixed: '#07006c'
  on-secondary-fixed-variant: '#2f2ebe'
  tertiary-fixed: '#ffdad6'
  tertiary-fixed-dim: '#ffb4ab'
  on-tertiary-fixed: '#410002'
  on-tertiary-fixed-variant: '#93000b'
  background: '#131315'
  on-background: '#e5e1e4'
  surface-variant: '#353437'
typography:
  headline-xl:
    fontFamily: Geist
    fontSize: 48px
    fontWeight: '800'
    lineHeight: '1.1'
    letterSpacing: -0.04em
  headline-lg:
    fontFamily: Geist
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Geist
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Geist
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  body-sm:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.4'
  label-md:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Geist
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1'
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 4px
  container-padding: 24px
  sidebar-width: 280px
  sidebar-collapsed: 80px
  gutter: 16px
---

## Brand & Style

The design system is built for the high-octane environment of fitness management. It balances the raw energy of a workout with the clinical precision of a modern SaaS platform. The aesthetic is **Corporate / Modern** with a high-fidelity tech edge, utilizing high-contrast typography and a sophisticated dark-leaning palette to evoke a sense of "elite performance."

The target audience includes gym owners and administrators who require a reliable, professional tool that feels as fast and responsive as the athletes they serve. The UI prioritizes data density without sacrificing clarity, ensuring that complex management tasks—from membership billing in COP to class scheduling—feel intuitive and frictionless.

## Colors

The palette is anchored by a **Deep Slate/Zinc** foundation, providing a "pro-grade" backdrop that reduces eye strain during long administrative sessions. 

- **Primary (Vibrant Emerald):** Used for "Active" statuses, successful check-ins, and primary calls to action. It signifies growth and health.
- **Secondary (Indigo):** Used for technical accents, data visualization, and navigation highlights.
- **Alert (Crimson):** Reserved strictly for overdue payments, expired memberships, or system errors.
- **Neutral Stack:** A range of grays from `#09090b` (Background) to `#fafafa` (Text/Highlights) creates a crisp, high-contrast environment.

## Typography

This design system utilizes **Geist** for its technical precision and modern geometric forms. Headings are characterized by heavy weights and **tight letter-spacing (tracking-tight)**, creating an impactful, editorial feel typical of high-end fitness brands.

- **Headlines:** Use Bold or ExtraBold weights for maximum hierarchy.
- **Body:** Regular weight for optimal legibility in data-heavy tables.
- **Currency (COP):** Financial figures should use `body-md` with `semibold` weights to ensure figures are immediately scannable.

## Layout & Spacing

The layout employs a **Fluid Grid** for internal dashboards and a fixed-center layout for public-facing marketing pages. 

- **Internal View:** Utilizes a collapsible sidebar (280px expanded) with a flexible main content area. Data is organized in a modular "Bento" style grid.
- **Mobile-First:** Public pages and member check-in screens are optimized for handheld use, utilizing full-width touch targets and a single-column reflow.
- **Grid:** A 12-column system is standard for desktop, collapsing to 4 columns for mobile. 
- **Spacing Rhythm:** Based on a 4px/8px incremental scale to maintain strict mathematical harmony across all components.

## Elevation & Depth

Visual hierarchy is achieved through **Tonal Layers** and **Low-Contrast Outlines**, strictly following the Shadcn-inspired philosophy.

- **Surfaces:** Use subtle shifts in the Zinc scale. The background is the darkest layer (`#09090b`), while cards and modals use a slightly lighter "Surface" tier to appear closer to the user.
- **Borders:** Instead of heavy shadows, use 1px borders in a muted Zinc-800 or Zinc-700. 
- **Shadows:** When necessary for modals, use extremely diffused, low-opacity black shadows (e.g., `0 10px 15px -3px rgba(0, 0, 0, 0.5)`) to maintain a clean, high-fidelity look.

## Shapes

The design system adopts a **Soft** shape language. All primary UI elements—such as buttons, input fields, and cards—utilize a consistent medium radius (0.25rem to 0.5rem). This "rounded-md" approach provides a professional, modern feel that is approachable but remains structured and efficient. Large containers or image placeholders may use `rounded-lg` (0.5rem) to reinforce the layered depth.

## Components

- **Buttons:** Solid fills for primary actions using Emerald. Ghost or outlined buttons for secondary actions to maintain hierarchy. All buttons feature a 0.25rem radius.
- **Input Fields:** Dark Zinc backgrounds with a 1px Zinc-700 border. Focused states utilize a subtle Emerald ring.
- **Cards:** Clean containers with a 1px border. No heavy drop shadows; depth is communicated through slight background color variations.
- **Chips/Badges:** Small, high-contrast labels for "Active," "Inactive," or "Trial" status. "Active" uses a low-opacity Emerald background with Emerald text.
- **Sidebar:** Navigation items use semi-transparent hover states and a left-aligned vertical "accent bar" in Indigo for the active state.
- **Data Tables:** High-density, border-bottom only for rows, using `body-sm` for content to maximize information per screen.
- **COP Display:** Currency should be right-aligned in tables, using a consistent monospaced variant of Geist if available for numerical alignment.