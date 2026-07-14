---
name: Daurly & Daur Ulang Core
colors:
  surface: '#f9f9f9'
  surface-dim: '#dadada'
  surface-bright: '#f9f9f9'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f3f3'
  surface-container: '#eeeeee'
  surface-container-high: '#e8e8e8'
  surface-container-highest: '#e2e2e2'
  on-surface: '#1a1c1c'
  on-surface-variant: '#594136'
  inverse-surface: '#2f3131'
  inverse-on-surface: '#f1f1f1'
  outline: '#8d7164'
  outline-variant: '#e1bfb0'
  surface-tint: '#9e4200'
  primary: '#9e4200'
  on-primary: '#ffffff'
  primary-container: '#ff6f00'
  on-primary-container: '#592200'
  inverse-primary: '#ffb691'
  secondary: '#5f5e5e'
  on-secondary: '#ffffff'
  secondary-container: '#e2dfde'
  on-secondary-container: '#636262'
  tertiary: '#5e5e5e'
  on-tertiary: '#ffffff'
  tertiary-container: '#9b9b9b'
  on-tertiary-container: '#323333'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdbcb'
  primary-fixed-dim: '#ffb691'
  on-primary-fixed: '#341100'
  on-primary-fixed-variant: '#793100'
  secondary-fixed: '#e5e2e1'
  secondary-fixed-dim: '#c8c6c5'
  on-secondary-fixed: '#1b1c1c'
  on-secondary-fixed-variant: '#474746'
  tertiary-fixed: '#e3e2e2'
  tertiary-fixed-dim: '#c7c6c6'
  on-tertiary-fixed: '#1b1c1c'
  on-tertiary-fixed-variant: '#464747'
  background: '#f9f9f9'
  on-background: '#1a1c1c'
  surface-variant: '#e2e2e2'
typography:
  headline-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '700'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1'
  label-sm:
    fontFamily: Inter
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
  base: 8px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 48px
  gutter: 20px
  margin-mobile: 16px
  margin-desktop: 64px
---

## Brand & Style
This design system is built to empower micro, small, and medium enterprises (MSMEs) through a professional yet energetic digital marketplace. The brand personality is **industrious, reliable, and vibrant**, balancing a neutral, structured environment with high-energy accents that drive action.

The visual style is **Corporate Modern with a "Commercial-High-Contrast" edge**. It utilizes a clean, systematic layout that prioritizes functional clarity and ease of use for diverse user groups. The interface leverages sharp structural elements mixed with vibrant hits of color to create an environment that feels like a modern, bustling digital courtyard.

## Colors
The palette is rooted in high-contrast functionality. 

- **Primary (Vibrant Orange):** Reserved for high-intent actions, progress indicators, and primary branding elements. It signifies growth and energy.
- **Secondary (Charcoal):** Used for typography, borders, and structural icons to ensure maximum legibility and a sense of "sturdy" professionalism.
- **Neutral (Light Grey/White):** Creates the "Pelataran" (Courtyard). White is used for card surfaces and interactive containers, while Light Grey serves as the page background to reduce eye strain and provide subtle depth.
- **Tertiary (Medium Grey):** Utilized for secondary text, metadata, and disabled states.

## Typography
The typography strategy employs two highly readable sans-serifs to distinguish between branding and utility.

- **Plus Jakarta Sans** is used for headlines. Its modern, slightly rounded geometric forms provide a welcoming and professional character that echoes the logo's modern aesthetic.
- **Inter** is the workhorse for body text, inputs, and labels. It is chosen for its exceptional legibility at small sizes and its systematic, neutral feel.

Use tight line-heights for headlines to maintain a compact, bold appearance, while keeping body text at a generous 1.6 ratio to ensure long-form content (like product descriptions) is easily digestible.

## Layout & Spacing
The system uses a **12-column Fluid Grid** for desktop, scaling down to 4 columns for mobile. 

- **Vertical Rhythm:** Built on an 8px baseline. All components, padding, and margins should be multiples of 8 (e.g., 8, 16, 24, 48).
- **Surface Contrast:** Backgrounds alternate between `#F5F5F5` (page) and `#FFFFFF` (content sections) to create clear visual separation without relying on heavy borders.
- **Desktop Layout:** Content is centered with a max-width of 1280px.
- **Mobile Layout:** Full-width content with 16px side margins to maximize screen real estate for product lists.

## Elevation & Depth
Depth in the design system is achieved through **Tonal Layering** and **Low-Contrast Outlines** rather than aggressive shadows. This maintains the clean, modern aesthetic requested.

- **Level 0 (Background):** `#F5F5F5` – The base floor.
- **Level 1 (Cards/Content):** `#FFFFFF` – Primary surface for product cards, menus, and forms. No shadow, but a 1px border of `#E0E0E0` (a lighter tint of charcoal).
- **Level 2 (Hover/Active):** A very soft, diffused shadow (10% opacity Charcoal) is applied only during hover states to indicate interactivity.
- **Overlays:** Modals and dropdowns use a crisp 1px border of `#212121` to establish a "structural" depth, emphasizing the architectural nature of the platform.

## Shapes
The design system adopts a **Soft (Level 1)** roundedness. 

- **Standard Elements:** Buttons, input fields, and small tags use a `0.25rem` (4px) radius. This provides a professional "edge" that isn't as aggressive as sharp corners but remains more serious than pill-shaped designs.
- **Containers:** Large product cards or sections use a `0.5rem` (8px) radius to feel approachable and modern.
- **Icons:** Icons should follow a consistent 2px stroke weight with slightly rounded caps to match the typography.

## Components
- **Buttons:** 
    - *Primary:* Solid Vibrant Orange (`#FF6F00`) with White text. Bold and high-contrast.
    - *Secondary:* Transparent background with a 2px Charcoal (`#212121`) border and text.
- **Input Fields:** White background, 1px Charcoal border. When focused, the border thickens to 2px in Vibrant Orange.
- **Product Cards:** White background, 1px soft border. Image at the top, followed by 16px padding for the title (Charcoal) and price (Vibrant Orange).
- **Chips/Badges:** For categories, use a Light Grey (`#EEEEEE`) background with Charcoal text. For "On Sale" or "New," use Vibrant Orange with White text.
- **Lists:** Clean rows separated by 1px `#E0E0E0` dividers. Use ample vertical padding (16px) for touch-target safety.
- **Checkboxes/Radios:** Square (4px radius) for checkboxes, circular for radios. Use Vibrant Orange for the "checked" state to ensure clear visibility.
- **Navigation:** A sticky top bar in White with a thin Charcoal bottom border to anchor the UI.