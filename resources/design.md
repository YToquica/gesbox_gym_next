---
name: Kinetic Performance
colors:
  surface: '#f8f9fa'
  surface-dim: '#d9dadb'
  surface-bright: '#f8f9fa'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f4f5'
  surface-container: '#edeeef'
  surface-container-high: '#e7e8e9'
  surface-container-highest: '#e1e3e4'
  on-surface: '#191c1d'
  on-surface-variant: '#5a4137'
  inverse-surface: '#2e3132'
  inverse-on-surface: '#f0f1f2'
  outline: '#8e7165'
  outline-variant: '#e2bfb2'
  surface-tint: '#ff6b1a'
  primary: '#ff6b1a'
  on-primary: '#ffffff'
  primary-container: '#ff6b1a'
  on-primary-container: '#591e00'
  inverse-primary: '#ffb596'
  secondary: '#5d5e61'
  on-secondary: '#ffffff'
  secondary-container: '#e2e2e5'
  on-secondary-container: '#636467'
  tertiary: '#505f76'
  on-tertiary: '#ffffff'
  tertiary-container: '#8a9ab2'
  on-tertiary-container: '#223246'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdbcd'
  primary-fixed-dim: '#ffb596'
  on-primary-fixed: '#360f00'
  on-primary-fixed-variant: '#7d2d00'
  secondary-fixed: '#e2e2e5'
  secondary-fixed-dim: '#c6c6c9'
  on-secondary-fixed: '#1a1c1e'
  on-secondary-fixed-variant: '#454749'
  tertiary-fixed: '#d3e4fe'
  tertiary-fixed-dim: '#b7c8e1'
  on-tertiary-fixed: '#0b1c30'
  on-tertiary-fixed-variant: '#38485d'
  background: '#f8f9fa'
  on-background: '#191c1d'
  surface-variant: '#e1e3e4'
typography:
  h1:
    fontFamily: Lexend
    fontSize: 48px
    fontWeight: '800'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  h2:
    fontFamily: Lexend
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.01em
  h3:
    fontFamily: Lexend
    fontSize: 24px
    fontWeight: '700'
    lineHeight: '1.3'
    letterSpacing: '0'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  label-bold:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: 0.05em
  stat-value:
    fontFamily: Lexend
    fontSize: 28px
    fontWeight: '700'
    lineHeight: '1'
    letterSpacing: -0.02em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 24px
  lg: 40px
  xl: 64px
  gutter: 24px
  margin: 32px
---

## Brand & Style

The brand personality of the design system is defined by high-octane energy, professional rigor, and motivational clarity. It is designed to serve a dual audience: the gym staff who require efficiency and reliability, and the gym members who seek inspiration and progress tracking. 

The visual direction follows a **High-Contrast / Bold** modern aesthetic. It utilizes aggressive color blocking and heavy typography to simulate the intensity of a workout environment, while maintaining a clean, systematic structure that ensures complex management data remains digestible. The style emphasizes movement and action, using punchy brand accents against a sophisticated neutral foundation to create a premium, "pro-athlete" atmosphere.

## Colors

The palette is anchored by a vibrant, "Electric Orange" derived from the brand’s core identity, signifying heat, energy, and determination. This is balanced by a deep "Obsidian Gray" for primary text and high-contrast surfaces, providing a professional weight to the interface.

*   **Primary:** Used for call-to-actions, progress indicators, and active states.
*   **Secondary (Dark):** Used for sidebars, navigation headers, and primary headings to create a grounded, high-performance look.
*   **Backgrounds:** A crisp "Gym White" (#FFFFFF) and "Concrete Light" (#F8F9FA) are used to maintain clarity and prevent the interface from feeling over-saturated.
*   **Success/Warning:** Standard utility colors should be slightly desaturated to ensure the primary orange remains the focal point of the user's attention.

## Typography

This design system utilizes **Lexend** for headlines to leverage its athletic, wide-set, and highly readable characteristics. It evokes a sense of strength and modern fitness branding. For technical data, management tables, and long-form body copy, **Inter** is used for its geometric neutrality and exceptional legibility at small sizes.

Headlines should utilize heavy weights (700-800) to create a "motivating" hierarchy. Stats and numerical data (like weights, reps, or revenue) should be treated with the `stat-value` style to emphasize achievement and performance metrics.

## Layout & Spacing

The design system employs a **12-column fluid grid** for dashboard views and a centered, fixed-width container (max-width 1280px) for marketing or member-facing content. 

The spacing rhythm is built on an **8px base unit**, ensuring mathematical harmony across all components. High-density areas (like class schedules or member rosters) should use the `sm` (12px) spacing to maximize information display, while "motivational" areas (like landing pages or workout summaries) should use `lg` (40px) and `xl` (64px) to allow the bold typography and imagery to breathe.

## Elevation & Depth

To maintain a "modern and clean" feel, the design system avoids heavy shadows in favor of **Tonal Layers** and subtle **Ambient Depth**. 

1.  **Level 0 (Surface):** The main background color (#F8F9FA).
2.  **Level 1 (Card/Section):** White (#FFFFFF) surfaces with a 1px solid border in a very light gray (#E2E8F0).
3.  **Level 2 (Interactive/Floating):** Used for dropdowns and active cards. These feature a soft, highly diffused shadow (0px 10px 25px -5px rgba(0,0,0,0.05)) to suggest they are lifted off the page.
4.  **Accent Depth:** Primary buttons and active state indicators do not use shadows; instead, they use high-saturation color fills to command attention through contrast rather than simulated 3D depth.

## Shapes

The shape language balances "aggressive" performance with "user-friendly" approachability. A **roundedness level of 2** (0.5rem base) is applied to buttons, input fields, and standard cards. 

Larger containers and section wrappers should use `rounded-xl` (1.5rem) to soften the overall interface and make it feel modern and premium. Smaller utility elements like tags or chips should use a fully pill-shaped radius to distinguish them from interactive buttons.

## Components

*   **Buttons:** Primary buttons must be solid vibrant orange with bold white text. Secondary buttons should use a dark gray ghost-style (border only) or solid dark gray for high-contrast "Staff" actions.
*   **Inputs:** Use 2px borders for input fields to reinforce the "bold" look. When focused, the border should change to the primary orange.
*   **Cards:** Use white backgrounds with 16px padding. Gym management specific cards (e.g., "Member Profile Quick View") should feature a left-hand accent border in primary orange.
*   **Chips/Tags:** Used for "Membership Status" (Active, Expired, Frozen). These should use high-saturation backgrounds with white text for maximum visibility in dense lists.
*   **Progress Bars:** Thin, high-contrast tracks with the primary orange used for the progress fill.
*   **Member Dashboard Widgets:** Circular progress rings for "Workouts This Week" and bold numerical displays for "Personal Bests."
*   **Staff Data Tables:** Use alternating row stripes in the neutral color and bold `label-bold` headers for professional clarity.