# Build Brief

## PROJECT
Site for: FinFlow.
Audience: Padre de familia monitoreando finanzas y cancelando deudas de tarjetas y líneas de crédito.
Register: Directo e institucional.
The one action a visitor should take: Ver su posición neta real en 90 segundos y registrar o liquidar un movimiento con cero fricción.

## STACK
React 19, TypeScript, Vite, Tailwind CSS, Lucide Icons, Vitest, Nginx Docker container, deployed to Vercel and local Docker.

## CONTENT
- Opening: Estado de Salud Financiera y Patrimonio Neto al día.
- Support: Activos líquidos disponibles frente a la deuda total de crédito y días de corte.
- Action: "Nuevo Movimiento" y "Pagar Resumen Tarjeta".
- Below the fold: Tarjetas bancarias con barras de consumo, resúmenes con fecha de corte y desglose de cuotas pendientes, historial de transacciones con búsqueda y filtros.
- Cut: Tarjetas infinitas de ajustes, bloques de texto explicativo largo, gráficos decorativos sin utilidad, modales con alertas bloqueantes.
- Rule: No em dashes and no en dashes anywhere in the output. Commas, colons, full stops, or hyphens in compound words only.

## SHAPE
Application layout with persistent top month selector, immediate dashboard cockpit metrics, direct accounts view, tabular transactions history, and lightweight offline storage.
Gutter: 16px on mobile, 32px on desktop.

## DESIGN TOKENS
See BRAND.md for the locked palette and type system.
Ground: `#012456`.
Surfaces: `#0a2d6c` and `#061d47`.
Text: `#ffffff` and `#93c5fd`.
Accent: `#00d4ff` (text on accent: `#012456`).
Warning: `#facc15`.
Danger: `#f87171`.

## SIGNATURE ELEMENT
ATM Cockpit Banner:
A high-contrast console panel displaying Net Worth (`Patrimonio Neto`), total liquid assets, and aggregate credit card debt with large monospace numbers, clear status light, and one-tap payment amortization.

## MOTION
Hover and focus states with 150ms transitions. Strict `@media (prefers-reduced-motion: reduce)` compliance. Confetti effects suppressed if reduced motion is requested.

## QUALITY FLOOR
- Responsive from 375px to 1440px without horizontal scroll.
- WCAG 2.2 AA contrast verified.
- Complete keyboard focus visibility with ring-2 cyan outline.
- All forms have semantic label-input associations via id and htmlFor.
- Offline-first: Data stored in LocalStorage, photos stored in IndexedDB.
- 100 percent passing unit test suite with zero residual logs.

## NON-NEGOTIABLES
1. All balances and monetary amounts must use tabular monospace numbers.
2. No native alert() dialogs permitted under any circumstances.
3. Every button and control must be fully functional and keyboard accessible.
4. Total credit card debt and next statement amounts must never be obscured.
