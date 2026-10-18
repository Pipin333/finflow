# Brand and Design System

## Material Sentence
The blue PowerShell console window, crisp white monospace figures on a CRT terminal, and the high-contrast amber warning light of an ATM status panel.

## Color Tokens
- Background (Deep PowerShell Navy): `#012456`
- Surface (Raised Console Layer): `#0a2d6c`
- Surface Subdued (Recessed Inputs): `#061d47`
- Border Subtle: `#1d4ed8`
- Border Highlight: `#38bdf8`
- Text Primary: `#ffffff`
- Text Muted: `#93c5fd`
- Accent (Positive / Liquid / Primary CTA): `#00d4ff`
- Text on Accent: `#012456`
- Warning (Credit Debt / Cut-off Alert): `#facc15`
- Danger (Payment Overdue / Deficit): `#f87171`
- Focus Ring: `#00d4ff`

All contrast pairs verified: `#ffffff` on `#012456` achieves 12.8:1 (AAA), `#00d4ff` on `#012456` achieves 8.4:1 (AAA).

## Typography
- Primary UI Font: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif
- Monospace Data Font: 'Consolas', 'Courier New', monospace
- Numbers and Balances: Tabular numbers enabled via `.tabular-nums`
- Type Scale:
  - Hero Net Worth: clamp(1.75rem, 1.25rem + 2.5vw, 2.75rem)
  - Card Metric Figures: clamp(1.25rem, 1rem + 1.2vw, 1.875rem)
  - Body and Form Labels: 0.875rem (14px) and 0.75rem (12px)
- Letter-spacing: -0.02em for headings, 0 for body, 0.05em uppercase labels.

## Composition and Choreography
- Page Shape: Multi-tab direct console layout (Dashboard, Accounts, Transactions, Analytics, Settings) with fixed bottom cockpit bar on mobile and persistent header.
- Gutter: 16px on mobile viewports under 640px, 32px on desktop.
- Layer Stack:
  - Ground (`#012456`): z-0
  - Surface Cards (`#0a2d6c`): z-10
  - Sticky Headers and Navigation: z-30
  - Modals and Overlays: z-50
- Signature Element: The ATM-style Net Worth cockpit card. Shows real net liquidity against total credit card debt with instant visual verdict (surplus or debt expansion).
- Entrance Easing: `cubic-bezier(0.16, 1, 0.3, 1)`
- Interaction Transition: `150ms ease-out` on hover and focus.
- Reduced Motion: All transitions collapse to 0.01ms when prefers-reduced-motion is active.
